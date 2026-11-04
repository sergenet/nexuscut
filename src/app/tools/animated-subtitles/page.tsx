import Link from 'next/link';
import { Captions, Scissors } from 'lucide-react';

export default function AnimatedSubtitlesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <Captions className="mx-auto h-12 w-12 text-fuchsia-400" />
        <h1 className="mt-6 text-5xl font-black md:text-6xl">Animated captions you can edit</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400">The working caption workflow lives inside the NexusCut editor. Import a video, open AI Magic, generate captions with Whisper, then review the words, timing, colors, font, size, and animation before export.</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-neutral-500">Transcription quality depends on the recording, language, background noise, and speaker clarity. NexusCut does not guarantee a fixed accuracy or retention increase.</p>
        <Link href="/editor" className="mt-10 inline-flex items-center gap-2 rounded-full bg-fuchsia-600 px-8 py-4 font-bold hover:bg-fuchsia-500"><Scissors className="h-5 w-5" /> Open the caption editor</Link>
      </div>
    </main>
  );
}
