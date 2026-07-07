"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, ChevronDown, Monitor, Globe, TabletSmartphone, Smartphone, 
  Wand2, Image as ImageIcon, Video, Mic, Type, FileImage, UserMinus, 
  Crop, Sparkles, LayoutTemplate, Calendar, Gift, Briefcase, Factory, 
  PlaySquare, Rocket, TrendingUp, Lightbulb, GraduationCap 
} from "lucide-react";

export default function Navigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = (menu: string) => {
    clearTimeout(timeoutId);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-50 relative">
          <Scissors className="w-6 h-6 text-indigo-500" />
          <span className="text-xl font-black tracking-tight text-white hover:text-indigo-400 transition-colors">
            Nexus<span className="text-indigo-500">Cut</span>
          </span>
        </Link>

        {/* Main Desktop Nav */}
        <nav className="hidden md:flex h-full items-center gap-1" onMouseLeave={handleMouseLeave}>
          
          {/* Products Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('products')}>
            <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'products' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
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
                  <MenuItem href="/products/online" icon={<Globe />} title="NexusCut Online" desc="Edit instantly in your browser" />
                  <MenuItem href="/products/pad" icon={<TabletSmartphone />} title="NexusCut Pad" desc="Optimized for tablets" />
                  <MenuItem href="/products/mobile" icon={<Smartphone />} title="NexusCut Mobile" desc="Create on the go" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Features Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('features')}>
            <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'features' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
              Features <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'features' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {activeMenu === 'features' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-[60px] -left-32 w-[600px] bg-neutral-900 border border-neutral-700/50 rounded-2xl shadow-2xl overflow-hidden p-6 grid grid-cols-2 gap-x-8 gap-y-2"
                >
                  <div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 px-3">AI Magic</h3>
                    <MenuItem href="#" icon={<ImageIcon />} title="AI Image Generator" />
                    <MenuItem href="#" icon={<Video />} title="AI Video Generator" />
                    <MenuItem href="#" icon={<Mic />} title="AI Voice Generator" />
                    <MenuItem href="#" icon={<Type />} title="Auto Caption Generator" />
                    <MenuItem href="#" icon={<Wand2 />} title="Gemini Omni" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 px-3">Image & Video Tools</h3>
                    <MenuItem href="#" icon={<FileImage />} title="Remove Background" />
                    <MenuItem href="#" icon={<Sparkles />} title="Image Upscaler" />
                    <MenuItem href="#" icon={<UserMinus />} title="AI People Remover" />
                    <MenuItem href="#" icon={<Crop />} title="Face Cutout" />
                    <MenuItem href="#" icon={<Type />} title="AI Text Remover" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Templates Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('templates')}>
            <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'templates' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
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
                    <Link href="#" className="text-indigo-400 text-sm font-semibold hover:text-indigo-300 mt-4 flex items-center gap-1">
                      Browse Full Gallery &rarr;
                    </Link>
                  </div>
                  <div className="w-2/3 p-6 grid grid-cols-2 gap-2">
                    <MenuItem href="#" icon={<Smartphone />} title="Social Media Templates" />
                    <MenuItem href="#" icon={<Gift />} title="Holiday Templates" />
                    <MenuItem href="#" icon={<Calendar />} title="Calendar Templates" />
                    <MenuItem href="#" icon={<Sparkles />} title="Anniversary Templates" />
                    <MenuItem href="#" icon={<Wand2 />} title="Effects Templates" />
                    <MenuItem href="#" icon={<Briefcase />} title="Business Templates" />
                    <MenuItem href="#" icon={<Factory />} title="Industry Templates" />
                    <MenuItem href="#" icon={<PlaySquare />} title="Recap Templates" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Growth Hub (Differentiator) Menu */}
          <div className="relative h-full flex items-center" onMouseEnter={() => handleMouseEnter('growth')}>
            <button className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'growth' ? 'text-white bg-white/5' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
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
                    <p className="text-sm text-neutral-400 mb-3">Scale your audience faster with exclusive guides, 30-day trials, and pro tactics not found anywhere else.</p>
                  </div>
                  <MenuItem href="#" icon={<Lightbulb className="text-emerald-400" />} title="Viral Hook Formulas" desc="Free PDF download" />
                  <MenuItem href="#" icon={<TrendingUp className="text-emerald-400" />} title="TikTok Growth Strategy" desc="Video masterclass" />
                  <MenuItem href="#" icon={<GraduationCap className="text-emerald-400" />} title="Pro Editing Tips" desc="Weekly newsletter" />
                  <div className="mt-2 p-3 bg-gradient-to-r from-emerald-900/30 to-indigo-900/30 rounded-xl border border-white/5">
                    <p className="text-xs text-white font-semibold">Unlock Pro for 30 Days Free</p>
                    <Link href="#" className="mt-2 block w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">Start Free Trial</Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link href="/editor" className="hidden sm:flex text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2 transition-colors">
            Log in
          </Link>
          <Link href="/editor" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2 rounded-full transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95">
            Open Editor
          </Link>
        </div>

      </div>
    </header>
  );
}

function MenuItem({ href, icon, title, desc }: { href: string, icon: React.ReactNode, title: string, desc?: string }) {
  return (
    <Link href={href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="mt-0.5 text-neutral-400 group-hover:text-indigo-400 transition-colors">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-5 h-5" })}
      </div>
      <div>
        <div className="text-sm font-bold text-neutral-200 group-hover:text-white transition-colors">{title}</div>
        {desc && <div className="text-xs text-neutral-500 mt-0.5 leading-snug">{desc}</div>}
      </div>
    </Link>
  );
}
