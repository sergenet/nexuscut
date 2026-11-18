import { NextResponse } from 'next/server';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  let tempFilePath: string | null = null;
  try {
    console.log("Agents Processing Video...");
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    if (file.size > 250 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be 250 MB or smaller.' }, { status: 413 });
    }

    // Save the file to the OS secure temp directory (never publicly web-accessible)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const extension = file.name.match(/\.[a-z0-9]{1,8}$/i)?.[0].toLowerCase() || '.mp4';
    const safeExtension = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'].includes(extension) ? extension : '.mp4';
    const fileName = `nexuscut-pipeline-${crypto.randomUUID()}${safeExtension}`;
    tempFilePath = join(os.tmpdir(), fileName);
    await writeFile(tempFilePath, buffer);

    // Call OpenAI Whisper API to transcribe the video/audio
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
    });

    const transcriptText = transcription.text;

    // Use GPT-4o to analyze the transcript and generate viral hooks
    const hookResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert TikTok editor. Given a raw transcript, analyze it and generate 3 highly engaging viral hooks that could be used for the video. Keep them short and punchy.',
        },
        {
          role: 'user',
          content: `Here is the transcript: "${transcriptText}"`,
        }
      ],
      temperature: 0.7,
    });

    const generatedHooks = hookResponse.choices[0].message.content;

    return NextResponse.json({
      success: true,
      message: 'Video fully processed by AI pipeline.',
      transcript: transcriptText,
      hooks: generatedHooks,
      videoUrl: null
    });

  } catch (error: unknown) {
    console.error('AI Pipeline error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Pipeline failed' }, { status: 500 });
  } finally {
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => undefined);
    }
  }
}
