"use client";

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

type FeedbackModalProps = {
  onClose: () => void;
  initialType?: 'general' | 'export';
};

export default function FeedbackModal({ onClose, initialType = 'general' }: FeedbackModalProps) {
  const [type, setType] = useState(initialType);
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (details.trim().length < 8) {
      setError('Please tell us a little more about what happened.');
      return;
    }
    if (attachment && attachment.size > 5 * 1024 * 1024) {
      setError('Please keep a screenshot or recording under 5 MB.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('details', details.trim());
      formData.append('email', email.trim());
      formData.append('page', window.location.href);
      formData.append('browser', navigator.userAgent);
      formData.append('screen', `${window.innerWidth} × ${window.innerHeight}`);
      if (attachment) formData.append('attachment', attachment);
      const response = await fetch('/api/feedback', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Could not send feedback. Please try again.');
      setStatus('sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send feedback. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className="w-full max-w-lg rounded-2xl border border-indigo-400/30 bg-neutral-900 p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300"><MessageSquare className="h-5 w-5" /></span><div><h2 id="feedback-title" className="text-lg font-bold text-white">{initialType === 'export' ? 'Export complete' : 'Send feedback'}</h2><p className="mt-1 text-sm text-neutral-400">{initialType === 'export' ? 'Your video is in the downloads folder. Did it work as expected?' : 'Your real-world test helps us improve NexusCut.'}</p></div></div>
          <button onClick={onClose} className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-bold text-neutral-200 hover:bg-white/10 hover:text-white" aria-label="Return to editor">Back to editor</button>
        </div>
        {status === 'sent' ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center"><p className="font-bold text-emerald-300">Thank you—your feedback was sent.</p><p className="mt-2 text-sm text-neutral-300">We appreciate you helping make NexusCut better.</p><button onClick={onClose} className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-500">Done</button></div> : <form onSubmit={submit} className="space-y-4">
          <div><label className="mb-1.5 block text-sm font-semibold text-neutral-200">What were you doing?</label><select value={type} onChange={(e) => setType(e.target.value as 'general' | 'export')} className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-2.5 text-sm text-white"><option value="general">Testing the editor / something was confusing</option><option value="export">Checking an exported video</option></select></div>
          <div><label className="mb-1.5 block text-sm font-semibold text-neutral-200">What happened, and what did you expect?</label><textarea autoFocus value={details} onChange={(e) => setDetails(e.target.value)} placeholder="For example: I split a clip at 0:18, then the audio started from the wrong place." className="h-28 w-full resize-none rounded-lg border border-neutral-700 bg-black p-3 text-sm text-white outline-none focus:border-indigo-400" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-semibold text-neutral-200">Email (optional)</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="For a reply" className="w-full rounded-lg border border-neutral-700 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></div><div><label className="mb-1.5 block text-sm font-semibold text-neutral-200">Screenshot (optional)</label><input onChange={(e) => setAttachment(e.target.files?.[0] || null)} type="file" accept="image/*,video/*" className="block w-full text-xs text-neutral-400 file:mr-2 file:rounded file:border-0 file:bg-neutral-700 file:px-2 file:py-1.5 file:text-xs file:font-semibold file:text-white" /></div></div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button disabled={status === 'sending'} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60">{status === 'sending' ? 'Sending…' : 'Send feedback'}</button>
        </form>}
      </div>
    </div>
  );
}
