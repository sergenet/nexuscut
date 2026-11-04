'use client';

import { useEffect } from 'react';

export default function ProConversionTracking() {
  useEffect(() => {
    window.gtag?.('event', 'view_item', {
      currency: 'USD',
      value: 29,
      items: [{ item_id: 'nexuscut_pro', item_name: 'NexusCut Pro', price: 29 }],
    });
    const trackMetaView = () => window.fbq?.('track', 'ViewContent', {
      content_ids: ['nexuscut_pro'],
      content_name: 'NexusCut Pro',
      content_type: 'product',
      currency: 'USD',
      value: 29,
    });
    if (window.fbq) trackMetaView();
    else {
      const timer = window.setTimeout(trackMetaView, 800);
      return () => window.clearTimeout(timer);
    }
  }, []);
  return null;
}
