import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. Emoji generation will fail.");
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

    const transcriptText = captions.map((c: any) => `[${c.start.toFixed(1)}s-${c.end.toFixed(1)}s] ${c.word}`).join(" ");

    const systemPrompt = `You are an expert social media video editor.
Your job is to analyze a transcript and add relevant emojis to make the captions visually engaging, similar to TikTok or Instagram Reels.

You will receive the transcript where each word is preceded by its timestamp [start-end].
Return a JSON object containing an array called "emojis".
Each object in the array should correspond to a specific word timestamp where you want to insert an emoji, and the emoji character itself.
Do NOT add an emoji for every single word. Only add emojis to highly expressive keywords (e.g., "money" -> "💰", "crazy" -> "🤯", "fire" -> "🔥"). 
Aim for about 1 emoji every 5 to 10 words.

Return exactly this JSON structure:
{
  "emojis": [
    {
      "start": <number in seconds, exact match from transcript>,
      "emoji": "<the emoji character>"
    }
  ]
}`;

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
    
    // Merge the emojis back into the captions array
    const updatedCaptions = captions.map((c: any) => {
      // Find if this word got an emoji assigned based on the start time
      // Because of float precision, allow a tiny delta
      const emojiMatch = resultJson.emojis.find((e: any) => Math.abs(e.start - c.start) < 0.05);
      if (emojiMatch) {
        return { ...c, emoji: emojiMatch.emoji };
      }
      return c;
    });

    return NextResponse.json({ captions: updatedCaptions });
  } catch (error: any) {
    console.error('Emoji error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
