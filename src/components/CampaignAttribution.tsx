'use client';

import { useEffect } from 'react';

const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'] as const;

export default function CampaignAttribution() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!attributionKeys.some(key => params.has(key))) return;
    const existingMatch = document.cookie.match(/(?:^|; )nexus_attribution=([^;]*)/);
    let existing: Record<string, string> = {};
    try { existing = existingMatch ? JSON.parse(decodeURIComponent(existingMatch[1])) : {}; } catch { existing = {}; }
    const value: Record<string, string> = {
      ...existing,
      visitorId: existing.visitorId || crypto.randomUUID(),
      landingPage: existing.landingPage || `${window.location.pathname}${window.location.search}`,
    };
    const mapping = { utm_source: 'source', utm_medium: 'medium', utm_campaign: 'campaign', utm_content: 'content', utm_term: 'term', fbclid: 'fbclid' } as const;
    attributionKeys.forEach(key => {
      const next = params.get(key);
      if (next) value[mapping[key]] = next.slice(0, 450);
    });
    document.cookie = `nexus_attribution=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${60 * 60 * 24 * 90}; Path=/; SameSite=Lax; Secure`;
    window.gtag?.('event', 'campaign_landing_view', { campaign: value.campaign, source: value.source, medium: value.medium });
  }, []);
  return null;
}
