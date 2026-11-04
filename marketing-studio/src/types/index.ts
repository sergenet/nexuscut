export type Platform = 'YouTube Shorts' | 'Instagram Reels' | 'TikTok' | 'Facebook' | 'LinkedIn';
export type Status = 'Draft' | 'Approved' | 'Published';

export interface Campaign {
  id: string;
  name: string;
  product: string;
  targetAudience: string;
  problem: string;
  benefit: string;
  callToAction: string;
  offerUrl: string;
  brandVoice: string;
  contentGoal: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  campaignId: string;
  platform: Platform;
  scheduledDate: string; // ISO string
  hook: string;
  script: string;
  caption: string;
  cta: string;
  hashtags: string;
  status: Status;
  createdAt: string;
}
