import React from "react";
import Link from "next/link";
import { MessageCircle, Globe, Share2, Mail } from "lucide-react";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          
          {/* Column 1: Products */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Products</h4>
            <ul className="space-y-3">
              <FooterLink href="/products/desktop">NexusCut Desktop</FooterLink>
              <FooterLink href="/editor">NexusCut Online</FooterLink>
              <FooterLink href="/products/pad">NexusCut Pad</FooterLink>
              <FooterLink href="/products/mobile">NexusCut Mobile</FooterLink>
              <FooterLink href="/video-repurposing-service">Video Repurposing Service</FooterLink>
            </ul>
          </div>

          {/* Column 2: Editor Features */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Editor Features</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="/editor">Video Editor</FooterLink>
              <FooterLink href="/tools/auto-captions">Auto Caption Generator</FooterLink>
              <FooterLink href="/tools/audio-studio">AI Voice Generator (TTS)</FooterLink>
              <FooterLink href="/tools/remove-background">AI Background Removal</FooterLink>
              <FooterLink href="/templates">Caption Styles</FooterLink>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Resources</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="/tutorial">Editor Tutorial</FooterLink>
              <FooterLink href="/templates">Viral Hook Templates</FooterLink>
              <FooterLink href="/templates">Script Templates</FooterLink>
              <FooterLink href="/tools/viral-hook-generator">Viral Hook Generator</FooterLink>
              <FooterLink href="/marketplace">Marketplace</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
            </ul>
          </div>

          {/* Column 4: Free Tools */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Free Tools</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="/tools/tiktok-caption-generator">TikTok Caption Generator</FooterLink>
              <FooterLink href="/tools/youtube-shorts-maker">YouTube Shorts Maker</FooterLink>
              <FooterLink href="/tools/viral-hook-generator">Viral Hook Generator</FooterLink>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/affiliates">Affiliate Program</FooterLink>
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <CookieSettingsButton />
              <FooterLink href="/refund-policy">Refund Policy</FooterLink>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="NexusCut Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/20 border border-neutral-800" />
            <span className="text-xl font-black tracking-tight text-white">
              Nexus<span className="text-indigo-500">Cut</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-neutral-400">
            <p className="text-sm">© {new Date().getFullYear()} NexusCut. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4">
            <SocialLink href="https://twitter.com/nexuscut" icon={<MessageCircle />} />
            <SocialLink href="https://nexuscut.io" icon={<Globe />} />
            <SocialLink href="https://linkedin.com/company/nexuscut" icon={<Share2 />} />
            <SocialLink href="mailto:support@nexuscut.io" icon={<Mail />} />
          </div>
        </div>
        
      </div>
    </footer>
  );
}

function FooterLink({ href, children, className = "" }: { href: string, children: React.ReactNode, className?: string }) {
  return (
    <li>
      <Link href={href} className={`text-sm text-neutral-400 hover:text-indigo-400 transition-colors ${className}`}>
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon }: { href: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-indigo-600 hover:text-white transition-all">
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
    </Link>
  );
}
