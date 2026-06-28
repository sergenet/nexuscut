import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const videoFile = formData.get('videoFile') as File;
    const bgmFile = formData.get('bgmFile') as File | null;
    const activeSegmentsStr = formData.get('activeSegments') as string;
    const captionsStr = formData.get('captions') as string;
    const brollSegmentsStr = formData.get('brollSegments') as string;
    const autoZoom = formData.get('autoZoom') === 'true';
    const magicColor = formData.get('magicColor') === 'true';
    const captionFont = formData.get('captionFont') as string || 'Roboto-Black';
    const captionSize = formData.get('captionSize') as string || '48';
    const captionColor = formData.get('captionColor') as string || '#FFFF00';
    const mainVolume = formData.get('mainVolume') as string || '1.0';
    const bgmVolume = formData.get('bgmVolume') as string || '0.5';
    const vw = formData.get('vw') as string || '1080';
    const vh = formData.get('vh') as string || '1920';

    const activeSegments = JSON.parse(activeSegmentsStr || '[]');
    const captions = JSON.parse(captionsStr || '[]');
    const brollSegments = JSON.parse(brollSegmentsStr || '[]');

    // Setup temp directory
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const id = Date.now().toString();
    const inputPath = path.join(tempDir, `input_${id}.mp4`);
    const outputPath = path.join(tempDir, `output_${id}.mp4`);
    const bgmPath = path.join(tempDir, `bgm_${id}.mp3`);
    const srtPath = path.join(tempDir, `captions_${id}.srt`);
    const fontPath = path.join(tempDir, `${captionFont}.ttf`);

    // Write video
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    fs.writeFileSync(inputPath, videoBuffer);

    // Write BGM
    if (bgmFile) {
      const bgmBuffer = Buffer.from(await bgmFile.arrayBuffer());
      fs.writeFileSync(bgmPath, bgmBuffer);
    }

    // Download Font
    let fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Black.ttf';
    if (captionFont === 'Montserrat-Bold') fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Bold.ttf';
    if (captionFont === 'BebasNeue-Regular') fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf';
    if (captionFont === 'Oswald-Bold') fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald-Bold.ttf';
    
    const fontRes = await fetch(fontUrl);
    const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
    fs.writeFileSync(fontPath, fontBuffer);

    // Download B-Roll videos
    const brollPaths = [];
    for (let i = 0; i < brollSegments.length; i++) {
      const seg = brollSegments[i];
      if (seg.videoUrl) {
        const bp = path.join(tempDir, `broll_${id}_${i}.mp4`);
        const bRes = await fetch(seg.videoUrl);
        const bBuf = Buffer.from(await bRes.arrayBuffer());
        fs.writeFileSync(bp, bBuf);
        brollPaths.push({ path: bp, start: seg.start, end: seg.end });
      }
    }

    // Write SRT
    if (captions.length > 0) {
      let srt = "";
      const validCaps = captions.filter((c:any) => activeSegments.some((seg:any) => c.start >= seg.start && c.end <= seg.end));
      validCaps.forEach((c:any, index:number) => {
        const formatTime = (seconds: number) => {
          const date = new Date(seconds * 1000);
          const hh = String(date.getUTCHours()).padStart(2, '0');
          const mm = String(date.getUTCMinutes()).padStart(2, '0');
          const ss = String(date.getUTCSeconds()).padStart(2, '0');
          const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
          return `${hh}:${mm}:${ss},${ms}`;
        };
        srt += `${index + 1}\n${formatTime(c.start)} --> ${formatTime(c.end)}\n${c.word}${c.emoji ? ' ' + c.emoji : ''}\n\n`;
      });
      fs.writeFileSync(srtPath, srt);
    }

    // Build FFmpeg command
    // Bypass Next.js Webpack bundler issues by manually referencing the downloaded binary
    const ffmpegCmd = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');

    let inputs = [`-i "${inputPath}"`];
    brollPaths.forEach(b => inputs.push(`-i "${b.path}"`));
    if (bgmFile) inputs.push(`-i "${bgmPath}"`);

    // Build Filtergraph
    let filterGraph = [];
    let currentVideoLabel = `0:v`;

    // 1. Overlay B-Rolls
    for (let i = 0; i < brollPaths.length; i++) {
      const b = brollPaths[i];
      const duration = b.end - b.start;
      const brollIdx = i + 1;
      
      // scale and crop to match main video, then pad the beginning with black frames to sync it flawlessly with the main timeline
      const brollFilter = `[${brollIdx}:v]scale=${vw}:${vh}:force_original_aspect_ratio=increase,crop=${vw}:${vh},tpad=start_duration=${b.start}:color=black[broll${i}]`;
      filterGraph.push(brollFilter);
      
      // eof_action=pass prevents FFmpeg from freezing or outputting black if the B-roll ends early
      const overlayFilter = `[${currentVideoLabel}][broll${i}]overlay=enable='between(t,${b.start},${b.end})':eof_action=pass[v_ovl${i}]`;
      filterGraph.push(overlayFilter);
      
      currentVideoLabel = `v_ovl${i}`;
    }

    // 2. Select filter (Cutting out silence/magic clips)
    let selectFilter = activeSegments.map((s:any) => `between(t,${s.start},${s.end})`).join('+');
    if (!selectFilter) selectFilter = '1';

    filterGraph.push(`[${currentVideoLabel}]fps=30,select='${selectFilter}',setpts=N/30/TB[v_sel]`);
    currentVideoLabel = `v_sel`;

    // 3. Zoom
    if (autoZoom) {
      filterGraph.push(`[${currentVideoLabel}]crop='iw/min(1+0.03*t,1.5)':'ih/min(1+0.03*t,1.5)':'(iw-ow)/2':'(ih-oh)/2',scale=${vw}:${vh}[v_zoom]`);
      currentVideoLabel = `v_zoom`;
    }

    // 3.5 Magic Color (Enhancement)
    if (magicColor) {
      filterGraph.push(`[${currentVideoLabel}]eq=contrast=1.15:saturation=1.2:brightness=0.02[v_magic]`);
      currentVideoLabel = `v_magic`;
    }

    // 4. Captions
    if (captions.length > 0) {
      // Convert hex color to ASS format
      const r = captionColor.substring(1, 3);
      const g = captionColor.substring(3, 5);
      const b = captionColor.substring(5, 7);
      const assColor = `&H00${b}${g}${r}`;
      // Windows absolute paths with colons (C:) break FFmpeg's filter parser. 
      // Using relative paths entirely avoids the escaping nightmare!
      const escapedSrtPath = path.relative(process.cwd(), srtPath).replace(/\\/g, '/');
      const escapedFontsDir = path.relative(process.cwd(), tempDir).replace(/\\/g, '/');
      
      const styleString = `FontName=${captionFont},FontSize=${captionSize},PrimaryColour=${assColor},OutlineColour=&H00000000,BorderStyle=1,Outline=3,Alignment=2,MarginV=40`;
      filterGraph.push(`[${currentVideoLabel}]subtitles='${escapedSrtPath}':fontsdir='${escapedFontsDir}':force_style='${styleString}'[v_out]`);
      currentVideoLabel = `v_out`;
    }

    // Audio filtergraph
    const autoSfx = formData.get('autoSfx') === 'true';
    let currentAudioLabel = `0:a`;
    filterGraph.push(`[${currentAudioLabel}]aselect='${selectFilter}',asetpts=N/SR/TB,volume=${mainVolume}[a_sel]`);
    currentAudioLabel = `a_sel`;

    let numAudioInputs = 1;
    let audioMixInputs = `[a_sel]`;

    if (bgmFile) {
      const bgmIdx = brollPaths.length + 1;
      filterGraph.push(`[${bgmIdx}:a]volume=${bgmVolume}[a_bgm]`);
      audioMixInputs += `[a_bgm]`;
      numAudioInputs++;
    }

    if (autoSfx && brollPaths.length > 0) {
      const swooshPath = path.join(process.cwd(), 'public', 'sfx', 'swoosh.mp3');
      inputs.push(`-i "${swooshPath}"`);
      const swooshIdx = brollPaths.length + (bgmFile ? 2 : 1);
      
      filterGraph.push(`[${swooshIdx}:a]volume=0.8,asplit=${brollPaths.length}` + brollPaths.map((_, i) => `[sw${i}]`).join(''));
      
      brollPaths.forEach((b, i) => {
        const delayMs = Math.round(b.start * 1000);
        filterGraph.push(`[sw${i}]adelay=${delayMs}|${delayMs}[sfx${i}]`);
        audioMixInputs += `[sfx${i}]`;
        numAudioInputs++;
      });
    }

    if (numAudioInputs > 1) {
      filterGraph.push(`${audioMixInputs}amix=inputs=${numAudioInputs}:duration=first:dropout_transition=2[a_out]`);
      currentAudioLabel = `a_out`;
    }

    const finalFilterStr = filterGraph.join('; ');
    
    let command = `"${ffmpegCmd}" -y ${inputs.join(' ')} -filter_complex "${finalFilterStr}" -map "[${currentVideoLabel}]" -map "[${currentAudioLabel}]" -c:v libx264 -preset fast "${outputPath}"`;

    // Execute FFmpeg
    console.log("Executing FFmpeg...");
    await execPromise(command);

    // Return the URL to the exported video
    return NextResponse.json({ downloadUrl: `/temp/output_${id}.mp4` });

  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
