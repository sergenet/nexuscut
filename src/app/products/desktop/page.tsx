"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Zap, Layers, MonitorPlay, Home } from "lucide-react";
import WaitlistModal from "@/components/WaitlistModal";

export default function DesktopProductPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistProduct, setWaitlistProduct] = useState("");

  const openWaitlist = (product: string) => {
    setWaitlistProduct(product);
    setIsWaitlistOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-24 relative">
      <Link href="/" className="absolute top-6 left-6 p-3 bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors z-10">
        <Home className="w-6 h-6 text-white" />
      </Link>
      
      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
        productName={waitlistProduct} 
      />
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
          NexusCut <span className="text-indigo-500">Desktop</span> Preview
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          The native desktop application is in development. The image below is a concept mockup; current editing is available in the browser editor.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => openWaitlist("NexusCut Desktop for Windows")}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
          >
            <Download className="w-5 h-5" /> Join Windows Beta
          </button>
          <button 
            onClick={() => openWaitlist("NexusCut Desktop for Mac")}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            Join Mac Beta
          </button>
        </div>
      </div>

      {/* Mockup Showcase */}
      <div className="px-6 max-w-6xl mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50 aspect-video">
          <Image 
            src="/assets/desktop_mockup.png" 
            alt="Concept mockup of the planned NexusCut Desktop interface" 
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Zap />}
          title="Planned native rendering"
          desc="GPU-assisted native rendering is under evaluation; 4K and 8K support are not currently promised."
        />
        <FeatureCard 
          icon={<Layers />}
          title="Planned expanded timeline"
          desc="The desktop roadmap includes more flexible video and audio tracks than the current browser editor."
        />
        <FeatureCard 
          icon={<MonitorPlay />}
          title="Planned workspace options"
          desc="Detachable panels and multi-monitor workflows are design goals, not released features."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 transition-colors">
      <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
