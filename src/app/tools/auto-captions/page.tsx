"use client";

import { toast } from '@/lib/toast';
import React, { useState } from "react";
import { Type, Video, Captions, Loader2, Download, Crown } from "lucide-react";
import Link from "next/link";
import fpPromise from '@fingerprintjs/fingerprintjs';

export default function AutoCaptionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "transcribing" | "done" | "limit_reached">("idle");
  const [transcription, setTranscription] = useState<{word: string, start: number, end: number}[]>([]);
  const [currentWordText, setCurrentWordText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const downloadSrt = () => {
    if (transcription.length === 0) return;
    const formatTimestamp = (seconds: number) => {
      const milliseconds = Math.max(0, Math.round(seconds * 1000));
      const hours = Math.floor(milliseconds / 3_600_000);
      const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
      const secs = Math.floor((milliseconds % 60_000) / 1000);
      const ms = milliseconds % 1000;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    };
    const srt = transcription.map((word, index) => `${index + 1}\n${formatTimestamp(word.start)} --> ${formatTimestamp(word.end)}\n${word.word.trim()}\n`).join('\n');
    const url = URL.createObjectURL(new Blob([srt], { type: 'application/x-subrip;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'nexuscut-captions.srt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setVideoUrl(URL.createObjectURL(selected));
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setStatus("transcribing");
    setErrorMessage("");
    
    try {
      // Get visitor id
      const fp = await fpPromise.load();
      const result = await fp.get();
      const visitorId = result.visitorId;

      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          'x-device-fingerprint': visitorId,
          'content-type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      
      if (res.status === 429) {
        setStatus("limit_reached");
        const errData = await res.json();
        setErrorMessage(errData.error || "Usage limit reached.");
        return;
      }
      
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json();
      setTranscription(data.transcription?.words || []);
      setStatus("done");
    } catch (err: unknown) {
      toast("Error: " + (err instanceof Error ? err.message : "Transcription failed"));
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <Type className="w-4 h-4" /> AI Speech-to-Text
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Auto Captions in <span className="text-indigo-500">Seconds</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Upload a video with spoken audio to create editable, word-timed captions. Accuracy varies with recording quality, language, and background noise.
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
              
              {/* Canvas */}
              <div className="flex-1 p-8 flex items-center justify-center relative">
                {!file ? (
                  <label 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="w-full h-full min-h-[300px] border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-950/50 group"
                  >
                    <div className="w-20 h-20 bg-neutral-800 group-hover:bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 transition-colors">
                      <Video className="w-10 h-10 text-neutral-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Video</h3>
                    <p className="text-neutral-500">MP4, MOV, or WebM up to 240 MB</p>
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const selected = e.target.files[0];
                        setFile(selected);
                        setVideoUrl(URL.createObjectURL(selected));
                      }
                    }} />
                  </label>
                ) : (
                  <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    
                    {videoUrl ? (
                      <div className="absolute inset-0 bg-black rounded-2xl overflow-hidden">
                        <video 
                          src={videoUrl}
                          controls
                          autoPlay
                          className="absolute inset-0 w-full h-full object-contain"
                          onTimeUpdate={(e) => {
                            const time = e.currentTarget.currentTime;
                            // Find the closest word, or current word
                            const currentWord = transcription.find(w => time >= w.start && time <= w.end) 
                                             || transcription.find(w => time >= w.start - 0.2 && time <= w.end + 0.2);
                            setCurrentWordText(currentWord?.word || '');
                          }}
                        />
                        {/* Dynamic Captions overlay */}
                        <div className="absolute bottom-16 inset-x-0 flex justify-center pointer-events-none z-10">
                          {currentWordText && status === "done" && (
                            <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
                              <p className="text-4xl font-black text-yellow-400 tracking-wide uppercase text-center drop-shadow-2xl" style={{ textShadow: "3px 3px 0 #000" }}>
                                {currentWordText}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Video className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-neutral-500 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {(status === "uploading" || status === "transcribing") && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">
                          {status === "uploading" ? "Uploading Video..." : "AI Transcribing Audio..."}
                        </h3>
                        <div className="w-64 h-2 bg-neutral-800 rounded-full overflow-hidden mt-4">
                          <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: "50%" }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Output */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 flex flex-col h-[500px]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Captions className="w-5 h-5 text-indigo-400" /> Caption Settings
            </h3>
            
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-400 mb-3">Spoken Language</label>
                <select className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500">
                  <option>English (Auto-Detect)</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-400 mb-3">Subtitle Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-indigo-600 text-white font-semibold py-3 px-2 rounded-xl text-xs border border-indigo-500">Dynamic Pop</button>
                  <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-2 rounded-xl text-xs transition-colors border border-neutral-700">Classic Cinematic</button>
                  <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-2 rounded-xl text-xs transition-colors border border-neutral-700">Karaoke Word</button>
                  <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-2 rounded-xl text-xs transition-colors border border-neutral-700">Minimalist</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800">
              {status === "limit_reached" ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <p className="text-red-400 font-bold mb-2">Free Limit Reached</p>
                  <p className="text-sm text-red-400/80 mb-4">{errorMessage} See current paid-plan access on the pricing page.</p>
                  <Link href="/pricing" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" /> View plans
                  </Link>
                </div>
              ) : status === "done" ? (
                <div className="flex gap-2">
                  <button onClick={downloadSrt} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" /> SRT
                  </button>
                  <Link href="/pricing" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                    View export plans
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={handleGenerate}
                  disabled={!file || status !== "idle"}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Type className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                  {status === "idle" ? "Generate Captions" : "Processing..."}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
}
