'use client';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { MarketplaceItem } from '@/lib/marketplaceData';

export const AssetCard = ({ item }: { item: MarketplaceItem }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout-addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          name: item.name,
          price: item.price
        })
      });
      const data = await res.json();
      if (data.url) {
        setLoading(false);
        window.location.href = data.url;
      } else if (res.status === 401) {
        // Purchases are tied to an account so delivery emails reach the buyer.
        // Send them to sign-in instead of a dead-end error.
        router.push('/account?returnTo=' + encodeURIComponent('/marketplace'));
      } else {
        console.error('Checkout failed:', data.error);
        toast('Checkout could not start. Please try again in a moment.');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      toast('Checkout could not start. Please try again in a moment.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-blue-500 group">
      <div className="h-48 bg-gray-900 relative overflow-hidden flex items-center justify-center">        {item.previewUrl ? (
          <img 
            src={item.previewUrl} 
            alt={`${item.name} preview`}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // No artwork yet: show a clean placeholder instead of a broken image.
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-gray-900 to-indigo-700/30 flex items-center justify-center">
            <svg className="w-14 h-14 text-blue-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <div className="absolute top-4 right-4 z-20 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          ${item.price}{item.type === 'subscription' ? '/mo' : ''}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{item.name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
        <ul className="mb-6 space-y-2">
          {item.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-300">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        {item.type === 'subscription' ? (
          // Plans are billed through Stripe on /pricing, never as one-time
          // marketplace add-ons, so these cards link instead of checking out.
          <Link
            href="/pricing"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <span>View plan</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        ) : (
          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <span>{loading ? 'Processing...' : 'Buy Now'}</span>
            {!loading && (
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
