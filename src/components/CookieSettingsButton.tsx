"use client";

import { openConsentBanner } from '@/lib/consent';
import { visitorNeedsConsentMessage } from '@/lib/region';
import { openGoogleConsentMessage } from '@/lib/googleCmp';

/**
 * Footer control so a visitor can change their cookie choice. It lives in its
 * own client component because the footer itself is rendered on the server.
 *
 * In Europe the decision belongs to Google's certified message, and Google
 * documents `showRevocationMessage()` as the way to reopen it. When the CMP is
 * not on the page (message not published yet, or a blocked script) the site's
 * own banner is the fallback, so the control is never a dead link.
 */
export default function CookieSettingsButton() {
  const handleClick = () => {
    if (visitorNeedsConsentMessage() && openGoogleConsentMessage()) return;
    openConsentBanner();
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className="text-sm text-neutral-400 transition-colors hover:text-indigo-400"
      >
        Cookie settings
      </button>
    </li>
  );
}
