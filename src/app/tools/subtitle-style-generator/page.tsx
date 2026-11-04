"use client";

import React, { useState } from "react";
import { Download, Palette, Video } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function SubtitleStyleGenerator() {
  const [text, setText] = useState("Watch how this simple trick changed my life.");
  const [font, setFont] = useState("Roboto-Black");
  const [color, setColor] = useState("#FFFF00");
  const [animation, setAnimation] = useState("pop");

  const downloadRecipe = () => {
    const recipe = { format: 'nexuscut-caption-style', version: 1, font, primaryColor: color, animation };
    const url = URL.createObjectURL(new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'nexuscut-caption-style.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <div className="pt-32 pb-24 flex-grow">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
              <Palette className="w-4 h-4" /> Free Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Free <span className="text-yellow-400">Subtitle Style</span> Generator
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Preview a supported NexusCut caption recipe and download its settings as JSON for reference.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left: Controls */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col">
              <h3 className="text-2xl font-bold mb-6">Customize Style</h3>
              
              <div className="space-y-6 flex-grow">
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Sample Text</label>
                  <input 
                    type="text" 
                    value={text} 
                    onChange={e => setText(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Font</label>
                  <select 
                    value={font} 
                    onChange={e => setFont(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="Roboto-Black">Roboto Black (Hormozi Style)</option>
                    <option value="Montserrat-Bold">Montserrat Bold</option>
                    <option value="BebasNeue-Regular">Bebas Neue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Primary Color</label>
                  <div className="flex gap-3">
                    {['#FFFF00', '#00FFFF', '#FF00FF', '#00FF00', '#FFFFFF'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Animation Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setAnimation('pop')} className={`py-3 px-4 rounded-xl font-bold border transition-colors ${animation === 'pop' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'}`}>Word Pop</button>
                    <button onClick={() => setAnimation('highlight')} className={`py-3 px-4 rounded-xl font-bold border transition-colors ${animation === 'highlight' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'}`}>Karaoke Highlight</button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-800 flex gap-4">
                <button onClick={downloadRecipe} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" /> Download JSON
                </button>
                <Link href="/editor" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                  Use in NexusCut
                </Link>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="bg-black border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center min-h-[500px]">
              <div className="absolute inset-0 opacity-40">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Video className="w-24 h-24 text-neutral-800 mb-4" />
                  <p className="text-neutral-600 font-bold">Video Background</p>
                </div>
              </div>
              
              <div className="relative z-10 px-8 py-4 text-center w-full max-w-sm">
                <p 
                  className={`text-4xl uppercase tracking-widest ${animation === 'pop' ? 'transform scale-110' : ''}`}
                  style={{ 
                    color: color,
                    fontFamily: font,
                    fontWeight: 900,
                    textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000'
                  }}
                >
                  {text.split(' ')[0]} <span className="text-white">{text.split(' ').slice(1).join(' ')}</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
