import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ToastViewport from "@/components/ToastViewport";
import { socialDefaults, twitterDefaults } from "@/lib/social";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export const metadata: Metadata = {
  // Resolve all relative metadata URLs against the one public domain.
  metadataBase: new URL('https://nexuscut.io'),
  title: "NexusCut - Next-Gen AI Video Editor for Creators",
  description: "Edit short-form video with an editable multitrack timeline, optional AI-assisted tools, and server-rendered MP4 export.",
  openGraph: {
    title: "NexusCut - Next-Gen AI Video Editor",
    description: "Create stunning videos with AI. The best editor for TikTok, Shorts, and Reels.",
    // No `url` here on purpose: a child route that declares its own
    // `openGraph` replaces this object, and one that omits `url` used to inherit
    // this homepage value - publishing the wrong canonical for 52 URLs.
    ...socialDefaults,
  },
  // No explicit title/description: Next.js derives both from each page's own
  // title and description, so a card is never generic while its og:title is not.
  twitter: {
    ...twitterDefaults,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NexusCut",
  "operatingSystem": "WebBrowser",
  "applicationCategory": "MultimediaApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Next-Gen AI Video Editor for vertical short-form content."
};

import { Suspense } from 'react';
import AffiliateTracker from '@/components/AffiliateTracker';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import CampaignAttribution from '@/components/CampaignAttribution';
import MetaPixel from '@/components/MetaPixel';
import CookieConsent from '@/components/CookieConsent';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- editor font choices are loaded globally by the App Router root layout. */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@400;700;900&family=Oswald:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;700;900&display=swap" rel="stylesheet" />
        {/* A plain <script> element, not next/script: next/script injects the tag
            on the client, so the served HTML contained no JSON-LD at all and any
            consumer that does not execute JavaScript (crawlers reading the
            response, search previews, answer engines) saw no structured data.
            This matches the pattern already used on /tools/auto-captions. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-950 text-white" suppressHydrationWarning>
        <GoogleAnalytics />
        <MetaPixel />
        <CampaignAttribution />
        <Suspense fallback={null}>
          <AffiliateTracker />
        </Suspense>
        <ToastViewport />
        <CookieConsent />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
