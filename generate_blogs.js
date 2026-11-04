const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const apiKeyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

const openai = new OpenAI({
  apiKey: apiKey,
});

const missingTopics = [
  { slug: 'edit-vertical-videos-reels', title: 'How to Edit Vertical Videos for Reels', category: 'Tutorial' },
  { slug: 'make-viral-tiktok-subtitles', title: 'How to Make Viral TikTok Subtitles', category: 'Design' },
  { slug: 'animated-captions-watch-time', title: 'Why Animated Captions Increase Watch Time', category: 'Analytics' },
  { slug: 'edit-sports-highlights', title: 'How to Edit Sports Highlights for TikTok', category: 'Niche' },
  { slug: 'edit-tutorial-clips', title: 'How to Edit Tutorial Clips', category: 'Tutorial' },
  { slug: 'word-by-word-captions', title: 'How to Add Word-by-Word Captions', category: 'Tutorial' },
  { slug: 'edit-reaction-videos', title: 'How to Edit Reaction Videos', category: 'Niche' },
  { slug: 'edit-motivational-clips', title: 'How to Edit Motivational Clips', category: 'Niche' },
  { slug: 'edit-comedy-clips', title: 'How to Edit Comedy Clips', category: 'Niche' },
  { slug: 'edit-business-clips', title: 'How to Edit Business Clips', category: 'Niche' },
  { slug: 'edit-educational-shorts', title: 'How to Edit Educational Shorts', category: 'Niche' },
  { slug: 'create-engaging-reels-ai', title: 'How to Create Engaging Reels with AI', category: 'Technology' },
];

async function generateContent(title) {
  console.log(`Generating content for: ${title}`);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert content marketer for NexusCut, an AI video editor for TikTok and Shorts. 
Write a short, engaging, and highly informative blog post (about 250-350 words) in Markdown format for the given title. 
Structure it with an H1 header, 2-3 H2 headers, bullet points, and short paragraphs. 
Promote NexusCut's features (auto-captions, AI background removal, magic cut, beat sync, etc.) where relevant.
Do NOT include the metadata (slug, title, etc) in your response, just the raw markdown body content.`
      },
      {
        role: 'user',
        content: `Write the blog post for: ${title}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content.trim();
}

async function main() {
  let newEntries = `\n// Generated posts below\n`;
  
  for (const topic of missingTopics) {
    const content = await generateContent(topic.title);
    
    // Create the TS object
    const entry = `
  {
    slug: '${topic.slug}',
    title: '${topic.title.replace(/'/g, "\\'")}',
    description: 'Learn the secrets to mastering ${topic.title.toLowerCase()} and skyrocketing your views.',
    date: '2026-07-22',
    category: '${topic.category}',
    content: \`\n${content.replace(/`/g, '\\`')}\n\`
  },`;
    
    newEntries += entry;
  }

  const filePath = path.join(__dirname, 'src', 'lib', 'blogData.ts');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Replace the closing bracket of the array
  fileContent = fileContent.replace(/];\s*$/, newEntries + '\n];\n');
  
  fs.writeFileSync(filePath, fileContent);
  console.log('Successfully added 12 new blog posts to blogData.ts');
}

main().catch(console.error);
