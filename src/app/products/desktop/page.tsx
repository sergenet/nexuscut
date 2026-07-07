import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Zap, Layers, MonitorPlay } from "lucide-react";

export default function DesktopProductPage() {
  return (
    <div className="min-h-screen bg-neutral-950 pb-24">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
          Unleash Pro Power on <span className="text-indigo-500">Desktop</span>
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          Hardware-accelerated rendering, infinite timeline tracks, and unparalleled precision. NexusCut Desktop is the ultimate tool for professional editors.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:scale-105">
            <Download className="w-5 h-5" /> Download for Windows
          </button>
          <button className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-full transition-all">
            Download for Mac
          </button>
        </div>
      </div>

      {/* Mockup Showcase */}
      <div className="px-6 max-w-6xl mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50 aspect-video">
          <Image 
            src="/assets/desktop_mockup.png" 
            alt="NexusCut Desktop UI" 
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Zap />}
          title="Hardware Acceleration"
          desc="Utilize the full power of your GPU to render 4K and 8K footage without breaking a sweat."
        />
        <FeatureCard 
          icon={<Layers />}
          title="Infinite Tracks"
          desc="Layer unlimited video, audio, and adjustment tracks. Your timeline, your rules."
        />
        <FeatureCard 
          icon={<MonitorPlay />}
          title="Multi-Monitor Support"
          desc="Detach panels, expand your timeline, and preview on a dedicated screen."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 transition-colors">
      <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
