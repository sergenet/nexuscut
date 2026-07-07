"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Download, PlayCircle, Smartphone, Wand2 } from "lucide-react";
import WaitlistModal from "@/components/WaitlistModal";

export default function MobileProductPage() {
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
          Create <span className="text-rose-500">Viral</span> Videos Anywhere
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          The ultimate pocket studio for TikTok, Shorts, and Reels. Shoot, edit, and post with one tap using NexusCut Mobile.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => openWaitlist("NexusCut Mobile for iOS")}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-rose-500/20 hover:scale-105"
          >
            <Smartphone className="w-5 h-5" /> Join iOS Waitlist
          </button>
          <button 
            onClick={() => openWaitlist("NexusCut Mobile for Android")}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-8 py-4 rounded-full transition-all"
          >
            Join Android Waitlist
          </button>
        </div>
      </div>

      {/* Mockup Showcase */}
      <div className="px-6 max-w-sm mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-rose-500/20 blur-[80px] rounded-full" />
        <div className="relative rounded-[3rem] overflow-hidden border-4 border-neutral-800 shadow-2xl shadow-black/50 aspect-[9/19]">
          <Image 
            src="/assets/mobile_mockup.png" 
            alt="NexusCut Mobile UI" 
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<PlayCircle />}
          title="Social Ready"
          desc="Export directly to TikTok, Instagram Reels, and YouTube Shorts with the exact correct aspect ratio and bitrate."
        />
        <FeatureCard 
          icon={<Smartphone />}
          title="Vertical Timeline"
          desc="A revolutionary editing timeline designed specifically to be used with one thumb."
        />
        <FeatureCard 
          icon={<Wand2 />}
          title="One-Tap Templates"
          desc="Access thousands of viral trending templates. Just select your clips and let AI do the rest."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-rose-500/50 transition-colors">
      <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
