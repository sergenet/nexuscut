'use client';
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, ArrowRight, CheckCircle2, Crown } from 'lucide-react';
import Link from 'next/link';
import fpPromise from '@fingerprintjs/fingerprintjs';

export default function ViralHookGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [hooks, setHooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const generateHooks = async () => {
    if (!topic) return;
    setLoading(true);
    setLimitReached(false);
    setErrorMessage("");
    try {
      // Get visitor id
      const fp = await fpPromise.load();
      const result = await fp.get();
      const visitorId = result.visitorId;

      const res = await fetch('/api/smart-tools/hook-generator', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-device-fingerprint': visitorId
        },
        body: JSON.stringify({ topic }),
      });
      
      if (res.status === 429) {
        setLimitReached(true);
        const errData = await res.json();
        setErrorMessage(errData.error || "Usage limit reached.");
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      if (data.hooks) setHooks(data.hooks);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Viral Hook <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Generator</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate five draft opening lines for a topic, then choose and test the one that fits your audience.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl mb-12">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-semibold text-gray-300">What is your video about?</label>
            <input 
              type="text" 
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. How to get 10k followers on TikTok fast..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateHooks()}
            />
            <button 
              onClick={generateHooks}
              disabled={loading || !topic}
              className="mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Generating Hooks...' : 'Generate Viral Hooks'}
              {!loading && <Sparkles className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {limitReached && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-12 shadow-xl max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">Free Limit Reached</h3>
            <p className="text-red-400/80 mb-6">{errorMessage} Please upgrade to Pro for unlimited viral hooks and AI editing.</p>
            <Link href="/pricing" className="inline-flex bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all items-center justify-center gap-2">
              <Crown className="w-5 h-5" /> Upgrade to Pro
            </Link>
          </div>
        )}

        {hooks.length > 0 && !limitReached && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-4">Your Custom Hooks</h2>
            {hooks.map((hook, idx) => (
              <div key={idx} className="p-6 bg-gray-900 rounded-xl border border-gray-800 flex items-start justify-between gap-4 hover:border-indigo-500/50 transition-colors group">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-gray-200">{hook}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(hook);
                    const btn = document.getElementById(`copy-btn-${idx}`);
                    if (btn) {
                      btn.innerText = 'Copied!';
                      setTimeout(() => btn.innerText = 'Copy', 2000);
                    }
                  }}
                  id={`copy-btn-${idx}`}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm font-semibold rounded-lg text-gray-300 hover:text-white transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  Copy
                </button>
              </div>
            ))}
            
            {/* The Trojan Horse CTA */}
            <div className="pt-10 text-center border-t border-gray-800 mt-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
                <Sparkles className="w-3 h-3" /> Next Step
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Ready to record this hook?</h3>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
                Drop your recorded video into NexusCut. We'll automatically transcribe it, cut the silences, and add those viral Hormozi-style captions. No upload required.
              </p>
              <a href="/editor" className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-10 py-5 rounded-full transition-all shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] hover:-translate-y-1 text-lg">
                Edit Video Now <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
