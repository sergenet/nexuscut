import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { socialFor } from '@/lib/social';

export const metadata = {
  openGraph: socialFor('/terms'),
  title: 'Terms of Service | NexusCut',
  description:
    'The terms and conditions that govern use of the NexusCut website, video editor and subscription plans.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <Navigation />
      <main className="flex-grow pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-lg text-neutral-300">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2>1. Introduction</h2>
          <p>Welcome to NexusCut. By accessing our website and using our video editing services, you agree to be bound by these Terms of Service.</p>
          
          <h2>2. Use License</h2>
          <p>You may use NexusCut and your exported videos for personal or commercial purposes subject to your subscription plan and these Terms. You may not copy, resell, sublicense, or provide access to the NexusCut software itself.</p>

          <h2>2.1 Agency Client Work</h2>
          <p>An active Agency subscription permits the account holder to create and export videos for their own clients. Each Agency account is for one account holder and does not include team seats or a shared collaborative workspace. You remain responsible for securing all rights required for client media, logos, fonts, music, and other uploaded material.</p>
          
          <h2>3. User Content</h2>
          <p>You retain all your ownership rights in your User Content. However, by submitting User Content to NexusCut, you hereby grant NexusCut a worldwide, non-exclusive, royalty-free, sublicenseable and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with the Service.</p>

          <h2>3.1 Marketplace Assets</h2>
          <p>Marketplace purchases grant the purchaser a non-exclusive, non-transferable license to use the downloaded assets in personal and commercial video projects, including client projects. The source files may not be redistributed, shared, sublicensed, or resold as standalone assets. Marketplace purchases are one-time purchases and do not change your NexusCut subscription tier.</p>

          <h2>4. Disclaimer</h2>
          <p>The materials on NexusCut's website are provided on an 'as is' basis. NexusCut makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
