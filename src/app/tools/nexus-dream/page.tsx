import Link from 'next/link';
import { Image as ImageIcon, LayoutTemplate, Sparkles } from 'lucide-react';

export default function NexusDreamPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-sm font-bold text-fuchsia-200"><Sparkles className="h-4 w-4" /> Creative image workspace</div>
        <h1 className="text-5xl font-black md:text-7xl">Create still images for your videos</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-neutral-400">NexusCut currently offers prompt-based still-image generation and downloadable design templates. Text-to-video, generative fill, and an infinite canvas are not available yet.</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/tools/ai-image-generator" className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-600 px-7 py-4 font-bold hover:bg-fuchsia-500"><ImageIcon className="h-5 w-5" /> Open image generator</Link>
          <Link href="/templates" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-7 py-4 font-bold hover:bg-neutral-800"><LayoutTemplate className="h-5 w-5" /> Browse templates</Link>
        </div>
      </div>
    </main>
  );
}
