import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/tools/ai-image-generator'),
  alternates: { canonical: '/tools/ai-image-generator' },
  title: 'Prompt-based Image Generator - NexusCut',
  description: 'Request an 800 × 800 still image from the connected Pollinations service.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Unlock Your Creativity with the AI Image Generator</h2>
        <p className="mb-4 leading-relaxed">This tool sends your prompt to Pollinations and displays the returned 800 × 800 still image. Generation time, availability, and visual quality depend on that third-party service.</p>
        <p className="mb-4 leading-relaxed">NexusCut has not fine-tuned the underlying model. The current page does not upscale to 4K or insert the image into an open editor project automatically.</p>
      </section>
      <Footer />
    </>
  );
}
