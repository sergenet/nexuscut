'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Briefcase, Lock, Palette, Upload, Type, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BrandKitPage() {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [logoUrl, setLogoUrl] = useState('');
  const [fontUrl, setFontUrl] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAuth() {
      try {
        const userRes = await fetch('/api/user/me');
        const userData = await userRes.json();
        const hasBrandKit = userData.planTier === 'pro' || userData.planTier === 'agency';
        setIsPro(hasBrandKit);

        if (hasBrandKit) {
          const brandRes = await fetch('/api/brand-kit');
          const brandData = await brandRes.json();
          if (brandData.brandKit) {
            setPrimaryColor(brandData.brandKit.primaryColor || '#4f46e5');
            setSecondaryColor(brandData.brandKit.secondaryColor || '#10b981');
            setLogoUrl(brandData.brandKit.logoUrl || '');
            setFontUrl(brandData.brandKit.fontUrl || '');
          }
        }
      } catch (e) {
        console.error('Failed to load brand kit data', e);
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/brand-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryColor, secondaryColor, logoUrl, fontUrl }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save Brand Kit.');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save Brand Kit.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
            <Briefcase className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">B2B Brand Kit</h1>
            <p className="text-gray-400">Manage your company's visual identity across all projects.</p>
          </div>
        </div>

        {!isPro ? (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <Lock className="w-16 h-16 text-amber-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Unlock the Brand Kit</h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 text-lg">
              Upgrade to Pro to apply saved caption colors and typography across projects and add your logo watermark to previews and exports.
            </p>
            <Link href="/pricing" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:-translate-y-1">
              Upgrade to Pro Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-100">Saved colors and typography are applied to captions. The secondary color highlights Retention Focus words. Your saved logo remains off by default; enable it in Export settings to choose its position, size, and opacity.</div>
            {/* Colors */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold">Brand Colors</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Primary Color</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                    <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 flex-grow font-mono focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                    <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 flex-grow font-mono focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Type className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold">Custom Typography</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Provide a direct URL to your company's font file (.ttf, .otf, .woff).</p>
              <input 
                type="text" 
                placeholder="https://your-domain.com/fonts/bold.ttf" 
                value={fontUrl} 
                onChange={(e) => setFontUrl(e.target.value)} 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Logo */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-5 h-5 text-pink-400" />
                <h2 className="text-xl font-bold">Company Logo / Watermark</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Provide a direct URL to your logo (transparent PNG recommended).</p>
              <input 
                type="text" 
                placeholder="https://your-domain.com/logo.png" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)} 
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-pink-500 mb-4"
              />
              {logoUrl && (
                <div className="mt-4 p-4 bg-gray-950 rounded-xl border border-gray-800 flex items-center justify-center">
                  <img src={logoUrl} alt="Brand Logo Preview" className="max-h-24 object-contain" />
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              {error && <p className="mr-auto self-center text-sm font-semibold text-rose-300">{error}</p>}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-full transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (saved ? <CheckCircle2 className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />)}
                {saving ? 'Saving...' : (saved ? 'Saved!' : 'Save Brand Kit')}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
