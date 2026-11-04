import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Beaker, Sparkles, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/labs'),
  alternates: { canonical: '/labs' },
  title: 'NexusCut Labs - Beta Features',
  description: 'Test bleeding-edge AI video editing features before they are released to the public.',
};

export default function LabsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <Beaker className="w-4 h-4" /> Experimental
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            NexusCut <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Labs</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Test bleeding-edge AI video features before they are released to the public. Exclusive to Creator+ and Agency plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">Live Beta</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Auto-B-Roll Engine</h3>
            <p className="text-gray-400 mb-6 max-w-md">Our AI analyzes your transcript and automatically inserts relevant B-Roll from our library of 10M+ assets. No manual searching required.</p>
            <Link href="/editor" className="inline-flex items-center text-green-400 font-bold group-hover:text-green-300">
              Try in Editor <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group opacity-75">
            <div className="absolute top-0 right-0 p-6">
              <span className="bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Coming Soon
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4">AI Voice Cloning</h3>
            <p className="text-gray-400 mb-6 max-w-md">Type your script and our TTS engine will generate the voiceover using a perfect clone of your own voice. Zero studio time needed.</p>
            <div className="inline-flex items-center text-gray-600 font-bold">
              Join Waitlist
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group opacity-75">
            <div className="absolute top-0 right-0 p-6">
              <span className="bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> In Development
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Multi-Language Dubbing</h3>
            <p className="text-gray-400 mb-6 max-w-md">Instantly translate and lip-sync your videos into Spanish, French, and German to reach a global audience effortlessly.</p>
            <div className="inline-flex items-center text-gray-600 font-bold">
              Join Waitlist
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-3xl p-8 relative flex flex-col justify-center items-center text-center">
            <Sparkles className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Have an idea?</h3>
            <p className="text-gray-400 mb-6">We build features based on creator feedback.</p>
            <a href="mailto:feedback@nexuscut.io" className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
              Submit Request
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
