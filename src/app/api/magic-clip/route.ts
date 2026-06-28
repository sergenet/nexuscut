import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Magic Clip will fail.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { captions } = await req.json();
    
    if (!captions || captions.length === 0) {
      return NextResponse.json({ error: 'No captions provided' }, { status: 400 });
    }

    // Reconstruct the full text with approximate timestamps for the LLM
    // To save tokens and guide the LLM, we'll chunk it into sentences or phrases.
    // For simplicity, we just pass the raw words with timestamps.
    const transcriptText = captions.map((c: any) => `[${c.start.toFixed(1)}s-${c.end.toFixed(1)}s] ${c.word}`).join(" ");

    const systemPrompt = `You are an expert viral video editor and social media manager.
You analyze video transcripts to find the most engaging, high-retention, "viral" clip (often called a hook or magic clip).

Analyze the following transcript which includes timestamps [start-end] for each word.
Return a JSON object with EXACTLY the following structure:
{
  "clips": [
    {
      "start": <number in seconds>,
      "end": <number in seconds>,
      "score": <number 1-100 indicating viral potential>,
      "title": "<STRICTLY 3 to 5 words MAXIMUM. Must be a catchy, clickbait-style title (e.g. 'The Ultimate Test', 'Mind Blowing Fact'). DO NOT output the raw transcript here.>",
      "reasoning": "<1 short sentence explaining why this clip is engaging.>"
    }
  ]
}

Ensure the start and end times correspond to actual timestamps in the provided transcript.

CRITICAL RULES:
1. You MUST ALWAYS return at least 1 clip in the "clips" array, no matter how short the video is. Do not return an empty array.
2. If the entire video is 60 seconds or less, do not skip returning clips. Just find the best continuous segment within it (even if it's only 5-10 seconds long), or return the entire transcript as the clip if it's all good.
3. Provide up to 3 clip options, sorted by score (highest first).`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcriptText }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const resultString = completion.choices[0].message.content;
    if (!resultString) throw new Error("No response from OpenAI");
    
    const resultJson = JSON.parse(resultString);

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error('Magic Clip error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
