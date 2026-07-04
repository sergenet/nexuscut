import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const slideCountStr = formData.get('slideCount') as string;
    const slideCount = parseInt(slideCountStr || '0', 10);
    
    if (slideCount === 0) {
      return NextResponse.json({ error: "No slides provided" }, { status: 400 });
    }

    // Setup temp directory
    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const id = Date.now().toString();
    const ffmpegCmd = process.platform === 'win32' ? 'ffmpeg' : '/usr/bin/ffmpeg';
    const scaleFilter = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;

    const generatedVideos: string[] = [];
    const filesToCleanup: string[] = [];

    console.log(`Processing ${slideCount} slides...`);

    for (let i = 0; i < slideCount; i++) {
      const audioFile = formData.get(`audio_${i}`) as File;
      const imageFile = formData.get(`image_${i}`) as File;

      if (!audioFile || !imageFile) continue;

      const audioExt = path.extname(audioFile.name) || '.mp3';
      const imageExt = path.extname(imageFile.name) || '.jpg';
      
      const audioPath = path.join(tempDir, `slide_${id}_${i}_audio${audioExt}`);
      const imagePath = path.join(tempDir, `slide_${id}_${i}_image${imageExt}`);
      const slideVideoPath = path.join(tempDir, `slide_${id}_${i}.mp4`);

      filesToCleanup.push(audioPath, imagePath, slideVideoPath);

      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      fs.writeFileSync(audioPath, audioBuffer);
      
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      fs.writeFileSync(imagePath, imageBuffer);

      // Generate the slide video
      // Important: Must standardize fps and audio sample rate for concat demuxer
      const command = `"${ffmpegCmd}" -y -loop 1 -i "${imagePath}" -i "${audioPath}" -vf "${scaleFilter}" -c:v libx264 -preset fast -tune stillimage -r 30 -c:a aac -b:a 192k -ar 44100 -pix_fmt yuv420p -shortest "${slideVideoPath}"`;

      console.log(`Generating video for slide ${i + 1}...`);
      await execPromise(command);
      
      generatedVideos.push(slideVideoPath);
    }

    if (generatedVideos.length === 0) {
      throw new Error("Failed to process any slides.");
    }

    const finalOutputPath = path.join(tempDir, `base_${id}.mp4`);
    
    // If only 1 slide, just rename/copy it
    if (generatedVideos.length === 1) {
      fs.copyFileSync(generatedVideos[0], finalOutputPath);
    } else {
      // Create concat file
      const concatFilePath = path.join(tempDir, `concat_${id}.txt`);
      filesToCleanup.push(concatFilePath);
      
      const concatContent = generatedVideos.map(v => `file '${v}'`).join('\n');
      fs.writeFileSync(concatFilePath, concatContent);
      
      // Stitch them together
      console.log("Stitching sequence...");
      const concatCmd = `"${ffmpegCmd}" -y -f concat -safe 0 -i "${concatFilePath}" -c copy "${finalOutputPath}"`;
      await execPromise(concatCmd);
    }

    // Cleanup intermediates
    for (const f of filesToCleanup) {
      try { fs.unlinkSync(f); } catch (e) { }
    }

    return NextResponse.json({ videoUrl: `/temp/base_${id}.mp4` });

  } catch (error: any) {
    console.error('Create Base error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
