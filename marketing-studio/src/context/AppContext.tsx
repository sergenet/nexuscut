'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Campaign, ContentItem } from '@/types';
import { getCampaigns, getContentItems, saveCampaign, saveContentItems, updateCampaign, updateContentItem, deleteContentItem } from '@/lib/storage';

interface AppContextType {
  campaigns: Campaign[];
  contentItems: ContentItem[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
  editCampaign: (id: string, updates: Partial<Campaign>) => void;
  addContentItems: (items: Omit<ContentItem, 'id' | 'createdAt'>[]) => void;
  editContentItem: (id: string, updates: Partial<ContentItem>) => void;
  removeContentItem: (id: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  const refreshData = () => {
    let currentCampaigns = getCampaigns();
    
    // Seed initial campaign if empty
    if (currentCampaigns.length === 0 && typeof window !== 'undefined' && !localStorage.getItem('nexuscut_seeded')) {
      const seedCampaign = {
        name: 'Creator Challenge',
        product: 'NexusCut',
        targetAudience: 'solo short-form creators and podcasters',
        problem: 'editing, captions, and exports take too long across multiple tools',
        benefit: 'record, edit, caption, and export in one browser',
        callToAction: 'Start the free Creator Challenge',
        offerUrl: 'https://nexuscut.io/creator-challenge',
        brandVoice: 'clear, confident, creator-friendly, never hype-filled',
        contentGoal: 'awareness'
      };
      saveCampaign(seedCampaign);
      localStorage.setItem('nexuscut_seeded', 'true');
      currentCampaigns = getCampaigns();
    }

    setCampaigns(currentCampaigns);
    setContentItems(getContentItems());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt'>) => {
    saveCampaign(campaign);
    refreshData();
  };

  const editCampaign = (id: string, updates: Partial<Campaign>) => {
    updateCampaign(id, updates);
    refreshData();
  };

  const addContentItems = (items: Omit<ContentItem, 'id' | 'createdAt'>[]) => {
    saveContentItems(items);
    refreshData();
  };

  const editContentItem = (id: string, updates: Partial<ContentItem>) => {
    updateContentItem(id, updates);
    refreshData();
  };

  const removeContentItem = (id: string) => {
    deleteContentItem(id);
    refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        campaigns,
        contentItems,
        addCampaign,
        editCampaign,
        addContentItems,
        editContentItem,
        removeContentItem,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
