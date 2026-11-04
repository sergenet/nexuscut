import crypto from 'crypto';

type MetaConversion = {
  eventName: 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'StartTrial' | 'Subscribe';
  eventId: string;
  email?: string | null;
  sourceUrl: string;
  value: number;
  currency?: string;
};

export async function sendMetaConversion(input: MetaConversion) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return { configured: false };
  const normalizedEmail = input.email?.trim().toLowerCase();
  const payload: Record<string, unknown> = {
    data: [{
      event_name: input.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      event_source_url: input.sourceUrl,
      action_source: 'website',
      user_data: normalizedEmail ? { em: [crypto.createHash('sha256').update(normalizedEmail).digest('hex')] } : {},
      custom_data: { value: input.value, currency: input.currency || 'USD' },
    }],
    ...(process.env.META_TEST_EVENT_CODE && { test_event_code: process.env.META_TEST_EVENT_CODE }),
  };
  const response = await fetch(`https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (!response.ok) console.error('Meta conversion failed:', response.status, await response.text());
  return { configured: true, ok: response.ok };
}
