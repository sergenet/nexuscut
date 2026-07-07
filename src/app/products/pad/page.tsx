"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Download, PenTool, LayoutTemplate, Layers } from "lucide-react";
import WaitlistModal from "@/components/WaitlistModal";

export default function PadProductPage() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [waitlistProduct, setWaitlistProduct] = useState("");

  const openWaitlist = (product: string) => {
    setWaitlistProduct(product);
    setIsWaitlistOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-24">
      <WaitlistModal 
        isOpen={isWaitlistOpen} 
        onClose={() => setIsWaitlistOpen(false)} 
        productName={waitlistProduct} 
      />
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
          Touch the <span className="text-fuchsia-500">Timeline</span>
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          NexusCut Pad brings the entire studio to your fingertips. Optimized for stylus precision and multi-touch gestures.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => openWaitlist("NexusCut Pad for iPad")}
            className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-fuchsia-500/20 hover:scale-105"
          >
            <Download className="w-5 h-5" /> Join iPad Waitlist
          </button>
          <button 
            onClick={() => openWaitlist("NexusCut Pad for Android")}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            Join Android Waitlist
          </button>
        </div>
      </div>

      {/* Mockup Showcase */}
      <div className="px-6 max-w-4xl mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-fuchsia-500/20 blur-[100px] rounded-full" />
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50 aspect-[4/3]">
          <Image 
            src="/assets/tablet_mockup.png" 
            alt="NexusCut Pad UI" 
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<PenTool />}
          title="Stylus Precision"
          desc="Draw masks, create animations, and trim clips with sub-pixel precision using your Apple Pencil or stylus."
        />
        <FeatureCard 
          icon={<LayoutTemplate />}
          title="Adaptive UI"
          desc="The interface perfectly adapts to your screen size, keeping the canvas front and center."
        />
        <FeatureCard 
          icon={<Layers />}
          title="Pro Desktop Engine"
          desc="Don't be fooled by the form factor. The Pad version runs the exact same rendering engine as desktop."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-fuchsia-500/50 transition-colors">
      <div className="w-14 h-14 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center text-fuchsia-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
