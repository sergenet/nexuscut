import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Download, CheckCircle2 } from 'lucide-react';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/brand'),
  alternates: { canonical: '/brand' },
  title: 'Brand Assets - NexusCut',
  description: 'Download the official NexusCut logos, brand colors, and usage guidelines.',
};

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            Brand <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Assets</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Everything you need to talk about NexusCut. Download logos, screenshots, and review our brand guidelines.
          </p>
          <a href="/NexusCut-Brand-Kit.zip" download className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg">
            <Download className="w-5 h-5" /> Download Full Brand Kit (.ZIP)
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="h-24 bg-indigo-500 rounded-xl mb-4 shadow-lg shadow-indigo-500/20"></div>
                <p className="font-bold">Nexus Indigo</p>
                <p className="text-sm text-gray-400">#6366f1</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="h-24 bg-blue-500 rounded-xl mb-4 shadow-lg shadow-blue-500/20"></div>
                <p className="font-bold">Creator Blue</p>
                <p className="text-sm text-gray-400">#3b82f6</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="h-24 bg-gray-950 border border-gray-800 rounded-xl mb-4"></div>
                <p className="font-bold">Studio Dark</p>
                <p className="text-sm text-gray-400">#030712</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="h-24 bg-white rounded-xl mb-4"></div>
                <p className="font-bold">Text White</p>
                <p className="text-sm text-gray-400">#ffffff</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Usage Guidelines</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 h-full">
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold">Do use our official logo</h4>
                    <p className="text-sm text-gray-400">Use the vector files provided in the brand kit. Do not alter the proportions.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <h4 className="font-bold">Do leave breathing room</h4>
                    <p className="text-sm text-gray-400">Ensure the logo has adequate padding around it so it stands out clearly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 shrink-0 flex items-center justify-center font-bold text-xs">X</div>
                  <div>
                    <h4 className="font-bold">Don't change the colors</h4>
                    <p className="text-sm text-gray-400">Please stick to the approved brand colors. Do not apply filters or drop shadows to the logo.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
