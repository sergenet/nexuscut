'use client';

import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { Campaign } from '@/types';
import { Plus } from 'lucide-react';

export default function CampaignsPage() {
  const { campaigns, addCampaign } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Campaigns
        </h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isFormOpen ? 'Cancel' : 'New Campaign'}
        </button>
      </div>

      {isFormOpen && (
        <CampaignForm
          onSave={(data) => {
            addCampaign(data);
            setIsFormOpen(false);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => (
          <div key={camp.id} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold">{camp.name}</h2>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                {new Date(camp.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              <span className="font-semibold text-slate-900 dark:text-slate-200">Product:</span> {camp.product}
              <br/>
              <span className="font-semibold text-slate-900 dark:text-slate-200">Goal:</span> {camp.contentGoal}
            </p>
            <div className="text-sm">
              <p><span className="font-semibold">Audience:</span> {camp.targetAudience}</p>
              <p><span className="font-semibold">Voice:</span> {camp.brandVoice}</p>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && !isFormOpen && (
          <p className="text-slate-500">No campaigns found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
}

function CampaignForm({ onSave }: { onSave: (data: Omit<Campaign, 'id' | 'createdAt'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    targetAudience: '',
    problem: '',
    benefit: '',
    callToAction: '',
    offerUrl: '',
    brandVoice: '',
    contentGoal: 'awareness'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Create Campaign Brief</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Campaign Name" name="name" value={formData.name} onChange={handleChange} required />
        <FormInput label="Product/Feature" name="product" value={formData.product} onChange={handleChange} required />
        <FormInput label="Target Audience" name="targetAudience" value={formData.targetAudience} onChange={handleChange} required />
        <FormInput label="Main Problem Solved" name="problem" value={formData.problem} onChange={handleChange} required />
        <FormInput label="Main Benefit" name="benefit" value={formData.benefit} onChange={handleChange} required />
        <FormInput label="Call to Action" name="callToAction" value={formData.callToAction} onChange={handleChange} required />
        <FormInput label="Offer/Landing URL" name="offerUrl" value={formData.offerUrl} onChange={handleChange} type="url" required />
        <FormInput label="Brand Voice" name="brandVoice" value={formData.brandVoice} onChange={handleChange} required />
        
        <div>
          <label className="block text-sm font-medium mb-1">Content Goal</label>
          <select
            name="contentGoal"
            value={formData.contentGoal}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="awareness">Awareness</option>
            <option value="signups">Signups</option>
            <option value="trial users">Trial Users</option>
            <option value="upgrades">Upgrades</option>
            <option value="sales">Sales</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          Save Campaign
        </button>
      </div>
    </form>
  );
}

function FormInput({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
        {...props}
      />
    </div>
  );
}
