export function trackEvent(eventName: string, parameters: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === 'undefined') return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === 'function') gtag('event', eventName, parameters);
}
