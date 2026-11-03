import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/remove-background'),
  alternates: { canonical: '/tools/remove-background' },
  title: 'Remove an Image Background - NexusCut',
  description: 'Upload an image and download the segmentation result as a transparent PNG.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Transparent PNG output</h2>
        <p className="mb-4 leading-relaxed">The tool accepts a still image, runs server-side subject segmentation, and returns a PNG with transparency. It does not process video.</p>
        <p className="mb-4 leading-relaxed">Fine hair, motion blur, low contrast, and complex backgrounds can reduce edge quality. Review the output before using it in published work.</p>
      </section>
      <Footer />
    </>
  );
}
