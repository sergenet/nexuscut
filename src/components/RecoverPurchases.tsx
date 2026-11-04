'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function RecoverPurchases() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error('Failed to send');
      
      setStatus('success');
      trackEvent('sign_in_link_requested', { location: 'downloads' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-zinc-500 hover:text-white underline underline-offset-4 text-sm mt-6 transition-colors"
      >
        Sign in with email
      </button>
    );
  }

  if (status === 'success') {
    return (
      <div className="mt-8 p-6 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-lg max-w-md w-full text-center">
        <CheckCircle2 className="w-8 h-8 text-[#39ff14] mx-auto mb-3" />
        <h4 className="text-white font-bold mb-2">Check your inbox</h4>
        <p className="text-sm text-zinc-400">
          We sent a secure sign-in link to {email}.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full text-left">
      <h4 className="text-white font-bold mb-2 flex items-center gap-2">
        <Mail className="w-5 h-5 text-[#39ff14]" />
        Sign in to NexusCut
      </h4>
      <p className="text-sm text-zinc-400 mb-4">
        Enter your email address to receive a secure sign-in link.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com" 
          required
          className="flex-1 bg-black border border-zinc-700 text-white px-4 py-2 focus:outline-none focus:border-[#39ff14] transition-colors"
        />
        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="bg-[#39ff14] text-black px-4 py-2 font-bold hover:bg-white transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-500 text-xs mt-2">Failed to send recovery email. Please try again later.</p>
      )}
    </div>
  );
}
