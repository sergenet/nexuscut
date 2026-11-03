import type { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Free Short-Form Video Templates & Presets | NexusCut',
  description:
    'Start from a free template instead of a blank timeline: hook openers, caption styles, and transitions built for TikTok, Shorts, and Reels.',
  alternates: { canonical: '/templates' },
  openGraph: {
    ...socialDefaults,
    title: 'Free Short-Form Video Templates & Presets',
    description:
      'Hook openers, caption styles, and transitions you can drop straight into a project.',
    url: '/templates',
    type: 'website',
  },
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
