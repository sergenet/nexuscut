/**
 * Which visitors need Google's European consent message.
 *
 * Google serves its certified CMP (Privacy & messaging, CMP ID 300) to users in
 * the EEA, the UK and Switzerland, and it decides that server-side from the IP.
 * The site cannot see the IP, so this is a timezone-based guess used only to
 * decide whether the AdSense tag (which carries the message) may load before a
 * visitor has made a choice. Google still makes the real decision: if the guess
 * is wrong the message simply does not appear, and the fallback in the banner
 * takes over.
 *
 * Deliberately an allowlist rather than "anything starting with Europe/":
 * Europe/Istanbul, Europe/Moscow and the Balkan zones are not in the EEA, and
 * loading the ad tag for them before consent would break the opt-in behaviour
 * those visitors are used to.
 */
const CONSENT_MESSAGE_TIMEZONES = new Set([
  // EU member states
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Bratislava',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Budapest',
  'Europe/Busingen',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/Ljubljana',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Malta',
  'Europe/Mariehamn',
  'Europe/Nicosia',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Sofia',
  'Europe/Stockholm',
  'Europe/Tallinn',
  'Europe/Vienna',
  'Europe/Vilnius',
  'Europe/Warsaw',
  'Europe/Zagreb',
  // EEA without being in the EU
  'Europe/Oslo',
  'Europe/Reykjavik',
  'Europe/Vaduz',
  'Arctic/Longyearbyen',
  // United Kingdom and the Crown Dependencies, which apply UK GDPR
  'Europe/London',
  'Europe/Belfast',
  'Europe/Gibraltar',
  'Europe/Guernsey',
  'Europe/Isle_of_Man',
  'Europe/Jersey',
  // Switzerland
  'Europe/Zurich',
  // Outermost EU regions
  'Africa/Ceuta',
  'Atlantic/Azores',
  'Atlantic/Canary',
  'Atlantic/Madeira',
]);

/** Pure, so the allowlist can be checked without a browser. */
export function needsConsentMessageForTimeZone(timeZone: string | null | undefined): boolean {
  if (!timeZone) return false;
  return CONSENT_MESSAGE_TIMEZONES.has(timeZone);
}

export function visitorTimeZone(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/**
 * Development-only region override, so the European flow can be exercised
 * without a VPN: `?consent=eu` forces the message path, `?consent=row` forces
 * the rest-of-world path. It is compiled out of production builds — a public
 * override would let a European visitor skip the certified CMP, which is the
 * one thing this whole flow exists to prevent.
 */
export function devRegionOverride(search: string): 'eu' | 'row' | null {
  if (process.env.NODE_ENV === 'production') return null;
  const value = new URLSearchParams(search).get('consent');
  return value === 'eu' || value === 'row' ? value : null;
}

/** True when this visitor is probably in a region Google's message covers. */
export function visitorNeedsConsentMessage(): boolean {
  if (typeof window === 'undefined') return false;
  const override = devRegionOverride(window.location.search);
  if (override) return override === 'eu';
  return needsConsentMessageForTimeZone(visitorTimeZone());
}
