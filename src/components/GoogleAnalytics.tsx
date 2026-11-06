"use client";

import { useEffect } from 'react';
import { createGoogleTag, type GoogleTag } from '@/lib/trackingQueues';
import { whenConsentGranted } from '@/lib/consent';
import { visitorNeedsConsentMessage } from '@/lib/region';
import { analyticsAllowed, watchConsentMode } from '@/lib/googleCmp';

const measurementId = 'G-1BZZ7X8ZH8';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GoogleTag;
    nexuscutGoogleInitialized?: boolean;
  }
}

export default function GoogleAnalytics() {
  useEffect(() => {
    let removeClickTracking: (() => void) | undefined;

    // Everything below is inside the consent callback: no dataLayer, no gtag,
    // no request to googletagmanager.com before the visitor accepts.
    const start = () => {
      // Set up the command queue first so the initial page view is retained even
      // while Google’s small loader script is downloading.
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || createGoogleTag(command => window.dataLayer?.push(command));
      if (!window.nexuscutGoogleInitialized) {
        window.gtag('js', new Date());
        // GA4 enhanced measurement handles subsequent browser-history page views.
        // Do not send a second manual page_view for the same route navigation.
        window.gtag('config', measurementId, { send_page_view: true });
        window.nexuscutGoogleInitialized = true;
      }

      if (!document.querySelector(`script[data-nexuscut-ga="${measurementId}"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.dataset.nexuscutGa = measurementId;
        document.head.appendChild(script);
      }

      if (removeClickTracking) return;
      const trackClick = (event: MouseEvent) => {
        const target = event.target instanceof Element
          ? event.target.closest<HTMLElement>('[data-analytics-event]')
          : null;
        if (!target) return;
        window.gtag?.('event', target.dataset.analyticsEvent || 'click', {
          location: target.dataset.analyticsLocation || 'unknown',
          destination: target.getAttribute('href') || undefined,
        });
      };
      document.addEventListener('click', trackClick);
      removeClickTracking = () => document.removeEventListener('click', trackClick);
    };

    const stopWaiting = whenConsentGranted(start);

    // In the EEA, UK and Switzerland the visitor's answer comes from Google's
    // certified consent message, not from our banner. Analytics starts only
    // when that message reports analytics consent (or that the purpose does
    // not apply); "not configured" is treated as a refusal, because a consent
    // that was never asked for cannot be relied on. Both listeners are kept so
    // that the site's own banner still works if no message is published yet.
    const stopCmp = visitorNeedsConsentMessage()
      ? watchConsentMode((values) => {
          if (analyticsAllowed(values)) start();
        })
      : () => {};

    return () => {
      stopWaiting();
      stopCmp();
      removeClickTracking?.();
    };
  }, []);

  return null;
}
