"use client";

import { toast } from '@/lib/toast';
import React, { useState } from "react";
import { Upload, Sparkles, Download, Loader2 } from "lucide-react";

export default function RemoveBackgroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    setStatus("idle");
  };

  const handleRemoveBg = async () => {
    if (!file) return;
    setStatus("uploading");
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      setStatus("processing");
      const res = await fetch("/api/smart-tools/remove-bg-image", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to remove background");
      
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPreview(objectUrl);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      toast("Failed to remove background. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-4 h-4" /> Nexus Vision AI
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Remove an image <span className="text-emerald-400">background</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Upload an image up to 25 MB. The segmentation model returns a transparent PNG; edge quality depends on the source image.
          </p>
        </div>

        {/* Workspace */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
            
            {/* Canvas */}
            <div className="flex-1 p-8 flex items-center justify-center relative bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-neutral-950/50">
              {!preview ? (
                <label 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="w-full max-w-2xl h-full min-h-[350px] bg-neutral-900 border-2 border-dashed border-neutral-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors group z-10"
                >
                  <div className="w-20 h-20 bg-neutral-800 group-hover:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 transition-colors">
                    <Upload className="w-10 h-10 text-neutral-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Upload Image</h3>
                  <p className="text-neutral-500">Drop an image here to remove the background</p>
                  <div className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
                    Browse Files
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden flex items-center justify-center">
                  
                  {/* Checkerboard background for "transparent" look when done */}
                  <div className={`absolute inset-0 transition-opacity duration-1000 ${status === 'done' ? 'opacity-100' : 'opacity-0'}`} style={{
                    backgroundImage: 'linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }} />

                  {status === "done" ? (
                    <div className="relative z-10 p-4">
                      <img src={preview} alt="Result" className="max-w-full max-h-[400px] object-contain drop-shadow-2xl" style={{ mixBlendMode: "normal" }} />
                    </div>
                  ) : (
                    <img src={preview} alt="Preview" className="max-w-full max-h-[400px] object-contain relative z-10" />
                  )}

                  {/* Processing Overlay */}
                  {(status === "uploading" || status === "processing") && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                      <div className="relative w-full max-w-sm h-64 border-2 border-emerald-500/50 rounded-xl overflow-hidden mb-8">
                        <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-30" />
                        {/* Scanning beam */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        {status === "uploading" ? "Analyzing Image..." : "Isolating Subject..."}
                      </h3>
                    </div>
                  )}

                  {/* Actions when idle (preview mode) */}
                  {status === "idle" && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center z-20">
                      <button 
                        onClick={handleRemoveBg}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-emerald-900 flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <Sparkles className="w-5 h-5" /> Remove Background
                      </button>
                    </div>
                  )}

                  {/* Actions when done */}
                  {status === "done" && (
                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4 z-20">
                      <button 
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                          setStatus("idle");
                        }}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors"
                      >
                        Upload Another
                      </button>
                      <a href={preview!} download="nexuscut_bg_removed.png" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-emerald-900 flex items-center gap-2 hover:scale-105 transition-all">
                        <Download className="w-5 h-5" /> Download PNG
                      </a>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}} />
    </div>
  );
}
