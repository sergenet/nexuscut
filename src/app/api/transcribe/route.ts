import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import Busboy from 'busboy';
import { Readable } from 'stream';

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
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type. Expected multipart/form-data.' }, { status: 400 });
    }

    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const id = Date.now().toString();
    const tempVideoPath = path.join(tempDir, `transcribe_in_${id}.mp4`);
    const tempAudioPath = path.join(tempDir, `transcribe_out_${id}.mp3`);

    let isVideoUploaded = false;

    // Stream the multipart form data using Busboy
    await new Promise((resolve, reject) => {
      try {
        const bb = Busboy({ headers: { 'content-type': contentType } });

        bb.on('file', (name, file, info) => {
          if (name === 'file') {
            console.log(`Streaming uploaded file directly to disk: ${tempVideoPath}...`);
            const writeStream = fs.createWriteStream(tempVideoPath);
            file.pipe(writeStream);
            file.on('end', () => {
              isVideoUploaded = true;
            });
          } else {
            file.resume(); // discard other files to prevent hanging
          }
        });

        bb.on('finish', () => resolve(true));
        bb.on('error', (err) => reject(err));

        if (req.body) {
          // req.body is a Web ReadableStream. Convert it to a Node.js Readable stream.
          // @ts-ignore - Readable.fromWeb exists in Node.js 17+ which the VPS uses.
          const nodeStream = Readable.fromWeb(req.body);
          nodeStream.pipe(bb);
        } else {
          reject(new Error("Empty request body"));
        }
      } catch (err) {
        reject(err);
      }
    });

    if (!isVideoUploaded) {
      return NextResponse.json({ error: 'No file provided in form data' }, { status: 400 });
    }

    // Process the video using FFmpeg on the server
    console.log("Video fully uploaded. Extracting audio on server using FFmpeg...");
    const ffmpegCmd = require('@ffmpeg-installer/ffmpeg').path;
    // Extract audio with heavy compression to keep it under 25MB for OpenAI
    const command = `"${ffmpegCmd}" -y -i "${tempVideoPath}" -vn -acodec libmp3lame -q:a 2 "${tempAudioPath}"`;
    await execPromise(command);

    console.log("Audio extracted successfully. Sending to OpenAI Whisper API...");
    const audioBuffer = fs.readFileSync(tempAudioPath);
    const fileToTranscribe = new File([audioBuffer], 'audio.mp3', { type: 'audio/mp3' });

    const transcription = await openai.audio.transcriptions.create({
      file: fileToTranscribe,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    // Cleanup temp files
    try {
      if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
      if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
