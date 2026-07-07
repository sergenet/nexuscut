import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, Cloud, Users, Cpu } from "lucide-react";

export default function OnlineProductPage() {
  return (
    <div className="min-h-screen bg-neutral-950 pb-24">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
          Edit Anywhere, <span className="text-emerald-500">Instantly</span>
        </h1>
        <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
          No installation required. NexusCut Online runs in your browser with desktop-level power. Start your project on your phone, finish it on your laptop.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/editor" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-emerald-500/20 hover:scale-105">
            <Globe className="w-5 h-5" /> Open Online Editor
          </Link>
        </div>
      </div>

      {/* Mockup Showcase */}
      <div className="px-6 max-w-6xl mx-auto mb-32 relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/50 aspect-video">
          <Image 
            src="/assets/desktop_mockup.png" 
            alt="NexusCut Online UI" 
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Cloud />}
          title="Cloud Sync"
          desc="Your media and projects are instantly synced across all your devices securely in the cloud."
        />
        <FeatureCard 
          icon={<Users />}
          title="Live Collaboration"
          desc="Edit in real-time with your team. Leave comments, assign tasks, and review instantly."
        />
        <FeatureCard 
          icon={<Cpu />}
          title="Browser Powered AI"
          desc="Access all of NexusCut's AI generators natively in the browser with zero lag."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 transition-colors">
      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-7 h-7" })}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
