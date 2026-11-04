import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Sparkles, Video, Layers, Scissors, Zap, Type, Music } from 'lucide-react';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/'),
  title: 'AI Word-by-Word Captions for TikTok, Reels & Shorts | NexusCut',
  description:
    'Auto-generate animated word-by-word captions for TikTok, Reels and YouTube Shorts right in your browser. Free exports with no watermark, plus a real timeline when you want full control.',
  alternates: { canonical: 'https://nexuscut.io' },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col overflow-x-hidden">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24">
        {/* Hero Section: the caption wedge front and center */}
        <section className="px-6 max-w-7xl mx-auto text-center mb-32 relative">
          {/* Background glowing effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[500px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 animate-[fadeInUp_1s_ease-out]">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-semibold mb-8 backdrop-blur-md">
              <Type className="w-4 h-4" />
              Word-by-word captions. Right in your browser.
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1] max-w-5xl mx-auto">
              Captions that make people <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500">
                stop scrolling.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Upload a clip and NexusCut transcribes every spoken word, then burns animated word-by-word captions you can restyle — fonts, colors, per-word highlight, exact timing — on a real multitrack timeline. Free exports, no watermark.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/editor" data-analytics-event="homepage_editor_cta" data-analytics-location="hero" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2 hover:-translate-y-1">
                Create Captions Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/tutorial" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                See it in 60 seconds
              </Link>
            </div>
            <Link href="/creator-challenge" data-analytics-event="creator_challenge_cta" data-analytics-location="homepage_hero" className="-mt-10 mb-16 inline-flex items-center gap-2 text-sm font-bold text-indigo-300 transition hover:text-white">
              <Sparkles className="h-4 w-4" /> New: Take the free 7-Day Shorts Challenge <ArrowRight className="h-4 w-4" />
            </Link>
            
            {/* Embedded Autoplaying Mockup showing word-by-word captions in action */}
            <div className="relative mx-auto max-w-5xl rounded-3xl p-2 bg-gradient-to-b from-white/10 to-white/0 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
              <style>{`
                @keyframes wordPop {
                  0%, 100% { opacity: 0; transform: scale(0.8) translateY(10px); }
                  5%, 25% { opacity: 1; transform: scale(1.1) translateY(0); color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
                  30%, 90% { opacity: 1; transform: scale(1) translateY(0); color: white; text-shadow: none; }
                }
                @keyframes floatEmoji {
                  0% { opacity: 0; transform: translateY(20px) scale(0.5); }
                  20% { opacity: 1; transform: translateY(0) scale(1.2); }
                  80% { opacity: 1; transform: translateY(-40px) scale(1); }
                  100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
                }
                @keyframes sweepPlayhead {
                  0% { left: 0%; }
                  100% { left: 100%; }
                }
                .word-1 { animation: wordPop 4s infinite 0.0s; opacity: 0; }
                .word-2 { animation: wordPop 4s infinite 0.4s; opacity: 0; }
                .word-3 { animation: wordPop 4s infinite 0.8s; opacity: 0; }
                .word-4 { animation: wordPop 4s infinite 1.2s; opacity: 0; }
                .word-5 { animation: wordPop 4s infinite 1.6s; opacity: 0; }
                .word-6 { animation: wordPop 4s infinite 2.0s; opacity: 0; }
                
                .emoji-1 { animation: floatEmoji 4s infinite 0.8s; opacity: 0; }
                .emoji-2 { animation: floatEmoji 4s infinite 2.2s; opacity: 0; }
              `}</style>
              
              <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center border border-white/5">
                {/* Mock UI for the editor showcasing captioned video + timeline */}
                <div className="absolute inset-0 flex flex-col">
                  {/* Mock Video Player Area */}
                  <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                    >
                      {/* Using a placeholder URL for visual effect */}
                      <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
                    </video>
                    
                    {/* Animated Emojis */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative w-3/4 h-full">
                        <div className="absolute bottom-32 left-1/4 text-5xl emoji-1 drop-shadow-2xl">🤯</div>
                        <div className="absolute bottom-40 right-1/4 text-5xl emoji-2 drop-shadow-2xl">🔥</div>
                      </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4">
                      <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex justify-center items-center gap-3">
                        <p className="text-center text-3xl font-black tracking-widest uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex flex-wrap justify-center gap-3">
                          <span className="word-1 inline-block">Wait...</span>
                          <span className="word-2 inline-block">this</span>
                          <span className="word-3 inline-block">was</span>
                          <span className="word-4 inline-block">edited</span>
                          <span className="word-5 inline-block">with</span>
                          <span className="word-6 inline-block">AI?</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Mock Timeline Area */}
                  <div className="h-48 bg-gray-950 border-t border-gray-900 p-4 flex flex-col gap-2 relative overflow-hidden">
                    {/* Animated Playhead */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 shadow-[0_0_15px_#4f46e5] z-20 pointer-events-none"
                      style={{ animation: 'sweepPlayhead 8s linear infinite' }}
                    >
                      <div className="w-3 h-3 rounded-full bg-indigo-400 absolute -top-1.5 -left-[5px] shadow-[0_0_10px_#4f46e5]"></div>
                    </div>

                    {/* Track 1: Video */}
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-10 bg-gray-900 rounded border border-gray-800 shrink-0 flex items-center justify-center shadow-inner">
                        <Video className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 h-10 rounded-lg relative flex gap-1">
                        <div className="h-full bg-indigo-600/30 border border-indigo-500/50 rounded flex-1 overflow-hidden relative">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=240&h=240&fit=facearea&facepad=1.6')] bg-repeat-x bg-[length:auto_100%]"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                          <span className="absolute bottom-1 left-2 text-[8px] text-white font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">00:00</span>
                        </div>
                        <div className="h-full bg-indigo-600/30 border border-indigo-500/50 rounded flex-[2] overflow-hidden relative">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=360&fit=crop')] bg-repeat-x bg-[length:auto_100%]"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                          <span className="absolute bottom-1 left-2 text-[8px] text-white font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">00:03</span>
                        </div>
                        <div className="h-full bg-indigo-600/30 border border-indigo-500/50 rounded flex-1 overflow-hidden relative">
                          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&fit=crop')] bg-repeat-x bg-[length:auto_100%]"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                          <span className="absolute bottom-1 left-2 text-[8px] text-white font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">00:09</span>
                        </div>
                      </div>
                    </div>
                    {/* Track 2: Captions */}
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-10 bg-gray-900 rounded border border-gray-800 shrink-0 flex items-center justify-center shadow-inner">
                        <Type className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 h-10 rounded-lg relative flex gap-1 items-center">
                        <div className="h-6 bg-yellow-500/40 border border-yellow-500/60 rounded flex-[0.5] shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center justify-center overflow-hidden"><span className="text-[9px] font-bold text-yellow-100 truncate px-1">Wait...</span></div>
                        <div className="h-6 bg-yellow-500/40 border border-yellow-500/60 rounded flex-[1.5] shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center justify-center overflow-hidden"><span className="text-[9px] font-bold text-yellow-100 truncate px-1">this was</span></div>
                        <div className="h-6 bg-yellow-500/40 border border-yellow-500/60 rounded flex-[1] shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center justify-center overflow-hidden"><span className="text-[9px] font-bold text-yellow-100 truncate px-1">edited</span></div>
                        <div className="h-6 bg-yellow-500/40 border border-yellow-500/60 rounded flex-[0.8] shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center justify-center overflow-hidden"><span className="text-[9px] font-bold text-yellow-100 truncate px-1">with AI?</span></div>
                      </div>
                    </div>
                    {/* Track 3: Audio */}
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-16 h-10 bg-gray-900 rounded border border-gray-800 shrink-0 flex items-center justify-center shadow-inner">
                        <Music className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 h-10 rounded-lg relative flex gap-1 items-center">
                        <div className="h-8 bg-emerald-500/20 border border-emerald-500/40 rounded flex-1 flex items-center px-1 overflow-hidden">
                          <div className="w-full h-4 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#10b981_2px,#10b981_4px)] opacity-50"></div>
                        </div>
                        <div className="h-8 bg-emerald-500/20 border border-emerald-500/40 rounded flex-[2] flex items-center px-1 overflow-hidden">
                          <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#10b981_2px,#10b981_4px)] opacity-60"></div>
                        </div>
                        <div className="h-8 bg-emerald-500/20 border border-emerald-500/40 rounded flex-[0.5] flex items-center px-1 overflow-hidden">
                          <div className="w-full h-3 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#10b981_2px,#10b981_4px)] opacity-40"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Honest value band */}
        <section className="border-y border-white/5 bg-white/[0.02] py-16 mb-32 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-2">Word-by-word</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Captions synced to every spoken word</p>
            </div>
            <div className="p-4 md:border-l border-white/5">
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-2">No watermark</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Free exports stay clean</p>
            </div>
            <div className="p-4 border-l border-white/5">
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-2">10 / month</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Free exports, no card needed</p>
            </div>
            <div className="p-4 border-l border-white/5">
              <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-2">Zero installs</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold">Runs entirely in your browser</p>
            </div>
          </div>
        </section>

        {/* How the captions work */}
        <section className="px-6 max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">From raw clip to <span className="text-indigo-400">captioned short</span> in three steps.</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">No timeline experience required. Every caption stays editable — nothing is locked in.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl">
              <div className="text-sm font-black text-indigo-400 mb-4 tracking-widest">STEP 1</div>
              <h3 className="text-xl font-bold mb-3">Drop in your clip</h3>
              <p className="text-gray-400 leading-relaxed">Upload a talking-head video or record right in the editor. Vertical, horizontal, or square.</p>
            </div>
            <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl">
              <div className="text-sm font-black text-indigo-400 mb-4 tracking-widest">STEP 2</div>
              <h3 className="text-xl font-bold mb-3">Auto-transcribe every word</h3>
              <p className="text-gray-400 leading-relaxed">Speech recognition timestamps each word, so captions land exactly when they are spoken.</p>
            </div>
            <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl">
              <div className="text-sm font-black text-indigo-400 mb-4 tracking-widest">STEP 3</div>
              <h3 className="text-xl font-bold mb-3">Style, tweak, export</h3>
              <p className="text-gray-400 leading-relaxed">Pick a caption preset, adjust any word, color or timing on the timeline, then export a clean MP4.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/tools/auto-captions" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-all">
              Try the Auto-Captions tool <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="px-6 max-w-7xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Captions first. <span className="text-indigo-400">Control always.</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">AI does the tedious part — transcription and timing. You keep the timeline when you want to go deeper.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Item 1: the wedge, largest card */}
            <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-6">
                      <Type className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Animated Word-by-Word Captions</h3>
                    <p className="text-gray-400 leading-relaxed text-lg">
                      The feature creators came for: active-word highlight, per-word colors, fonts and punch-in animations — tuned to the exact millisecond each word is spoken. Change everything with a single click.
                    </p>
                  </div>
                  <div className="flex-1 w-full bg-black/50 rounded-xl border border-white/10 p-6 flex items-center justify-center min-h-[150px]">
                     <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse">
                        <span className="text-yellow-400">High</span> Retention
                     </span>
                  </div>
               </div>
            </div>
            
            {/* Bento Item 2 */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Timeline Freedom</h3>
              <p className="text-gray-400 leading-relaxed">
                Drag, drop, snap. A real multitrack timeline — fix any cut, caption or layer instead of regenerating the whole video.
              </p>
            </div>
            
            {/* Bento Item 3 */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl hover:border-purple-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">One-Click Silence Cut</h3>
              <p className="text-gray-400 leading-relaxed">
                Detect silent gaps and dead air, then remove them from the timeline in one pass so your short never drags.
              </p>
            </div>
            
            {/* Bento Item 4 */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 p-8 rounded-3xl hover:border-blue-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant &amp; Lightweight</h3>
              <p className="text-gray-400 leading-relaxed">
                No downloads or installs — the editor loads in seconds, your project autosaves to your account, and your media stays on your device.
              </p>
            </div>
          </div>
        </section>

        {/* Competitor Comparison Section */}
        <section className="px-6 max-w-5xl mx-auto mb-32">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center relative z-10">Why short-form creators switch to NexusCut</h2>
            
            <div className="space-y-6 relative z-10">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <h4 className="font-bold text-gray-500 mb-2 uppercase text-sm tracking-wider">vs. Automated Clippers (e.g. Opus)</h4>
                  <p className="text-lg">They give you a black box. <span className="text-indigo-400 font-semibold">We give you a full timeline.</span></p>
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <h4 className="font-bold text-gray-500 mb-2 uppercase text-sm tracking-wider">vs. Credit-based Caption Apps</h4>
                  <p className="text-lg">Metered words and watermarked trials. <span className="text-indigo-400 font-semibold">Here every export is yours, clean and unmetered.</span></p>
                </div>
              </div>
              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <h4 className="font-bold text-gray-500 mb-2 uppercase text-sm tracking-wider">vs. Desktop Apps (e.g. Premiere)</h4>
                  <p className="text-lg">They require massive downloads. <span className="text-indigo-400 font-semibold">We run instantly in your browser.</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 max-w-4xl mx-auto text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-5xl md:text-6xl font-black mb-8 relative z-10">Your next Short deserves better captions.</h2>
          <p className="text-xl text-gray-400 mb-10 relative z-10">Word-by-word animation, automatic timing, zero watermark — free.</p>
          <Link href="/editor" data-analytics-event="homepage_editor_cta" data-analytics-location="final_cta" className="inline-flex px-10 py-5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-xl transition-all shadow-xl items-center gap-3 relative z-10 group">
            Create Captions Free <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </main>

      <Footer />
      
      {/* Global CSS for custom animations if Tailwind config doesn't have them */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
