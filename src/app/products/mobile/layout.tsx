import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/products/mobile'),
  title: 'NexusCut Mobile — iOS & Android Video Editor | NexusCut',
  description:
    'NexusCut for iOS and Android is in development. Join the waitlist to create and caption short-form video from your phone.',
  alternates: { canonical: '/products/mobile' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
