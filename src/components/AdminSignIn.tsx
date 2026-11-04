'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from 'lucide-react';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, returnTo: '/admin' }),
      });
      if (!response.ok) throw new Error('Could not send sign-in link');
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-5 text-white">
      <section className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-7 shadow-2xl sm:p-9">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#39ff14]/15 text-[#39ff14]"><LockKeyhole className="h-5 w-5" /></div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#39ff14]">NexusCut owner area</p>
        <h1 className="mt-2 text-3xl font-black">Sign in to continue</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Use the owner email address. We will send a secure sign-in link that brings you back here.</p>

        {status === 'sent' ? (
          <div className="mt-7 border border-[#39ff14]/30 bg-[#39ff14]/10 p-5 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#39ff14]" />
            <h2 className="mt-3 font-bold">Check your inbox</h2>
            <p className="mt-1 text-sm text-zinc-300">A secure sign-in link was sent to {email}.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7">
            <label className="mb-2 block text-sm font-bold" htmlFor="admin-email">Email address</label>
            <div className="flex gap-2">
              <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" className="min-w-0 flex-1 border border-zinc-700 bg-black px-3 py-3 text-white outline-none transition focus:border-[#39ff14]" />
              <button type="submit" disabled={status === 'loading'} className="flex items-center justify-center bg-[#39ff14] px-4 font-bold text-black transition hover:bg-white disabled:opacity-50" aria-label="Send sign-in link">
                {status === 'loading' ? '...' : <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500"><Mail className="h-3.5 w-3.5" /> Link expires in 15 minutes.</p>
            {status === 'error' && <p className="mt-3 text-sm text-red-400">The sign-in email could not be sent. Please try again.</p>}
          </form>
        )}
      </section>
    </main>
  );
}
