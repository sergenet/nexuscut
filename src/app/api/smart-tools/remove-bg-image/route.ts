import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const pythonExecutable = process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'python' : 'python3');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');
    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    if (imageFile.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image must be 25 MB or smaller.' }, { status: 413 });
    }

    const tmpDir = path.join(os.tmpdir(), 'nexuscut_ai');
    await fs.mkdir(tmpDir, { recursive: true });

    const inputPath = path.join(tmpDir, `input_${Date.now()}.png`);
    const outputPath = path.join(tmpDir, `output_${Date.now()}.png`);

    const arrayBuffer = await imageFile.arrayBuffer();
    await fs.writeFile(inputPath, Buffer.from(arrayBuffer));

    const pythonScript = path.join(process.cwd(), 'src', 'ai', 'remove_bg_image.py');
    await execFileAsync(pythonExecutable, [pythonScript, inputPath, outputPath], {
      timeout: 2 * 60 * 1000,
      maxBuffer: 1024 * 1024,
    });

    const outputBuffer = await fs.readFile(outputPath);

    // Clean up
    await fs.unlink(inputPath).catch(console.error);
    await fs.unlink(outputPath).catch(console.error);

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="removed_bg.png"'
      }
    });

  } catch (error: unknown) {
    console.error('Smart Tool Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Processing failed' }, { status: 500 });
  }
}
