/**
 * One consent record for the whole site.
 *
 * Nothing that sets a cookie or sends a request to Google/Meta may run before
 * the visitor has chosen. The banner writes this value, and the analytics
 * components subscribe to the same event, so a page that is already open
 * starts tracking the moment Accept is clicked instead of needing a reload.
 */

export const CONSENT_KEY = 'nexuscut-consent';
/** Fired with `detail: 'granted' | 'denied' | null` whenever the choice changes. */
export const CONSENT_EVENT = 'nexuscut-consent-changed';
/** Fired when something (e.g. the footer link) asks the banner to reopen. */
export const OPEN_CONSENT_EVENT = 'nexuscut-open-consent';

export type ConsentValue = 'granted' | 'denied' | null;

export function readConsent(): ConsentValue {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    // Private mode or a blocked storage API: treat it as no choice yet.
    return null;
  }
}

export function writeConsent(value: 'granted' | 'denied'): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // The in-memory event below still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_EVENT, { detail: value }));
}

/**
 * Subscription used by `useSyncExternalStore`, so the banner reads the stored
 * choice without setting state from inside an effect (which React 19 lint
 * rejects, and which caused a cascading render).
 */
export function subscribeToConsent(onChange: () => void): () => void {
  // `storage` fires in the other tabs, `CONSENT_EVENT` in this one.
  const handler = () => onChange();
  window.addEventListener(CONSENT_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/** Re-open the banner so a visitor can change their mind. */
export function openConsentBanner(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

/**
 * Runs `onGranted` now if consent was already given, otherwise as soon as it
 * is. Returns a cleanup function; the listener is removed after the first
 * grant so nothing keeps firing twice.
 */
export function whenConsentGranted(onGranted: () => void): () => void {
  if (readConsent() === 'granted') {
    onGranted();
    return () => {};
  }

  const handler = (event: Event) => {
    if ((event as CustomEvent<ConsentValue>).detail !== 'granted') return;
    window.removeEventListener(CONSENT_EVENT, handler);
    onGranted();
  };
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
