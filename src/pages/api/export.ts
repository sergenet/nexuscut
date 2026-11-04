import { NextApiRequest, NextApiResponse } from 'next';
import Busboy from 'busboy';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFile, spawn } from 'child_process';
import { promises as dnsPromises } from 'dns';
import util from 'util';
import prisma from '@/lib/prisma';
import { enqueueExport, EXPORT_QUEUE_CAPACITY } from '@/lib/exportQueue';
import { createHash, randomUUID } from 'crypto';

const execFileAsync = util.promisify(execFile);

type UploadedForm = { fields: Record<string, string>; files: Record<string, string[]> };
type Transition = { type: string; duration?: number };
type ActiveSegment = { start: number; end: number; sourceStart?: number; fileIndex?: number; volume?: number; transitionOut?: Transition; visualEffect?: string };
type Caption = { text?: string; emoji?: string; start: number; end: number; x?: number; y?: number; color?: string; fontSize?: number; fontFamily?: string; bold?: boolean; italic?: boolean; textAlign?: string; letterSpacing?: number; lineHeight?: number; textShadow?: boolean; shadowColor?: string; shadowBlur?: number; outlineWidth?: number; outlineColor?: string; isTitle?: boolean; style?: string; retentionWords?: string[]; activeWordIndex?: number };
type BrollSegment = { videoUrl?: string; start: number; end: number };
type AudioEffect = { fileIndex?: number; url?: string; start: number; volume?: number };
type BrollPath = { path: string; start: number; end: number };
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

/** Coerce a client-provided value to a finite number, falling back when invalid. */
const num = (value: unknown, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/** Clamp a client-provided value into [min, max]; invalid values become the fallback. */
const clampNum = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** Clamp a client-provided value to an integer inside [min, max]. */
const clampInt = (value: unknown, fallback: number, min: number, max: number): number => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

/** Accept only #RRGGBB colors before they reach the ASS renderer. */
const toHex = (value: unknown, fallback: string): string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIVATE_HOST_RE = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)|::1$/i;

/** Identifiers are stored hashed so a database leak cannot be replayed as a session. */
const hashIdentifier = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

/**
 * Download a public HTTPS resource with SSRF protections: https-only,
 * private hosts rejected (re-checked after every redirect hop), DNS resolved
 * to a public address, bounded redirects and a hard size cap.
 */
async function fetchPublicBytes(rawUrl: string, maxBytes: number): Promise<Buffer> {
  let current = rawUrl;
  for (let hop = 0; hop < 4; hop++) {
    const parsed = new URL(current);
    if (parsed.protocol !== 'https:' || !parsed.hostname || PRIVATE_HOST_RE.test(parsed.hostname)) {
      throw new Error('Media URLs must use a public HTTPS address.');
    }
    const resolved = await dnsPromises.lookup(parsed.hostname);
    if (PRIVATE_HOST_RE.test(resolved.address)) {
      throw new Error('Media URLs must use a public address.');
    }
    const response = await fetch(current, { redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Invalid redirect from media host.');
      current = new URL(location, current).toString();
      continue;
    }
    if (!response.ok) throw new Error(`Could not download media (${response.status}).`);
    const declared = Number(response.headers.get('content-length') || 0);
    if (declared > maxBytes) throw new Error('Media exceeds the supported size.');
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) throw new Error('Media download was empty.');
    if (bytes.length > maxBytes) throw new Error('Media exceeds the supported size.');
    return bytes;
  }
  throw new Error('Too many redirects while downloading media.');
}

function runFfmpegWithProgress(
  bin: string,
  args: string[],
  statusPath: string,
  stage: string,
  totalDuration: number,
  progressStart: number,
  progressEnd: number,
) {
  // FFmpeg reports the rendered timestamp on stderr. Convert that timestamp to
  // a real percentage instead of pretending that a long export is progressing.
  // Arguments are passed as an array with no shell, so client-provided values
  // can never be interpreted as shell syntax.
  const yIndex = args.indexOf('-y');
  const fullArgs = yIndex === -1
    ? args
    : [...args.slice(0, yIndex + 1), '-progress', 'pipe:2', '-nostats', ...args.slice(yIndex + 1)];
  return new Promise<void>((resolve, reject) => {
    const process = spawn(bin, fullArgs, { shell: false });
    let errorTail = '';
    let lastProgress = -1;

    const updateProgress = (chunk: string) => {
      errorTail = (errorTail + chunk).slice(-5000);
      const matches = [...chunk.matchAll(/out_time_(?:us|ms)=(\d+)/g)];
      const lastMatch = matches[matches.length - 1];
      if (!lastMatch || totalDuration <= 0) return;
      const renderedSeconds = Number(lastMatch[1]) / 1_000_000;
      const progress = Math.max(progressStart, Math.min(progressEnd, Math.floor(progressStart + (renderedSeconds / totalDuration) * (progressEnd - progressStart))));
      if (progress >= lastProgress + 1) {
        lastProgress = progress;
        fs.writeFileSync(statusPath, JSON.stringify({ status: 'processing', stage, progress }));
      }
    };

    process.stderr.on('data', (data) => updateProgress(data.toString()));
    process.on('error', reject);
    process.on('close', (code) => code === 0 ? resolve() : reject(new Error(errorTail || `FFmpeg exited with code ${code}`)));
  });
}


export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

function clientIp(req: NextApiRequest): string {
  const xff = req.headers['x-forwarded-for'];
  const raw = (Array.isArray(xff) ? xff.join(',') : typeof xff === 'string' ? xff : '') || req.socket?.remoteAddress || 'unknown';
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  // Behind the site proxy the real client IP is the LAST entry; earlier
  // entries can be forged by the caller and must not be trusted.
  return parts.length ? parts[parts.length - 1] : 'unknown';
}

// Per-IP upload throttle. The free allowance is keyed by a cookie a caller can
// rotate, so this window is what actually caps runaway upload traffic.
const exportRateState =
  (globalThis as typeof globalThis & { nexuscutExportRate?: Map<string, number[]> }).nexuscutExportRate ??
  new Map<string, number[]>();
(globalThis as typeof globalThis & { nexuscutExportRate?: Map<string, number[]> }).nexuscutExportRate = exportRateState;
const EXPORT_RATE_WINDOW_MS = 10 * 60 * 1000;
const EXPORT_RATE_MAX = 12;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ip = clientIp(req);
  const rateNow = Date.now();
  if (exportRateState.size > 5000) {
    for (const [key, hits] of exportRateState) {
      if (!hits.length || rateNow - hits[hits.length - 1] > EXPORT_RATE_WINDOW_MS) exportRateState.delete(key);
    }
  }
  const recentHits = (exportRateState.get(ip) || []).filter((ts) => rateNow - ts < EXPORT_RATE_WINDOW_MS);
  if (recentHits.length >= EXPORT_RATE_MAX) {
    return res.status(429).json({ error: 'Too many export requests from this network. Please try again in a few minutes.' });
  }
  recentHits.push(rateNow);
  exportRateState.set(ip, recentHits);

  try {
    
    const data = await new Promise<UploadedForm>((resolve, reject) => {
      // Caption-heavy projects can legitimately exceed Busboy's 1 MB default
      // for an individual text field.  The old default truncated `captions`,
      // which then failed JSON.parse during export.
      const busboy = Busboy({ headers: req.headers, limits: { fieldSize: 10 * 1024 * 1024 } });
      const fields: Record<string, string> = {};
      const files: Record<string, string[]> = {};

      busboy.on('file', (name, file) => {
        // Field names are client-controlled; keep them filesystem-safe so a
        // crafted multipart request can never write outside the temp dir.
        const safeName = String(name).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'upload';
        const saveTo = path.join(os.tmpdir(), `${safeName}-${Date.now()}`);
        file.pipe(fs.createWriteStream(saveTo));
        if (!files[name]) files[name] = [];
        files[name].push(saveTo);
      });

      busboy.on('field', (name, val) => {
        fields[name] = val;
      });

      busboy.on('finish', () => resolve({ fields, files }));
      busboy.on('error', reject);
      req.pipe(busboy);
    });

    const formData = {
      has: (name: string) => data.fields[name] !== undefined || data.files[name] !== undefined,
      get: (name: string) => {
        if (data.fields[name] !== undefined) return data.fields[name];
        if (data.files[name] && data.files[name].length > 0) return data.files[name][0];
        return null;
      }
    };

    
    // Extract dynamic video files
    const mainVideoFiles: string[] = [];
    let i = 0;
    while (formData.has(`videoFile_${i}`)) {
      mainVideoFiles.push(formData.get(`videoFile_${i}`) as string);
      i++;
    }
    const audioFiles: string[] = [];
    i = 0;
    while (formData.has(`audioFile_${i}`)) {
      audioFiles.push(formData.get(`audioFile_${i}`) as string);
      i++;
    }
    const bgmFile = formData.get('bgmFile') as string | null;
    const ttsFile = formData.get('ttsFile') as string | null;
    const activeSegmentsStr = formData.get('activeSegments') as string;
    const captionsStr = formData.get('captions') as string;
    const brollSegmentsStr = formData.get('brollSegments') as string;
    const audioFxStr = formData.get('audioFx') as string;
    const autoZoom = formData.get('autoZoom') === 'true';
    const magicColor = formData.get('magicColor') === 'true';
    let captionFont = (formData.get('captionFont') as string || 'Roboto-Black').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'Roboto-Black';
    const captionSize = formData.get('captionSize') as string || '48';
    const captionColor = formData.get('captionColor') as string || '#FFFF00';
    // Every value below is client-controlled and is interpolated into the
    // FFmpeg filter graph: coerce it to a bounded number before it is used.
    const mainVolume = clampNum(formData.get('mainVolume'), 1, 0, 2);
    const bgmVolume = clampNum(formData.get('bgmVolume'), 0.5, 0, 2);
    let vw = String(clampInt(formData.get('vw'), 1080, 16, 7680));
    let vh = String(clampInt(formData.get('vh'), 1920, 16, 7680));
    const exportQuality = formData.get('exportQuality') === 'fast' ? 'fast' : 'high';
    const framingMode = formData.get('framingMode') === 'fit' ? 'fit' : 'fill';
    const applyBrandLogo = formData.get('applyBrandLogo') === 'true';
    const brandLogoPosition = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(String(formData.get('brandLogoPosition'))) ? String(formData.get('brandLogoPosition')) : 'bottom-right';
    const brandLogoSize = Math.max(8, Math.min(35, Number(formData.get('brandLogoSize')) || 18));
    const brandLogoOpacity = Math.max(20, Math.min(100, Number(formData.get('brandLogoOpacity')) || 85)) / 100;

    // Keep the fast option predictable even if a request is modified outside
    // the editor. It is intentionally lightweight for long videos and queues.
    if (exportQuality === 'fast') {
      if (Number(vh) > Number(vw)) {
        vw = '540'; vh = '960';
      } else if (Number(vw) > Number(vh)) {
        vw = '960'; vh = '540';
      } else {
        vw = '540'; vh = '540';
      }
    }

    // Identify each browser separately, while allowing a signed-in customer to
    // receive the benefits attached to their actual account. The former shared
    // "local-user" record made every visitor consume the same free allowance
    // and also prevented paid plans from taking effect at export time.
    // Only accept identity cookies we issued ourselves: an arbitrary client
    // value is never used as a database key, and identifiers are stored hashed.
    const sessionCookie = req.cookies.nexus_session_id;
    const guestCookie = req.cookies.nexus_export_guest_id;
    const validSession = Boolean(sessionCookie && UUID_RE.test(sessionCookie));
    const validGuest = Boolean(guestCookie && guestCookie.startsWith('guest:') && UUID_RE.test(guestCookie.slice(6)));
    const identity: string = validSession && sessionCookie
      ? sessionCookie
      : validGuest && guestCookie
        ? guestCookie
        : `guest:${randomUUID()}`;
    if (identity !== guestCookie) {
      res.setHeader('Set-Cookie', `nexus_export_guest_id=${encodeURIComponent(identity)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`);
    }
    const userId = hashIdentifier(identity);
    let user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });

    // Free allowances are monthly calendar periods in UTC, matching the
    // pricing page. Reset lazily on the first export request of a new month.
    const now = new Date();
    const currentPeriodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    if (!user.exportPeriodStart || user.exportPeriodStart < currentPeriodStart) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { exportCount: 0, exportPeriodStart: currentPeriodStart },
      });
    }

    const isFree = user.planTier === 'free' && !user.isPro;
    const hasPriorityExport = user.isPro && ['pro', 'agency'].includes(user.planTier);
    const exportPriority = user.isPro ? (user.planTier === 'agency' ? 2 : user.planTier === 'pro' ? 1 : 0) : 0;
    const brandKit = hasPriorityExport ? await prisma.brandKit.findUnique({ where: { userId: user.id } }) : null;
    if (brandKit?.fontUrl) captionFont = 'NexusBrand';

    if (isFree) {
      if (user.exportCount >= 10) {
        return res.status(403).json({
          code: 'EXPORT_LIMIT',
          error: 'You have used your 10 free exports for this month.',
          upgradeUrl: '/pricing',
        });
      }
      // Free accounts retain the 720p ceiling, while still honoring the
      // deliberately smaller Fast export choice.
      if (exportQuality !== 'fast') {
        if (Number(vh) > Number(vw)) {
          vw = '720'; vh = '1280';
        } else if (Number(vw) > Number(vh)) {
          vw = '1280'; vh = '720';
        } else {
          vw = '720'; vh = '720';
        }
      }
      // Restrict premium fonts
      captionFont = 'Roboto-Black';
    }

    // Parse then sanitize: every numeric field is coerced so a crafted JSON
    // payload can never smuggle non-numeric text into the FFmpeg command.
    const rawSegments: unknown = JSON.parse(activeSegmentsStr || '[]');
    const activeSegments: ActiveSegment[] = (Array.isArray(rawSegments) ? rawSegments : [])
      .map((s: ActiveSegment) => ({
        ...s,
        start: num(s?.start, NaN),
        end: num(s?.end, NaN),
        sourceStart: num(s?.sourceStart, 0),
        fileIndex: clampInt(s?.fileIndex, 0, 0, 64),
        volume: clampNum(s?.volume, 1, 0, 2),
      }))
      .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start);
    console.log("activeSegments received:", JSON.stringify(activeSegments, null, 2));
    const captions = (JSON.parse(captionsStr || '[]') as Caption[])
      .map((c) => ({ ...c, start: num(c.start, 0), end: num(c.end, 0) }));
    const brollSegments = (JSON.parse(brollSegmentsStr || '[]') as BrollSegment[])
      .map((b) => ({ ...b, start: num(b.start, 0), end: num(b.end, 0) }));
    const audioFx = (JSON.parse(audioFxStr || '[]') as AudioEffect[])
      .map((fx) => ({ ...fx, start: num(fx.start, 0), volume: clampNum(fx.volume, 1, 0, 2) }));

    // Build a proper source-time to export-time mapping.
    // Each segment in the timeline has a source range (sourceStart..sourceEnd) that maps to
    // an output range. When transitions exist, the output duration is compressed because
    // xfade overlaps the end of one segment with the start of the next.
    // Captions are positioned on the timeline (seg.start..seg.end), so we need to map
    // timeline positions to output positions.
    
    // First compute what the output timeline looks like after xfade compression
    const segDurations = activeSegments.map((seg) => seg.end - seg.start);
    const outputSegStarts: number[] = [];
    let outputTime = 0;
    
    for (let i = 0; i < activeSegments.length; i++) {
      outputSegStarts.push(outputTime);
      outputTime += segDurations[i];
    }
    const totalOutputDuration = outputTime;

    // Map a timeline time to an output time
    const mapTimeToExport = (t: number): number => {
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        if (t >= seg.start && t < seg.end) {
          const offsetInSeg = t - seg.start;
          return outputSegStarts[i] + offsetInSeg;
        }
      }
      // Past the last segment
      const lastSeg = activeSegments[activeSegments.length - 1];
      if (lastSeg && t >= lastSeg.end) {
        const offsetInSeg = lastSeg.end - lastSeg.start;
        return outputSegStarts[outputSegStarts.length - 1] + offsetInSeg;
      }
      return t;
    };

    // Apply mapping to captions, broll, and audio FX
    captions.forEach((c) => { c.start = mapTimeToExport(c.start); c.end = mapTimeToExport(c.end); });
    brollSegments.forEach((b) => { b.start = mapTimeToExport(b.start); b.end = mapTimeToExport(b.end); });
    audioFx.forEach((a) => { a.start = mapTimeToExport(a.start); });

    // Calculate vertical margin for captions to avoid native UI on TikTok/Shorts
    // Setup temp directory
    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const id = Date.now().toString();
    const outputPath = path.join(tempDir, `output_${id}.mp4`);
    const bgmPath = path.join(tempDir, `bgm_${id}.mp3`);
    const ttsPath = path.join(tempDir, `tts_${id}.mp3`);
    const srtPath = path.join(tempDir, `captions_${id}.srt`);
    // Use a dedicated fonts directory to prevent libass from scanning all of /tmp
    const fontDir = path.join(tempDir, `nexuscut_fonts_${id}`);
    if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true });
    const fontPath = path.join(fontDir, `${captionFont}.ttf`);
    const fetchBrandAsset = async (assetUrl: string, destination: string, maxBytes: number) => {
      const bytes = await fetchPublicBytes(assetUrl, maxBytes);
      fs.writeFileSync(destination, bytes);
    };
    let brandLogoPath: string | null = null;
    if (brandKit?.fontUrl) await fetchBrandAsset(brandKit.fontUrl, fontPath, 10 * 1024 * 1024);
    if (applyBrandLogo && brandKit?.logoUrl) {
      brandLogoPath = path.join(tempDir, `brand_logo_${id}.png`);
      await fetchBrandAsset(brandKit.logoUrl, brandLogoPath, 8 * 1024 * 1024);
    }

    // Write all main video files
    const mainVideoPaths: string[] = [];
    for (let j = 0; j < mainVideoFiles.length; j++) {
      const vFile = mainVideoFiles[j];
      const p = path.join(tempDir, `input_${id}_${j}.mp4`);
      const vBuffer = fs.readFileSync(vFile);
      fs.writeFileSync(p, vBuffer);
      mainVideoPaths.push(p);
    }

    const uploadedAudioPaths: string[] = [];
    for (let j = 0; j < audioFiles.length; j++) {
      const p = path.join(tempDir, `audio_${id}_${j}`);
      fs.copyFileSync(audioFiles[j], p);
      uploadedAudioPaths.push(p);
    }

    // Write BGM
    if (bgmFile) {
      const bgmBuffer = fs.readFileSync(bgmFile);
      fs.writeFileSync(bgmPath, bgmBuffer);
    }
    
    // Write TTS
    if (ttsFile) {
      const ttsBuffer = fs.readFileSync(ttsFile);
      fs.writeFileSync(ttsPath, ttsBuffer);
    }

    // Download Font
    let fontUrl = 'https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Black.ttf';
    if (captionFont === 'Montserrat-Bold') fontUrl = 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf';
    if (captionFont === 'BebasNeue-Regular') fontUrl = 'https://raw.githubusercontent.com/googlefonts/bebasneue/main/fonts/ttf/BebasNeue-Regular.ttf';
    if (captionFont === 'Oswald-Bold') fontUrl = 'https://raw.githubusercontent.com/googlefonts/oswald/main/fonts/ttf/Oswald-Bold.ttf';
    
    try {
      const fontRes = await fetch(fontUrl);
      if (fontRes.ok) {
        const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
        fs.writeFileSync(fontPath, fontBuffer);
      }
    } catch (e) {
      console.warn("Failed to download font", e);
    }

    // Download B-Roll videos
    const brollPaths: BrollPath[] = [];
    for (let i = 0; i < brollSegments.length; i++) {
      const seg = brollSegments[i];
      if (seg.videoUrl) {
        const bp = path.join(tempDir, `broll_${id}_${i}.mp4`);
        // Client-supplied URL: same SSRF policy as brand assets (public HTTPS only).
        const bBuf = await fetchPublicBytes(seg.videoUrl, 250 * 1024 * 1024);
        fs.writeFileSync(bp, bBuf);
        brollPaths.push({ path: bp, start: seg.start, end: seg.end });
      }
    }

    // (Old SRT writing block removed - handled in pass 2)

    // Write the job to the visible queue before returning. The actual FFmpeg
    // work is deliberately serialized below to protect this small VPS.
    const statusPath = path.join(tempDir, `status_${id}.json`);
    fs.writeFileSync(statusPath, JSON.stringify({ status: 'queued', progress: 0 }));
    
    const runExport = async () => {
      try {
        fs.writeFileSync(statusPath, JSON.stringify({ status: 'processing', stage: 'Preparing render', progress: 0 }));
        // Build FFmpeg command
        // Prefer the VPS-maintained FFmpeg binary. npm optional binaries can be
        // absent after a production dependency reinstall.
        const bundledFfmpeg = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
        const ffmpegCmd = os.platform() === 'linux' && fs.existsSync('/usr/bin/ffmpeg')
          ? '/usr/bin/ffmpeg'
          : bundledFfmpeg;

        // A screen recording or a silent clip has no audio stream at all.
        // Detect this before constructing the filter graph so we can supply a
        // matching silent track instead of referring to a non-existent [n:a].
        const ffprobeCmd = os.platform() === 'linux' && fs.existsSync('/usr/bin/ffprobe')
          ? '/usr/bin/ffprobe'
          : 'ffprobe';
        const audioPresence = new Map<string, boolean>();
        const hasAudio = async (filePath: string) => {
          const cached = audioPresence.get(filePath);
          if (cached !== undefined) return cached;
          try {
            const { stdout } = await execFileAsync(ffprobeCmd, ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', filePath]);
            const present = stdout.trim() === 'audio';
            audioPresence.set(filePath, present);
            return present;
          } catch {
            // A probe failure must not reject the whole export. Rendering a
            // silent track is the safe fallback for the affected segment.
            audioPresence.set(filePath, false);
            return false;
          }
        };

    // Track inputs as an ordered list of -i arguments. inputIndex is the FFmpeg stream index.
    const inputArgs: string[] = [];
    let inputIndex = 0;

    // Sort segments by their timeline start to ensure correct concatenation order
    activeSegments.sort((a, b) => a.start - b.start);

    // Provide the input video multiple times using fast-seeking (-ss before -i).
    // This is CRITICAL to prevent OOM. Using multiple 'trim' filters on a single [0:v] 
    // forces FFmpeg to buffer gigabytes of uncompressed frames. Separate inputs eliminate buffering.
    const segmentInputIdxs: number[] = [];
    activeSegments.forEach((seg) => {
      const fileIndex = seg.fileIndex || 0;
      const sourceFile = mainVideoPaths[fileIndex];
      
      const duration = seg.end - seg.start;
      const sourceStart = seg.sourceStart || 0;
      
      // Fast seek to the exact segment start and read only the needed duration
      inputArgs.push('-ss', String(sourceStart), '-t', String(duration), '-i', sourceFile);
      segmentInputIdxs.push(inputIndex++);
    });

    // Add b-roll inputs
    const brollIdxs: number[] = [];
    brollPaths.forEach(b => {
      inputArgs.push('-i', b.path);
      brollIdxs.push(inputIndex++);
    });

    // Add BGM input
    let bgmIdx = -1;
    if (bgmFile) {
      inputArgs.push('-i', bgmPath);
      bgmIdx = inputIndex++;
    }

    // Add TTS input
    let ttsIdx = -1;
    if (ttsFile) {
      inputArgs.push('-i', ttsPath);
      ttsIdx = inputIndex++;
    }

    // Add Audio FX inputs
    const audioFxIdxs: { idx: number, start: number, volume?: number }[] = [];
    const bundledAudioFx: Record<string, string> = {
      '/sounds/whoosh.wav': 'whoosh.wav',
      '/sounds/pop.wav': 'pop.wav',
      '/sounds/ding.wav': 'ding.wav',
      '/sounds/boom.wav': 'boom.wav',
    };
    audioFx.forEach((fx) => {
      const uploadedAudioPath = typeof fx.fileIndex === 'number' && Number.isInteger(fx.fileIndex) ? uploadedAudioPaths[fx.fileIndex] : undefined;
      const bundledName = typeof fx.url === 'string' ? bundledAudioFx[fx.url] : undefined;
      if (uploadedAudioPath || bundledName) {
        const fxPath = uploadedAudioPath || path.join(process.cwd(), 'public', 'sounds', bundledName!);
        if (fs.existsSync(/* turbopackIgnore: true */ fxPath)) {
          inputArgs.push('-i', fxPath);
          audioFxIdxs.push({ idx: inputIndex++, start: fx.start, volume: fx.volume });
        }
      }
    });

    // Add swoosh SFX input
    const autoSfx = formData.get('autoSfx') === 'true';
    let swooshIdx = -1;
    if (autoSfx && brollPaths.length > 0) {
      const swooshPath = path.join(process.cwd(), 'public', 'sfx', 'swoosh.mp3');
      inputArgs.push('-i', swooshPath);
      swooshIdx = inputIndex++;
    }

    console.log("Pass 1 starting...");

    // Build Filtergraph
    const filterGraph: string[] = [];

    let currentVideoLabel = `0:v`;
    let currentAudioLabel = `0:a`;

    if (activeSegments.length > 0) {
      // Format each individual segment stream to match output resolution
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        const vidIdx = segmentInputIdxs[i];
        // Since we used -ss and -t on the input, the stream already starts at 0 and has correct duration.
        // We just need to scale/pad it and ensure framerate, and CRITICALLY set the timebase so xfade doesn't crash
        const videoFrameFilter = framingMode === 'fit'
          ? `scale=${vw}:${vh}:force_original_aspect_ratio=decrease,pad=${vw}:${vh}:(ow-iw)/2:(oh-ih)/2:color=black`
          : `scale=${vw}:${vh}:force_original_aspect_ratio=increase,crop=${vw}:${vh}`;
        const effectFilter = ({
          mono: 'hue=s=0',
          warm: 'eq=saturation=1.18:brightness=0.04:gamma_r=1.08',
          cool: 'eq=saturation=1.08:brightness=0.03:gamma_b=1.08',
          contrast: 'eq=contrast=1.2:saturation=1.12',
        } as Record<string, string>)[seg.visualEffect || ''] || '';
        filterGraph.push(`[${vidIdx}:v]fps=30,${videoFrameFilter}${effectFilter ? `,${effectFilter}` : ''},format=yuv420p,setsar=1/1,settb=1/90000[v_seg${i}]`);
        const sourceFile = mainVideoPaths[seg.fileIndex || 0];
        const segmentVolume = Math.max(0, Math.min(2, Number(seg.volume ?? 1)));
        if (await hasAudio(sourceFile)) {
          filterGraph.push(`[${vidIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=${segmentVolume}[a_seg${i}]`);
        } else {
          const duration = Math.max(0.01, Number(seg.end) - Number(seg.start));
          filterGraph.push(`anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration=${duration},asetpts=N/SR/TB[a_seg${i}]`);
        }
      }

      // FAST CONCAT TRANSITION LOGIC
      const vLabels = activeSegments.map((_, i) => `v_seg${i}`);
      const aLabels = activeSegments.map((_, i) => `a_seg${i}`);
      
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        const segDuration = seg.end - seg.start;
        
        if (seg.transitionOut && seg.transitionOut.type !== 'None' && i < activeSegments.length - 1) {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            
            filterGraph.push(`[${vLabels[i]}]fade=t=out:st=${fadeOutStart}:d=${tDuration}[v_fout${i}]`);
            filterGraph.push(`[${aLabels[i]}]afade=t=out:st=${fadeOutStart}:d=${tDuration}[a_fout${i}]`);
            vLabels[i] = `v_fout${i}`;
            aLabels[i] = `a_fout${i}`;
            
            const nextSeg = activeSegments[i+1];
            const nextDuration = nextSeg.end - nextSeg.start;
            const nextTDur = Math.min(tDuration, nextDuration / 2);
            filterGraph.push(`[${vLabels[i+1]}]fade=t=in:st=0:d=${nextTDur}[v_fin${i+1}]`);
            filterGraph.push(`[${aLabels[i+1]}]afade=t=in:st=0:d=${nextTDur}[a_fin${i+1}]`);
            vLabels[i+1] = `v_fin${i+1}`;
            aLabels[i+1] = `a_fin${i+1}`;
        }
        
        if (i === activeSegments.length - 1 && seg.transitionOut && seg.transitionOut.type !== 'None') {
            const tDuration = Math.min(seg.transitionOut.duration || 0.5, segDuration / 2, 0.5);
            const fadeOutStart = Math.max(0, segDuration - tDuration);
            filterGraph.push(`[${vLabels[i]}]fade=t=out:st=${fadeOutStart}:d=${tDuration}[v_fout${i}]`);
            filterGraph.push(`[${aLabels[i]}]afade=t=out:st=${fadeOutStart}:d=${tDuration}[a_fout${i}]`);
            vLabels[i] = `v_fout${i}`;
            aLabels[i] = `a_fout${i}`;
        }
      }
      
      const n = activeSegments.length;
      let concatStr = '';
      for (let i = 0; i < n; i++) {
        concatStr += `[${vLabels[i]}][${aLabels[i]}]`;
      }
      filterGraph.push(`${concatStr}concat=n=${n}:v=1:a=1[v_concat][a_concat]`);
      
      const lastVideo = `v_concat`;
      const lastAudio = `a_concat`;
      // Normalize framerate to prevent any drift
      filterGraph.push(`[${lastVideo}]fps=30[v_sel]`);

      if (ttsIdx !== -1) {
        filterGraph.push(`[${ttsIdx}:a]volume=${mainVolume}[a_sel]`);
      } else {
        filterGraph.push(`[${lastAudio}]volume=${mainVolume}[a_sel]`);
      }

      currentVideoLabel = `v_sel`;
      currentAudioLabel = `a_sel`;
    } else {
      // Fallback if no cuts were made
      filterGraph.push(`[0:v]fps=30[v_sel]`);

      if (ttsIdx !== -1) {
        filterGraph.push(`[${ttsIdx}:a]volume=${mainVolume}[a_sel]`);
      } else {
        filterGraph.push(`[0:a]volume=${mainVolume}[a_sel]`);
      }

      currentVideoLabel = `v_sel`;
      currentAudioLabel = `a_sel`;
    }

    // 1. Overlay B-Rolls
    for (let i = 0; i < brollPaths.length; i++) {
      const b = brollPaths[i];
      const brollIdx = brollIdxs[i];

      const brollFilter = `[${brollIdx}:v]scale=${vw}:${vh}:force_original_aspect_ratio=increase,crop=${vw}:${vh},tpad=start_duration=${b.start}:color=black[broll${i}]`;
      filterGraph.push(brollFilter);

      const overlayFilter = `[${currentVideoLabel}][broll${i}]overlay=enable='between(t,${b.start},${b.end})':eof_action=pass[v_ovl${i}]`;
      filterGraph.push(overlayFilter);

      currentVideoLabel = `v_ovl${i}`;
    }

    // 2. Zoom
    if (autoZoom) {
      filterGraph.push(`[${currentVideoLabel}]crop='iw/min(1+0.03*t,1.5)':'ih/min(1+0.03*t,1.5)':'(iw-ow)/2':'(ih-oh)/2',scale=${vw}:${vh}[v_zoom]`);
      currentVideoLabel = `v_zoom`;
    }

    // 3. Magic Color
    if (magicColor) {
      filterGraph.push(`[${currentVideoLabel}]eq=contrast=1.15:saturation=1.2:brightness=0.02[v_magic]`);
      currentVideoLabel = `v_magic`;
    }

    // 4. Captions — handled in a second pass to avoid OOM (subtitles + xfade together exceed 1GB VPS RAM)
    const hasCaptions = captions.length > 0;
    let validCaps: Caption[] = [];
    if (hasCaptions) {
      validCaps = captions.filter((c) => c.start < c.end && c.start >= 0 && c.start < totalOutputDuration);
      // CRITICAL: SRT captions MUST be sorted by start time, otherwise libass drops them!
      validCaps.sort((a, b) => a.start - b.start);
    }

    let numAudioInputs = 1;
    let audioMixInputs = `[a_sel]`;

    if (bgmIdx !== -1) {
      filterGraph.push(`[${bgmIdx}:a]volume=${bgmVolume}[a_bgm]`);
      audioMixInputs += `[a_bgm]`;
      numAudioInputs++;
    }

    if (swooshIdx !== -1) {
      filterGraph.push(`[${swooshIdx}:a]volume=0.8,asplit=${brollPaths.length}` + brollPaths.map((_, i) => `[sw${i}]`).join(''));

      brollPaths.forEach((b, i) => {
        const delayMs = Math.round(b.start * 1000);
        filterGraph.push(`[sw${i}]adelay=${delayMs}|${delayMs}[sfx${i}]`);
        audioMixInputs += `[sfx${i}]`;
        numAudioInputs++;
      });
    }

    audioFxIdxs.forEach((fx, i) => {
      const delayMs = Math.round(fx.start * 1000);
      const vol = fx.volume !== undefined ? fx.volume : 1.0;
      filterGraph.push(`[${fx.idx}:a]volume=${vol},adelay=${delayMs}|${delayMs}[cust_sfx${i}]`);
      audioMixInputs += `[cust_sfx${i}]`;
      numAudioInputs++;
    });

    if (numAudioInputs > 1) {
      filterGraph.push(`${audioMixInputs}amix=inputs=${numAudioInputs}:duration=first:dropout_transition=2,volume=${numAudioInputs}[a_out]`);
      currentAudioLabel = `a_out`;
    }

    const finalFilterStr = filterGraph.join('; ');

    // Pass 1: Render video with transitions + audio (no captions)
    const needsFinishingPass = (hasCaptions && validCaps.length > 0) || Boolean(brandLogoPath);
    const pass1Output = needsFinishingPass ? path.join(tempDir, `pass1_${id}.mp4`) : outputPath;
    // Constrained Baseline + yuv420p is the most broadly compatible MP4
    // combination, including Windows Media Player and older mobile devices.
    const pass1Args = [
      '-y', '-threads', '4',
      ...inputArgs,
      '-filter_complex', finalFilterStr,
      '-map', `[${currentVideoLabel}]`,
      '-map', `[${currentAudioLabel}]`,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k',
      pass1Output,
    ];

    // Execute FFmpeg Pass 1
    console.log("Executing FFmpeg Pass 1...");
    try {
      await runFfmpegWithProgress(
        ffmpegCmd,
        pass1Args,
        statusPath,
        'Rendering video',
        totalOutputDuration,
        0,
        needsFinishingPass ? 70 : 99,
      );
    } catch (error: unknown) {
      const message = errorMessage(error);
      fs.writeFileSync(path.join(tempDir, `ffmpeg-error-pass1_${id}.log`), `ARGS:\n${pass1Args.join('\n')}\n\nERROR:\n${message.slice(-5000)}`);
      throw new Error("FFmpeg failed: " + message.slice(-1000));
    }

    // Pass 2: Burn captions onto the rendered video (separate pass to avoid OOM)
    if (hasCaptions && validCaps.length > 0) {
      // Text layers may intentionally overlap (for example Headline + Subtitle
      // + Body). ASS supports that natively, so preserve each layer's exact
      // timeline range rather than shortening overlapping items.

      // Write ASS file
      const playResX = Number(vw) || 1080;
      const playResY = Number(vh) || 1920;

      let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: ${playResX}
PlayResY: ${playResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,3,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

      validCaps.forEach((c) => {
        const formatTimeASS = (seconds: number) => {
          const date = new Date(seconds * 1000);
          const h = String(date.getUTCHours());
          const mm = String(date.getUTCMinutes()).padStart(2, '0');
          const ss = String(date.getUTCSeconds()).padStart(2, '0');
          const cs = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
          return `${h}:${mm}:${ss}.${cs}`;
        };

        const startTime = formatTimeASS(c.start);
        const endTime = formatTimeASS(c.end);

        // Convert hex color #RRGGBB to ASS &HBBGGRR&
        const hex = toHex((!c.isTitle && brandKit?.primaryColor) || c.color, toHex(captionColor, '#FFFFFF'));
        const r = hex.substring(1, 3);
        const g = hex.substring(3, 5);
        const b = hex.substring(5, 7);
        const assColor = `&H00${b}${g}${r}&`;
        const outlineHex = toHex(c.outlineColor, '#000000');
        const outlineColor = `&H00${outlineHex.substring(5, 7)}${outlineHex.substring(3, 5)}${outlineHex.substring(1, 3)}&`;

        // Scale font size relative to output height (preview UI assumes ~600px height)
        // A font size of 48 in a 600px window is roughly 8% of the height.
        // We'll calculate proportional ASS font size based on PlayResY.
        const uiFontSize = Number(c.fontSize) || Number(captionSize) || 48;
        const proportionalSize = Math.round((uiFontSize / 600) * playResY);

        // Map font filename to actual internal ASS FontName to prevent libass fallback
        const uiFontFamily = (!c.isTitle && brandKit?.fontUrl) ? 'NexusBrand' : (c.fontFamily || captionFont || 'Inter-Black');
        let assFontName = uiFontFamily;
        if (uiFontFamily.includes('Roboto')) assFontName = 'Roboto';
        else if (uiFontFamily.includes('Montserrat')) assFontName = 'Montserrat';
        else if (uiFontFamily.includes('Bebas')) assFontName = 'Bebas Neue';
        else if (uiFontFamily.includes('Oswald')) assFontName = 'Oswald';
        else if (uiFontFamily.includes('Playfair')) assFontName = 'Playfair Display';
        else if (uiFontFamily.includes('Inter')) assFontName = 'Inter';
        // Font names land inside the ASS file: keep them to safe characters.
        assFontName = assFontName.replace(/[^\w .-]/g, '').slice(0, 64) || 'Inter';

        // Calculate position in PlayRes coordinates based on percentage
        const xPercent = c.x !== undefined ? Number(c.x) : 50;
        const yPercent = c.y !== undefined ? Number(c.y) : 80;
        
        const posX = Math.round((xPercent / 100) * playResX);
        const posY = Math.round((yPercent / 100) * playResY);

        // Build ASS tags
        // Preset title layers get a subtle exit fade. Word-by-word captions do
        // not, so their timing remains precise.
        const fadeOut = c.isTitle ? '\\fad(150,350)' : '';
        const outline = Math.max(0, Number(c.outlineWidth) || 0);
        const shadow = c.textShadow ? Math.max(1, Math.min(6, Math.round((Number(c.shadowBlur) || 6) / 3))) : 0;
        const spacing = Number(c.letterSpacing) || 0;
        const weight = c.bold ? '\\b1' : '';
        const italic = c.italic ? '\\i1' : '';
        const pop = c.style === 'growth-punch' ? '\\fscx72\\fscy72\\t(0,180,\\fscx100\\fscy100)' : '';
        // Use the same anchor semantics as the browser preview: X is the left
        // edge for left-aligned text, center for centered text, and right edge
        // for right-aligned text. Y is the vertical center of the text block.
        const alignment = c.textAlign === 'left' ? 4 : c.textAlign === 'right' ? 6 : 5;
        const tags = `{\\an${alignment}\\pos(${posX},${posY})\\c${assColor}\\3c${outlineColor}\\bord${outline}\\shad${shadow}\\fsp${spacing}\\fs${proportionalSize}\\fn${assFontName}${weight}${italic}${pop}${fadeOut}}`;
        // ASS uses \N for a line break. Writing a literal newline would end
        // the Dialogue instruction, which is why multi-line Body text used to
        // export only its first line. Escape other ASS control characters too.
        const escapeAssText = (value: string) => value
          .replace(/\\/g, '\\\\')
          .replace(/{/g, '\\{')
          .replace(/}/g, '\\}')
          .replace(/\r?\n/g, '\\N');
        const textValue = c.emoji ? `${c.text} ${c.emoji}` : String(c.text || '');
        const encodedRetentionMatch = textValue.match(/^(.*)\[\[([^\]]+)\]\](.*)$/);
        const retentionParts = c.retentionWords?.length
          ? c.retentionWords.map((word, index) => ({ word, active: index === c.activeWordIndex }))
          : encodedRetentionMatch
            ? [
                ...encodedRetentionMatch[1].trim().split(/\s+/).filter(Boolean).map(word => ({ word, active: false })),
                { word: encodedRetentionMatch[2], active: true },
                ...encodedRetentionMatch[3].trim().split(/\s+/).filter(Boolean).map(word => ({ word, active: false })),
              ]
            : null;
        const textStr = retentionParts?.length
          ? retentionParts.map(({ word, active }) => {
              const toAssColor = (hexColor: string) => `&H00${hexColor.substring(5, 7)}${hexColor.substring(3, 5)}${hexColor.substring(1, 3)}&`;
              const color = active ? toAssColor(brandKit?.secondaryColor || '#FFD400') : toAssColor(brandKit?.primaryColor || '#FFFFFF');
              return `{\\c${color}}${escapeAssText(word)}`;
            }).join(' ')
          : escapeAssText(textValue);

        assContent += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${tags}${textStr}\n`;
      });

      const assPath = path.join(tempDir, `subs_${id}.ass`);
      fs.writeFileSync(assPath, assContent);

      // Use absolute path for ASS, fontsdir points to the small dedicated font directory.
      // CRITICAL: On Windows, the drive letter colon (C:) must be escaped as C\:, otherwise 
      // FFmpeg parses it as a filter argument separator, breaking the path and causing libass 
      // to scan the entire system Temp directory, which crashes it instantly.
      const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "'\\''");
      const escapedFontsDir = fontDir.replace(/\\/g, '/').replace(/:/g, '\\:');

      const subtitleFilter = `[0:v]subtitles='${escapedAssPath}':fontsdir='${escapedFontsDir}'[sub]`;
      const logoX = brandLogoPosition.endsWith('left') ? 'W*0.04' : 'W-w-W*0.04';
      const logoY = brandLogoPosition.startsWith('top') ? 'H*0.04' : 'H-h-H*0.04';
      const logoFilter = brandLogoPath ? `;[1:v]scale=${Math.round(playResX * brandLogoSize / 100)}:-1:force_original_aspect_ratio=decrease,format=rgba,colorchannelmixer=aa=${brandLogoOpacity}[logo];[sub][logo]overlay=${logoX}:${logoY}[v_out]` : '';
      const pass2Inputs = ['-y', '-threads', '4', '-i', pass1Output];
      if (brandLogoPath) pass2Inputs.push('-loop', '1', '-i', brandLogoPath);
      const pass2Args = [
        ...pass2Inputs,
        '-filter_complex', `${subtitleFilter}${logoFilter || ';[sub]null[v_out]'}`,
        '-map', '[v_out]', '-map', '0:a',
        '-c:v', 'libx264', '-preset', 'ultrafast', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', '-c:a', 'copy',
        ...(brandLogoPath ? ['-shortest'] : []),
        outputPath,
      ];

      console.log("Executing FFmpeg Pass 2 (captions)...");

      try {
        await runFfmpegWithProgress(ffmpegCmd, pass2Args, statusPath, 'Adding captions', totalOutputDuration, 70, 99);
      } catch (error: unknown) {
        const message = errorMessage(error);
        fs.writeFileSync(path.join(tempDir, `ffmpeg-error-pass2_${id}.log`), `ARGS:\n${pass2Args.join('\n')}\n\nERROR:\n${message.slice(-5000)}`);
        // If caption burn fails, fall back to the video without captions
        console.error("Caption burn failed, using video without captions");
        fs.copyFileSync(pass1Output, outputPath);
      }
      // Clean up pass1 intermediate file
      try { fs.unlinkSync(pass1Output); } catch {}
    } else if (brandLogoPath) {
      const maxLogoWidth = Math.round((Number(vw) || 1080) * brandLogoSize / 100);
      const logoX = brandLogoPosition.endsWith('left') ? 'W*0.04' : 'W-w-W*0.04';
      const logoY = brandLogoPosition.startsWith('top') ? 'H*0.04' : 'H-h-H*0.04';
      const logoArgs = [
        '-y', '-threads', '4',
        '-i', pass1Output,
        '-loop', '1', '-i', brandLogoPath,
        '-filter_complex', `[1:v]scale=${maxLogoWidth}:-1:force_original_aspect_ratio=decrease,format=rgba,colorchannelmixer=aa=${brandLogoOpacity}[logo];[0:v][logo]overlay=${logoX}:${logoY}[v_out]`,
        '-map', '[v_out]', '-map', '0:a?',
        '-c:v', 'libx264', '-preset', 'ultrafast', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', '-c:a', 'copy', '-shortest',
        outputPath,
      ];
      await runFfmpegWithProgress(ffmpegCmd, logoArgs, statusPath, 'Adding brand watermark', totalOutputDuration, 70, 99);
      try { fs.unlinkSync(pass1Output); } catch {}
    }

    if (isFree) {
      await prisma.user.update({
        where: { id: user.id },
        data: { exportCount: { increment: 1 } }
      });
    }

    const finalExportPath = path.join(tempDir, `final_${id}.mp4`);
    fs.copyFileSync(outputPath, finalExportPath);

    // Clean up temp files to prevent /tmp from accumulating
    try {
      fs.unlinkSync(outputPath);
      mainVideoPaths.forEach(p => { try { fs.unlinkSync(p); } catch {} });
      uploadedAudioPaths.forEach(p => { try { fs.unlinkSync(p); } catch {} });
      try { fs.unlinkSync(srtPath); } catch {}
      if (brandLogoPath) { try { fs.unlinkSync(brandLogoPath); } catch {} }
      try { fs.rmSync(fontDir, { recursive: true, force: true }); } catch {}
    } catch {}

    // Mark job as completed
    fs.writeFileSync(statusPath, JSON.stringify({ status: 'completed' }));
    
      } catch (backgroundError: unknown) {
        console.error('Background Export error:', backgroundError);
        fs.writeFileSync(statusPath, JSON.stringify({ status: 'error', error: errorMessage(backgroundError) }));
      }
    };

    const queued = enqueueExport(id, runExport, exportPriority);
    if (!queued.accepted) {
      try {
        fs.unlinkSync(statusPath);
        Object.values(data.files).flat().forEach((file) => {
          try { fs.unlinkSync(file); } catch {}
        });
      } catch {}
      return res.status(429).json({
        error: `The export queue is temporarily full. Please try again in a few minutes (up to ${EXPORT_QUEUE_CAPACITY} exports are protected at once).`,
      });
    }

    return res.status(200).json({ jobId: id, status: 'queued', queuePosition: queued.position });

  } catch (error: unknown) {
    console.error('Export request error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: errorMessage(error) });
    }
  }
}
