"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Play, Pause, Scissors, Type, Download, Loader2, Sparkles, VolumeX, Smile, Music, ZoomIn, Video, Save, Trash , Plus, ArrowRightToLine, ArrowLeftToLine} from "lucide-react";
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
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(true);
  
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
        if (!isPro && v.duration > 600) {
          alert("Free users can only process videos up to 10 minutes long. Please upgrade to Pro to upload full podcasts and long-form videos!");
          setVideoFile(null);
          setVideoSrc(null);
          return;
        }
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


  // 60FPS polling for smooth captions
  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      if (isPlaying && videoRef.current) {
        handleTimeUpdate();
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    if (isPlaying) {
      animationFrameId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeSegments]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    if (!videoRef.current || videoDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percent * videoDuration;
    videoRef.current.currentTime = newTime;
    if (audioRef.current) audioRef.current.currentTime = newTime;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handleTimelineClick(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return; // Only scrub if dragging
    handleTimelineClick(e);
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
    let formData = new FormData();
    
    // Always send the raw video directly to the server on the VPS
    // Bypassing WebAssembly FFmpeg ensures budget mobile devices never crash due to RAM limits
    setProgressText("Uploading video: 0%");
    formData = new FormData();
    formData.append('file', videoFile);

    try {
      const data = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/transcribe', true);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            if (percent < 100) {
              setProgressText(`Uploading video: ${percent}%`);
            } else {
              setProgressText("Transcribing via OpenAI Whisper (almost done)...");
            }
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error("Invalid JSON response from server"));
            }
          } else {
            reject(new Error(`Server returned status ${xhr.status}: ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      if (data.error) throw new Error(data.error);

      if (data.transcription && data.transcription.words) {
        setCaptions(data.transcription.words);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Error generating captions: ${error.message || String(error)}`);
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  
  const generateMagicClip = async () => {
    if (!isPro) {
      alert("Magic Clip AI Curation is a Premium feature. Please Upgrade to Pro!");
      return;
    }
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
      
      if (muteOriginalAudio) {
        setMainVolume(0.0);
      }
      
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


  // TIMELINE EDITING CONTROLS
  const splitSegment = () => {
    const idx = activeSegments.findIndex(s => currentTime > s.start && currentTime < s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const seg = activeSegments[idx];
    const newSegs = [...activeSegments];
    newSegs.splice(idx, 1, { start: seg.start, end: currentTime }, { start: currentTime, end: seg.end });
    setActiveSegments(newSegs);
  };

  const setInPoint = () => {
    const idx = activeSegments.findIndex(s => currentTime > s.start && currentTime < s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const newSegs = [...activeSegments];
    newSegs[idx].start = currentTime;
    setActiveSegments(newSegs);
  };

  const setOutPoint = () => {
    const idx = activeSegments.findIndex(s => currentTime > s.start && currentTime < s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const newSegs = [...activeSegments];
    newSegs[idx].end = currentTime;
    setActiveSegments(newSegs);
  };

  const deleteSegment = () => {
    const idx = activeSegments.findIndex(s => currentTime >= s.start && currentTime <= s.end);
    if (idx === -1) return alert("Playhead is not inside an active clip.");
    const newSegs = [...activeSegments];
    newSegs.splice(idx, 1);
    setActiveSegments(newSegs);
  };

  const addSegment = () => {
    const idx = activeSegments.findIndex(s => currentTime >= s.start && currentTime <= s.end);
    if (idx !== -1) return alert("Playhead is already inside an active clip.");
    
    // Find next segment to not overlap
    const nextSeg = activeSegments.find(s => s.start > currentTime);
    let end = currentTime + 5;
    if (nextSeg && end > nextSeg.start) end = nextSeg.start;
    if (end > videoDuration) end = videoDuration;
    
    const newSegs = [...activeSegments, { start: currentTime, end }];
    newSegs.sort((a, b) => a.start - b.start);
    setActiveSegments(newSegs);
  };

  const handleExport = async () => {
    if (!videoFile || !videoRef.current) return;
    
    // Pro limitation: block export if final video is longer than 60s for free users
    const totalDuration = activeSegments.reduce((acc, seg) => acc + (seg.end - seg.start), 0);
    if (!isPro && totalDuration > 60) {
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
    const pastCaptions = captions.filter(c => c.start <= currentTime);
    if (pastCaptions.length > 0) {
      const c = pastCaptions[pastCaptions.length - 1];
      if (currentTime <= c.end + 1.0) {
        activeCaption = c;
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

  const steps = [
    { id: 1, title: 'Transcribe' },
    { id: 2, title: 'AI Curation' },
    { id: 3, title: 'Style & Audio' },
    { id: 4, title: 'Export' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* Top Stepper Navigation */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <button 
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${activeStep === step.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeStep === step.id ? 'bg-white text-indigo-600' : 'bg-neutral-800 text-neutral-400'}`}>
                  {step.id}
                </div>
                {step.title}
              </button>
              {step.id < 4 && <div className="w-8 h-px bg-neutral-700 mx-2" />}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
           <button onClick={startOver} disabled={isProcessing} className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 disabled:opacity-50 rounded-lg text-sm font-semibold text-red-400 transition-colors border border-red-900/50">
             <Trash className="w-4 h-4" /> Start Over
           </button>
           <button onClick={handleExport} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors shadow-lg shadow-indigo-500/20">
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[55vh]">
        
        {/* Main Video Player (Left 2/3) */}
        <div 
          className="lg:col-span-2 bg-black rounded-2xl border border-neutral-800 overflow-hidden relative group shadow-2xl flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            playsInline
            className="h-full w-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); audioRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; if (audioRef.current) audioRef.current.currentTime = 0; }}
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

        {/* Dynamic Sidebar (Right 1/3) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col h-full overflow-y-auto">
          
          {/* STEP 1: TRANSCRIBE */}
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">1. Generate Captions</h3>
                <button onClick={generateCaptions} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-indigo-500/20">
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Type className="w-5 h-5" />} Auto-Transcribe Audio
                </button>
              </div>
              
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3">Translate (Optional)</h3>
                <div className="flex gap-2">
                  <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className="bg-neutral-900 text-white flex-1 outline-none border border-neutral-700 rounded-lg p-2">
                    <option value="Arabic">Arabic</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Dutch">Dutch</option>
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Greek">Greek</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Indonesian">Indonesian</option>
                    <option value="Italian">Italian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="Polish">Polish</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Russian">Russian</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Swedish">Swedish</option>
                    <option value="Thai">Thai</option>
                    <option value="Turkish">Turkish</option>
                    <option value="Vietnamese">Vietnamese</option>
                  </select>
                  <button onClick={translateCaptions} disabled={isProcessing || targetLanguage === 'English'} className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-4 rounded-lg transition-colors font-semibold">
                    Apply
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-3">Transcript Viewer</h3>
                <div className="bg-black border border-neutral-700 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
                   {captions.length > 0 ? (
                     <div className="flex flex-wrap gap-1 text-base leading-loose font-medium">
                       {captions.map((c, i) => {
                         const isCut = !activeSegments.some(seg => c.start >= seg.start && c.end <= seg.end);
                         return (
                           <span 
                             key={i} 
                             className={`cursor-pointer transition-all ${
                               isCut ? 'opacity-20 line-through text-neutral-500' :
                               currentTime >= c.start && currentTime <= c.end 
                                 ? 'text-yellow-400 font-bold bg-yellow-500/20 px-1 rounded shadow-[0_0_10px_rgba(250,204,21,0.3)]' 
                                 : 'text-white hover:text-yellow-200'
                             }`}
                             onClick={() => { if (videoRef.current) { videoRef.current.currentTime = c.start; videoRef.current.play(); } }}
                           >
                             {c.word}{c.emoji && <span className="ml-1">{c.emoji}</span>}
                           </span>
                         )
                       })}
                     </div>
                   ) : (
                     <div className="text-neutral-500 text-sm text-center py-8">No transcript yet. Generate captions first.</div>
                   )}
                </div>
              </div>

              
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Caption Styling</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Font Family</label>
                    <select value={captionFont} onChange={(e) => setCaptionFont(e.target.value)} className="w-full bg-neutral-900 text-white text-sm rounded-lg px-3 py-2 outline-none border border-neutral-700">
                      <option value="Roboto-Black">Roboto</option>
                      <option value="Montserrat-Bold">Montserrat</option>
                      <option value="BebasNeue-Regular">Bebas Neue</option>
                      <option value="Oswald-Bold">Oswald</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">Font Size</label>
                    <select value={captionSize} onChange={(e) => setCaptionSize(Number(e.target.value))} className="w-full bg-neutral-900 text-white text-sm rounded-lg px-3 py-2 outline-none border border-neutral-700">
                      <option value={24}>Small (24)</option>
                      <option value={36}>Medium (36)</option>
                      <option value={48}>Large (48)</option>
                      <option value={64}>X-Large (64)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-700 mb-4">
                  <span className="text-sm text-white">Text Color</span>
                  <input type="color" value={captionColor} onChange={(e) => setCaptionColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                </div>

                <button onClick={generateEmojis} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 disabled:opacity-50 rounded-lg font-bold transition-all">
                  <Smile className="w-4 h-4" /> Apply Auto-Emojis
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AI CURATION */}
          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              
              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <VolumeX className="w-4 h-4" /> Cut Silence
                </h3>
                <p className="text-xs text-neutral-400 mb-4">Automatically remove quiet gaps from your video.</p>
                <div className="flex items-center gap-4 mb-4">
                  <input type="range" min="-60" max="-10" step="5" value={silenceThreshold} onChange={(e) => setSilenceThreshold(Number(e.target.value))} className="w-full accent-red-500" />
                  <span className="text-xs font-mono text-neutral-300 bg-neutral-900 px-2 py-1 rounded">{silenceThreshold}dB</span>
                </div>
                <button onClick={removeSilence} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 rounded-lg text-white font-semibold transition-all">
                  Apply Silence Cut
                </button>
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" /> Extract Viral Hook
                </h3>
                <p className="text-xs text-neutral-400 mb-4">AI finds the most engaging parts of your video and trims out the rest.</p>
                <button onClick={generateMagicClip} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 border border-yellow-500/30 disabled:opacity-50 rounded-lg font-bold transition-all mb-4">
                  Find Magic Clip
                </button>
                {magicClips.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 max-h-[150px] overflow-y-auto">
                    {magicClips.map((clip, i) => (
                      <div key={i} onClick={() => applyMagicClip(clip)} className="bg-neutral-900 hover:bg-neutral-800 cursor-pointer p-3 rounded-lg border border-neutral-700 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white text-sm">{clip.title}</span>
                          <span className="text-xs font-black bg-yellow-500 text-black px-2 py-0.5 rounded-full">{clip.score}/100</span>
                        </div>
                        <div className="text-xs font-mono text-indigo-400">{clip.start.toFixed(1)}s - {clip.end.toFixed(1)}s</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Video className="w-4 h-4" /> Auto B-Roll
                </h3>
                <p className="text-xs text-neutral-400 mb-4">AI overlays relevant stock footage on your video.</p>
                <button onClick={generateBRoll} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 text-green-500 hover:bg-green-600/30 border border-green-500/30 disabled:opacity-50 rounded-lg font-bold transition-all">
                  Generate B-Roll
                </button>
                {brollSegments.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 max-h-[150px] overflow-y-auto">
                    {brollSegments.map((b, i) => (
                      <div key={i} className="bg-neutral-900 p-2 rounded-lg border border-neutral-700 flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors"
                           onClick={() => { if (videoRef.current) { videoRef.current.currentTime = b.start; videoRef.current.play(); }}}>
                        <span className="text-sm text-white font-semibold truncate">{b.query}</span>
                        <span className="text-xs font-mono text-green-400">{b.start.toFixed(1)}s - {b.end.toFixed(1)}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: STYLE & AUDIO */}
          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Visual Effects</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <span className="text-sm text-white flex items-center gap-2"><ZoomIn className="w-4 h-4 text-indigo-400" /> Auto Zoom (Face)</span>
                    <input type="checkbox" checked={autoZoom} onChange={(e) => setAutoZoom(e.target.checked)} className="accent-indigo-500 w-5 h-5" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <span className="text-sm text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-fuchsia-400" /> Magic Color Grading</span>
                    <input type="checkbox" checked={magicColor} onChange={(e) => setMagicColor(e.target.checked)} className="accent-fuchsia-500 w-5 h-5" />
                  </label>
                </div>
              </div>

              <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4">Audio & TTS</h3>
                <div className="flex flex-col gap-3 mb-4">
                  <label className="flex items-center justify-between cursor-pointer bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <span className="text-sm text-white flex items-center gap-2"><VolumeX className="w-4 h-4 text-green-400" /> Auto Sound Effects</span>
                    <input type="checkbox" checked={autoSfx} onChange={(e) => setAutoSfx(e.target.checked)} className="accent-green-500 w-5 h-5" />
                  </label>
                </div>
                
                <h4 className="text-xs font-bold text-indigo-400 mb-2 mt-4">AI VOICE (TTS)</h4>
                <textarea 
                  className="w-full bg-neutral-900 text-sm text-white p-3 rounded-lg border border-neutral-700 outline-none resize-none mb-2 focus:border-indigo-500" 
                  rows={2} 
                  placeholder="Enter text for AI voice..." 
                  value={ttsText} 
                  onChange={e => setTtsText(e.target.value)}
                />
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={muteOriginalAudio} onChange={(e) => setMuteOriginalAudio(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
                  <span className="text-xs text-neutral-300">Mute original video audio</span>
                </label>
                <div className="flex gap-2">
                  <select className="bg-neutral-900 text-xs text-white p-2 rounded-lg border border-neutral-700 flex-1 outline-none" value={ttsVoice} onChange={e => setTtsVoice(e.target.value)}>
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="echo">Echo (Male)</option>
                    <option value="fable">Fable (British Male)</option>
                    <option value="onyx">Onyx (Deep Male)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Soft Female)</option>
                  </select>
                  <button onClick={generateTTS} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    Add Voice
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 4: MARKETING & EXPORT */}
          {activeStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
              
              <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700">
                <button onClick={generateMarketingTools} disabled={isProcessing} className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-fuchsia-500/20 transition-all flex justify-center items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" /> Write Titles & HashTags
                </button>
                
                {marketingData && (
                  <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-700 space-y-4 max-h-[300px] overflow-y-auto">
                    <div>
                      <h4 className="text-xs font-black text-fuchsia-400 uppercase mb-2">Viral Titles</h4>
                      <ul className="text-sm text-white space-y-2 list-disc list-inside">
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

              <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-2">Project Management</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={saveProject} disabled={isProcessing} className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors border border-neutral-600">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-700 disabled:opacity-50 rounded-xl text-sm font-semibold text-white transition-colors border border-neutral-600 cursor-pointer">
                    <Upload className="w-4 h-4" /> Load
                    <input type="file" accept=".nxp" className="hidden" onChange={handleLoadProject} disabled={isProcessing} />
                  </label>
                </div>
                
                {!isPro ? (
                  <button onClick={handleUpgrade} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 rounded-xl text-md font-bold text-white transition-all shadow-lg shadow-orange-500/20 mt-2">
                    <Sparkles className="w-5 h-5" /> Upgrade to Pro
                  </button>
                ) : (
                  <button onClick={handleManageSubscription} disabled={isProcessing} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl text-sm font-bold text-amber-500 transition-colors border border-amber-500/30 mt-2">
                    Manage Pro Subscription
                  </button>
                )}
              </div>
              
            </motion.div>
          )}

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
                <label className="text-sm text-neutral-400 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2"><Music className="w-4 h-4" /> Background Music</span>
                  <span>{Math.round(bgmVolume * 100)}%</span>
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
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Timeline</h3>
              <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded-lg border border-neutral-700">
                <button onClick={splitSegment} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Split Clip at Playhead">
                  <Scissors className="w-4 h-4 text-white" />
                </button>
                <button onClick={setInPoint} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Set In Point (Trim Start)">
                  <ArrowRightToLine className="w-4 h-4 text-white" />
                </button>
                <button onClick={setOutPoint} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Set Out Point (Trim End)">
                  <ArrowLeftToLine className="w-4 h-4 text-white" />
                </button>
                <button onClick={deleteSegment} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Delete Current Clip">
                  <Trash className="w-4 h-4 text-red-400" />
                </button>
                <button onClick={addSegment} className="p-2 hover:bg-neutral-700 rounded transition-colors tooltip" title="Add Clip at Playhead">
                  <Plus className="w-4 h-4 text-green-400" />
                </button>
              </div>
            </div>

            <div 
              className="relative h-24 bg-neutral-800 rounded-xl overflow-hidden cursor-pointer group touch-none select-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
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
