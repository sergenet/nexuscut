import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/subtitle-style-generator'),
  alternates: { canonical: '/tools/subtitle-style-generator' },
  title: 'Subtitle Style Generator - NexusCut',
  description: 'Preview supported NexusCut caption styling choices and download a JSON style recipe.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Preview a NexusCut caption recipe</h2>
        <p className="mb-4 leading-relaxed">Choose from the fonts, colors, and two animation labels shown in the tool. The downloadable JSON records those choices for reference when recreating the style in NexusCut.</p>
        <p className="mb-4 leading-relaxed">This tool does not export Premiere Pro or CapCut preset files, install styles automatically, or claim a guaranteed effect on engagement.</p>
      </section>
      <Footer />
    </>
  );
}
