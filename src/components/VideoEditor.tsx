"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Play, Pause, Scissors, Type, Download, Loader2, Sparkles, VolumeX, Smile, Music, ZoomIn, Video, Save, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoEditor() {
  const [activeStep, setActiveStep] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [captions, setCaptions] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => setIsPro(data.isPro))
      .catch(console.error);
  }, []);
  
  const [videoDuration, setVideoDuration] = useState(0);
  
  // Phase 2, 2.5 & 3 states
  const [silenceThreshold, setSilenceThreshold] = useState(-30);
  const [magicClips, setMagicClips] = useState<any[]>([]);
  const [activeSegments, setActiveSegments] = useState<{start: number, end: number}[]>([]);
  const [brollSegments, setBrollSegments] = useState<any[]>([]);
  
  const [captionFont, setCaptionFont] = useState('Roboto-Black');
  const [captionSize, setCaptionSize] = useState(48);
  const [captionColor, setCaptionColor] = useState('#FFFF00');
  const [autoZoom, setAutoZoom] = useState(false);
  const [bgmFile, setBgmFile] = useState<File | null>(null);
  const [mainVolume, setMainVolume] = useState(1.0);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [magicColor, setMagicColor] = useState(false);
  const [marketingData, setMarketingData] = useState<any>(null);
  
  const [ttsText, setTtsText] = useState("");
  const [ttsVoice, setTtsVoice] = useState("alloy");
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);
  
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [autoSfx, setAutoSfx] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ffmpegRef = useRef<any>(null);

  useEffect(() => {
    import('@ffmpeg/ffmpeg').then(({ FFmpeg }) => {
      ffmpegRef.current = new FFmpeg();
    }).catch(err => console.error("Error loading FFmpeg:", err));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setCaptions([]);
      setMagicClips([]);
      setBrollSegments([]);
      const v = document.createElement('video');
      v.src = url;
      v.onloadedmetadata = () => {
        setActiveSegments([{ start: 0, end: v.duration }]);
        setVideoDuration(v.duration);
      };
    }
  };

  const handleBgmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setBgmFile(e.target.files[0]);
  };

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = mainVolume;
  }, [mainVolume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = bgmVolume;
  }, [bgmVolume]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    
    if (activeSegments.length > 0) {
      const currentSegmentIndex = activeSegments.findIndex(seg => time >= seg.start && time <= seg.end);
      if (currentSegmentIndex === -1) {
        const nextSegment = activeSegments.find(seg => seg.start > time);
        if (nextSegment) {
          videoRef.current.currentTime = nextSegment.start;
          if (audioRef.current) audioRef.current.currentTime = nextSegment.start;
        } else if (time > activeSegments[activeSegments.length - 1].end) {
          videoRef.current.pause();
          videoRef.current.currentTime = activeSegments[activeSegments.length - 1].end;
          setIsPlaying(false);
        }
      }
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || videoDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * videoDuration;
    videoRef.current.currentTime = newTime;
    if (audioRef.current) audioRef.current.currentTime = newTime;
    if (!isPlaying) {
      videoRef.current.play();
    }
  };

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) {
      const { toBlobURL } = await import('@ffmpeg/util');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }
    return ffmpeg;
  };

  const generateCaptions = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    try {
      const { fetchFile } = await import('@ffmpeg/util');
      const ffmpeg = await loadFFmpeg();

      setProgressText("Extracting audio stream...");
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'libmp3lame', '-q:a', '2', 'audio.mp3']);
      
      const fileData = await ffmpeg.readFile('audio.mp3');
      const audioBlob = new Blob([fileData], { type: 'audio/mp3' });
      const audioFile = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });

      setProgressText("Transcribing via OpenAI Whisper...");
      const formData = new FormData();
      formData.append('file', audioFile);

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      if (data.transcription && data.transcription.words) {
        setCaptions(data.transcription.words);
      }
    } catch (error) {
      console.error(error);
      alert("Error generating captions.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };
  
  const generateMagicClip = async () => {
    if (captions.length === 0) return alert("Generate captions first!");
    setIsProcessing(true);
    setProgressText("AI is hunting for viral hooks...");
    try {
      const res = await fetch('/api/magic-clip', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captions })
      });
      if (!res.ok) throw new Error("Magic Clip failed");
      const data = await res.json();
      if (data.clips && data.clips.length > 0) {
        setMagicClips(data.clips);
        applyMagicClip(data.clips[0]);
      }
    } catch(err) {
      console.error(err);
      alert("Magic clip analysis failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const generateMarketingTools = async () => {
    const transcriptText = captions.map(c => c.word).join(" ");
    if (!transcriptText) return alert("Generate captions first!");
    
    setIsProcessing(true);
    setProgressText("AI is writing viral titles and hashtags...");
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: transcriptText })
      });
      if (!res.ok) throw new Error("Marketing generation failed");
      const data = await res.json();
      setMarketingData(data);
    } catch(err) {
      console.error(err);
      alert("Marketing tools failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const generateTTS = async () => {
    if (!ttsText) return alert("Enter some text to speak!");
    
    setIsProcessing(true);
    setProgressText("AI is generating speech...");
    try {
      const res = await fetch('/api/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: ttsText, voice: ttsVoice })
      });
      if (!res.ok) throw new Error("TTS generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setTtsAudioUrl(url);
      
      // Auto-play the preview
      const audio = new Audio(url);
      audio.play();
      
      // Set it as BGM so it overlays automatically
      const file = new File([blob], "tts.mp3", { type: "audio/mp3" });
      setBgmFile(file);
      setBgmVolume(1.0);
      
    } catch(err) {
      console.error(err);
      alert("TTS failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const generateEmojis = async () => {
    if (captions.length === 0) return alert("Generate captions first!");
    setIsProcessing(true);
    setProgressText("AI is adding emojis...");
    try {
      const res = await fetch('/api/emojis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captions })
      });
      if (!res.ok) throw new Error("Emoji failed");
      const data = await res.json();
      if (data.captions) setCaptions(data.captions);
    } catch(err) {
      console.error(err);
      alert("Emoji generation failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const generateBRoll = async () => {
    if (captions.length === 0) return alert("Generate captions first!");
    setIsProcessing(true);
    setProgressText("AI is generating B-Roll script and fetching from Pexels...");
    try {
      const res = await fetch('/api/b-roll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captions })
      });
      if (!res.ok) throw new Error("B-Roll failed");
      const data = await res.json();
      if (data.segments && data.segments.length > 0) {
        setBrollSegments(data.segments);
        alert(`Found ${data.segments.length} B-Roll clips!`);
      } else {
        alert("No B-Roll clips found for this transcript.");
      }
    } catch(err) {
      console.error(err);
      alert("B-Roll generation failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };
  
  const applyMagicClip = (clip: any) => {
    setActiveSegments([{ start: clip.start, end: clip.end }]);
    if (videoRef.current) {
      videoRef.current.currentTime = clip.start;
      videoRef.current.play();
    }
  };

  const removeSilence = async () => {
    if (!videoFile || !videoRef.current) return;
    setIsProcessing(true);
    setProgressText(`Analyzing audio for silence below ${silenceThreshold}dB...`);
    try {
      const { fetchFile } = await import('@ffmpeg/util');
      const ffmpeg = await loadFFmpeg();
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      let silenceStarts: number[] = [];
      let silenceEnds: number[] = [];
      
      ffmpeg.on('log', ({ message }: {message: string}) => {
        if (message.includes('silence_start: ')) {
          const start = parseFloat(message.split('silence_start: ')[1]);
          if (!isNaN(start)) silenceStarts.push(start);
        }
        if (message.includes('silence_end: ')) {
          const endStr = message.split('silence_end: ')[1].split(' ')[0];
          const end = parseFloat(endStr);
          if (!isNaN(end)) silenceEnds.push(end);
        }
      });
      
      await ffmpeg.exec(['-i', 'input.mp4', '-af', `silencedetect=noise=${silenceThreshold}dB:d=0.5`, '-f', 'null', '-']);
      ffmpeg.off('log', () => {});
      
      const totalDuration = videoRef.current.duration;
      let newSegments: {start: number, end: number}[] = [];
      let currentPos = 0;
      for (let i = 0; i < silenceStarts.length; i++) {
        if (silenceStarts[i] > currentPos) newSegments.push({ start: currentPos, end: silenceStarts[i] });
        currentPos = silenceEnds[i];
      }
      if (currentPos < totalDuration) newSegments.push({ start: currentPos, end: totalDuration });
      if (newSegments.length === 0) newSegments = [{ start: 0, end: totalDuration }];
      
      setActiveSegments(newSegments);
    } catch(err) {
      console.error(err);
      alert("Silence removal failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleExport = async () => {
    if (!videoFile || !videoRef.current) return;
    
    // Pro limitation: block export if video is longer than 60s for free users
    if (!isPro && videoRef.current.duration > 60) {
      alert("Free users can only export videos up to 60 seconds long. Please upgrade to Pro!");
      return;
    }

    setIsProcessing(true);
    setProgressText("Uploading and rendering on the cloud backend (much faster!)...");
    
    try {
      const formData = new FormData();
      formData.append('videoFile', videoFile);
      if (bgmFile) formData.append('bgmFile', bgmFile);
      formData.append('activeSegments', JSON.stringify(activeSegments));
      formData.append('captions', JSON.stringify(captions));
      formData.append('brollSegments', JSON.stringify(brollSegments));
      formData.append('autoZoom', String(autoZoom));
      formData.append('magicColor', String(magicColor));
      formData.append('autoSfx', String(autoSfx));
      formData.append('captionFont', captionFont);
      formData.append('captionSize', String(captionSize));
      formData.append('captionColor', captionColor);
      formData.append('mainVolume', String(mainVolume));
      formData.append('bgmVolume', String(bgmVolume));
      formData.append('vw', String(videoRef.current?.videoWidth || 1080));
      formData.append('vh', String(videoRef.current?.videoHeight || 1920));

      const res = await fetch('/api/export', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Backend export failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setProgressText("Downloading final video...");
      
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = 'nexuscut-exported-backend.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const translateCaptions = async () => {
    if (captions.length === 0) return alert("Generate captions first!");
    if (targetLanguage === 'English') return;
    setIsProcessing(true);
    setProgressText(`Translating to ${targetLanguage}...`);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ captions, targetLanguage })
      });
      if (!res.ok) throw new Error("Translation failed");
      const translated = await res.json();
      setCaptions(translated);
    } catch(err) {
      console.error(err);
      alert("Translation failed.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const saveProject = () => {
    try {
      const editorState = {
        captions, activeSegments, brollSegments, captionFont, captionSize, captionColor, autoZoom, silenceThreshold
      };
      const blob = new Blob([JSON.stringify(editorState, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexuscut-project-${Date.now()}.nxp`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Project saved to your computer successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save project.");
    }
  };

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string);
        if (state.captions) setCaptions(state.captions);
        if (state.activeSegments) setActiveSegments(state.activeSegments);
        if (state.brollSegments) setBrollSegments(state.brollSegments);
        if (state.captionFont) setCaptionFont(state.captionFont);
        if (state.captionSize) setCaptionSize(state.captionSize);
        if (state.captionColor) setCaptionColor(state.captionColor);
        if (state.autoZoom !== undefined) setAutoZoom(state.autoZoom);
        if (state.silenceThreshold !== undefined) setSilenceThreshold(state.silenceThreshold);
        alert("Project loaded successfully!");
      } catch (err) {
        alert("Invalid project file.");
      }
    };
    reader.readAsText(file);
  };

  const startOver = () => {
    if (!confirm("Are you sure you want to start over? All unsaved progress will be lost.")) return;
    setVideoFile(null);
    setVideoSrc(null);
    setCaptions([]);
    setMagicClips([]);
    setBrollSegments([]);
    setActiveSegments([]);
    setVideoDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/stripe/checkout', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'editor' })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout failed. Please configure Stripe API keys.");
      }
    } catch(err) {
      console.error(err);
      alert("Checkout failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/stripe/portal', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'editor' })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to load portal. Please configure Stripe API keys.");
      }
    } catch(err) {
      console.error(err);
      alert("Failed to load portal.");
    } finally {
      setIsProcessing(false);
    }
  };

  let activeCaption = null;
  if (captions.length > 0) {
    for (let i = 0; i < captions.length; i++) {
      const c = captions[i];
      if (currentTime >= c.start && currentTime <= c.end + 0.2) {
        activeCaption = c;
        break;
      }
    }
  }

  let activeBroll = null;
  if (brollSegments.length > 0) {
    for (const b of brollSegments) {
      if (currentTime >= b.start && currentTime <= b.end && b.videoUrl) {
        activeBroll = b;
        break;
      }
    }
  }

  const getReactStyle = () => {
    let cssFont = 'Impact, sans-serif';
    if (captionFont === 'Montserrat-Bold') cssFont = 'Arial, sans-serif';
    if (captionFont === 'BebasNeue-Regular') cssFont = '"Arial Narrow", sans-serif';
    if (captionFont === 'Oswald-Bold') cssFont = 'Impact, sans-serif';

    return {
      color: captionColor, 
      textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', 
      WebkitTextStroke: '1px black', 
      fontFamily: cssFont,
      fontSize: `${captionSize}px`,
      lineHeight: '1.2',
      textAlign: 'center' as const,
      wordWrap: 'break-word' as const,
      maxWidth: '90%'
    };
  };

  if (!videoSrc) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl p-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Start Creating</h2>
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            Select Video File
            <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-4 gap-4">
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-neutral-800 rounded-lg p-1 border border-neutral-700">
            <button onClick={generateCaptions} disabled={isProcessing} className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-700 disabled:opacity-50 rounded-md text-sm text-white transition-colors">
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />} Captions
            </button>
            <div className="w-px bg-neutral-700 mx-1"></div>
            <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className="bg-neutral-800 text-white text-xs outline-none cursor-pointer pr-1 border border-neutral-700 rounded p-1 [&>option]:bg-neutral-800 [&>option]:text-white">
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Russian">Russian</option>
              <option value="Chinese">Chinese</option>
              <option value="Korean">Korean</option>
              <option value="Arabic">Arabic</option>
              <option value="Hindi">Hindi</option>
              <option value="Dutch">Dutch</option>
              <option value="Turkish">Turkish</option>
              <option value="Polish">Polish</option>
              <option value="Swedish">Swedish</option>
              <option value="Indonesian">Indonesian</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="Thai">Thai</option>
              <option value="Greek">Greek</option>
            </select>
            <button onClick={translateCaptions} disabled={isProcessing || targetLanguage === 'English'} className="flex items-center gap-1 px-2 py-1.5 hover:bg-neutral-700 disabled:opacity-50 rounded-md text-xs text-indigo-400 font-bold transition-colors">
              Translate
            </button>
          </div>
          
          <button onClick={generateEmojis} disabled={isProcessing} className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors">
            <Smile className="w-4 h-4 text-blue-400" /> Auto-Emojis
          </button>

          <button onClick={generateBRoll} disabled={isProcessing} className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors border border-green-500/30 bg-green-500/10">
            <Video className="w-4 h-4 text-green-400" /> Auto B-Roll
          </button>
          
          <button onClick={generateMagicClip} disabled={isProcessing} className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg text-sm text-white transition-colors">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Magic Clip
          </button>

          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg">
            <button onClick={removeSilence} disabled={isProcessing} className="flex items-center gap-2 text-sm text-white hover:text-indigo-400 transition-colors mr-2">
              <VolumeX className="w-4 h-4 text-red-400" /> Cut Silence
            </button>
            <span className="text-xs text-neutral-400 min-w-[30px]">{silenceThreshold}dB</span>
            <input type="range" min="-60" max="-10" step="5" value={silenceThreshold} onChange={(e) => setSilenceThreshold(Number(e.target.value))} className="w-20 accent-indigo-500" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center bg-neutral-800 p-2 rounded-lg border border-neutral-700">
           <div className="flex items-center gap-2 px-2 border-r border-neutral-700">
             <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Font</span>
             <select 
               value={captionFont} 
               onChange={(e) => setCaptionFont(e.target.value)}
               className="bg-neutral-900 text-white text-sm rounded-md px-2 py-1 outline-none border border-neutral-700"
             >
               <option value="Roboto-Black">Roboto</option>
               <option value="Montserrat-Bold">Montserrat</option>
               <option value="BebasNeue-Regular">Bebas Neue</option>
               <option value="Oswald-Bold">Oswald</option>
             </select>
           </div>

           <div className="flex items-center gap-2 px-2 border-r border-neutral-700">
             <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Size</span>
             <select 
               value={captionSize} 
               onChange={(e) => setCaptionSize(Number(e.target.value))}
               className="bg-neutral-900 text-white text-sm rounded-md px-2 py-1 outline-none border border-neutral-700"
             >
               <option value={24}>24</option>
               <option value={28}>28</option>
               <option value={32}>32</option>
               <option value={36}>36</option>
               <option value={40}>40</option>
               <option value={48}>48</option>
               <option value={56}>56</option>
               <option value={64}>64</option>
             </select>
           </div>

           <div className="flex items-center gap-2 px-2 border-r border-neutral-700">
             <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
           </div>
           
           <div className="flex items-center gap-2 px-2 border-r border-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={autoZoom} onChange={(e) => setAutoZoom(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
                <span className="text-sm text-white flex items-center gap-1"><ZoomIn className="w-4 h-4 text-indigo-400" /> Zoom</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 px-2 border-r border-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={magicColor} onChange={(e) => setMagicColor(e.target.checked)} className="accent-fuchsia-500 w-4 h-4" />
                <span className="text-sm text-white flex items-center gap-1"><Sparkles className="w-4 h-4 text-fuchsia-400" /> Magic Color</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 px-2 border-r border-neutral-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={autoSfx} onChange={(e) => setAutoSfx(e.target.checked)} className="accent-green-500 w-4 h-4" />
                <span className="text-sm text-white flex items-center gap-1"><VolumeX className="w-4 h-4 text-green-400" /> Auto SFX</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 px-2">
             <label className="flex items-center gap-2 text-sm text-white hover:text-indigo-400 cursor-pointer transition-colors">
               <Music className="w-4 h-4 text-pink-400" /> {bgmFile ? 'BGM Loaded' : 'Add BGM'}
               <input type="file" accept="audio/*" className="hidden" onChange={handleBgmUpload} />
             </label>
           </div>
        </div>
        
        <div className="flex gap-2">
          {!isPro ? (
            <button onClick={handleUpgrade} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors shadow-lg shadow-orange-500/20">
              <Sparkles className="w-4 h-4" /> Go Pro
            </button>
          ) : (
            <button onClick={handleManageSubscription} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg text-sm font-semibold text-amber-500 transition-colors border border-amber-500/30">
              Manage Pro
            </button>
          )}

          <button onClick={startOver} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 rounded-lg text-sm font-semibold text-red-400 transition-colors border border-red-900/50">
            <Trash className="w-4 h-4" /> Delete Project
          </button>

          <label className="flex items-center gap-2 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors border border-neutral-700 cursor-pointer">
            <Upload className="w-4 h-4" /> Load Project
            <input type="file" accept=".nxp" className="hidden" onChange={handleLoadProject} disabled={isProcessing} />
          </label>

          <button onClick={saveProject} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors border border-neutral-700">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Project
          </button>
          
          <button onClick={handleExport} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[55vh]">
        {/* Main Video Player */}
        <div className="lg:col-span-2 bg-black rounded-2xl border border-neutral-800 overflow-hidden relative group shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            className="h-full w-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); audioRef.current?.pause(); }}
            onPlay={() => { setIsPlaying(true); audioRef.current?.play(); }}
            onPause={() => { setIsPlaying(false); audioRef.current?.pause(); }}
          />

          {bgmFile && (
            <audio ref={audioRef} src={URL.createObjectURL(bgmFile)} loop />
          )}

          {/* B-Roll Overlay */}
          {activeBroll && (
            <div className="absolute inset-0 pointer-events-none z-40 bg-transparent flex items-center justify-center overflow-hidden">
              <video src={activeBroll.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded font-mono border border-neutral-600">
                B-ROLL: {activeBroll.query}
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {activeCaption && (
              <motion.div
                key={activeCaption.word}
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute bottom-24 w-full flex justify-center pointer-events-none z-50"
              >
                <span className="text-4xl md:text-5xl font-black uppercase tracking-tight" style={getReactStyle()}>
                  {activeCaption.word}
                  {activeCaption.emoji && <span className="ml-2 drop-shadow-lg">{activeCaption.emoji}</span>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
               <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
               <p className="text-white font-medium text-center px-8">{progressText}</p>
            </div>
          )}
        </div>

        {/* AI Suggestions / Sidebar */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col h-full overflow-y-auto">
          
          {/* TTS Generator */}
          <div className="mb-6 bg-neutral-800 p-4 rounded-xl border border-neutral-700">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <VolumeX className="w-4 h-4" /> Text to Speech Voice
            </h3>
            <textarea 
              className="w-full bg-neutral-900 text-sm text-white p-2 rounded-lg border border-neutral-700 outline-none resize-none mb-2" 
              rows={2} 
              placeholder="Enter text for AI voice..." 
              value={ttsText} 
              onChange={e => setTtsText(e.target.value)}
            />
            <div className="flex gap-2">
              <select className="bg-neutral-900 text-xs text-white p-2 rounded-lg border border-neutral-700 flex-1 outline-none" value={ttsVoice} onChange={e => setTtsVoice(e.target.value)}>
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="fable">Fable (British Male)</option>
                <option value="onyx">Onyx (Deep Male)</option>
                <option value="nova">Nova (Female)</option>
                <option value="shimmer">Shimmer (Soft Female)</option>
              </select>
              <button onClick={generateTTS} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                Generate
              </button>
            </div>
            {ttsAudioUrl && <p className="text-xs text-green-400 mt-2 font-semibold">✓ Audio added to BGM track!</p>}
          </div>

          {/* Marketing Hub */}
          <div className="mb-6">
            <button onClick={generateMarketingTools} disabled={isProcessing} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-fuchsia-500/20 transition-colors flex justify-center items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" /> Generate Viral Titles & Tags
            </button>
            
            {marketingData && (
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Titles</h4>
                  <ul className="text-sm text-white space-y-1 list-disc list-inside">
                    {marketingData.titles?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Description</h4>
                  <p className="text-sm text-neutral-300 whitespace-pre-wrap">{marketingData.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Hashtags</h4>
                  <p className="text-sm text-blue-400">{marketingData.hashtags?.join(" ")}</p>
                </div>
              </div>
            )}
          </div>
          {brollSegments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Video className="w-4 h-4" /> AI B-Roll Cuts
              </h3>
              <div className="flex flex-col gap-2">
                {brollSegments.map((b, i) => (
                  <div key={i} className="bg-neutral-800 p-2 rounded-lg border border-neutral-700 flex justify-between items-center cursor-pointer hover:bg-neutral-700 transition-colors"
                       onClick={() => { if (videoRef.current) { videoRef.current.currentTime = b.start; videoRef.current.play(); }}}>
                    <span className="text-sm text-white font-semibold truncate">{b.query}</span>
                    <span className="text-xs font-mono text-green-400">{b.start.toFixed(1)}s - {b.end.toFixed(1)}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {magicClips.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> AI Viral Hooks
              </h3>
              <div className="flex flex-col gap-2">
                {magicClips.map((clip, i) => (
                  <div key={i} onClick={() => applyMagicClip(clip)} className="bg-neutral-800 hover:bg-neutral-700 cursor-pointer p-3 rounded-lg border border-neutral-700 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{clip.title}</span>
                      <span className="text-xs font-black bg-yellow-500 text-black px-2 py-1 rounded-full">{clip.score}/100</span>
                    </div>
                    <div className="text-xs font-mono text-indigo-400">{clip.start.toFixed(1)}s - {clip.end.toFixed(1)}s</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-xl font-bold text-white mb-4 mt-2">Transcript</h3>
          <div className="space-y-2 pr-2 pt-4 pb-4">
             {captions.length > 0 ? (
               <div className="flex flex-wrap gap-1 text-lg leading-loose">
                 {captions.map((c, i) => {
                   const isCut = !activeSegments.some(seg => c.start >= seg.start && c.end <= seg.end);
                   return (
                     <span 
                       key={i} 
                       className={`cursor-pointer transition-all ${
                         isCut ? 'opacity-20 line-through text-neutral-500' :
                         currentTime >= c.start && currentTime <= c.end 
                           ? 'text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded' 
                           : 'text-neutral-300 hover:text-white'
                       }`}
                       onClick={() => { if (videoRef.current) { videoRef.current.currentTime = c.start; videoRef.current.play(); } }}
                     >
                       {c.word}{c.emoji && <span className="ml-1">{c.emoji}</span>}
                     </span>
                   )
                 })}
               </div>
             ) : (
               <div className="text-neutral-500 text-sm text-center mt-10">No transcript yet.</div>
             )}
          </div>
        </div>
      </div>
      
      {/* Interactive Timeline & Audio Controls */}
      {videoSrc && videoDuration > 0 && (
        <div className="mt-8 space-y-6">
          {/* Audio Controls */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <VolumeX className="text-indigo-500 w-6 h-6" /> Audio Tracks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-neutral-400 font-medium flex justify-between">
                  Main Video Volume <span>{Math.round(mainVolume * 100)}%</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={mainVolume} onChange={(e) => setMainVolume(Math.min(1, Math.max(0, Number(e.target.value))))} className="w-full accent-indigo-500 mt-2" />
              </div>
              
              <div>
                <label className="text-sm text-neutral-400 font-medium flex items-center gap-2">
                  <Music className="w-4 h-4" /> Background Music <span>{Math.round(bgmVolume * 100)}%</span>
                </label>
                <div className="flex gap-2 mt-2">
                  <label className="flex-1 cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 flex items-center justify-center transition-colors">
                    <input type="file" accept="audio/*" onChange={handleBgmUpload} className="hidden" />
                    <span className="text-xs font-semibold text-white truncate max-w-[150px]">{bgmFile ? bgmFile.name : 'Upload BGM'}</span>
                  </label>
                </div>
                {bgmFile && (
                  <input type="range" min="0" max="1" step="0.05" value={bgmVolume} onChange={(e) => setBgmVolume(Math.min(1, Math.max(0, Number(e.target.value))))} className="w-full accent-green-500 mt-2" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
            <div 
              className="relative h-24 bg-neutral-800 rounded-xl overflow-hidden cursor-pointer group"
              onClick={handleTimelineClick}
            >
              {/* Active Segments */}
              {activeSegments.map((seg, i) => (
                <div 
                  key={i}
                  className="absolute top-0 bottom-0 bg-indigo-500/40 border-l border-r border-indigo-400/50"
                style={{ 
                  left: `${(seg.start / videoDuration) * 100}%`, 
                  width: `${((seg.end - seg.start) / videoDuration) * 100}%` 
                }}
              />
            ))}
            
            {/* B-Roll Segments */}
            {brollSegments.map((seg, i) => (
              <div 
                key={i}
                className="absolute top-0 h-6 bg-green-500/80 border-l border-green-400 z-10 shadow-sm"
                style={{ 
                  left: `${(seg.start / videoDuration) * 100}%`, 
                  width: `${((seg.end - seg.start) / videoDuration) * 100}%` 
                }}
              >
                <div className="text-[10px] font-bold text-black px-1 truncate leading-6">
                  {seg.query}
                </div>
              </div>
            ))}
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none transition-all duration-75"
              style={{ left: `${(currentTime / videoDuration) * 100}%` }}
            >
              <div className="absolute -top-2 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full shadow" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-400 font-mono">
            <span>0:00</span>
            <span>{currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s</span>
          </div>
          </div>
        </div>
      )}

    </div>
  );
}
