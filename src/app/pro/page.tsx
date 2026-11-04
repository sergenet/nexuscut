import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Briefcase, Check, Scissors, Sparkles, Type } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProConversionTracking from '@/components/ProConversionTracking';
import { getVerifiedUser } from '@/lib/auth';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/pro'),
  title: 'NexusCut Pro — Turn Spoken Video Into a Publish-Ready Short',
  description: 'Score hooks, tighten pacing, add Retention Focus captions, and edit through the transcript. Try NexusCut Pro free for 7 days.',
  alternates: { canonical: '/pro' },
};

const features = [
  { icon: Sparkles, title: 'Growth Mode', text: 'Choose from scored hook options, create a tightened 9:16 edit, and remove conservative dead air.' },
  { icon: Type, title: 'Retention Focus captions', text: 'Keep phrases readable while the active spoken word changes to your highlight color.' },
  { icon: Scissors, title: 'Nexus ScriptCut', text: 'Edit video by selecting transcript words, with optional filler-word and repetition suggestions.' },
  { icon: Briefcase, title: 'Brand Kit', text: 'Reuse caption colors and typography. Add your logo only when you choose to enable it for export.' },
];

export default async function ProLandingPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const user = await getVerifiedUser();
  const cancelled = (await searchParams).checkout === 'cancelled';
  const checkoutPath = '/api/stripe/checkout?plan=pro';
  const cta = user ? checkoutPath : `/account?returnTo=${encodeURIComponent(checkoutPath)}`;
  return <div className="min-h-screen bg-[#07070b] text-white">
    <ProConversionTracking />
    <Navigation />
    <main>
      <section className="relative overflow-hidden px-5 pb-20 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_.95fr]">
          <div>
            {cancelled && <p className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">Checkout was cancelled. Nothing was charged.</p>}
            <p className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-black text-emerald-200">NexusCut Pro · 7 days free</p>
            <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-tight sm:text-6xl">Turn spoken video into a <span className="text-indigo-400">publish-ready Short.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">Find a stronger opening, tighten pauses, add synchronized active-word captions, and remove unwanted words through the transcript—without giving up timeline control.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={cta} data-analytics-event="pro_trial_cta" data-analytics-location="pro_hero" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-4 font-black transition hover:bg-indigo-500">Start 7-Day Pro Trial <ArrowRight className="h-5 w-5" /></Link>
              <Link href="/tutorial" className="px-5 py-4 text-center font-bold text-neutral-300 hover:text-white">See how the tools work</Link>
            </div>
            <p className="mt-4 text-sm text-neutral-400">Payment method required. $29/month after 7 days. Cancel before the trial ends to avoid a charge.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] p-2 shadow-2xl shadow-indigo-950/50"><Image src="/assets/desktop_mockup.png" alt="NexusCut video editor timeline and preview" width={1200} height={760} priority className="h-auto w-full rounded-2xl" /></div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-5 py-20">
        <div className="mx-auto max-w-6xl"><p className="text-sm font-black uppercase tracking-[.2em] text-indigo-300">One focused workflow</p><h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">The parts of short-form editing that consume the most time—working together.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">{features.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-white/10 bg-neutral-900 p-6"><Icon className="h-7 w-7 text-indigo-300" /><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-neutral-400">{text}</p></div>)}</div>
        </div>
      </section>

      <section className="px-5 py-20"><div className="mx-auto grid max-w-5xl gap-10 rounded-3xl border border-indigo-400/25 bg-indigo-500/10 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12"><div><p className="text-sm font-black uppercase tracking-[.18em] text-indigo-300">Full Pro access</p><h2 className="mt-3 text-3xl font-black">Try the complete workflow for seven days.</h2><ul className="mt-6 space-y-3 text-neutral-200">{['Growth Mode and Retention Focus captions', 'Nexus ScriptCut suggestions and transcript edits', 'Priority export queue and unlimited 1080p exports', 'Saved Brand Kit colors, font, and optional logo'].map(item => <li key={item} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />{item}</li>)}</ul></div><div className="text-center md:min-w-64"><p className="text-5xl font-black">$0</p><p className="mt-1 text-sm text-neutral-400">for the first 7 days</p><Link href={cta} data-analytics-event="pro_trial_cta" data-analytics-location="pro_bottom" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-white px-6 py-4 font-black text-black hover:bg-neutral-200">Start Pro Trial</Link><p className="mt-3 text-xs leading-5 text-neutral-400">Then $29/month until cancelled.</p></div></div></section>
    </main>
    <Footer />
  </div>;
}
