import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['ffmpeg-static'],
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Keep nested local tools (such as Marketing Studio) out of this app's
  // TypeScript/build graph and deployment bundle.
  turbopack: { root: projectRoot },
  experimental: {
    workerThreads: false,
    cpus: 1,
    memoryBasedWorkersCount: true,
    serverActions: { bodySizeLimit: '250mb' },
  },
  // Two thin legacy posts (97 and 90 words) were retired when long-form guides
  // replaced them on the same subjects. Both URLs have been in the sitemap since
  // June, so they are redirected permanently rather than left to 404 — either
  // way the inbound link equity lands on the replacement.
  async redirects() {
    return [
      { source: '/blog/watch-time-optimization', destination: '/blog/vanity-metrics-vs-real-signals', permanent: true },
      { source: '/blog/retention-tricks', destination: '/blog/read-a-retention-graph', permanent: true },
      // Four short posts duplicated the caption and vertical-video guides.
      // Google reads near-duplicate thin pages as low-value content, so they
      // 301 into the full guide that now covers the same ground.
      { source: '/blog/make-viral-tiktok-subtitles', destination: '/blog/caption-readability-guide', permanent: true },
      { source: '/blog/animated-captions-watch-time', destination: '/blog/caption-readability-guide', permanent: true },
      { source: '/blog/word-by-word-captions', destination: '/blog/caption-readability-guide', permanent: true },
      { source: '/blog/create-engaging-reels-ai', destination: '/blog/edit-vertical-videos-reels', permanent: true },
    ];
  },
  async headers() {
    // React's development build reconstructs callstacks with eval, so `next dev`
    // throws "eval() is not supported" against the production policy. Add it for
    // the dev server only: production builds are compiled with this branch
    // false, so the shipped CSP still forbids eval.
    const devEval = process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'";
    return [
      {
        source: '/:path*',
        headers: [
        // Google AdSense needs its script, ad-frame and beacon hosts allowed or
        // the loader is silently blocked. facebook.com is in frame-src and
        // form-action because the Meta pixel sends its /tr/ beacon as a form
        // POST and opens a hidden frame; without both, every event was dropped.
        // img-src/style-src/font-src already
        // allow every https host, so only script-src, frame-src and connect-src
        // are widened, and only to Google-owned hosts. 'unsafe-eval' is still
        // not permitted: AdSense does not require it.
        { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://www.facebook.com; img-src 'self' blob: data: https:; media-src 'self' blob: data: https:; font-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.pexels.com https://*.stripe.com https://*.google-analytics.com https://analytics.google.com https://www.facebook.com https://fundingchoicesmessages.google.com https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net https://*.adtrafficquality.google https://*.google.com https://www.gstatic.com; script-src 'self' 'unsafe-inline'${devEval} https://js.stripe.com https://www.googletagmanager.com https://connect.facebook.net https://fundingchoicesmessages.google.com https://*.googlesyndication.com https://*.googleadservices.com https://www.googletagservices.com https://adservice.google.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.gstatic.com; style-src 'self' 'unsafe-inline' https:; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://fundingchoicesmessages.google.com https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net https://*.google.com https://*.adtrafficquality.google https://www.gstatic.com https://www.facebook.com` },
        // Recording is an intentional editor feature.  Keep these APIs unavailable
        // to embedded third-party pages, but allow this HTTPS origin to request them.
        { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(), browsing-topics=()' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'Link', value: '<https://nexuscut.io/:path*>; rel="canonical"' },
        ],
      },
      // A catch-all parameter is not expanded for the root route, so give the
      // homepage its explicit canonical URL.
      {
        source: '/',
        headers: [{ key: 'Link', value: '<https://nexuscut.io/>; rel="canonical"' }],
      },
    ];
  },
};

export default nextConfig;
