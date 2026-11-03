import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';
export const metadata: Metadata = {
  openGraph: socialFor('/tools/viral-hook-generator'),
  alternates: { canonical: '/tools/viral-hook-generator' },
  title: 'Video Hook Generator for Shorts & Reels - NexusCut',
  description: 'Generate opening-line drafts for short videos, then review and adapt them to your audience.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Draft a clearer opening</h2>
        <p className="mb-4 leading-relaxed">An early hook can help explain why a viewer should keep watching, but no opening line guarantees retention, reach, or distribution.</p>
        <p className="mb-4 leading-relaxed">The tool uses a language model to draft five opening-line variations from the topic you provide. The suggestions are not trained on a private NexusCut dataset and are not psychologically or statistically proven.</p>
        <p className="mb-4 leading-relaxed">Use the results as writing prompts, check factual claims, adapt the voice to your audience, and test performance in your own content.</p>
      </section>
    </>
  );
}
