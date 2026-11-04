'use client';
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TikTokCaptionGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateCaptions = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch('/api/smart-tools/caption-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.captions) setCaptions(data.captions);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Free TikTok Post <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Caption Generator</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Draft post descriptions and relevant hashtag ideas from your topic. Review every suggestion before publishing.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl mb-12">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-300">What is your video about?</label>
            <textarea 
              rows={3}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              placeholder="e.g. A vlog about my morning routine as a software engineer..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateCaptions();
                }
              }}
            />
            <button 
              onClick={generateCaptions}
              disabled={loading || !topic}
              className="mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Writing Captions...' : 'Generate Viral Captions'}
              {!loading && <Sparkles className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {captions.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4">Your Custom Captions</h2>
            {captions.map((caption, idx) => (
              <div key={idx} className="p-6 bg-gray-900 rounded-xl border border-gray-800 flex flex-col gap-4 hover:border-emerald-500/50 transition-colors relative group">
                <p className="text-lg text-gray-200 whitespace-pre-wrap">{caption}</p>
                <button 
                  onClick={() => copyToClipboard(caption, idx)}
                  className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  {copiedIndex === idx ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            ))}
            
            <div className="pt-10 text-center border-t border-gray-800 mt-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
                <Sparkles className="w-3 h-3" /> Next Step
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Want animated video subtitles too?</h3>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                Drop your video into NexusCut. We'll automatically transcribe it, cut the silences, and add those viral Hormozi-style captions directly to the video itself.
              </p>
              <Link href="/editor" className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-5 rounded-full transition-all shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:-translate-y-1 text-lg">
                Edit Video Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
