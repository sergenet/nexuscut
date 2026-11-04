'use client';

import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { generateContent } from '@/lib/generator';
import { useRouter } from 'next/navigation';

export default function GeneratorPage() {
  const { campaigns, addContentItems } = useAppContext();
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!selectedCampaignId) return;
    const campaign = campaigns.find(c => c.id === selectedCampaignId);
    if (!campaign) return;

    setIsGenerating(true);
    try {
      const newItems = await generateContent(campaign);
      addContentItems(newItems);
      router.push('/library');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-10">
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Content Generator
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Select a campaign to automatically generate 30 days of draft content across all platforms.
        </p>

        <div className="text-left space-y-2 max-w-md mx-auto">
          <label className="block text-sm font-medium">Select Campaign</label>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isGenerating || campaigns.length === 0}
          >
            {campaigns.length === 0 ? (
              <option value="">No campaigns available</option>
            ) : (
              campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedCampaignId}
          className="w-full max-w-md mx-auto bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-medium py-3 rounded-lg shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <span className="animate-pulse">Generating Content...</span>
          ) : (
            'Generate 30-Day Calendar'
          )}
        </button>
      </div>
    </div>
  );
}
