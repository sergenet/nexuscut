'use client';
import { toast } from '@/lib/toast';
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Download, Sparkles, FolderDown, X, Mail } from 'lucide-react';
import Link from 'next/link';

const templates = [
  {
    id: 'viral-hooks',
    title: 'Viral Hook Pack',
    description: '10 proven hooks that grab attention in the first 3 seconds. Stop the scroll instantly.',
    file: '/templates/viral-hooks.zip',
    color: 'from-blue-500 to-indigo-500',
    icon: Sparkles
  },
  {
    id: 'caption-pack',
    title: 'Caption Styles Pack',
    description: '10 dynamic subtitle styles (JSON presets) compatible with Premiere Pro, CapCut, and NexusCut.',
    file: '/templates/captions-pack.zip',
    color: 'from-fuchsia-500 to-pink-500',
    icon: Download
  },
  {
    id: 'script-pack',
    title: 'Script Templates',
    description: '10 Fill-in-the-blank script templates for talking-head videos, reaction clips, storytelling, vlogs, tutorials, product reviews, unboxings, Q&A sessions, podcasts, and challenges.',
    file: '/templates/script-pack.zip',
    color: 'from-amber-400 to-orange-500',
    icon: FolderDown
  }
];

export default function TemplatesPage() {
  const [selectedPack, setSelectedPack] = useState<typeof templates[0] | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownloadClick = (pack: typeof templates[0]) => {
    setSelectedPack(pack);
    setSubmitted(false);
    setEmail('');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedPack) return;
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/marketing/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, packId: selectedPack.id }),
      });
      
      if (!res.ok) throw new Error('Failed to record email');
      
      setSubmitted(true);
      
      // Auto-trigger download
      const link = document.createElement('a');
      link.href = selectedPack.file;
      link.download = selectedPack.file.split('/').pop() || 'download.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      toast('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col relative">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <FolderDown className="w-4 h-4" /> Free Resources
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Template Packs</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Download our proven templates and apply them to your content today. 100% free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((pack) => {
            const Icon = pack.icon;
            return (
              <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl hover:border-gray-700 transition-colors">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${pack.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{pack.title}</h3>
                <p className="text-gray-400 mb-8 flex-grow">{pack.description}</p>
                
                <button 
                  onClick={() => handleDownloadClick(pack)}
                  className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Pack (.zip)
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-24 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-12 text-center border border-indigo-500/30">
          <h2 className="text-4xl font-extrabold mb-4">Want more templates?</h2>
          <p className="text-xl text-indigo-200 mb-8 max-w-2xl mx-auto">
            Upgrade to NexusCut Creator+ and get exclusive access to our premium marketplace of animated backgrounds, dynamic captions, and auto-hook generators.
          </p>
          <Link href="/pricing" className="inline-block px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            View Premium Plans
          </Link>
        </div>
      </main>

      <Footer />

      {/* Email Capture Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedPack(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedPack.color} flex items-center justify-center mx-auto mb-4`}>
                <selectedPack.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Get the {selectedPack.title}</h2>
              <p className="text-gray-400">Enter your best email address below to instantly download this template pack.</p>
            </div>

            {submitted ? (
              <div className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Success!</h3>
                <p className="text-gray-300 mb-4">Your download should start automatically.</p>
                <a href={selectedPack.file} download className="text-emerald-400 hover:text-emerald-300 underline font-medium">
                  Click here if it didn't start.
                </a>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="creator@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                  {loading ? 'Processing...' : 'Download Now'}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  By downloading, you agree to receive creator tips and updates from NexusCut. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
