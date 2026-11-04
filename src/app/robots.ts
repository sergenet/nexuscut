import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/downloads',
        '/account',
        '/admin',
        '/affiliates/dashboard',
        '/pro/success',
        '/marketplace/success',
        '/api/',
      ],
    },
    sitemap: 'https://nexuscut.io/sitemap.xml',
  };
}
