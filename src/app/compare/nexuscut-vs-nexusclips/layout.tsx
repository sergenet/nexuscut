
import { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  alternates: { canonical: '/compare/nexuscut-vs-nexusclips' },
  title: 'NexusCut vs NexusClips - Which is Better? | NexusCut',
  description:
    'A checked list of what NexusCut does today, the four cases where it is the wrong tool, and what to ask before choosing any clip editor.',
  openGraph: {
    ...socialDefaults,
    title: 'NexusCut vs NexusClips - Which is Better? | NexusCut',
    description:
      'What NexusCut does today, where it is the wrong choice, and how to compare clip editors.',
    url: '/compare/nexuscut-vs-nexusclips',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
