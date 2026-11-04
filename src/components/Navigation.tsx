"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, ChevronDown, Monitor, Globe, TabletSmartphone, Smartphone, 
  Image as ImageIcon, Type,
  Sparkles, LayoutTemplate, Gift, Briefcase,
  Rocket, TrendingUp, Lightbulb, Film, Music, Download
} from "lucide-react";

export default function Navigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [account, setAccount] = useState<{ authenticated: boolean; planTier: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const reset = window.setTimeout(() => setActiveMenu(null), 0);
    return () => window.clearTimeout(reset);
  }, [pathname]);

  useEffect(() => {
    let active = true;
    fetch('/api/user/me', { cache: 'no-store' })
      .then(response => response.json())
      .then((data: { authenticated?: boolean; planTier?: string }) => {
        if (active) setAccount({ authenticated: Boolean(data.authenticated), planTier: data.planTier || 'free' });
      })
      .catch(() => { if (active) setAccount({ authenticated: false, planTier: 'free' }); });
    return () => { active = false; };
  }, [pathname]);

  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutId.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50 relative">
          <img src="/logo.jpg" alt="NexusCut Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/20 border border-neutral-800" />
          <span className="text-xl font-black tracking-tight text-white hover:text-indigo-400 transition-colors">
            Nexus<span className="text-indigo-500">Cut</span>
          </span>
        </Link>

        {/* Main Desktop Nav */}
        <nav className="hidden md:flex h-full items-center gap-1" onMouseLeave={handleMouseLeave}>
          
          {/* Marketplace Link */}
          <div className="relative h-full flex items-center">
            <Link href="/marketplace" className="px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-1">
              <Gift className="w-4 h-4" /> Marketplace
            </Link>
          </div>

          {/* Downloads Link */}
          <div className="relative h-full flex items-center">
            <Link href="/downloads" className="px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors text-neutral-300 hover:text-white hover:bg-white/5 flex items-center gap-1">
              <Download className="w-4 h-4" /> Downloads
            </Link>
          </div>

          {/* Pricing Link */}
          <div className="relative h-full flex items-center">
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors text-neutral-300 hover:text-white hover:bg-white/5">
              Pricing
            </Link>
          </div>

          {/* Blog Link */}
          <div className="relative h-full flex items-center">
            <Link href="/blog" className="px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors text-neutral-300 hover:text-white hover:bg-white/5">
              Blog
            </Link>
          </div>

          {/* Products Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('products')}>
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${activeMenu === 'products' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
              Products <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'products' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'products' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[60px] left-0 w-64 bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden p-2"
                >
                  <MenuItem href="/products/desktop" icon={<Monitor />} title="NexusCut Desktop" desc="Pro video editing for PC/Mac" />
                  <MenuItem href="/editor" icon={<Globe />} title="NexusCut Online" desc="Edit instantly in your browser" />
                  <MenuItem href="/video-repurposing-service" icon={<Briefcase />} title="Video Repurposing Service" desc="Done-for-you short-form editing" isNew />
                  <MenuItem href="/products/pad" icon={<TabletSmartphone />} title="NexusCut Pad" desc="Optimized for tablets" />
                  <MenuItem href="/products/mobile" icon={<Smartphone />} title="NexusCut Mobile" desc="Create on the go" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Features Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('features')}>
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${activeMenu === 'features' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
              Features <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'features' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'features' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[60px] -left-32 w-[600px] bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden p-6"
                >
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="col-span-2 text-sm font-bold text-neutral-500 tracking-wider mb-2 uppercase">Nexus AI Features</div>
                    <MenuItem href="/editor" icon={<Scissors />} title="Video Editor" desc="The core timeline editor" />
                    <MenuItem href="/tools/auto-captions" icon={<Type />} title="Auto Captions" desc="AI powered subtitles" />
                    <MenuItem href="/tools/audio-studio" icon={<Music />} title="AI Voice (TTS)" desc="AI voice generation" />
                    <MenuItem href="/tools/remove-background" icon={<ImageIcon />} title="Remove Background" desc="1-click background removal" />
                    <MenuItem href="/tools/viral-hook-generator" icon={<Sparkles />} title="Viral Hook Generator" desc="AI hook writing" />
                    <MenuItem href="/brand-kit" icon={<Briefcase />} title="B2B Brand Kit" desc="Save logos, hex colors & fonts" isPro />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Templates Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('templates')}>
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${activeMenu === 'templates' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
              Templates <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'templates' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'templates' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[60px] -left-48 w-[700px] bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden flex"
                >
                  <div className="w-1/3 bg-neutral-800/50 p-6 border-r border-neutral-700/50 flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                        <LayoutTemplate className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">NexusCut Templates</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        Explore all NexusCut templates in one place for marketing, social media, or personal storytelling. Personalize your templates with ease using AI-powered editing tools and modern designs.
                      </p>
                    </div>
                    <Link href="/templates" className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 mt-4 flex items-center gap-1">
                      Browse Full Gallery &rarr;
                    </Link>
                  </div>
                  <div className="w-2/3 p-6 grid grid-cols-2 gap-2">
                    <MenuItem href="/templates" icon={<Sparkles />} title="Viral Hooks Pack" />
                    <MenuItem href="/templates" icon={<Type />} title="Caption Styles Pack" />
                    <MenuItem href="/templates" icon={<Briefcase />} title="Script Templates Pack" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Growth Hub (Differentiator) Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('growth')}>
            <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${activeMenu === 'growth' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
              <span className="flex items-center gap-1 text-emerald-400"><Rocket className="w-4 h-4" /> Growth Hub</span>
              <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${activeMenu === 'growth' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'growth' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[60px] -left-24 w-80 bg-neutral-900 border border-emerald-900/50 rounded-2xl shadow-2xl overflow-hidden p-2"
                >
                  <div className="px-3 py-2">
                    <span className="inline-block px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full mb-2">Free Resources</span>
                    <p className="text-sm text-neutral-400 mb-3">Scale your audience faster with free creator tools, a 7-day Pro trial, and practical publishing tactics.</p>
                  </div>
                  <Link href="/creator-challenge" data-analytics-event="creator_challenge_cta" data-analytics-location="growth_hub" className="mx-2 mb-2 flex items-center gap-3 rounded-xl border border-indigo-400/25 bg-indigo-500/10 px-3 py-3 text-sm font-bold text-indigo-100 transition hover:bg-indigo-500/20">
                    <Sparkles className="h-5 w-5 text-indigo-300" /> 7-Day Shorts Challenge
                  </Link>
                  <MenuItem href="/tools/tiktok-caption-generator" icon={<Type className="text-emerald-400" />} title="TikTok Captions" desc="Free AI Tool" />
                  <MenuItem href="/tools/youtube-shorts-maker" icon={<Film className="text-emerald-400" />} title="YT Shorts Maker" desc="Free AI Tool" />
                  <MenuItem href="/tools/viral-hook-generator" icon={<Sparkles className="text-emerald-400" />} title="Viral Hooks" desc="Free AI Tool" />
                  <MenuItem href="/templates" icon={<Lightbulb className="text-emerald-400" />} title="Viral Hook Formulas" desc="Free templates download" />
                  <MenuItem href="/tutorial" icon={<TrendingUp className="text-emerald-400" />} title="Editor Tutorial" desc="Learn the editor" />
                  <div className="mt-2 p-3 bg-gradient-to-r from-emerald-900/30 to-indigo-900/30 rounded-xl border border-white/5">
                    <p className="text-xs text-white font-semibold">Try NexusCut Pro Free for 7 Days</p>
                    <Link href="/pro" className="mt-2 block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">Start 7-Day Pro Trial</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link href="/blog" className="hidden sm:block md:hidden text-sm font-semibold text-neutral-300 hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="/account" className="sm:hidden whitespace-nowrap rounded-lg px-2 py-2 text-xs font-bold text-neutral-200 transition-colors hover:bg-white/5 hover:text-white">
            {account?.authenticated ? 'Account' : 'Log in'}
          </Link>
          <Link href="/account" className="hidden sm:flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2 transition-colors">
            {account?.authenticated ? 'My Account' : 'Log In'}
            {account?.authenticated && <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-300">{account.planTier}</span>}
          </Link>
          <Link href="/editor" className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95">
            Open Editor
          </Link>
        </div>

      </div>
    </header>
  );
}

function MenuItem({ href, icon, title, desc, isNew, isPro }: { href: string, icon: React.ReactNode, title: string, desc?: string, isNew?: boolean, isPro?: boolean }) {
  return (
    <Link href={href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="mt-0.5 text-neutral-400 group-hover:text-indigo-400 transition-colors">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{title}</div>
          {isNew && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">NEW</span>}
          {isPro && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">PRO</span>}
        </div>
        {desc && <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>}
      </div>
    </Link>
  );
}
