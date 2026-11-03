import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/animated-subtitles'),
  alternates: { canonical: '/tools/animated-subtitles' },
  title: 'Animated Subtitles Generator - NexusCut',
  description: 'Generate, review, style, and export word-timed captions in the NexusCut editor.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Editable word-timed captions</h2>
        <p className="mb-4 leading-relaxed">The editor transcribes spoken audio, places words on the timeline, and lets you review text and timing before export. You can adjust supported font, color, size, position, and animation settings.</p>
        <p className="mb-4 leading-relaxed">Transcription quality and viewer response vary by recording and audience. NexusCut does not promise a fixed accuracy or retention increase.</p>
      </section>
      <Footer />
    </>
  );
}
