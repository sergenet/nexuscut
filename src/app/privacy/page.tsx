import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/privacy'),
  title: 'Privacy Policy | NexusCut',
  description:
    'How NexusCut collects, uses and protects your information, including accounts, payments, analytics and advertising, and how to control cookies.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <Navigation />
      <main className="flex-grow pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-lg text-neutral-300">
          {/* A fixed date. This used to render `new Date()`, so the policy claimed
              to have been updated every single day it was viewed. */}
          <p>Last updated: 6 November 2026</p>
          <p>This policy covers the NexusCut website at nexuscut.io, the browser editor, and the advertising and analytics services described below. It explains what we collect, why, and how you can control it.</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, payment information, and video content you upload for editing.</p>
          
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of NexusCut. We also use it to communicate with you, process your transactions, and to detect and prevent fraud.</p>
          
          <h2>3. Information Sharing</h2>
          <p>We use service providers to operate specific features. Stripe processes payments. OpenAI processes text, audio, or transcript data when you request captions, text-to-speech, translations, hook suggestions, emoji suggestions, marketing drafts, or B-roll search suggestions. Pexels receives generated stock-search terms when you request B-roll. The prompt-based image page requests images from Pollinations, so your prompt and ordinary network request data are sent to that service. Do not submit confidential or sensitive material to an AI feature unless you are authorized to share it with the applicable provider.</p>
          <p>Uploaded media used for transcription, background removal, image-motion rendering, and video export is written to temporary server storage for processing. NexusCut attempts to remove temporary working files after processing, while completed export files remain temporarily available for download according to server cleanup operations.</p>
          
          <h2>4. Cookies and Analytics</h2>
          <p>We set one first-party cookie, <code>nexus_session_id</code>, so the editor can keep your work and export allowance attached to you between visits. It holds a random identifier, not your email address.</p>
          <p>With your permission we also load Google Analytics 4 and a Meta advertising pixel. They set their own cookies and tell us which pages are used and which campaigns brought people here. Neither one loads, and neither sets a cookie, until you choose Accept in the banner. If you Decline, the editor works exactly the same and only the measurement is switched off.</p>
          <p>You can change your choice at any time with the <strong>Cookie settings</strong> link in the footer, or by clearing this site&apos;s storage in your browser.</p>

          <h2>5. Advertising</h2>
          <p>NexusCut is supported by advertising. When ads are shown, they are served by Google AdSense. Google and its advertising partners may use cookies, including the DoubleClick cookie, and similar identifiers to serve ads based on your visits to this and other websites, and to measure how those ads perform.</p>
          <p>The advertising script does not load, and no advertising cookie is set, until you choose Accept in our consent banner. If you Decline, you still see the site exactly as intended; the ads are simply not personalised. On pages that carry an ad slot, a non-personalised placeholder may be shown instead.</p>
          <p>You can control advertising cookies independently of this site:</p>
          <ul>
            <li>Google&apos;s own controls and opt-out for personalised advertising: <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">adssettings.google.com</a></li>
            <li>Industry-wide opt-out for participating vendors: <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">aboutads.info/choices</a></li>
            <li>Network Advertising Initiative opt-out: <a href="https://optout.networkadvertising.org/" rel="noopener noreferrer" target="_blank">optout.networkadvertising.org</a></li>
          </ul>
          <p>Opting out of personalised advertising does not remove ads; it makes them less relevant. You can read how Google uses information from sites that use its services at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer" target="_blank">policies.google.com/technologies/partner-sites</a>.</p>

          <h2>6. Your Rights</h2>
          <p>Depending on where you live, you may have the right to access the personal information we hold about you, to correct it, to delete it, to receive a portable copy, to object to certain processing, and to withdraw consent you have already given. Withdrawing consent for analytics or advertising takes effect immediately and can be done at any time with the <strong>Cookie settings</strong> link in the footer.</p>
          <p>We do not sell personal information, and we do not share it for cross-context behavioural advertising except when you have accepted advertising cookies. To exercise any of these rights, email us and we will respond within the period required by applicable law.</p>

          <h2>7. Data Security</h2>
          <p>We use appropriate technical and organizational measures designed to protect the personal information we process about you.</p>

          <h2>8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@nexuscut.io, or through the <a href="/contact">contact page</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
