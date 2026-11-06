"use client";

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  CONSENT_EVENT,
  OPEN_CONSENT_EVENT,
  readConsent,
  subscribeToConsent,
  writeConsent,
} from '@/lib/consent';

/**
 * Cookie banner. Rendered on every route, but only after the store reports no
 * choice, so a visitor who has already decided never sees a flash of it.
 *
 * It owns no analytics itself: Accept/Decline only records the choice, and the
 * GA4 and Meta pixel components start (or stay idle) from that same event.
 */
export default function CookieConsent() {
  // The stored choice, read through a subscription rather than set from an
  // effect. The server render and the hydration pass both see `null`, so the
  // banner only appears once the client has actually looked at storage.
  const choice = useSyncExternalStore(
    subscribeToConsent,
    readConsent,
    // A sentinel, not `null`: the server cannot know the choice, and rendering
    // the banner into the HTML would flash it at every visitor who already
    // accepted before hydration removed it again.
    () => 'server' as const,
  );
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    // Choosing closes it, including the choice made in another tab.
    const close = () => setReopened(false);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    window.addEventListener(CONSENT_EVENT, close);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, open);
      window.removeEventListener(CONSENT_EVENT, close);
    };
  }, []);

  const visible = reopened || choice === null;
  if (!visible) return null;

  const choose = (value: 'granted' | 'denied') => {
    writeConsent(value);
    setReopened(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] p-4 sm:p-6"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-body"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-700 bg-neutral-900/95 p-5 shadow-2xl backdrop-blur sm:p-6">
        <h2 id="cookie-consent-title" className="text-base font-bold text-white">
          Cookies and analytics
        </h2>
        <p id="cookie-consent-body" className="mt-2 text-sm leading-6 text-neutral-300">
          NexusCut uses analytics — Google Analytics and a Meta advertising pixel — to understand
          which pages people actually use. Neither loads until you accept. Declining leaves the
          editor fully working; only the measurement is switched off. See the{' '}
          <Link href="/privacy" className="text-indigo-400 underline hover:text-indigo-300">
            privacy policy
          </Link>{' '}
          for what is stored.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="rounded-full border border-neutral-600 px-5 py-2.5 text-sm font-bold text-neutral-200 transition hover:border-neutral-400 hover:text-white"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
