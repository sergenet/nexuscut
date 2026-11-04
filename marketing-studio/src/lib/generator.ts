import { Campaign, ContentItem, Platform } from '@/types';
import { addDays } from 'date-fns';

const PLATFORMS: Platform[] = ['YouTube Shorts', 'Instagram Reels', 'TikTok', 'Facebook', 'LinkedIn'];

export const generateContent = async (campaign: Campaign): Promise<Omit<ContentItem, 'id' | 'createdAt'>[]> => {
  // Simulate network delay for API readiness
  await new Promise(resolve => setTimeout(resolve, 1500));

  const items: Omit<ContentItem, 'id' | 'createdAt'>[] = [];
  const startDate = new Date();

  // We need 30 posts
  for (let i = 0; i < 30; i++) {
    const platform = PLATFORMS[i % PLATFORMS.length];
    const scheduledDate = addDays(startDate, i).toISOString();

    let hook = '';
    let script = '';
    let caption = '';

    const variant = i % 3;

    if (platform === 'LinkedIn' || platform === 'Facebook') {
      // Text-heavy posts
      if (variant === 0) {
        hook = `Struggling with ${campaign.problem}?`;
        script = `I found a way to ${campaign.benefit}. We use ${campaign.product} to achieve this without the usual hassle. It fits our ${campaign.brandVoice} style perfectly.`;
        caption = `Tired of the grind? Here is how to fix it.\n\n${campaign.callToAction} at ${campaign.offerUrl}`;
      } else if (variant === 1) {
        hook = `How we solved ${campaign.problem} for good.`;
        script = `As ${campaign.targetAudience}, time is everything. With ${campaign.product}, you can ${campaign.benefit}.`;
        caption = `Don't let ${campaign.problem} hold you back.\n\n${campaign.callToAction} 👉 ${campaign.offerUrl}`;
      } else {
        hook = `The ultimate hack for ${campaign.targetAudience}`;
        script = `If you want to ${campaign.benefit}, you need to look at ${campaign.product}.`;
        caption = `Achieve your ${campaign.contentGoal} goals today.\n\n${campaign.callToAction} here: ${campaign.offerUrl}`;
      }
    } else {
      // Video-focused posts (TikTok, Reels, Shorts)
      if (variant === 0) {
        hook = `POV: You hate ${campaign.problem}`;
        script = `1. Notice the problem. 2. Discover ${campaign.product}. 3. ${campaign.benefit}. Boom.`;
        caption = `This changed everything for me. #shorts #hack\n\n${campaign.callToAction} - ${campaign.offerUrl}`;
      } else if (variant === 1) {
        hook = `Stop scrolling if you are a ${campaign.targetAudience}`;
        script = `You need to try ${campaign.product}. It lets you ${campaign.benefit} in half the time.`;
        caption = `Game changer alert 🚨\n\n${campaign.callToAction}: ${campaign.offerUrl}`;
      } else {
        hook = `The secret to ${campaign.benefit}`;
        script = `No more ${campaign.problem}. Just use ${campaign.product} and watch your ${campaign.contentGoal} skyrocket.`;
        caption = `Try it yourself!\n\n${campaign.callToAction} ✨ ${campaign.offerUrl}`;
      }
    }

    items.push({
      campaignId: campaign.id,
      platform,
      scheduledDate,
      hook,
      script,
      caption,
      cta: campaign.callToAction,
      hashtags: `#${campaign.product.replace(/\s+/g, '')} #${campaign.contentGoal} #marketing`,
      status: 'Draft'
    });
  }

  return items;
};
