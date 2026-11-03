import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';
export const metadata: Metadata = {
  openGraph: socialFor('/tools/tiktok-caption-generator'),
  alternates: { canonical: '/tools/tiktok-caption-generator' },
  title: 'TikTok Caption & Hashtag Generator - NexusCut',
  description: 'Draft TikTok captions and hashtag ideas with AI, then review and adapt them for your audience.',
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section className="max-w-4xl mx-auto px-6 py-24 text-gray-300">
        <h2 className="text-3xl font-bold text-white mb-6">Draft TikTok captions to refine</h2>
        <p className="mb-4 leading-relaxed">Provide a topic and the tool generates caption drafts and hashtag ideas. It does not inspect your video or guarantee placement on the For You Page, reach, comments, or any other performance result.</p>
        <p className="mb-4 leading-relaxed">A language model turns your topic into several caption drafts with hashtag ideas. NexusCut does not have access to TikTok's private algorithm, live hashtag volumes, or a proprietary training set of viral posts.</p>
        <p className="mb-4 leading-relaxed">Treat the output as a starting point. Verify facts, remove irrelevant hashtags, and adapt the wording to your account and audience.</p>
      </section>
    </>
  );
}
