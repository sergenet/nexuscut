import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/privacy'),
  title: 'Privacy Policy | NexusCut',
  description:
    'How NexusCut collects, uses and protects your information, including accounts, payments and analytics.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <Navigation />
      <main className="flex-grow pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-lg text-neutral-300">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes your name, email address, payment information, and video content you upload for editing.</p>
          
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of NexusCut. We also use it to communicate with you, process your transactions, and to detect and prevent fraud.</p>
          
          <h2>3. Information Sharing</h2>
          <p>We use service providers to operate specific features. Stripe processes payments. OpenAI processes text, audio, or transcript data when you request captions, text-to-speech, translations, hook suggestions, emoji suggestions, marketing drafts, or B-roll search suggestions. Pexels receives generated stock-search terms when you request B-roll. The prompt-based image page requests images from Pollinations, so your prompt and ordinary network request data are sent to that service. Do not submit confidential or sensitive material to an AI feature unless you are authorized to share it with the applicable provider.</p>
          <p>Uploaded media used for transcription, background removal, image-motion rendering, and video export is written to temporary server storage for processing. NexusCut attempts to remove temporary working files after processing, while completed export files remain temporarily available for download according to server cleanup operations.</p>
          
          <h2>4. Data Security</h2>
          <p>We use appropriate technical and organizational measures designed to protect the personal information we process about you.</p>

          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@nexuscut.io.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
