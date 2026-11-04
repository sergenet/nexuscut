'use client';

import { useEffect, useState } from 'react';

export default function ConversionConfirmation({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState('Confirming your membership…');
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/analytics/checkout-success?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
      .then(async response => {
        const result = await response.json() as { verified?: boolean; eventName?: 'StartTrial' | 'Subscribe'; eventId?: string; tier?: string; value?: number; currency?: string; error?: string };
        if (!response.ok || !result.verified) throw new Error(result.error || 'Could not verify checkout.');
        const value = result.value ?? 0;
        const currency = result.currency ?? 'USD';
        const isTrial = result.eventName === 'StartTrial';
        if (!isTrial && result.eventName !== 'Subscribe') throw new Error('Checkout event could not be verified.');
        window.gtag?.('event', isTrial ? 'start_trial' : 'purchase', { currency, value, plan: result.tier, transaction_id: result.eventId });
        window.fbq?.('track', result.eventName, { currency, value }, { eventID: result.eventId });
        setMessage(isTrial ? 'Your seven-day trial checkout is confirmed.' : 'Your Creator subscription payment is confirmed.');
      })
      .catch(error => setMessage(error instanceof Error ? error.message : 'Open My Account to confirm your membership.'));
  }, [sessionId]);
  return <p className="mt-4 text-sm text-emerald-300">{sessionId ? message : 'The checkout reference is missing. Open My Account to confirm your membership.'}</p>;
}
