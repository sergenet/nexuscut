'use client';
import { toast } from '@/lib/toast';
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { DollarSign, Users, Link as LinkIcon, ArrowRight, BarChart3, X, Mail, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function AffiliatesPage() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [affiliateCode, setAffiliateCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !channelUrl) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, channelUrl })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.code) {
          setAffiliateCode(data.code);
        }
        setSubmitted(true);
      } else {
        toast('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans flex flex-col relative">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold tracking-wide uppercase mb-6">
            <DollarSign className="w-4 h-4" /> Partner Program
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">30% Recurring</span> Commissions
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Join the NexusCut Affiliate Program and get paid for every creator you refer. Earn monthly recurring revenue for the lifetime of their subscription.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/25"
            >
              Apply Now
            </button>
            <Link href="/affiliates/dashboard" className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* How it Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LinkIcon className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">1. Get Your Link</h3>
            <p className="text-gray-400">Sign up and get a unique tracking link and custom promo code for your audience.</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">2. Share with Creators</h3>
            <p className="text-gray-400">Promote NexusCut in your videos, newsletters, or courses using our provided Brand Kit.</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">3. Earn Monthly</h3>
            <p className="text-gray-400">Get paid 30% of their subscription fee every single month for as long as they stay subscribed.</p>
          </div>
        </div>

        {/* Brand Kit Promo */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:mr-8 text-left">
            <h2 className="text-3xl font-bold mb-4">Need assets to promote?</h2>
            <p className="text-gray-400 max-w-lg">
              Download our official Brand Kit. It includes high-res logos, UI mockups, talking points, and email swipe copy to make promoting NexusCut effortless.
            </p>
          </div>
          <Link href="/brand" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-2">
            View Brand Kit <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      <Footer />

      {/* Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowModal(false); setSubmitted(false); setEmail(''); setChannelUrl(''); setAffiliateCode(''); }}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Partner Application</h2>
              <p className="text-gray-400">Tell us a bit about your audience and we'll get you set up with a partner link.</p>
            </div>

            {submitted ? (
              <div className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">You're Approved!</h3>
                <p className="text-gray-300 mb-4">Your application was automatically approved. Here is your unique affiliate link. Anyone who signs up through this link will earn you a 30% lifetime commission.</p>
                {affiliateCode && (
                  <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
                    <code className="text-emerald-400 text-sm">https://nexuscut.io/?ref={affiliateCode}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`https://nexuscut.io/?ref=${affiliateCode}`)}
                      className="text-gray-400 hover:text-white text-sm bg-gray-800 px-3 py-1 rounded-md"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PlayCircle className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="url"
                    required
                    placeholder="YouTube or TikTok Link"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email || !channelUrl}
                  className="w-full mt-2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
