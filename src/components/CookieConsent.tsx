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
import { visitorNeedsConsentMessage } from '@/lib/region';
import { watchGdprApplies } from '@/lib/googleCmp';

/**
 * How long to wait for Google's message before assuming it is not published and
 * falling back to this banner. Long enough for the CMP to boot on a slow
 * connection, short enough that a European visitor without a message is not
 * left on a page with no way to choose.
 */
const CMP_DETECTION_TIMEOUT_MS = 2500;

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
  // "pending" only ever begins in a region Google's message covers: until the
  // CMP answers, this banner stays hidden so a European visitor is not asked
  // twice. A missing CMP (message not published) resolves to "absent" and the
  // banner takes over.
  const [cmpState, setCmpState] = useState<'pending' | 'applies' | 'absent'>(() =>
    typeof window !== 'undefined' && visitorNeedsConsentMessage() ? 'pending' : 'absent',
  );

  // Subscribed once and kept for the life of the page, not torn down when the
  // timeout resolves: Google's message can arrive after our fallback banner is
  // already up on a slow connection, and when it does it must still be able to
  // take the banner down rather than leaving two prompts on screen.
  useEffect(() => {
    const stop = watchGdprApplies((applies) => setCmpState(applies ? 'applies' : 'absent'));
    const timer = window.setTimeout(
      () => setCmpState((current) => (current === 'pending' ? 'absent' : current)),
      CMP_DETECTION_TIMEOUT_MS,
    );
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, []);

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

  // Google's message owns the decision in the EEA, UK and Switzerland, so this
  // banner never competes with it.
  if (cmpState === 'applies') return null;

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
          NexusCut uses analytics — Google Analytics and a Meta advertising pixel — and shows ads
          through Google AdSense. None of them loads until you accept. Declining leaves the editor
          fully working; only the measurement and the ads are switched off. In Europe, the UK and
          Switzerland, Google&apos;s own consent message asks about advertising instead. See the{' '}
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
