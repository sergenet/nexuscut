"use client";

import { useEffect } from 'react';
import { createGoogleTag, type GoogleTag } from '@/lib/trackingQueues';
import { readConsent, subscribeToConsent } from '@/lib/consent';
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

    // 1. Initialize dataLayer and gtag queue immediately
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || createGoogleTag(command => window.dataLayer?.push(command));

    // 2. Establish Google Consent Mode v2 defaults
    const currentConsent = readConsent();
    if (currentConsent === 'granted') {
      window.gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } else {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });
    }

    // 3. Load gtag.js unconditionally for cookieless measurement & traffic modeling
    if (!window.nexuscutGoogleInitialized) {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: true,
        anonymize_ip: true,
      });
      window.nexuscutGoogleInitialized = true;
    }

    if (!document.querySelector(`script[data-nexuscut-ga="${measurementId}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.dataset.nexuscutGa = measurementId;
      document.head.appendChild(script);
    }

    // 4. Click tracking listener
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

    // 5. Update consent dynamically when granted or denied
    const handleConsentUpdate = () => {
      const updated = readConsent();
      if (updated === 'granted') {
        window.gtag?.('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      } else if (updated === 'denied') {
        window.gtag?.('consent', 'update', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    };

    const stopWaiting = subscribeToConsent(handleConsentUpdate);

    // In the EEA, UK and Switzerland, watch Google CMP
    const stopCmp = visitorNeedsConsentMessage()
      ? watchConsentMode((values) => {
          if (analyticsAllowed(values)) {
            window.gtag?.('consent', 'update', {
              analytics_storage: 'granted',
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            });
          }
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
