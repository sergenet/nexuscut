import React from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CheckCircle2, MinusCircle, ArrowRight } from 'lucide-react';

/**
 * The competitor is named in the title because that is what people search for,
 * but the page only makes claims about NexusCut. Nothing here describes
 * NexusClips' pricing, features or quality, because those cannot be verified
 * from this codebase and a stale claim is worse than no comparison.
 */

const capabilities = [
  { feature: 'Auto-captions with editable word timing', nexusCut: true },
  { feature: 'Still-image background removal', nexusCut: true },
  { feature: 'Vertical 9:16 canvas', nexusCut: true },
  { feature: 'Server-side MP4 rendering (no upload to a desktop app)', nexusCut: true },
  { feature: 'Downloadable creator templates', nexusCut: true },
  { feature: 'Released native mobile app', nexusCut: false },
  { feature: 'Team seats or a shared workspace', nexusCut: false },
  { feature: 'Text-to-video generation', nexusCut: false },
];

const limitations = [
  'No native iOS or Android app. The mobile product is a waitlist, and the editor is a browser tool.',
  'One seat per account. Agency adds five client Brand Kits, not shared logins.',
  'Uploads are capped at 1 GB per file, and exports run in a queue rather than instantly.',
  'Text-to-video is not offered. Image motion and AI-assisted writing are, generation is not.',
];

const faqs = [
  {
    q: 'Is NexusCut better than NexusClips?',
    a: 'It depends on what you are editing. NexusCut is built for vertical short-form video with word-by-word captions, a real multitrack timeline, and a rendered MP4 you download. If you need a native phone app or a team workspace, NexusCut is not the right tool yet, and this page says so rather than inventing a win.',
  },
  {
    q: 'Can I try NexusCut without paying?',
    a: 'Yes. The free tier includes the editor with a monthly export allowance, so you can caption and export a real clip before deciding. Paid plans raise the allowance, add the Brand Kit, and move exports up the queue.',
  },
  {
    q: 'Do my videos get uploaded to a server?',
    a: 'Only when you export, or when you run a feature that needs processing, such as transcription, background removal or image motion. The timeline itself runs in your browser. Temporary working files are removed after processing.',
  },
  {
    q: 'What happens to my captions if I change a word?',
    a: 'Caption timing is stored per word, so editing the text keeps the existing timings for the words that stay and lets you re-time only the ones you changed. That is the main practical difference from burning in a caption file.',
  },
  {
    q: 'Does NexusCut work for horizontal video?',
    a: 'The editor handles 16:9 footage, but the product and the templates are aimed at vertical output for TikTok, Reels and Shorts. If your work is long-form horizontal, a desktop NLE will cost you less time.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-grow">
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Comparison</p>
            <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight leading-tight">
              NexusCut vs NexusClips
            </h1>
            <p className="mt-6 text-lg text-neutral-400 leading-relaxed">
              A factual checklist of what NexusCut does today, followed by the places where it is
              the wrong choice. We do not publish claims about another product&apos;s features,
              pricing or output quality, because we cannot verify them from the outside.
            </p>
          </div>
        </section>

        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm leading-6 text-neutral-400">
            <h2 className="text-base font-bold text-white">How to read this page</h2>
            <p className="mt-2">
              Every row below was checked against the live NexusCut build. A green tick means the
              feature is shipped and works in the browser today. A dash means it is not available,
              including features that are on the roadmap. If a capability matters to you and it is
              marked unavailable here, assume it is unavailable in both tools until you have tested
              the other one yourself.
            </p>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-6">What NexusCut currently provides</h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-800">
              <div className="grid grid-cols-[1fr_auto] border-b border-neutral-800 bg-neutral-950/60">
                <div className="p-5 font-semibold text-neutral-400">Capability</div>
                <div className="p-5 text-center font-bold text-indigo-400">NexusCut</div>
              </div>
              {capabilities.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-[1fr_auto] border-b border-neutral-800/50 transition-colors last:border-b-0 hover:bg-neutral-800/20"
                >
                  <div className="p-5 font-medium text-neutral-300">{row.feature}</div>
                  <div className="flex w-28 items-center justify-center border-l border-neutral-800">
                    {row.nexusCut ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="Available" />
                    ) : (
                      <MinusCircle className="h-5 w-5 text-neutral-600" aria-label="Not available" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Where NexusCut is the wrong choice</h2>
            <ul className="space-y-3">
              {limitations.map((item) => (
                <li key={item} className="flex gap-3 text-neutral-400 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-neutral-500 leading-relaxed">
              A comparison page that only lists wins is an advertisement. These four limits are the
              ones that send people to a different tool, and each of them is a deliberate scope
              decision rather than a missing feature nobody got around to.
            </p>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Questions worth asking before you pick either tool</h2>
            <ol className="space-y-4 text-neutral-400 leading-relaxed">
              <li>
                <span className="font-bold text-white">Does the caption timing survive editing?</span>{' '}
                Ask for a word-level timeline, not a burned-in subtitle. If retyping one word forces
                a full re-transcribe, you will stop fixing typos.
              </li>
              <li>
                <span className="font-bold text-white">Where does the render happen?</span>{' '}
                A browser render that depends on your laptop is free until it overheats on a
                ten-minute clip.
              </li>
              <li>
                <span className="font-bold text-white">What does the free tier actually export?</span>{' '}
                Check the resolution and the monthly count, not the feature list.
              </li>
              <li>
                <span className="font-bold text-white">Can you leave with your files?</span>{' '}
                An MP4 you download is portable. A project that only exists inside one service is
                not.
              </li>
              <li>
                <span className="font-bold text-white">Do you need a phone app?</span>{' '}
                If most of your editing happens on a phone, pick a tool that already ships one.
              </li>
            </ol>
          </div>
        </section>

        <section className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Frequently asked</h2>
            <dl className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
              {faqs.map(({ q, a }) => (
                <div key={q} className="p-6">
                  <dt className="font-bold text-white">{q}</dt>
                  <dd className="mt-2 text-neutral-400 leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="pb-28 px-6 text-center">
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:bg-indigo-500"
          >
            Open the editor <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Free tier, no card. Export one clip before you decide anything.
          </p>
        </section>
      </main>

      <Footer />

      {/* Served as a plain script tag so the FAQ exists for crawlers that never
          run JavaScript. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
