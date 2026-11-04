import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getVerifiedUser } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user?.isPro || !['pro', 'agency'].includes(user.planTier)) {
      return NextResponse.json({ error: 'Growth Mode is available on the Pro plan.' }, { status: 403 });
    }
    const { transcript } = await req.json();
    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is missing' }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert short-form video strategist. Given a timestamped transcript, return exactly three distinct, coherent hook candidates. Each should be a self-contained 8-25 second spoken excerpt that starts and ends on a natural thought boundary. Score each candidate from 0-100 for curiosity, clarity, emotion, and opening strength. Do not invent words or timestamps. Return ONLY JSON in this form: {"candidates":[{"start":number,"end":number,"title":string,"reason":string,"scores":{"curiosity":number,"clarity":number,"emotion":number,"opening":number}}]}. Titles and reasons must be concise. Do not include markdown.`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error extracting hook:', error);
    return NextResponse.json({ error: 'Failed to extract hook' }, { status: 500 });
  }
}
