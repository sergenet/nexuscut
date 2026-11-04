import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_generate_captions = """
  const generateCaptions = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    let formData = new FormData();
    
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
      // Fallback: Send the whole video file to the server for processing
      // This is crucial for mobile phones (Android/iOS) where ffmpeg.wasm crashes due to low memory!
      setProgressText("Uploading video for server processing (this may take a moment)...");
      formData = new FormData();
      formData.append('file', videoFile);
    }

    try {
      setProgressText("Transcribing via OpenAI Whisper...");
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      if (data.transcription && data.transcription.words) {
        setCaptions(data.transcription.words);
      }
    } catch (error: any) {
      console.error(error);
      alert(Error generating captions: );
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };
"""

content = re.sub(r'  const generateCaptions = async \(\) => \{[\s\S]*?\} finally \{[\s\S]*?\}[\s\S]*?\};', new_generate_captions.strip(), content)

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
