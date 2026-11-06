'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createMetaPixelQueue, type MetaPixelQueue } from '@/lib/trackingQueues';
import { whenConsentGranted } from '@/lib/consent';

declare global {
  interface Window {
    fbq?: MetaPixelQueue;
    _fbq?: MetaPixelQueue;
    nexuscutMetaPixelId?: string;
    nexuscutMetaPage?: string;
  }
}

export default function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const pathname = usePathname();
  useEffect(() => {
    if (!pixelId || !pathname) return;

    // fbevents.js and `_fbp` are advertising cookies, so nothing here runs
    // before the visitor accepts. The effect re-runs on navigation, and by then
    // `whenConsentGranted` sees a stored grant and starts immediately.
    const stopWaiting = whenConsentGranted(() => {
      window.fbq = window.fbq || createMetaPixelQueue();
      window._fbq = window._fbq || window.fbq;
      if (window.nexuscutMetaPixelId !== pixelId) {
        window.fbq('init', pixelId);
        window.nexuscutMetaPixelId = pixelId;
      }
      if (!document.querySelector('script[src="https://connect.facebook.net/en_US/fbevents.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      }
      // The root layout persists during Next.js navigation. Track the next page
      // without reinitializing the pixel or duplicating a remounted page view.
      if (window.nexuscutMetaPage !== pathname) {
        window.fbq('track', 'PageView');
        window.nexuscutMetaPage = pathname;
      }
    });

    return () => stopWaiting();
  }, [pixelId, pathname]);
  return null;
}
