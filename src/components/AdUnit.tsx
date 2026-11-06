'use client';

import { useEffect, useRef } from 'react';
import { whenConsentGranted } from '@/lib/consent';

/**
 * One responsive ad unit.
 *
 * The slot id comes from the environment, and without one this renders
 * nothing at all. That is deliberate: a unit with a missing or invented slot
 * id requests an ad that can never fill, which shows as an empty gap on the
 * page and as an error in the console.
 */
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-0467059729557007';

export default function AdUnit({
  slot,
  className,
  label,
}: {
  slot: string | undefined;
  className?: string;
  label?: string;
}) {
  const holder = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot) return;
    return whenConsentGranted(() => {
      if (!holder.current || pushed.current) return;
      pushed.current = true;
      window.adsbygoogle = window.adsbygoogle || [];
      // Each <ins> needs exactly one push; a second one throws and leaves the
      // unit permanently blank.
      window.adsbygoogle.push({});
    });
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={className} aria-label={label}>
      <ins
        ref={holder}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
