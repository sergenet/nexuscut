
import { Metadata } from 'next';
import { socialDefaults } from '@/lib/social';
import { socialFor } from '@/lib/social';

export const metadata: Metadata = {
  alternates: { canonical: '/tiktok-video-editor' },
  title: 'Free AI TikTok Video Editor | NexusCut',
  description: 'Create 9:16 TikTok edits with an editable timeline, optional auto-captions, silence removal, and MP4 export.',
  openGraph: {
    ...socialDefaults,
    title: 'Free AI TikTok Video Editor | NexusCut',
    description: 'Create 9:16 TikTok edits with an editable timeline, optional auto-captions, silence removal, and MP4 export.',
    url: '/tiktok-video-editor',
    type: 'website',
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
