import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) console.warn("OPENAI_API_KEY missing");
if (!process.env.PEXELS_API_KEY) console.warn("PEXELS_API_KEY missing");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PEXELS_KEY = process.env.PEXELS_API_KEY;

export async function POST(req: Request) {
  try {
    const { captions } = await req.json();
    if (!captions || captions.length === 0) return NextResponse.json({ error: 'No captions provided' }, { status: 400 });

    const transcriptText = captions.map((c: any) => `[${c.start.toFixed(1)}s-${c.end.toFixed(1)}s] ${c.word}`).join(" ");

    const systemPrompt = `You are an expert social media video editor.
Analyze the transcript and find exactly 1 or 2 high-impact moments that would benefit from B-Roll stock footage.
For each moment, define the exact start and end timestamps (from the transcript brackets) and a 1-3 word highly descriptive search query to find relevant stock video (e.g., "money falling", "gym workout", "sad person").

Return exactly this JSON structure:
{
  "broll": [
    {
      "start": <number in seconds>,
      "end": <number in seconds>,
      "query": "<search query string>"
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

    if (!resultJson.broll || resultJson.broll.length === 0) {
      return NextResponse.json({ segments: [] });
    }

    // Fetch actual videos from Pexels for each suggestion
    const segments = [];
    for (const item of resultJson.broll) {
      if (!PEXELS_KEY) {
        segments.push({ ...item, videoUrl: null, error: 'No Pexels API Key' });
        continue;
      }

      try {
        const pexelsRes = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(item.query)}&per_page=1&orientation=portrait`, {
          headers: { Authorization: PEXELS_KEY }
        });
        const pexelsData = await pexelsRes.json();
        
        if (pexelsData.videos && pexelsData.videos.length > 0) {
          // Find the best quality mp4
          const files = pexelsData.videos[0].video_files;
          const bestFile = files.sort((a: any, b: any) => b.width - a.width).find((f: any) => f.file_type === 'video/mp4');
          
          if (bestFile) {
            segments.push({
              start: item.start,
              end: item.end,
              query: item.query,
              videoUrl: bestFile.link
            });
          }
        }
      } catch (err) {
        console.error("Pexels fetch error:", err);
      }
    }

    return NextResponse.json({ segments });

  } catch (error: any) {
    console.error('B-Roll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
