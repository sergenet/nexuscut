import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
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
          content: `You are an expert TikTok and YouTube Shorts growth manager. 
Your goal is to generate 3 highly engaging, viral post captions (descriptions) for a short-form video based on a topic provided by the user. 
Each caption must include:
1. A strong opening sentence.
2. A CTA (Call to action) like "Save this for later" or "Drop a comment".
3. Emojis that fit the vibe.
4. 3-5 highly relevant hashtags.

Respond ONLY with a JSON array of strings containing the 3 captions. Do not include markdown formatting like \`\`\`json or any other text.`
        },
        {
          role: 'user',
          content: `Video Topic: ${topic}`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    let captions = [];
    try {
      captions = JSON.parse(content);
    } catch {
      // Fallback
      captions = content.split('\n\n').filter(line => line.trim().length > 0);
      captions = captions.slice(0, 3);
    }

    return NextResponse.json({ captions });
  } catch (error) {
    console.error('Error generating captions:', error);
    return NextResponse.json({ error: 'Failed to generate captions' }, { status: 500 });
  }
}
