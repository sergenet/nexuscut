import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const prompt = `You are an expert social media manager and viral content strategist.
Read the following transcript of a short-form video (TikTok/Reels/Shorts) and generate:
1. 3 highly engaging, clickbaity (but accurate) titles.
2. A short, punchy video description with emojis.
3. 10 highly relevant SEO-optimized hashtags.

Format the response EXACTLY as a JSON object with this structure:
{
  "titles": ["title1", "title2", "title3"],
  "description": "the description here...",
  "hashtags": ["#tag1", "#tag2"]
}

Transcript:
"${transcript}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Marketing API error:', error);
    return NextResponse.json({ error: 'Failed to generate marketing materials' }, { status: 500 });
  }
}
