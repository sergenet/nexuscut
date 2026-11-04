import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Captions, Clock3, Crop, Download, Scissors } from 'lucide-react';

const steps = [
  { icon: Crop, title: 'Start in the right format', text: 'Open the editor with a vertical 9:16 canvas already selected for YouTube Shorts.' },
  { icon: Scissors, title: 'Cut to the strongest moment', text: 'Trim the clip, split at the playhead, and keep the part that earns attention quickly.' },
  { icon: Captions, title: 'Add readable text', text: 'Use Headline, Subtitle, Body text, or Auto Captions to make the short easy to follow without sound.' },
  { icon: Download, title: 'Export and publish', text: 'Choose Fast 540p for a quick draft, or High quality when you are ready to publish.' },
];

export default function YouTubeShortsMakerPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navigation />
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <section className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-300">YouTube Shorts workflow</span>
          <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">Make a YouTube Short <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">without starting from scratch</span></h1>
          <p className="mt-6 text-xl text-gray-400">NexusCut sets up the right canvas and gives you the editing tools to trim, caption, and export a vertical Short from your browser.</p>
          <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/editor?format=shorts" className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-7 py-4 text-lg font-bold text-white transition-colors hover:bg-red-500 shadow-lg shadow-red-600/20">Start a YouTube Short <ArrowRight className="w-5 h-5" /></Link>
            <Link href="/tutorial" className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-7 py-4 text-lg font-bold text-neutral-200 transition-colors hover:bg-white/5">Read the editor guide</Link>
          </div>
        </section>

        <section className="mt-20 grid gap-5 md:grid-cols-2">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400"><Icon className="h-5 w-5" /></div>
              <div><span className="text-xs font-bold uppercase tracking-wide text-red-300">Step {index + 1}</span><h2 className="mt-1 text-xl font-bold">{title}</h2><p className="mt-2 leading-6 text-gray-400">{text}</p></div>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 md:p-8 flex flex-col md:flex-row gap-5 items-start">
          <Clock3 className="h-7 w-7 shrink-0 text-amber-300" />
          <div><h2 className="text-xl font-bold text-amber-100">A quick note on longer videos</h2><p className="mt-2 leading-6 text-amber-50/75">For the fastest results, first cut your longer recording down to the moment you want to publish. Fast Export is the best choice for reviews and drafts; use High quality for the final version.</p></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
