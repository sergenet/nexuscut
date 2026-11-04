"use client";

import { useEffect, useState } from 'react';
import { Download, Film, Loader2, Upload, Wand2 } from 'lucide-react';

export default function NexusAnimatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [duration, setDuration] = useState(5);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result);
  }, [preview, result]);

  const selectFile = (selected: File) => {
    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setStatus('idle');
    setError('');
  };

  const render = async () => {
    if (!file) return;
    setStatus('processing');
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('duration', String(duration));
    try {
      const response = await fetch('/api/animate-image', { method: 'POST', body: formData });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Rendering failed.');
      }
      if (result) URL.revokeObjectURL(result);
      setResult(URL.createObjectURL(await response.blob()));
      setStatus('done');
    } catch (renderError) {
      setStatus('idle');
      setError(renderError instanceof Error ? renderError.message : 'Rendering failed.');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 px-6 pb-24 pt-32 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1 text-sm font-bold text-rose-300"><Film className="h-4 w-4" /> Image Motion</div>
          <h1 className="text-4xl font-black md:text-6xl">Turn one image into a motion clip</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-neutral-400">Create a vertical MP4 with a smooth cinematic push-in. This tool performs a real FFmpeg render; it does not invent movement inside the scene.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="flex min-h-[520px] items-center justify-center overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            {result ? <video src={result} controls autoPlay loop muted className="max-h-[480px] rounded-2xl" /> : preview ? <img src={preview} alt="Selected source" className="max-h-[480px] rounded-2xl object-contain" /> : (
              <label className="flex min-h-[420px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-700 hover:border-rose-400">
                <Upload className="mb-4 h-10 w-10 text-neutral-400" /><span className="font-bold">Choose JPG, PNG, or WebP</span><span className="mt-2 text-sm text-neutral-500">Maximum 25 MB</span>
                <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && selectFile(event.target.files[0])} />
              </label>
            )}
          </section>
          <aside className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-lg font-bold">Render settings</h2>
            <label className="mt-8 block text-sm font-semibold text-neutral-300">Duration: {duration} seconds</label>
            <input className="mt-3 w-full accent-rose-500" type="range" min="2" max="10" value={duration} onChange={(event) => setDuration(Number(event.target.value))} />
            <p className="mt-5 text-sm leading-6 text-neutral-400">Output: 1080 × 1920, H.264 MP4, 30 fps, no audio.</p>
            {error && <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            {status === 'done' && result ? <a className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold hover:bg-emerald-500" href={result} download="nexuscut-image-motion.mp4"><Download className="h-5 w-5" /> Download MP4</a> : <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-4 font-bold hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50" disabled={!file || status === 'processing'} onClick={render}>{status === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}{status === 'processing' ? 'Rendering…' : 'Create MP4'}</button>}
            {file && <label className="mt-3 flex w-full cursor-pointer items-center justify-center rounded-xl border border-neutral-700 py-3 text-sm font-bold hover:bg-neutral-800">Choose another image<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && selectFile(event.target.files[0])} /></label>}
          </aside>
        </div>
      </div>
    </main>
  );
}
