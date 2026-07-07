import React from "react";
import Link from "next/link";
import { Scissors, MessageCircle, Globe, Share2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          
          {/* Column 1: Products */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Products</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="/products/desktop">NexusCut Desktop</FooterLink>
              <FooterLink href="/products/online">NexusCut Online</FooterLink>
              <FooterLink href="/products/pad">NexusCut Pad</FooterLink>
              <FooterLink href="/products/mobile">NexusCut Mobile</FooterLink>
            </ul>
          </div>

          {/* Column 2: AI Features */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">AI Features</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="#">AI Image Generator</FooterLink>
              <FooterLink href="#">AI Video Generator</FooterLink>
              <FooterLink href="#">AI Dialogue Scene</FooterLink>
              <FooterLink href="#">AI Design Pro</FooterLink>
              <FooterLink href="#">AI Voice Generator</FooterLink>
              <FooterLink href="#">Auto Caption Generator</FooterLink>
              <FooterLink href="#">AI Art Studio</FooterLink>
              <FooterLink href="#">AI Logo Creator</FooterLink>
              <FooterLink href="#">NexusDream 2.0</FooterLink>
              <FooterLink href="#">NexusPro Audio Studio</FooterLink>
              <FooterLink href="#">Gemini Omni Engine</FooterLink>
            </ul>
          </div>

          {/* Column 3: Image & Video */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Image & Video</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="#">Remove Background</FooterLink>
              <FooterLink href="#">Transparent Background</FooterLink>
              <FooterLink href="#">Image Upscaler</FooterLink>
              <FooterLink href="#">Meme Maker</FooterLink>
              <FooterLink href="#">Convert Video To MP4</FooterLink>
              <FooterLink href="#">Transcribe Video To Text</FooterLink>
              <FooterLink href="#">Compress Video</FooterLink>
              <FooterLink href="#">AI Text Remover</FooterLink>
              <FooterLink href="#">AI People Remover</FooterLink>
              <FooterLink href="#">AI Inpainting</FooterLink>
              <FooterLink href="#">Face Cutout</FooterLink>
            </ul>
          </div>

          {/* Column 4: Discover */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Discover</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="#">NexusCut Affiliates</FooterLink>
              <FooterLink href="#">Pioneer Program</FooterLink>
              <FooterLink href="#">Creative Partner Program</FooterLink>
              <FooterLink href="#">NexusCut Creative Campus</FooterLink>
              <FooterLink href="#" className="text-emerald-400 font-semibold">Growth Hub (Free Tips)</FooterLink>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
            <ul className="flex flex-col gap-3">
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Help Center</FooterLink>
              <FooterLink href="#">Newsroom</FooterLink>
              <FooterLink href="#">Community</FooterLink>
              <FooterLink href="#">Trust Center</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Privacy Policy</FooterLink>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-black tracking-tight text-white">
              Nexus<span className="text-indigo-500">Cut</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-neutral-400">
            <p className="text-sm">© {new Date().getFullYear()} NexusCut. All rights reserved.</p>
          </div>

          <div className="flex items-center gap-4">
            <SocialLink href="#" icon={<MessageCircle />} />
            <SocialLink href="#" icon={<Globe />} />
            <SocialLink href="#" icon={<Share2 />} />
            <SocialLink href="#" icon={<Mail />} />
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
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4" })}
    </Link>
  );
}
