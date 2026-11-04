import { NextResponse } from 'next/server';
import ffmpegPath from 'ffmpeg-static';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');
  const requestedDuration = Number(formData.get('duration'));
  const duration = Math.max(2, Math.min(10, Number.isFinite(requestedDuration) ? requestedDuration : 5));

  if (!(image instanceof File)) return NextResponse.json({ error: 'Choose an image first.' }, { status: 400 });
  if (!image.type.startsWith('image/')) return NextResponse.json({ error: 'The selected file must be an image.' }, { status: 400 });
  if (image.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'Images must be 25 MB or smaller.' }, { status: 413 });

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nexuscut-animate-'));
  const inputPath = path.join(workDir, `input${path.extname(image.name) || '.png'}`);
  const outputPath = path.join(workDir, 'nexuscut-motion.mp4');

  try {
    if (!ffmpegPath) throw new Error('FFmpeg is not available on this server.');
    await fs.writeFile(inputPath, Buffer.from(await image.arrayBuffer()));
    const frames = Math.ceil(duration * 30);
    const filter = `scale=1200:2134:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=${frames}:s=1080x1920:fps=30,format=yuv420p`;
    await execFileAsync(ffmpegPath, ['-y', '-loop', '1', '-i', inputPath, '-vf', filter, '-t', String(duration), '-r', '30', '-an', '-c:v', 'libx264', '-preset', 'fast', '-movflags', '+faststart', outputPath], { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 });
    const video = await fs.readFile(outputPath);
    return new NextResponse(video, { headers: { 'Content-Type': 'video/mp4', 'Content-Disposition': 'attachment; filename="nexuscut-image-motion.mp4"', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Image animation failed', error);
    return NextResponse.json({ error: 'The image could not be rendered. Try a different JPG, PNG, or WebP image.' }, { status: 500 });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
