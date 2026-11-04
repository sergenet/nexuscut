import React from 'react';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashSessionId } from '@/lib/auth';
import { marketplaceCatalog } from '@/lib/marketplaceData';
import { Download, Package } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import RecoverPurchases from '@/components/RecoverPurchases';
import type { Purchase } from '@prisma/client';

export const metadata = {
  title: 'My Downloads - NexusCut',
  robots: { index: false, follow: false },
};

export default async function DownloadsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('nexus_session_id')?.value;
  
  let purchases: Purchase[] = [];
  
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: hashSessionId(userId) },
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (user) {
      purchases = user.purchases;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#39ff14] selection:text-black font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
          My <span className="text-[#39ff14]">Downloads</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-12 max-w-2xl">
          Access all your purchased marketplace assets here. Download high-resolution files and bundles directly to your device.
        </p>

        {purchases.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900/50 p-12 text-center flex flex-col items-center justify-center">
            <Package className="w-16 h-16 text-zinc-600 mb-6" />
            <h3 className="text-2xl font-bold mb-2">No purchases yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md">
              You haven't purchased any assets from the marketplace yet. Explore our collection of premium backgrounds and templates.
            </p>
            <Link 
              href="/marketplace"
              className="bg-white text-black px-6 py-3 font-bold hover:bg-[#39ff14] transition-colors"
            >
              Browse Marketplace
            </Link>
            
            <RecoverPurchases />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => {
              const item = marketplaceCatalog.find(i => i.id === purchase.itemId);
              
              if (!item) return null;
              
              return (
                <div key={purchase.id} className="border border-zinc-800 bg-zinc-900 flex flex-col group hover:border-[#39ff14]/50 transition-colors">
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                    <img 
                      src={item.previewUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#39ff14] backdrop-blur-sm">
                      {item.type.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <p className="text-zinc-400 text-sm mb-6 flex-grow">{item.description}</p>
                    
                    <a 
                      href={`/api/downloads?itemId=${item.id}`}
                      className="w-full bg-[#39ff14] text-black font-bold py-3 px-4 flex items-center justify-center gap-2 hover:bg-white transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Assets
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
