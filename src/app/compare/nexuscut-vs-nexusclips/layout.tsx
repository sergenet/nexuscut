
import { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  alternates: { canonical: '/compare/nexuscut-vs-nexusclips' },
  title: 'NexusCut vs NexusClips - Which is Better? | NexusCut',
  description: 'Review the currently available NexusCut capabilities for short-form video editing.',
  openGraph: {
    ...socialDefaults,
    title: 'NexusCut vs NexusClips - Which is Better? | NexusCut',
    description: 'Review the currently available NexusCut capabilities for short-form video editing.',
    url: '/compare/nexuscut-vs-nexusclips',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
