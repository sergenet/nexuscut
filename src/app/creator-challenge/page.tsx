import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Captions, CheckCircle2, Clock3, FileVideo, Scissors, Sparkles, Users } from 'lucide-react';
import FoundingTesterForm from '@/components/FoundingTesterForm';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  title: 'The 7-Day Shorts Challenge | NexusCut',
  description: 'Turn one recording into three short videos you can publish. Edit, caption, and export in your browser with NexusCut.',
  alternates: { canonical: '/creator-challenge' },
  openGraph: {
    ...socialDefaults,
    title: 'Publish 3 Shorts From One Recording',
    description: 'A free 7-day creator challenge from NexusCut.',
    url: '/creator-challenge',
  },
};

const editorUrl = '/editor?utm_source=creator_challenge&utm_medium=organic&utm_campaign=three_shorts';

export default function CreatorChallengePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08080c] text-white">
      <nav className="border-b border-white/10 bg-[#08080c]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="text-xl font-black tracking-tight">Nexus<span className="text-indigo-400">Cut</span></Link>
          <Link href={editorUrl} data-analytics-event="creator_challenge_editor_cta" data-analytics-location="navigation" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold transition hover:bg-indigo-500">Open editor</Link>
        </div>
      </nav>

      <section className="relative px-5 pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-bold text-emerald-200"><Sparkles className="h-4 w-4" /> Free 7-day creator challenge</div>
            <h1 className="text-4xl font-black leading-[1.04] tracking-tight sm:text-6xl">Publish 3 Shorts from <span className="text-indigo-400">one recording.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">Bring one talking-head, podcast, tutorial, or screen recording. In seven days, use NexusCut to choose the best moments, add captions, and export three videos worth posting.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={editorUrl} data-analytics-event="creator_challenge_editor_cta" data-analytics-location="hero" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white transition hover:bg-indigo-500">Start the challenge free <ArrowRight className="h-5 w-5" /></Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-4 font-bold text-neutral-200 transition hover:bg-white/5">See the 3 steps</Link>
            </div>
            <p className="mt-4 text-sm text-neutral-500">No credit card. Your free account includes 10 exports.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] p-2 shadow-2xl shadow-indigo-950/40">
            <Image src="/assets/desktop_mockup.png" alt="NexusCut timeline editor with a video project" width={1200} height={760} priority className="h-auto w-full rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="border-y border-amber-300/20 bg-amber-300/[0.06] px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-2xl border border-amber-300/25 bg-[#11110d] p-6 lg:grid-cols-[1fr_.9fr] lg:items-center md:p-8">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-amber-200"><Users className="h-4 w-4" /> Founding tester program — 10 places</p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">Test NexusCut with a real video. Get 7 days of Pro access.</h2>
            <p className="mt-3 max-w-3xl leading-7 text-neutral-300">Bring one 30–90 second clip, complete a real edit, and tell us honestly what worked and what did not. No polished review or public post is required—useful feedback is what earns the free access.</p>
          </div>
          <FoundingTesterForm />
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/10 bg-white/[0.025] px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-300">A simple first win</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">A workflow you can finish—not another course.</h2></div>
          <div className="grid gap-5 md:grid-cols-3">
            <Step number="01" icon={<FileVideo />} title="Upload one recording" text="Start with a 30-second to 10-minute clip you already have—or record directly in NexusCut." />
            <Step number="02" icon={<Scissors />} title="Choose three moments" text="Use the timeline to split and trim. Keep the clearest, most useful moments for three separate posts." />
            <Step number="03" icon={<Captions />} title="Caption and export" text="Generate captions, review the words, choose your format, then export each video ready to publish." />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-300">Built for solo creators</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Keep timeline control. Skip the complicated setup.</h2>
          <p className="mt-5 text-lg leading-8 text-neutral-300">NexusCut is for creators who want a practical browser editor: record or upload, edit the moment, add captions or voiceover, and export without installing desktop software.</p>
        </div>
        <ul className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-neutral-200">
          {['Record with your camera, microphone, or screen', 'Split, trim, and arrange clips on a real timeline', 'Generate and review captions before export', 'Export vertical, horizontal, or square video'].map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />{item}</li>)}
        </ul>
      </section>

      <section className="px-5 pb-24 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 px-6 py-14">
          <Clock3 className="mx-auto h-8 w-8 text-indigo-300" />
          <h2 className="mt-4 text-3xl font-black sm:text-5xl">Your first short can be finished today.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-300">Open the editor, add one recording, and complete step one. You do not need to master every feature before you publish.</p>
          <Link href={editorUrl} data-analytics-event="creator_challenge_editor_cta" data-analytics-location="final_cta" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 font-bold text-black transition hover:bg-neutral-200">Start your free challenge <ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>
    </main>
  );
}

function Step({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-2xl border border-white/10 bg-[#0d0d13] p-6"><p className="text-sm font-black text-indigo-300">{number}</p><div className="mt-5 text-indigo-300">{icon}</div><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-neutral-400">{text}</p></article>;
}
