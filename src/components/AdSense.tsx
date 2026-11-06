'use client';

import { useEffect } from 'react';
import { readConsent, subscribeToConsent, whenConsentGranted } from '@/lib/consent';
import { visitorNeedsConsentMessage } from '@/lib/region';
import { pushToGoogleFc } from '@/lib/googleCmp';

/**
 * The AdSense loader.
 *
 * Two things load this tag, and the difference matters:
 *
 * 1. A visitor who accepted our banner — the normal case everywhere else.
 * 2. A visitor in the EEA, UK or Switzerland, *before* any choice. Google's
 *    certified consent message is delivered by the AdSense tag itself, not by a
 *    separate snippet, so gating the tag behind our own banner would mean the
 *    European message could never appear and Google would never get a consent
 *    signal. Google blocks personalised ads until the message is answered.
 */
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-0467059729557007';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    nexuscutAdsLoaded?: boolean;
  }
}

const TAG_SELECTOR = 'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]';

function injectTag() {
  if (window.nexuscutAdsLoaded) return;
  // Identified by src, not by a data attribute: the AdSense loader inspects its
  // own tag and logs a warning when it finds an attribute it does not know.
  if (document.querySelector(TAG_SELECTOR)) {
    window.nexuscutAdsLoaded = true;
    return;
  }
  // The tag drains this array when it loads, so queuing before it arrives is
  // both allowed and the documented way to hand it configuration.
  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  window.adsbygoogle = window.adsbygoogle || [];

  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  script.addEventListener('load', () => {
    window.dispatchEvent(new Event('nexuscut-ads-tag-loaded'));
  });
  document.head.appendChild(script);
  window.nexuscutAdsLoaded = true;
}

export default function AdSense() {
  useEffect(() => {
    // Keep the queue alive before the tag loads so a Consent Mode callback
    // registered by another component is not dropped.
    pushToGoogleFc('CONSENT_API_READY', () => {});

    if (visitorNeedsConsentMessage()) {
      injectTag();
      return;
    }

    if (readConsent() === 'granted') {
      injectTag();
      return;
    }

    const stopWaiting = whenConsentGranted(injectTag);
    // A choice made in another tab should also start the tag here.
    const unsubscribe = subscribeToConsent(() => {
      if (readConsent() === 'granted') injectTag();
    });
    return () => {
      stopWaiting();
      unsubscribe();
    };
  }, []);

  return null;
}
