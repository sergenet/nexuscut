import type { Metadata } from 'next';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  openGraph: socialFor('/editor'),
  title: 'Online Video Editor with Word-by-Word Captions | NexusCut',
  description:
    'Edit short-form video in your browser: a real multitrack timeline, auto-captions with active-word highlight, transitions and effects — then export a clean MP4.',
  alternates: { canonical: '/editor' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
