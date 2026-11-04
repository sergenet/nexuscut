import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const rectsJson = formData.get('rects') as string;
    
    if (!videoFile || !rectsJson) {
      return NextResponse.json({ error: 'No video file or coordinates provided' }, { status: 400 });
    }
    if (videoFile.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: 'Video must be 250 MB or smaller.' }, { status: 413 });
    }
    try {
      const rects = JSON.parse(rectsJson);
      if (!Array.isArray(rects) || rects.length > 100) throw new Error('invalid');
    } catch {
      return NextResponse.json({ error: 'Invalid erase coordinates.' }, { status: 400 });
    }

    const tmpDir = path.join(os.tmpdir(), 'nexuscut_ai');
    await fs.mkdir(tmpDir, { recursive: true });

    const inputPath = path.join(tmpDir, `input_erase_${Date.now()}.mp4`);
    const outputPath = path.join(tmpDir, `output_erase_${Date.now()}.mp4`);

    const arrayBuffer = await videoFile.arrayBuffer();
    await fs.writeFile(inputPath, Buffer.from(arrayBuffer));

    // The Python script will handle processing the video
    const pythonScript = path.join(process.cwd(), 'src', 'ai', 'eraser.py');
    await execFileAsync('python', [pythonScript, inputPath, outputPath, rectsJson], {
      timeout: 5 * 60 * 1000,
      maxBuffer: 1024 * 1024,
    });

    const outputBuffer = await fs.readFile(outputPath);

    // Clean up
    await fs.unlink(inputPath).catch(console.error);
    await fs.unlink(outputPath).catch(console.error);

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="erased.mp4"'
      }
    });

  } catch (error: unknown) {
    console.error('Smart Tool Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Processing failed' }, { status: 500 });
  }
}
