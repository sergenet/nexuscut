import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/nexus-animate'),
  alternates: { canonical: '/tools/nexus-animate' },
  title: 'Image to Motion MP4 - NexusCut',
  description: 'Turn a still image into a vertical MP4 with a smooth cinematic push-in rendered by FFmpeg.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">What this renderer does</h2>
        <p className="mb-4 leading-relaxed">The tool converts a JPG, PNG, or WebP image into a 1080 × 1920 H.264 MP4 with a centered push-in movement. Choose a duration from two to ten seconds and download the rendered file.</p>
        <p className="mb-4 leading-relaxed">It does not generate new objects, character motion, parallax depth, or particle effects. The result is a dependable motion treatment for still photos, slides, and B-roll backgrounds.</p>
      </section>
      <Footer />
    </>
  );
}
