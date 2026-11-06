import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/products/desktop'),
  title: 'NexusCut Desktop Editor for Windows & Mac (Beta) | NexusCut',
  description:
    'The NexusCut desktop editor is in beta: multitrack timeline and word-by-word captions coming to Windows and Mac. Join the beta list.',
  alternates: { canonical: '/products/desktop' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
