'use client';

import { useEffect } from 'react';
import { whenConsentGranted } from '@/lib/consent';

/**
 * The AdSense loader.
 *
 * AdSense for review requires the code to be present on the site, and serving
 * personalised ads before a visitor has chosen would break both the consent
 * banner and Google's own EU user consent policy. So the script is only
 * injected after Accept: no request to googlesyndication.com is made for a
 * visitor who has not opted in.
 */
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-0467059729557007';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    nexuscutAdsLoaded?: boolean;
  }
}

export default function AdSense() {
  useEffect(() => {
    const start = () => {
      window.adsbygoogle = window.adsbygoogle || [];
      if (window.nexuscutAdsLoaded) return;
      if (document.querySelector('script[data-nexuscut-adsense]')) {
        window.nexuscutAdsLoaded = true;
        return;
      }
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
      script.dataset.nexuscutAdsense = 'true';
      document.head.appendChild(script);
      window.nexuscutAdsLoaded = true;
    };

    return whenConsentGranted(start);
  }, []);

  return null;
}
