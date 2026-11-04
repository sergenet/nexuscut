
import React from 'react';
import Link from 'next/link';
import { Play, Sparkles, Wand2, Type, Smartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Navbar placeholder */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-white tracking-tighter">
            NexusCut
          </Link>
          <div className="flex gap-4 items-center">
            <a href="https://nexuscut.io/editor" className="text-sm font-medium hover:text-white text-neutral-400">Features</a>
            <a href="https://nexuscut.io/pricing" className="text-sm font-medium hover:text-white text-neutral-400">Pricing</a>
            <a href="https://app.nexuscut.io" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-medium transition-colors">
              Start Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <Sparkles className="w-4 h-4" /> Start with 10 free monthly exports
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Create and Export Instagram Reels
          </h1>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build a 9:16 edit with an editable timeline, optional AI-assisted captions, silence removal, and export controls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://app.nexuscut.io" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)]">
              Start Editing Now <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-neutral-500 text-sm sm:hidden mt-2">No credit card required.</p>
          </div>
          <p className="text-neutral-500 text-sm hidden sm:block mt-6">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tools for a clear vertical edit</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">Built specifically for vertical video creators on Instagram Reels.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Type className="w-8 h-8 text-indigo-400" />}
              title="Auto-Captions"
              desc="Generate word-timed captions, then review and correct the text and timing before export."
            />
            <FeatureCard 
              icon={<Wand2 className="w-8 h-8 text-purple-400" />}
              title="Image Background Removal"
              desc="Use the separate image tool to create a transparent PNG. Video background removal is not available."
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8 text-pink-400" />}
              title="9:16 Canvas"
              desc="Edit and export in a vertical frame suitable for Reels uploads. Platform distribution is not guaranteed."
            />
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto prose prose-invert prose-lg">
          <h2 className="text-3xl font-bold mb-6">Why use a dedicated Instagram Reels Editor?</h2>
          <p className="text-neutral-300 mb-6">
            A vertical layout and readable captions can make a video easier to watch on a phone, but Instagram controls its own distribution systems.
          </p>
          <p className="text-neutral-300 mb-6">
            NexusCut is designed around short-form editing while preserving timeline control. No editor can guarantee reach or placement in Instagram recommendations.
          </p>
          <ul className="list-disc pl-6 text-neutral-300 mb-8 space-y-2">
            <li><strong>Reduce repetitive work:</strong> Captioning and silence detection can shorten parts of the workflow; processing time varies by source.</li>
            <li><strong>Support comprehension:</strong> Word-timed captions can help viewers follow speech; results vary.</li>
            <li><strong>Cloud-Based:</strong> Edit from your browser. No heavy software to download.</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-neutral-500">
          <p>© 2026 NexusCut. The Best AI Video Editor for Instagram Reels.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl hover:border-indigo-500/30 transition-colors">
      <div className="bg-neutral-950 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
