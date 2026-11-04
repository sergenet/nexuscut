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

    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key is missing' }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert short-form video strategist and copywriter for TikTok and YouTube Shorts. 
Your goal is to draft exactly 5 concise opening lines for a short-form video based on the topic provided by the user.
Do not describe the lines as proven, guaranteed, data-backed, or certain to improve performance.
The hooks should use proven frameworks (curiosity gap, negative framing, authority, etc.). 
Respond ONLY with a JSON array of strings containing the 5 hooks. Do not include markdown formatting like \`\`\`json or any other text.`
        },
        {
          role: 'user',
          content: `Topic: ${topic}`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    let hooks = [];
    try {
      hooks = JSON.parse(content);
    } catch {
      // Fallback in case the LLM didn't return clean JSON
      hooks = content.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^[\d\-\.\*\[\]\"\s]+/, '').trim());
      // Ensure we only return 5
      hooks = hooks.slice(0, 5);
    }

    await incrementGuestUsage(req);

    return NextResponse.json({ hooks });
  } catch (error) {
    console.error('Error generating hooks:', error);
    return NextResponse.json({ error: 'Failed to generate hooks' }, { status: 500 });
  }
}
