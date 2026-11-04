"use client";

import { toast } from '@/lib/toast';
import React, { useState } from "react";
import { ExternalLink, Image as ImageIcon, Wand2 } from "lucide-react";

export default function AiImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setStatus("generating");
    
    // Use pollinations.ai to generate real AI images without an API key for the MVP
    const encodedPrompt = encodeURIComponent(prompt);
    // Setting a random seed so identical prompts generate new images
    const seed = Math.floor(Math.random() * 100000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}`;
    
    // We can pre-load the image to show the loader until it's actually ready
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setResult(imageUrl);
      setStatus("done");
    };
    img.onerror = () => {
      toast("Failed to generate image. Please try again.");
      setStatus("idle");
    };
  };

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <ImageIcon className="w-4 h-4" /> AI Generator
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Imagine it. <span className="text-fuchsia-500">Generate it.</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Send a text prompt to the connected third-party image service and review the generated square image.
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input & Settings */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
              <form onSubmit={handleGenerate} className="flex flex-col h-full">
                <label className="block text-sm font-semibold text-neutral-400 mb-3">Your Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic cyber-city at sunset with flying neon cars, hyper-realistic, 8k resolution..."
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-fuchsia-500 h-32 resize-none mb-6"
                  required
                />

                <p className="mb-8 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-400">Current output is 800 × 800. Style is controlled through the wording of your prompt. The request is processed by Pollinations, not on NexusCut servers.</p>

                <button 
                  type="submit"
                  disabled={!prompt || status === "generating"}
                  className="mt-auto w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                  {status === "generating" ? "Dreaming..." : "Generate Image"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] h-full flex flex-col items-center justify-center p-8">
              
              {status === "idle" && !result && (
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-10 h-10 text-neutral-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Dream</h3>
                  <p className="text-neutral-500">Enter a prompt on the left and our AI will bring it to life.</p>
                </div>
              )}

              {status === "generating" && (
                <div className="text-center flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-fuchsia-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Wand2 className="w-8 h-8 text-fuchsia-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">Generating your image...</h3>
                  <p className="text-neutral-500">Refining details and enhancing resolution.</p>
                </div>
              )}

              {status === "done" && result && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden shadow-2xl bg-black mb-8 group">
                    <img src={result} alt="Generated Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-white text-sm font-medium line-clamp-2">{prompt}</p>
                    </div>
                  </div>
                  
                  <a href={result} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-8 py-3 font-bold text-white shadow-lg shadow-fuchsia-500/20 hover:bg-fuchsia-500"><ExternalLink className="h-4 w-4" /> Open 800 × 800 image</a>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
