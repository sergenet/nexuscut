'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function FoundingTesterForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch('/api/marketing/founding-testers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        creatorType: formData.get('creatorType'),
        website: formData.get('website'),
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string; eventId?: string };
    if (!response.ok) {
      setStatus('error');
      setMessage(result.error || 'Your application could not be saved. Please try again.');
      return;
    }
    setStatus('success');
    setMessage('Application received. We will review it and contact you at the email you provided.');
    window.gtag?.('event', 'generate_lead', {
      currency: 'USD',
      value: 0,
      lead_source: 'founding_tester_program',
      transaction_id: result.eventId,
    });
    window.fbq?.('track', 'Lead', { content_name: 'NexusCut Founding Tester Program', currency: 'USD', value: 0 }, result.eventId ? { eventID: result.eventId } : undefined);
    form.reset();
  }

  if (status === 'success') {
    return <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-left" role="status"><CheckCircle2 className="h-7 w-7 text-emerald-300" /><h3 className="mt-3 text-xl font-black">You are on the review list.</h3><p className="mt-2 leading-7 text-emerald-50/80">{message}</p></div>;
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-amber-300/25 bg-black/30 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold text-neutral-200">Name<input name="name" required minLength={2} maxLength={80} autoComplete="name" className="mt-2 w-full rounded-xl border border-white/15 bg-[#09090d] px-4 py-3 font-normal text-white outline-none transition focus:border-amber-300" /></label>
        <label className="block text-sm font-bold text-neutral-200">Email<input name="email" required type="email" maxLength={254} autoComplete="email" className="mt-2 w-full rounded-xl border border-white/15 bg-[#09090d] px-4 py-3 font-normal text-white outline-none transition focus:border-amber-300" /></label>
      </div>
      <label className="mt-4 block text-sm font-bold text-neutral-200">What best describes you?<select name="creatorType" required defaultValue="" className="mt-2 w-full rounded-xl border border-white/15 bg-[#09090d] px-4 py-3 font-normal text-white outline-none transition focus:border-amber-300"><option value="" disabled>Choose one</option><option>Short-form creator</option><option>Podcaster</option><option>Coach or educator</option><option>Marketer or business owner</option><option>Freelance editor</option><option>Other</option></select></label>
      <label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {message && <p className="mt-4 text-sm text-rose-200" role="alert">{message}</p>}
      <button type="submit" disabled={status === 'submitting'} data-analytics-event="founding_tester_apply" data-analytics-location="creator_challenge_form" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 py-4 font-black text-black transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60">{status === 'submitting' ? 'Sending application…' : 'Request a tester place'}{status !== 'submitting' && <ArrowRight className="h-5 w-5" />}</button>
      <p className="mt-3 text-center text-xs leading-5 text-neutral-500">No payment method. No public review required. We only use your email for this tester program.</p>
    </form>
  );
}
