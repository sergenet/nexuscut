"use client";

import { openConsentBanner } from '@/lib/consent';

/**
 * Footer control so a visitor can change their cookie choice. It lives in its
 * own client component because the footer itself is rendered on the server.
 */
export default function CookieSettingsButton() {
  return (
    <li>
      <button
        type="button"
        onClick={openConsentBanner}
        className="text-sm text-neutral-400 transition-colors hover:text-indigo-400"
      >
        Cookie settings
      </button>
    </li>
  );
}
