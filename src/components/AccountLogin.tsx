'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountLogin({ returnTo = '/account' }: { returnTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'login' | 'email-sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('login');
    setMessage('');
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setStatus('error');
      setMessage(data.error || 'Sign in failed.');
      return;
    }
    router.push(returnTo);
    router.refresh();
  };

  const requestPasswordLink = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Enter your email address first.');
      return;
    }
    setStatus('login');
    const response = await fetch('/api/auth/recover', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, returnTo: returnTo === '/account' ? '/account?setPassword=1' : returnTo }),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setStatus('error');
      setMessage(data.error || 'Verification email could not be sent.');
      return;
    }
    setStatus('email-sent');
    setMessage('Check your inbox. The secure link will return you here to create or reset your password.');
  };

  return (
    <form onSubmit={login} className="mt-6 max-w-md space-y-4">
      <label className="block"><span className="mb-1.5 block text-sm font-bold text-neutral-300">Email</span><input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-indigo-500" /></label>
      <label className="block"><span className="mb-1.5 block text-sm font-bold text-neutral-300">Password</span><input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-indigo-500" /></label>
      {message && <p className={`text-sm ${status === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>{message}</p>}
      <button type="submit" disabled={status === 'login'} className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold hover:bg-indigo-500 disabled:opacity-50">{status === 'login' ? 'Please wait…' : 'Log In'}</button>
      <button type="button" onClick={requestPasswordLink} disabled={status === 'login'} className="w-full text-sm font-semibold text-indigo-300 hover:text-indigo-200 disabled:opacity-50">Create or reset password</button>
    </form>
  );
}
