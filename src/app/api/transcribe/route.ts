import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Call OpenAI Whisper API for word-level timestamps
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
