
import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Play } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-white tracking-tighter">
            NexusCut
          </Link>
          <a href="https://app.nexuscut.io" className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-medium transition-colors">
            Start Free
          </a>
        </div>
      </nav>

      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            NexusCut vs <span className="text-neutral-500 line-through">NexusClips</span>
          </h1>
          <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A factual checklist of what NexusCut currently provides. We do not make unverified claims about NexusClips or its users.
          </p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 border-b border-neutral-800 bg-neutral-950/50">
              <div className="p-6 font-semibold text-lg text-neutral-400">Features</div>
              <div className="p-6 font-bold text-xl text-indigo-400 text-center border-l border-neutral-800">NexusCut</div>
            </div>
            
            <ComparisonRow feature="Auto-captions with editable word timing" nexusCut={true} />
            <ComparisonRow feature="Still-image background removal" nexusCut={true} />
            <ComparisonRow feature="Vertical 9:16 canvas" nexusCut={true} />
            <ComparisonRow feature="Server-side MP4 rendering" nexusCut={true} />
            <ComparisonRow feature="Downloadable creator templates" nexusCut={true} />
            <ComparisonRow feature="Released native mobile app" nexusCut={false} />
            
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 text-center">
        <a href="https://app.nexuscut.io" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all group shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
          Switch to NexusCut Today <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
      </section>
    </div>
  );
}

function ComparisonRow({ feature, nexusCut }: { feature: string, nexusCut: boolean }) {
  return (
    <div className="grid grid-cols-2 border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
      <div className="p-6 font-medium text-neutral-300">{feature}</div>
      <div className="p-6 flex items-center justify-center border-l border-neutral-800">
        {nexusCut ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <span className="text-sm text-neutral-400">Not available</span>}
      </div>
    </div>
  );
}
