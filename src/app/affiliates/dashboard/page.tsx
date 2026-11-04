import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { DollarSign, Users, AlertCircle, Calendar, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Affiliate Dashboard - NexusCut',
  robots: { index: false, follow: false },
};

export default async function AffiliateDashboard() {
  // For MVP/Demo purposes since auth isn't fully wired, fetch the latest affiliate
  const affiliate = await prisma.affiliate.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      referrals: {
        include: {
          referredUser: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center font-sans">
        <Navigation />
        <main className="flex-grow flex flex-col items-center justify-center pt-32 pb-24 text-center px-4">
          <h1 className="text-3xl font-bold mb-4">You are not an affiliate yet</h1>
          <p className="text-neutral-400 mb-8 max-w-md">Join the NexusCut partner program to start earning 30% recurring commissions on every referral.</p>
          <Link href="/affiliates" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-lg font-bold transition-colors">
            Apply Now
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const totalEarnings = affiliate.referrals
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingBalance = affiliate.referrals
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const activeCustomers = affiliate.referrals.filter(r => r.status !== 'cancelled').length;
  const cancelledCustomers = affiliate.referrals.filter(r => r.status === 'cancelled').length;

  const progressPercentage = Math.min((pendingBalance / affiliate.payoutThreshold) * 100, 100);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Partner Dashboard</h1>
            <p className="text-neutral-400">Welcome back, {affiliate.payoutEmail}</p>
          </div>
          <div className="mt-4 md:mt-0 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
            <div>
              <p className="text-sm text-neutral-500 font-medium">Your Affiliate Link</p>
              <p className="text-indigo-400 font-mono text-sm">https://nexuscut.io/?via={affiliate.affiliateCode}</p>
            </div>
            <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
              <ArrowUpRight className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Payout Threshold Notice */}
        <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-indigo-100">Payout Threshold</h3>
              <p className="text-indigo-300 text-sm">You need a minimum of ${affiliate.payoutThreshold.toFixed(2)} in pending balances to receive a payout.</p>
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-indigo-300">${pendingBalance.toFixed(2)}</span>
              <span className="text-indigo-300">${affiliate.payoutThreshold.toFixed(2)}</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h3 className="text-neutral-400 font-medium">Total Paid</h3>
            </div>
            <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <h3 className="text-neutral-400 font-medium">Pending Balance</h3>
            </div>
            <p className="text-3xl font-bold">${pendingBalance.toFixed(2)}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-neutral-400 font-medium">Active Referrals</h3>
            </div>
            <p className="text-3xl font-bold">{activeCustomers}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-neutral-400 font-medium">Cancellations</h3>
            </div>
            <p className="text-3xl font-bold">{cancelledCustomers}</p>
          </div>
        </div>

        {/* Referrals List */}
        <h2 className="text-2xl font-bold mb-6">Recent Referrals</h2>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          {affiliate.referrals.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-950/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-neutral-400">Customer (Masked)</th>
                    <th className="px-6 py-4 text-sm font-medium text-neutral-400">Date Joined</th>
                    <th className="px-6 py-4 text-sm font-medium text-neutral-400">Amount</th>
                    <th className="px-6 py-4 text-sm font-medium text-neutral-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {affiliate.referrals.map((referral) => {
                    const isCancelled = referral.status === 'cancelled';
                    const emailParts = referral.referredUser?.email?.split('@') || ['user', 'domain.com'];
                    const maskedEmail = `${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;
                    
                    return (
                      <tr key={referral.id} className="hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium">{maskedEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-neutral-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(referral.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${referral.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {isCancelled ? (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 w-max px-3 py-1 rounded-full">
                              <XCircle className="w-4 h-4" />
                              Cancelled on {referral.cancelledAt ? new Date(referral.cancelledAt).toLocaleDateString() : 'N/A'}
                            </div>
                          ) : referral.status === 'paid' ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 w-max px-3 py-1 rounded-full">
                              <CheckCircle2 className="w-4 h-4" />
                              Paid
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 w-max px-3 py-1 rounded-full">
                              <AlertCircle className="w-4 h-4" />
                              Pending
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
