import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Check } from 'lucide-react';
import { socialFor } from '@/lib/social';

const creatorCheckoutReady = Boolean(
  process.env.STRIPE_CREATOR_PRICE_ID ||
  process.env.STRIPE_PRO_PRICE_ID ||
  process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID ||
  process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
);
const proCheckoutReady = Boolean(
  process.env.STRIPE_PRO_PLUS_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID,
);
const agencyCheckoutReady = Boolean(process.env.STRIPE_AGENCY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID);

export const metadata = {
  openGraph: socialFor('/pricing'),
  alternates: { canonical: '/pricing' },
  title: 'Pricing - NexusCut',
  description: 'Simple pricing. Powerful results. Choose the plan that fits your creator journey.',
};

const plans = [
  {
    id: 'free-tier',
    name: 'Free',
    price: '$0',
    description: 'Perfect for new creators',
    features: [
      'Web Video Editor Access',
      'Standard Auto-Captions',
      'Fast exports at 540p',
      'High-quality exports up to 720p',
      '10 Exports / Month',
      'No watermark',
    ],
    cta: 'Start Free',
    href: '/editor',
    popular: false,
  },
  {
    id: 'creator-tier',
    name: 'Creator',
    price: '$12',
    period: '/mo',
    description: 'For consistent content creators',
    features: [
      'Everything in Free',
      'Unlimited 1080p Exports',
      'Access to all standard editor tools',
      'Standard export queue',
      'Priority access to new creator features',
    ],
    cta: 'Choose Creator',
    href: '/account?returnTo=%2Fapi%2Fstripe%2Fcheckout%3Fplan%3Dcreator',
    available: creatorCheckoutReady,
    popular: true,
  },
  {
    id: 'pro-tier',
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For creators publishing at a serious pace',
    features: [
      'Everything in Creator',
      'Growth Mode: scored hooks, pacing, vertical edit, and Retention Focus captions',
      'Nexus ScriptCut: edit video by deleting transcript words',
      'Filler-word and repeated-phrase suggestions',
      'Priority export queue',
      'Brand Kit: caption colors, custom font, and logo watermark',
    ],
    cta: 'Start 7-Day Pro Trial',
    href: '/pro',
    available: proCheckoutReady,
    popular: false,
  },
  {
    id: 'agency-tier', name: 'Agency', price: '$49', period: '/mo',
    description: 'For freelancers and small client studios',
    features: ['Everything in Pro', 'Five switchable client Brand Kits', 'Agency-priority export queue', 'Commercial client-use rights', 'Client-specific colors, fonts, and optional logos'],
    cta: 'Start 7-Day Agency Trial', href: '/account?returnTo=%2Fapi%2Fstripe%2Fcheckout%3Fplan%3Dagency', available: agencyCheckoutReady, popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Simple pricing. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Powerful results.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free. Upgrade for unlimited full-HD exports when you are ready to publish more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              id={plan.id}
              className={`relative bg-gray-900 border rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-105 z-10' 
                  : 'border-gray-700 hover:border-gray-500 hover:shadow-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold py-1.5 px-6 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
              <p className="text-gray-400 mb-6 text-sm min-h-[40px] leading-relaxed">{plan.description}</p>
              
              <div className="mb-6 flex items-baseline">
                <span className="text-5xl font-extrabold text-white tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-gray-400 font-medium ml-1">{plan.period}</span>}
              </div>

              {plan.available === false ? (
                <div className="w-full py-4 rounded-xl font-bold text-center mb-8 bg-gray-800/70 text-gray-500 border border-gray-700 cursor-not-allowed">
                  Plan opening soon
                </div>
              ) : (
                <a 
                  href={plan.href} 
                  className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-300 mb-8 flex items-center justify-center gap-2 ${
                    plan.popular 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105' 
                      : 'bg-gray-800 hover:bg-white text-gray-300 hover:text-black border border-gray-700 hover:border-white shadow-lg hover:scale-105'
                  }`}
                >
                  {plan.cta}
                </a>
              )}

              <div className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start text-sm">
                      <div className={`mt-0.5 shrink-0 mr-3 rounded-full p-1 ${plan.popular ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-gray-300 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto text-left space-y-4">
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                What does Agency add beyond Pro?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">Agency is for a freelancer or small client studio operating one NexusCut account. It includes five switchable client Brand Kits, client-use rights, and the highest export-queue priority. It does not currently include team seats or a shared workspace.</p>
            </details>
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                How does the Pro trial work?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">New Pro subscribers receive full Pro access free for 7 days. Stripe collects a payment method at signup, but billing does not begin until the trial ends. Cancel before the end of the trial to avoid the $29 monthly charge.</p>
            </details>
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                What is the difference between Creator and Pro?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">Creator begins at $12/month with no trial and includes unlimited 1080p exports, all standard editor tools, and the standard export queue. Pro includes a 7-day trial, then costs $29/month, and adds Growth Mode for scored hook selection, conservative dead-air tightening, and Retention Focus captions; Nexus ScriptCut for transcript-based editing; filler-word and repeated-phrase suggestions; priority export processing; and Brand Kit styling with an optional logo watermark. Both paid plans export at up to 1080p.</p>
            </details>
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                How does the free plan work?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">You can export up to 10 videos each month. Fast exports are 540p; High quality exports are available up to 720p. Free exports do not include a watermark.</p>
            </details>
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                Can I cancel anytime?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">Absolutely. There are no contracts or hidden fees. Open My Account and use the billing controls to cancel at any time. Cancel a Pro trial before its seventh day ends to avoid the first monthly charge.</p>
            </details>
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                Do you support team accounts?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">Not yet. Agency supports one account holder managing multiple client Brand Kits, but it does not include additional seats or a shared collaborative workspace.</p>
            </details>
            <details className="group bg-gray-900 border border-gray-800 rounded-lg p-6 open:border-indigo-500 transition-colors cursor-pointer">
              <summary className="font-bold text-lg marker:content-none flex justify-between items-center outline-none">
                Do you offer discounts?
                <span className="text-indigo-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-400 text-sm mt-4">We occasionally offer promotional discounts. Join our newsletter to stay updated. We also offer a 7-day refund policy if you aren't satisfied.</p>
            </details>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
