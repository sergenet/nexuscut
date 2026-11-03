import type { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Agency Video Editing & Client Brand Kits | NexusCut',
  description:
    'Run client video work in NexusCut: a saved brand kit per client, a multitrack timeline, and MP4 export your agency can deliver on schedule.',
  alternates: { canonical: '/agency' },
  openGraph: {
    ...socialDefaults,
    title: 'Agency Video Editing & Client Brand Kits',
    description:
      'Manage multiple client brands in one editor, with reusable brand kits and export-ready short-form video.',
    url: '/agency',
    type: 'website',
  },
};

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
