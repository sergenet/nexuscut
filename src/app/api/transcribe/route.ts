import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Ensure the API key is available
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Transcription will fail.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let fileToTranscribe = file;
    let tempVideoPath = '';
    let tempAudioPath = '';

    // If the file is a video, extract audio using backend FFmpeg
    if (file.type.startsWith('video/')) {
      console.log("Video uploaded for transcription. Extracting audio on server...");
      const tempDir = path.join(process.cwd(), 'public', 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const id = Date.now().toString();
      tempVideoPath = path.join(tempDir, `transcribe_in_${id}.mp4`);
      tempAudioPath = path.join(tempDir, `transcribe_out_${id}.mp3`);
      
      const videoBuffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(tempVideoPath, videoBuffer);
      
      const ffmpegCmd = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
      // Extract audio with heavy compression to keep it under 25MB for OpenAI
      const command = `"${ffmpegCmd}" -y -i "${tempVideoPath}" -vn -acodec libmp3lame -q:a 2 "${tempAudioPath}"`;
      await execPromise(command);
      
      const audioBuffer = fs.readFileSync(tempAudioPath);
      fileToTranscribe = new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' });
    }

    console.log("Sending to OpenAI Whisper API...");
    // Call OpenAI Whisper API for word-level timestamps
    const transcription = await openai.audio.transcriptions.create({
      file: fileToTranscribe,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    // Cleanup temp files
    try {
      if (tempVideoPath && fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
      if (tempAudioPath && fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
    } catch(cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
