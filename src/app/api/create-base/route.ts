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
    
    const audioFile = formData.get('audio') as File;
    const imageFile = formData.get('image') as File;

    if (!audioFile || !imageFile) {
      return NextResponse.json({ error: "Missing audio or image file" }, { status: 400 });
    }

    // Setup temp directory
    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const id = Date.now().toString();
    
    const audioExt = path.extname(audioFile.name) || '.mp3';
    const imageExt = path.extname(imageFile.name) || '.jpg';
    
    const audioPath = path.join(tempDir, `base_audio_${id}${audioExt}`);
    const imagePath = path.join(tempDir, `base_image_${id}${imageExt}`);
    const outputPath = path.join(tempDir, `base_${id}.mp4`);

    // Write files
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    fs.writeFileSync(audioPath, audioBuffer);
    
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    fs.writeFileSync(imagePath, imageBuffer);

    // Command to create video:
    // loop image, add audio, scale/crop to 1080x1920 (9:16), stop at shortest (audio)
    const ffmpegCmd = process.platform === 'win32' ? 'ffmpeg' : '/usr/bin/ffmpeg';
    
    // Scale filter to ensure 1080x1920 by cropping instead of stretching
    const scaleFilter = `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920`;

    const command = `"${ffmpegCmd}" -y -loop 1 -i "${imagePath}" -i "${audioPath}" -vf "${scaleFilter}" -c:v libx264 -preset fast -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputPath}"`;

    console.log("Executing FFmpeg base video generation...");
    await execPromise(command);

    // We can delete the input files to save space
    try {
      fs.unlinkSync(audioPath);
      fs.unlinkSync(imagePath);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ videoUrl: `/temp/base_${id}.mp4` });

  } catch (error: any) {
    console.error('Create Base error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
