'use client';

import { toast } from '@/lib/toast';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountActions({ hasBillingAccount }: { hasBillingAccount: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'billing' | 'logout' | null>(null);

  const openBilling = async () => {
    setBusy('billing');
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || 'Billing portal is unavailable.');
      window.location.href = data.url;
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Billing portal is unavailable.');
      setBusy(null);
    }
  };

  const signOut = async () => {
    setBusy('logout');
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/editor" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold hover:bg-indigo-500">Open Editor</Link>
      {hasBillingAccount && <button onClick={openBilling} disabled={busy !== null} className="rounded-xl border border-neutral-700 px-5 py-3 font-bold text-neutral-200 hover:bg-neutral-800 disabled:opacity-50">{busy === 'billing' ? 'Opening…' : 'Manage billing'}</button>}
      <button onClick={signOut} disabled={busy !== null} className="rounded-xl border border-rose-900/70 px-5 py-3 font-bold text-rose-300 hover:bg-rose-950/30 disabled:opacity-50">{busy === 'logout' ? 'Signing out…' : 'Sign out'}</button>
    </div>
  );
}
