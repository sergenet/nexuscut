import re

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the WAV encoder helper outside the component
wav_helper = """
function audioBufferToWav(buffer: AudioBuffer, startSample: number, endSample: number): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const numSamples = endSample - startSample;
  
  const blockAlign = numChannels * 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  for (let i = startSample; i < endSample; i++) {
    let sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

export default function VideoEditor() {
"""

content = content.replace("export default function VideoEditor() {", wav_helper.strip())


# Replace generateCaptions
new_generate_captions = """
  const generateCaptions = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      try {
        console.log("Mobile device detected. Using native AudioContext chunking.");
        setProgressText("Decoding audio (this takes a few seconds)...");
        
        const arrayBuffer = await videoFile.arrayBuffer();
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
        
        // Downsample to 16kHz Mono
        const TARGET_SAMPLE_RATE = 16000;
        const offlineCtx = new OfflineAudioContext(1, decodedData.duration * TARGET_SAMPLE_RATE, TARGET_SAMPLE_RATE);
        const source = offlineCtx.createBufferSource();
        source.buffer = decodedData;
        source.connect(offlineCtx.destination);
        source.start();
        
        const renderedBuffer = await offlineCtx.startRendering();
        
        const CHUNK_DURATION_SEC = 60; // 1 minute chunks
        const samplesPerChunk = TARGET_SAMPLE_RATE * CHUNK_DURATION_SEC;
        const totalSamples = renderedBuffer.length;
        const totalChunks = Math.ceil(totalSamples / samplesPerChunk);
        
        let allWords: any[] = [];
        
        for (let i = 0; i < totalChunks; i++) {
          setProgressText(Transcribing chunk  of ...);
          const startSample = i * samplesPerChunk;
          const endSample = Math.min(startSample + samplesPerChunk, totalSamples);
          
          const wavBlob = audioBufferToWav(renderedBuffer, startSample, endSample);
          const wavFile = new File([wavBlob], chunk_.wav, { type: "audio/wav" });
          
          const formData = new FormData();
          formData.append('file', wavFile);
          
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          if (!res.ok) throw new Error(Chunk  failed);
          
          const data = await res.json();
          if (data.transcription && data.transcription.words) {
            const timeOffset = i * CHUNK_DURATION_SEC;
            const shiftedWords = data.transcription.words.map((w: any) => ({
              ...w,
              start: w.start + timeOffset,
              end: w.end + timeOffset
            }));
            allWords = allWords.concat(shiftedWords);
          }
        }
        
        setCaptions(allWords);
        setIsProcessing(false);
        setProgressText("");
        return; // Done mobile path
      } catch (err: any) {
        console.error(err);
        alert(Mobile extraction failed: );
        setIsProcessing(false);
        setProgressText("");
        return;
      }
    } 

    // DESKTOP PATH
    let formData = new FormData();
    try {
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
      console.warn("Desktop FFmpeg failed.", clientSideError);
      alert("Local extraction failed. Please try a different video.");
      setIsProcessing(false);
      setProgressText("");
      return;
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

content = re.sub(r'  const generateCaptions = async \(\) => \{[\s\S]*?    \}\n  \};\n', new_generate_captions.strip() + '\n\n', content, count=1)

with open(r'C:\NexusCut\src\components\VideoEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
