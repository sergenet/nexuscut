import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/products/pad'),
  title: 'NexusCut Pad — Tablet Video Editor | NexusCut',
  description:
    'Edit and caption short-form video on a tablet with touch. Join the waitlist for the NexusCut tablet edition.',
  alternates: { canonical: '/products/pad' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
