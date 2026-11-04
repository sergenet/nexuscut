import re

# 1. Update VideoEditor.tsx to bypass ffmpeg on mobile
with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_generate_captions = """
  const generateCaptions = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    let formData = new FormData();
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log("Mobile device detected. Bypassing client FFmpeg.");
      setProgressText("Uploading video for server processing (this may take a moment)...");
      formData.append('file', videoFile);
    } else {
      try {
        // Try Client-Side Audio Extraction first (fastest for desktop)
        const { fetchFile } = await import('@ffmpeg/util');
        const ffmpeg = await loadFFmpeg();

        setProgressText("Extracting audio stream...");
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
        await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'libmp3lame', '-q:a', '2', 'audio.mp3']);
        
        const fileData = await ffmpeg.readFile('audio.mp3');
        const audioBlob = new Blob([fileData], { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });
        
        formData.append('file', audioFile);
      } catch (clientSideError) {
        console.warn("Client-side FFmpeg failed. Falling back to server-side extraction.", clientSideError);
        setProgressText("Uploading video for server processing (this may take a moment)...");
        formData = new FormData();
        formData.append('file', videoFile);
      }
    }

    try {
"""

content = re.sub(r'  const generateCaptions = async \(\) => \{[\s\S]*?try \{', new_generate_captions.strip() + '\n      setProgressText("Transcribing via OpenAI Whisper...");', content, count=1)

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update transcribe route to use dynamic ffmpeg path
with open(r'C:\NexusCut\src\app\api\transcribe\route.ts', 'r', encoding='utf-8') as f:
    t_content = f.read()

t_content = t_content.replace(
    "const ffmpegCmd = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');",
    "const ffmpegCmd = require('@ffmpeg-installer/ffmpeg').path;"
)

with open(r'C:\NexusCut\src\app\api\transcribe\route.ts', 'w', encoding='utf-8') as f:
    f.write(t_content)

# 3. Update export route to use dynamic ffmpeg path
with open(r'C:\NexusCut\src\app\api\export\route.ts', 'r', encoding='utf-8') as f:
    e_content = f.read()

e_content = e_content.replace(
    "const ffmpegCmd = path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');",
    "const ffmpegCmd = require('@ffmpeg-installer/ffmpeg').path;"
)

with open(r'C:\NexusCut\src\app\api\export\route.ts', 'w', encoding='utf-8') as f:
    f.write(e_content)

# 4. Update next.config.ts to mark @ffmpeg-installer/ffmpeg as server external
new_next_config = """import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg'],
};

export default nextConfig;
"""
with open(r'C:\NexusCut\next.config.ts', 'w', encoding='utf-8') as f:
    f.write(new_next_config)
