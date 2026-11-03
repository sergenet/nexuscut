import type { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Affiliate Program: Earn Commission on Referrals | NexusCut',
  description:
    'Refer creators to NexusCut and earn commission on the subscriptions you bring in. Track clicks, signups, and payouts from one affiliate dashboard.',
  alternates: { canonical: '/affiliates' },
  openGraph: {
    ...socialDefaults,
    title: 'NexusCut Affiliate Program',
    description:
      'Earn commission by referring creators to a browser-based short-form video editor.',
    url: '/affiliates',
    type: 'website',
  },
};

export default function AffiliatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
