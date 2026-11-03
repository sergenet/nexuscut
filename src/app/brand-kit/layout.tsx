import type { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Brand Kit: Save Colors, Fonts & Logo | NexusCut',
  description:
    'Store your logo, brand colors, and fonts once, then apply them across every project so each export stays consistently on-brand.',
  alternates: { canonical: '/brand-kit' },
  openGraph: {
    ...socialDefaults,
    title: 'NexusCut Brand Kit',
    description: 'Save your logo, colors, and fonts once and reuse them in every project.',
    url: '/brand-kit',
    type: 'website',
  },
};

export default function BrandKitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
