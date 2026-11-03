import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/video-effects'),
  alternates: { canonical: '/tools/video-effects' },
  title: 'Free Video Effects & Filters - NexusCut',
  description: 'Apply five supported clip looks in the NexusCut editor and include them in the exported video.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Supported effects</h2>
        <p className="mb-4 leading-relaxed">The current editor includes Original, Black &amp; White, Warm, Cool, and High Contrast treatments. Select a timeline clip, choose a treatment in Effects, preview it, and include it in the exported MP4.</p>
        <p className="mb-4 leading-relaxed">NexusCut does not currently include LUTs, VHS glitches, film grain, light leaks, lens flares, or a broad cinematic-effects library.</p>
      </section>
      <Footer />
    </>
  );
}
