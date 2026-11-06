/**
 * Thin wrapper over Google's Privacy & messaging API (`googlefc`) and the IAB
 * TCF API that it exposes.
 *
 * Only APIs documented in the Privacy & messaging JavaScript API reference are
 * used here:
 *   - googlefc.callbackQueue.push({ CONSENT_API_READY | CONSENT_MODE_DATA_READY: fn })
 *   - googlefc.getGoogleConsentModeValues()  (one status per consent-mode purpose)
 *   - googlefc.showRevocationMessage()
 *   - __tcfapi('addEventListener', 2.2, cb)  for `gdprApplies`
 *
 * The older googlefc.getConsentStatus() is intentionally unused: Google's own
 * reference says it belongs to the deprecated Simplified Framework and always
 * returns UNKNOWN.
 */

/** Mirrors googlefc.ConsentModePurposeStatusEnum, compared by value so a
 *  rename of the enum members in Google's bundle cannot break the mapping. */
const PURPOSE_UNKNOWN = 0;
const PURPOSE_GRANTED = 1;
const PURPOSE_DENIED = 2;
const PURPOSE_NOT_APPLICABLE = 3;
const PURPOSE_NOT_CONFIGURED = 4;

export type PurposeStatus =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'not_applicable'
  | 'not_configured';

export interface ConsentModeValues {
  adStorage: PurposeStatus;
  adUserData: PurposeStatus;
  adPersonalization: PurposeStatus;
  analyticsStorage: PurposeStatus;
}

interface GoogleFcConsentModeUserStatus {
  adStoragePurposeConsentStatus?: number;
  adUserDataPurposeConsentStatus?: number;
  adPersonalizationPurposeConsentStatus?: number;
  analyticsStoragePurposeConsentStatus?: number;
}

type TcfCallback = (tcData: { gdprApplies?: boolean; eventStatus?: string } | null, success?: boolean) => void;

declare global {
  interface Window {
    googlefc?: {
      callbackQueue?: Array<Record<string, () => void> | (() => void)>;
      getGoogleConsentModeValues?: () => GoogleFcConsentModeUserStatus;
      showRevocationMessage?: () => void;
    };
    __tcfapi?: (command: string, version: number, callback: TcfCallback, ...rest: unknown[]) => void;
    /** Set by this module once the CMP has been detected. */
    nexuscutCmpPresent?: boolean;
  }
}

function mapStatus(value: number | undefined): PurposeStatus {
  switch (value) {
    case PURPOSE_GRANTED:
      return 'granted';
    case PURPOSE_DENIED:
      return 'denied';
    case PURPOSE_NOT_APPLICABLE:
      return 'not_applicable';
    case PURPOSE_NOT_CONFIGURED:
      return 'not_configured';
    default:
      return 'unknown';
  }
}

/** Queue a googlefc callback if the queue exists, or create it first. */
export function pushToGoogleFc(key: string, fn: () => void): void {
  if (typeof window === 'undefined') return;
  window.googlefc = window.googlefc || {};
  const existing = window.googlefc.callbackQueue;
  // Google documents the keyed-object form; a bare function is its legacy form.
  if (existing !== undefined && !Array.isArray(existing)) return;
  const queue: Array<Record<string, () => void> | (() => void)> = existing || [];
  queue.push({ [key]: fn });
  window.googlefc.callbackQueue = queue;
}

export function googleCmpPresent(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.googlefc?.callbackQueue) || Boolean(window.__tcfapi);
}

/**
 * Read `gdprApplies` from the TCF API once it exists. Google's message sets it
 * to true for EEA/UK/CH visitors; for everyone else it is false, and the site's
 * own banner stays in charge.
 */
export function watchGdprApplies(callback: (applies: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let stopped = false;

  const subscribe = () => {
    if (stopped) return;
    const tcf = window.__tcfapi;
    if (!tcf) return;
    try {
      tcf('addEventListener', 2.2, (tcData) => {
        if (stopped || !tcData) return;
        window.nexuscutCmpPresent = true;
        callback(Boolean(tcData.gdprApplies));
      });
    } catch {
      // A CMP that throws here is not usable; the caller's timeout handles it.
    }
  };

  // The API is often already defined by the time React mounts; the queue
  // callback covers the case where it is not.
  pushToGoogleFc('CONSENT_API_READY', subscribe);
  subscribe();
  return () => {
    stopped = true;
  };
}

/**
 * Consent-mode values, delivered once Google has them. The callback can fire
 * more than once if the visitor changes their choice.
 */
export function watchConsentMode(callback: (values: ConsentModeValues) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  let stopped = false;

  const read = () => {
    if (stopped) return;
    const readValues = window.googlefc?.getGoogleConsentModeValues;
    if (typeof readValues !== 'function') return;
    let raw: GoogleFcConsentModeUserStatus;
    try {
      raw = readValues();
    } catch {
      return;
    }
    if (!raw) return;
    window.nexuscutCmpPresent = true;
    callback({
      adStorage: mapStatus(raw.adStoragePurposeConsentStatus),
      adUserData: mapStatus(raw.adUserDataPurposeConsentStatus),
      adPersonalization: mapStatus(raw.adPersonalizationPurposeConsentStatus),
      analyticsStorage: mapStatus(raw.analyticsStoragePurposeConsentStatus),
    });
  };

  pushToGoogleFc('CONSENT_MODE_DATA_READY', read);
  read();
  return () => {
    stopped = true;
  };
}

/**
 * Analytics may start when consent mode says yes, or when the purpose does not
 * apply to this visitor. `not_configured` is a "no": it means analytics consent
 * was never asked for, so there is nothing to rely on.
 */
export function analyticsAllowed(values: ConsentModeValues): boolean {
  return values.analyticsStorage === 'granted' || values.analyticsStorage === 'not_applicable';
}

/** Ads may render once the CMP has produced a decision of any kind. */
export function adsDecisionKnown(values: ConsentModeValues): boolean {
  return values.adStorage !== 'unknown';
}

/**
 * Reopen Google's European consent message. Returns false when the CMP is not
 * on the page, so the caller can fall back to the site's own banner.
 */
export function openGoogleConsentMessage(): boolean {
  if (typeof window === 'undefined') return false;
  const show = window.googlefc?.showRevocationMessage;
  if (typeof show !== 'function') return false;
  try {
    show();
    return true;
  } catch {
    return false;
  }
}
