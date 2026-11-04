'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AffiliateTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const ref = searchParams.get('ref');
    if (ref) {
      // Store in a cookie that lasts for 30 days
      const d = new Date();
      d.setTime(d.getTime() + (30*24*60*60*1000));
      const expires = "expires="+ d.toUTCString();
      document.cookie = "nexuscut_affiliate=" + ref + ";" + expires + ";path=/";
    }
  }, [searchParams]);

  return null; // Invisible tracker component
}
