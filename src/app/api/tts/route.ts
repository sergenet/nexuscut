import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkGuestLimit, incrementGuestUsage } from '@/lib/rateLimit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const limitCheck = await checkGuestLimit(req, 3);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.error }, { status: 429 });
    }

    const { text, voice } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Supported voices: alloy, echo, fable, onyx, nova, and shimmer
    const selectedVoice = voice || 'alloy';

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: selectedVoice as 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer' | 'verse',
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    await incrementGuestUsage(req);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="tts.mp3"',
      },
    });

  } catch (error: unknown) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
