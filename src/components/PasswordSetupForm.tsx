'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordSetupForm({ required }: { required: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setBusy(true);
    const response = await fetch('/api/auth/password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setMessage(data.error || 'Password could not be saved.');
      setBusy(false);
      return;
    }
    setMessage('Password saved. You can use email and password for future logins.');
    setPassword('');
    setConfirm('');
    router.replace('/account');
    router.refresh();
  };

  return (
    <div className="border-b border-neutral-800 bg-indigo-500/5 p-7">
      <h2 className="text-xl font-bold">{required ? 'Create your password' : __import__('os').environ.get('VPS_PASSWORD','')}</h2>
      <p className="mt-2 text-sm text-neutral-400">Use 10–128 characters. NexusCut stores only a secure password hash.</p>
      <form onSubmit={submit} className="mt-5 grid max-w-md gap-3">
        <input type="password" autoComplete="new-password" minLength={10} maxLength={128} required placeholder="New password" value={password} onChange={event => setPassword(event.target.value)} className="rounded-xl border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-indigo-500" />
        <input type="password" autoComplete="new-password" minLength={10} maxLength={128} required placeholder="Confirm password" value={confirm} onChange={event => setConfirm(event.target.value)} className="rounded-xl border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-indigo-500" />
        {message && <p className="text-sm text-neutral-300">{message}</p>}
        <button disabled={busy} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold hover:bg-indigo-500 disabled:opacity-50">{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </div>
  );
}
