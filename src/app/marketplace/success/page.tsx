'use client';
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CheckCircle, Download, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { marketplaceCatalog } from '@/lib/marketplaceData';

function SuccessContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams?.get('item_id');
  const emailed = searchParams?.get('emailed');
  
  const item = itemId ? marketplaceCatalog.find(i => i.id === itemId) ?? null : null;

  return (
    <div className="relative z-10">
      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
        <CheckCircle className="w-12 h-12 text-emerald-400" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Payment Successful!</h1>
      
      {item ? (
        <p className="text-xl text-gray-400 mb-8">
          Thank you for purchasing <strong className="text-white">{item.name}</strong>.{' '}
          {emailed === '1'
            ? 'Your download links are on their way to your email — check your inbox (and spam folder just in case).'
            : 'Your payment is confirmed. Download links will arrive by email as soon as your files are ready.'}
        </p>
      ) : (
        <p className="text-xl text-gray-400 mb-8">
          Thank you for your purchase. Your payment was successful.
        </p>
      )}

      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 mb-10 text-left">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-indigo-400" /> How to access your assets
        </h3>
        <ul className="space-y-4 text-gray-300">
          <li className="flex items-start">
            <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">1</span>
            <span>Head over to your <strong><Link href="/downloads" className="text-indigo-400 hover:underline">Downloads</Link></strong> page.</span>
          </li>
          <li className="flex items-start">
            <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">2</span>
            <span>
              You will find all your purchased digital assets listed securely in your account.
            </span>
          </li>
          <li className="flex items-start">
            <span className="bg-indigo-500/20 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">3</span>
            <span>
              Click the download button next to your items to save the high-quality files directly to your computer.
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/downloads" 
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
        >
          Go to Downloads <ArrowRight className="w-5 h-5" />
        </Link>
        <Link 
          href="/marketplace" 
          className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center"
        >
          Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

export default function MarketplaceSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Confetti / Glow effect background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/20 blur-[100px] pointer-events-none rounded-full" />
          
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 relative z-10">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
              <p className="text-xl text-gray-400">Loading your purchase details...</p>
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
