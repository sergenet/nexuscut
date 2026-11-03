import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';
export const metadata: Metadata = {
  openGraph: socialFor('/tools/youtube-shorts-maker'),
  alternates: { canonical: '/tools/youtube-shorts-maker' },
  title: 'YouTube Shorts Maker & Editor - NexusCut',
  description: 'Set up a 9:16 canvas, trim footage, add captions, and export a YouTube Short in NexusCut.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">A practical YouTube Shorts workflow</h2>
        <p className="mb-4 leading-relaxed">The editor supports a 9:16 canvas, manual trimming and splitting, auto-captions, transcript-based clip suggestions, Pexels B-roll suggestions, silence removal, and MP4 export.</p>
        <p className="mb-4 leading-relaxed">NexusCut does not currently provide automatic speaker tracking, automatic reframing, beat sync, or a one-click conversion of a long video into multiple finished Shorts. Review every AI suggestion and adjust the cut yourself.</p>
        <p className="mb-4 leading-relaxed">Export time and quality depend on the source file, selected settings, server load, and browser. NexusCut cannot influence YouTube distribution or guarantee audience growth.</p>
      </section>
    </>
  );
}
