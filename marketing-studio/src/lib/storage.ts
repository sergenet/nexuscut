import { Campaign, ContentItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const CAMPAIGNS_KEY = 'nexuscut_campaigns';
const CONTENT_KEY = 'nexuscut_content';

export const getCampaigns = (): Campaign[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CAMPAIGNS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt'>): Campaign => {
  const campaigns = getCampaigns();
  const newCampaign: Campaign = {
    ...campaign,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  campaigns.push(newCampaign);
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  return newCampaign;
};

export const updateCampaign = (id: string, updates: Partial<Campaign>): void => {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index !== -1) {
    campaigns[index] = { ...campaigns[index], ...updates };
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }
};

export const getContentItems = (): ContentItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(CONTENT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveContentItems = (items: Omit<ContentItem, 'id' | 'createdAt'>[]): ContentItem[] => {
  const currentItems = getContentItems();
  const newItems: ContentItem[] = items.map((item) => ({
    ...item,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }));
  const updatedItems = [...currentItems, ...newItems];
  localStorage.setItem(CONTENT_KEY, JSON.stringify(updatedItems));
  return newItems;
};

export const updateContentItem = (id: string, updates: Partial<ContentItem>): void => {
  const items = getContentItems();
  const index = items.findIndex((i) => i.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(CONTENT_KEY, JSON.stringify(items));
  }
};

export const deleteContentItem = (id: string): void => {
  const items = getContentItems();
  const filtered = items.filter((i) => i.id !== id);
  localStorage.setItem(CONTENT_KEY, JSON.stringify(filtered));
};
