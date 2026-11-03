
import { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  alternates: { canonical: '/youtube-shorts-editor' },
  title: 'Free YouTube Shorts Editor with AI | NexusCut',
  description: 'Create 9:16 YouTube Shorts with an editable timeline, optional captions, silence removal, and MP4 export.',
  openGraph: {
    ...socialDefaults,
    title: 'Free YouTube Shorts Editor with AI | NexusCut',
    description: 'Create 9:16 YouTube Shorts with an editable timeline, optional captions, silence removal, and MP4 export.',
    url: '/youtube-shorts-editor',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
