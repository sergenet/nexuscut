export type CampaignAttribution = {
  visitorId?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
  landingPage?: string;
};

export function parseAttributionCookie(value?: string): CampaignAttribution {
  if (!value) return {};
  try {
    return JSON.parse(decodeURIComponent(value)) as CampaignAttribution;
  } catch {
    return {};
  }
}

export function stripeAttributionMetadata(attribution: CampaignAttribution) {
  const clean = (value?: string) => value?.slice(0, 450) || undefined;
  return {
    ...(clean(attribution.visitorId) && { visitor_id: clean(attribution.visitorId) }),
    ...(clean(attribution.source) && { utm_source: clean(attribution.source) }),
    ...(clean(attribution.medium) && { utm_medium: clean(attribution.medium) }),
    ...(clean(attribution.campaign) && { utm_campaign: clean(attribution.campaign) }),
    ...(clean(attribution.content) && { utm_content: clean(attribution.content) }),
    ...(clean(attribution.term) && { utm_term: clean(attribution.term) }),
    ...(clean(attribution.fbclid) && { fbclid: clean(attribution.fbclid) }),
  };
}
