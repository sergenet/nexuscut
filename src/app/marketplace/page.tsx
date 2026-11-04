import React from 'react';
import { marketplaceCatalog } from '@/lib/marketplaceData';
import { AssetCard } from '@/components/Marketplace/AssetCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/marketplace'),
  alternates: { canonical: '/marketplace' },
  title: 'Marketplace - NexusCut Add-ons & Templates',
  description: 'Supercharge your editing workflow with premium caption styles, background packs, and viral templates. One-time purchases for lifelong access.',
};

export default function MarketplacePage() {
  const captionPacks = marketplaceCatalog.filter(i => i.type === 'caption_style');
  const backgroundPacks = marketplaceCatalog.filter(i => i.type === 'background_pack');
  const creatorKits = marketplaceCatalog.filter(i => i.type === 'effect');
  const subscriptions = marketplaceCatalog.filter(i => i.type === 'subscription');

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          The Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Marketplace</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Level up your edits with premium templates, dynamic captions, and satisfying backgrounds. One-time fee. Keep them forever.
        </p>
      </section>

      {/* Creator Toolkits Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Creator Toolkits</h2>
            <p className="text-gray-400 mt-2">Practical writing resources for planning stronger short-form videos.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creatorKits.map(item => (
            <AssetCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Caption Styles Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Caption Styles</h2>
            <p className="text-gray-400 mt-2">Instantly apply proven text animations to your videos.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {captionPacks.map(item => (
            <AssetCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Background Packs Section - rendered only once the catalog has items */}
      {backgroundPacks.length > 0 && (
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Split-Screen Backgrounds</h2>
            <p className="text-gray-400 mt-2">Retain attention with highly engaging bottom-half footage.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {backgroundPacks.map(item => (
            <AssetCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      )}

      {/* Subscriptions Section - rendered only once the catalog has items */}
      {subscriptions.length > 0 && (
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full mb-20 border-t border-gray-800 pt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-indigo-400">Premium Add-ons</h2>
            <p className="text-gray-400 mt-2">Unlock advanced AI capabilities for your account.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subscriptions.map(item => (
            <AssetCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
}
