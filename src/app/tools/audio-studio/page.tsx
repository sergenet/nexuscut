"use client";

import React, { useState, useRef } from "react";
import { Music, Mic, Volume2, Settings2, Play, Pause, Download, Loader2, AudioLines } from "lucide-react";
import fpPromise from '@fingerprintjs/fingerprintjs';

export default function AudioStudioPage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error" | "limit_reached">("idle");
  const [voice, setVoice] = useState("nova");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const d = new Date(seconds * 1000);
    return d.toISOString().substring(11, 19);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;
    
    setStatus("generating");
    setErrorMessage("");
    
    try {
      let visitorId = "fallback-id-" + Math.random().toString(36).substring(7);
      try {
        const fp = await fpPromise.load();
        const result = await fp.get();
        visitorId = result.visitorId;
      } catch (fpError) {
        console.warn("Fingerprint blocked, using fallback", fpError);
      }

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-fingerprint": visitorId,
        },
        body: JSON.stringify({ text, voice }),
      });

      if (res.status === 429) {
        setStatus("limit_reached");
        const errData = await res.json();
        setErrorMessage(errData.error || "Usage limit reached.");
        return;
      }

      if (!res.ok) throw new Error("TTS generation failed");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatus("done");
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : 'Audio generation failed.');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <Music className="w-4 h-4" /> AI Sound Design
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            NexusPro <span className="text-violet-500">Audio Studio</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Convert a script into speech using one of six available AI voices, then preview and download the generated audio.
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[600px]">
              
              <div className="flex items-center justify-between mb-6 border-b border-neutral-800 pb-4">
                <button className="text-white font-bold border-b-2 border-violet-500 pb-1">Text to Speech</button>
                <span className="text-neutral-600 font-semibold pb-1" aria-label="Voice cloning is not available">Voice Clone — unavailable</span>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col flex-1">
                <label className="block text-sm font-semibold text-neutral-400 mb-3">Script</label>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your script here to generate an AI voiceover..."
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 flex-1 resize-none mb-6 custom-scrollbar"
                  required
                />

                <label className="block text-sm font-semibold text-neutral-400 mb-3">AI Voice Actor</label>
                <select 
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-violet-500 mb-6"
                >
                  <option value="nova">Nova (Energetic Female)</option>
                  <option value="alloy">Alloy (Neutral)</option>
                  <option value="echo">Echo (Deep Male)</option>
                  <option value="fable">Fable (British Male)</option>
                  <option value="onyx">Onyx (Authoritative Male)</option>
                  <option value="shimmer">Shimmer (Soft Female)</option>
                </select>

                <button 
                  type="submit"
                  disabled={!text || status === "generating"}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                >
                  {status === "generating" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
                  {status === "generating" ? "Synthesizing Audio..." : "Generate Voiceover"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Audio Editor / Visualizer */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative h-[600px] flex flex-col">
              
              <div className="h-14 bg-neutral-950 border-b border-neutral-800 flex items-center px-4 justify-between">
                <div className="flex gap-4">
                  <button className="text-neutral-400 hover:text-white transition-colors"><Settings2 className="w-5 h-5" /></button>
                  <button className="text-neutral-400 hover:text-white transition-colors"><Volume2 className="w-5 h-5" /></button>
                </div>
                <div className="text-xs font-semibold text-neutral-500 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-black">
                
                {status === "idle" && (
                  <div className="text-center">
                    <AudioLines className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-500">Audio Timeline Empty</h3>
                  </div>
                )}

                {status === "generating" && (
                  <div className="text-center w-full max-w-md">
                    <h3 className="text-2xl font-bold text-white mb-8 animate-pulse">Synthesizing Neural Voice</h3>
                    <div className="flex items-center justify-center gap-1 h-16">
                      {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 bg-violet-500 rounded-full animate-[wave_1s_ease-in-out_infinite]"
                          style={{ 
                            height: `${20 + ((i * 37) % 80)}%`,
                            animationDelay: `${i * 0.05}s` 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(status === "error" || status === "limit_reached") && (
                  <div className="text-center w-full max-w-md bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-2">
                      {status === "limit_reached" ? "Free Limit Reached" : "Generation Failed"}
                    </h3>
                    <p className="text-red-400/80 mb-6">{errorMessage}</p>
                    {status === "limit_reached" && (
                      <a href="/pricing" className="inline-flex bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-lg transition-all items-center gap-2">
                        Upgrade to Pro
                      </a>
                    )}
                  </div>
                )}

                {status === "done" && (
                  <div className="w-full flex flex-col items-center">
                    {/* Deterministic audio progress visualization */}
                    <div className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded-xl mb-8 flex items-center px-4 overflow-hidden relative group cursor-pointer"
                           onClick={(e) => {
                             if (!audioRef.current || !duration) return;
                             const rect = e.currentTarget.getBoundingClientRect();
                             const pos = (e.clientX - rect.left) / rect.width;
                             audioRef.current.currentTime = pos * duration;
                           }}>
                      <div className="absolute top-0 bottom-0 left-0 bg-violet-500/20 border-r border-violet-500 z-10" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                      <div className="w-full flex items-center justify-between gap-0.5 opacity-50 group-hover:opacity-100 transition-opacity">
                        {[...Array(100)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full ${i < 33 ? 'bg-violet-400' : 'bg-neutral-600'}`}
                            style={{ height: `${20 + ((i * 53) % 80)}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={togglePlay} className="w-16 h-16 bg-white hover:scale-105 rounded-full flex items-center justify-center transition-transform shadow-xl shadow-white/10">
                        {isPlaying ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 text-black ml-1" />}
                      </button>
                    </div>
                    <audio 
                      ref={audioRef} 
                      src={audioUrl || undefined} 
                      onEnded={() => setIsPlaying(false)} 
                      onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                      onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                      className="hidden" 
                    />
                  </div>
                )}

              </div>

              {/* Bottom Track */}
              <div className="h-32 bg-neutral-950 border-t border-neutral-800 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Track 1: Voiceover</span>
                  {status === "done" && audioUrl && (
                    <a href={audioUrl} download="voiceover.mp3" className="text-xs text-violet-400 font-bold flex items-center gap-1 hover:text-violet-300">
                      <Download className="w-4 h-4" /> Export Audio
                    </a>
                  )}
                </div>
                <div className="h-16 bg-neutral-900 rounded-lg border border-neutral-800 relative">
                  {status === "done" && (
                    <div className="absolute top-2 bottom-2 left-2 w-1/3 bg-violet-500/20 border border-violet-500/50 rounded flex items-center px-2">
                      <span className="text-[10px] text-violet-300 font-mono truncate">{text}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
