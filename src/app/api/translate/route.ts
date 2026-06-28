import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { captions, targetLanguage } = await req.json();

    if (!captions || !targetLanguage) {
      return NextResponse.json({ error: 'Captions and Target Language are required' }, { status: 400 });
    }

    const prompt = `You are an expert subtitle translator.
Translate the following array of caption objects into ${targetLanguage}.
You MUST maintain the exact same JSON structure, array length, and exact "start" and "end" timestamps.
Only translate the "word" field. Keep any emojis in the "emoji" field exactly as they are.

Input Captions JSON:
${JSON.stringify(captions)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const parsed = JSON.parse(content);
    
    // GPT might return it wrapped in a "captions" key if it interprets "json_object" that way
    const translatedArray = parsed.captions || parsed;

    return NextResponse.json(translatedArray);
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Failed to translate captions' }, { status: 500 });
  }
}
