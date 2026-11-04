import Link from 'next/link';
import { SlidersHorizontal, Wand2 } from 'lucide-react';

export default function VideoEffectsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <Wand2 className="mx-auto h-12 w-12 text-cyan-400" />
        <h1 className="mt-6 text-5xl font-black md:text-6xl">Video looks that render in your export</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">Use the NexusCut editor to apply Original, Black &amp; White, Warm, Cool, or High Contrast to a selected clip. The preview and FFmpeg export use the same selected effect.</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-neutral-500">LUTs, film grain, light leaks, lens flares, VHS glitches, and GPU-accelerated real-time effects are not currently offered.</p>
        <Link href="/editor" className="mt-10 inline-flex items-center gap-2 rounded-full bg-cyan-600 px-8 py-4 font-bold hover:bg-cyan-500"><SlidersHorizontal className="h-5 w-5" /> Open effects in the editor</Link>
      </div>
    </main>
  );
}
