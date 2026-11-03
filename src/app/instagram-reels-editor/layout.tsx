
import { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  alternates: { canonical: '/instagram-reels-editor' },
  title: 'Instagram Reels Editor | NexusCut',
  description: 'Create 9:16 Reels with an editable timeline, optional captions, silence removal, and MP4 export.',
  openGraph: {
    ...socialDefaults,
    title: 'Instagram Reels Editor | NexusCut',
    description: 'Create 9:16 Reels with an editable timeline, optional captions, silence removal, and MP4 export.',
    url: '/instagram-reels-editor',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
