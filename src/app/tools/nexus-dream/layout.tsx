import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/nexus-dream'),
  alternates: { canonical: '/tools/nexus-dream' },
  title: 'Creative Image Tools - NexusCut',
  description: 'Generate still images from prompts or start with downloadable design templates.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Current creative tools</h2>
        <p className="mb-4 leading-relaxed">The image generator creates still-image assets from a text prompt through a third-party generation service. The templates library provides downloadable starting points.</p>
        <p className="mb-4 leading-relaxed">NexusCut does not currently offer text-to-video generation, generative fill, or an infinite design canvas. Those capabilities will only be described as available after they are implemented and tested.</p>
      </section>
      <Footer />
    </>
  );
}
