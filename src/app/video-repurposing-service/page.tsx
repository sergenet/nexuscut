import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileVideo2,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

const serviceOrderUrl =
  process.env.NEXT_PUBLIC_VIDEO_REPURPOSING_ORDER_URL ||
  'mailto:sales@nexuscut.io?subject=NexusCut%20Video%20Repurposing%20Pilot%20Order';

export const metadata: Metadata = {
  openGraph: socialFor('/video-repurposing-service'),
  title: 'Done-for-You Video Repurposing Service | NexusCut',
  description:
    'Turn up to two finished videos into eight edited vertical clips with captions, one revision round, and first delivery within five business days.',
  alternates: {
    canonical: '/video-repurposing-service',
  },
};

const included = [
  'Eight edited 9:16 short-form video clips',
  'Up to two client-supplied finished videos',
  'Maximum 120 source minutes combined',
  'Readable, timed captions and platform-ready framing',
  'One consolidated creative revision round',
  'First delivery within five business days after all inputs are received',
];

const workflow = [
  {
    title: 'Confirm the fit',
    body: 'Send us your source-video links, audience, preferred examples, and the platforms you plan to use.',
  },
  {
    title: 'Approve the direction',
    body: 'We confirm the source scope, brand assets, style, delivery date, and the person responsible for approval.',
  },
  {
    title: 'We edit the clips',
    body: 'A human editor selects useful moments, reframes them vertically, adds captions, and checks every export.',
  },
  {
    title: 'Review and receive',
    body: 'You receive eight preview files, submit one consolidated revision list, and receive the approved masters.',
  },
];

export default function VideoRepurposingServicePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-violet-500/30">
      <Navigation />

      <main>
        <section className="relative overflow-hidden px-6 pb-24 pt-32 md:pb-32 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-bold text-violet-200">
                <Sparkles className="h-4 w-4" /> Human-edited, done-for-you service
              </div>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
                Turn long videos into short clips—without adding another editing job.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-300 md:text-xl">
                NexusCut Video Repurposing converts your finished videos into a focused batch of vertical clips for Shorts, Reels, and TikTok. Every clip is reviewed by a human editor before delivery.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href={serviceOrderUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-7 py-4 text-base font-black text-white transition hover:bg-violet-400"
                >
                  Order the $600 pilot <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="mailto:sales@nexuscut.io?subject=NexusCut%20Video%20Repurposing%20Question"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/70 px-7 py-4 text-base font-bold text-neutral-100 transition hover:border-neutral-500"
                >
                  <Mail className="h-5 w-5" /> Ask a question
                </a>
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                Secure payment instructions are confirmed after we verify that your source material fits the pilot scope.
              </p>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-neutral-900/80 p-7 shadow-2xl shadow-violet-950/30 backdrop-blur md:p-9">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-300">Paid pilot</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-black">$600</span>
                <span className="pb-1 text-neutral-400">one-time</span>
              </div>
              <p className="mt-4 leading-7 text-neutral-300">
                A defined first project designed to test working fit, communication, editing quality, and turnaround before considering ongoing work.
              </p>
              <ul className="mt-7 space-y-4">
                {included.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-neutral-200">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.025] px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-violet-300">What you receive</p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">A usable clip package, not an automated clip dump.</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <Feature icon={<FileVideo2 />} title="Eight vertical masters">
                Edited 9:16 files prepared for the major short-form platforms. You retain control over where and when they are published.
              </Feature>
              <Feature icon={<MessageSquareText />} title="Human-reviewed captions">
                Captions are timed and checked for readability. Brand colors and supplied assets are applied when practical.
              </Feature>
              <Feature icon={<ShieldCheck />} title="Clear operating boundaries">
                We edit client-authorized materials. We do not copy third-party clips, buy engagement, or promise views, leads, or revenue.
              </Feature>
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">How it works</p>
              <h2 className="mt-3 text-4xl font-black md:text-5xl">Four controlled steps from source to delivery.</h2>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {workflow.map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7">
                  <div className="flex items-start gap-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 font-black text-violet-300">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-xl font-black">{step.title}</h3>
                      <p className="mt-2 leading-7 text-neutral-400">{step.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
              <Clock3 className="h-9 w-9 text-violet-300" />
              <h2 className="mt-5 text-3xl font-black">What starts the delivery clock?</h2>
              <p className="mt-4 leading-7 text-neutral-300">
                The five-business-day target begins after payment and after we receive usable source files or download links, brand assets, examples, style approval, and the name of the final approver.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-8">
              <CheckCircle2 className="h-9 w-9 text-emerald-300" />
              <h2 className="mt-5 text-3xl font-black">Rights and approval</h2>
              <p className="mt-4 leading-7 text-neutral-300">
                You must own or have permission to use every supplied recording, logo, image, music track, and other asset. You remain responsible for final content approval and publishing.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-neutral-900/50 px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-4xl font-black">Important pilot terms</h2>
            <div className="mt-10 space-y-4 text-neutral-300">
              <Term title="Scope">Eight clips from no more than two finished source videos and 120 source minutes combined.</Term>
              <Term title="Revision">One consolidated creative revision round is included. New concepts, replacement source material, or additional rounds require a separate quote.</Term>
              <Term title="Delivery">First delivery is targeted within five business days after all required inputs are received. Delays in source delivery or approvals move the schedule.</Term>
              <Term title="Results">Editing and delivery are provided; distribution, audience growth, views, leads, sales, and platform acceptance are not guaranteed.</Term>
              <Term title="Cancellations and refunds">If you cancel before editing begins, we will refund the pilot payment. Once editing begins, the pilot payment is non-refundable except where required by law. If we cannot accept the project or deliver the agreed scope, we will refund the affected payment.</Term>
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-5xl rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-emerald-500/10 p-9 text-center md:p-14">
            <h2 className="text-4xl font-black md:text-5xl">Ready to test one focused batch?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
              Order the $600 pilot or email us first with your source links. We will confirm fit and scope before production begins.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={serviceOrderUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-black text-neutral-950 transition hover:bg-neutral-200">
                Order the pilot <ArrowRight className="h-5 w-5" />
              </a>
              <a href="mailto:sales@nexuscut.io" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-7 py-4 font-bold text-white transition hover:bg-white/10">
                sales@nexuscut.io
              </a>
            </div>
            <p className="mt-7 text-sm text-neutral-400">
              NexusCut Video Repurposing · 20249 Livorno Way, Los Angeles, CA 91326
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-neutral-950 p-7">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-neutral-400">{children}</p>
    </article>
  );
}

function Term({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-2 leading-7">{children}</p>
    </div>
  );
}
