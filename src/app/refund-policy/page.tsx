import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/refund-policy'),
  alternates: { canonical: '/refund-policy' },
  title: 'Cancellation and Refund Policy - NexusCut',
  description: 'Read the official cancellation and refund policy for NexusCut.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 font-sans flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-32 pb-24 px-4 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Cancellation and Refund Policy</h1>
        <p className="text-gray-400 mb-12"><strong>Last Updated:</strong> July 25, 2026</p>

        <div className="prose prose-invert max-w-none prose-indigo">
          <p>
            Thank you for choosing NexusCut. We are committed to providing you with the best AI video editing tools. We understand that circumstances may change, and this policy outlines your rights regarding subscription cancellations and refunds.
          </p>

          <hr className="my-8 border-gray-800" />

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Subscription Cancellation</h2>
          <p>
            You can cancel your NexusCut Premium subscription at any time. We believe in complete transparency and do not lock our users into hidden contracts.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>How to Cancel:</strong> You can cancel your subscription directly from your Account Dashboard by navigating to <strong>Settings &gt; Billing &gt; Cancel Subscription</strong>, or by using the Customer Portal link provided in your invoice emails.</li>
            <li><strong>Access After Cancellation:</strong> Upon cancellation, you will continue to have full access to your Premium features until the end of your current paid billing cycle.</li>
            <li><strong>Auto-Renewal:</strong> If you cancel before your renewal date, you will not be charged for the following billing cycle. Once your billing cycle ends, your account will automatically revert to the Free tier.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Refund Policy</h2>
          <p>
            Due to the nature of our product (which involves high computing costs for AI generation and video rendering), our refund policy is strictly enforced to prevent abuse.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>7-Day Money-Back Guarantee:</strong> If you are a first-time subscriber to a Premium plan and are not satisfied with the service, you may request a full refund within <strong>seven (7) days</strong> of your initial purchase, provided you have not exceeded the fair usage limit of AI generations or video exports.</li>
            <li><strong>After 7 Days:</strong> No refunds will be issued for requests made more than 7 days after the initial purchase date.</li>
            <li><strong>Renewals:</strong> We do not offer refunds for automatic subscription renewals. It is your responsibility to cancel your subscription prior to the renewal date if you do not wish to be charged. We send a reminder email 3 days before any annual subscription renews.</li>
            <li><strong>Partial Months:</strong> We do not offer prorated refunds for mid-cycle cancellations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Exceptions</h2>
          <p>
            We reserve the right to deny refund requests in cases of:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>TOS Violations:</strong> If your account was suspended or terminated due to a violation of our Terms of Service (e.g., generating illegal content or abusing the API).</li>
            <li><strong>Abuse:</strong> If we detect a pattern of purchasing, utilizing extensive computing resources, and requesting refunds across multiple accounts.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. How to Request a Refund</h2>
          <p>
            To request a refund within your eligible 7-day window, please contact our support team at <strong>support@nexuscut.io</strong> with the subject line "Refund Request." Please include your account email address and the reason for your request.
          </p>
          <p>
            Refunds are processed to the original payment method and typically take 3-5 business days to appear on your statement.
          </p>

          <hr className="my-8 border-gray-800" />
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 italic text-sm">
            <p className="mb-0">
              <strong>Note:</strong> This policy is subject to change. Any modifications will be updated on this page and effective immediately. By continuing to use NexusCut, you agree to this policy.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
