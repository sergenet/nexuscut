import { MetadataRoute } from 'next';
import { getAllBlogSlugs, getBlogPostBySlug } from '@/lib/blogData';
import { academyLessons } from '@/lib/academyData';

// Publishing or scheduling a post from the admin panel changes which URLs
// exist, so the sitemap must re-render instead of freezing at build time.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'; // Replace with real domain

  const staticRoutes = [
    '',
    '/editor',
    '/pricing',
    '/pro',
    '/agency',
    '/video-repurposing-service',
    '/marketplace',
    '/affiliates',
    '/templates',
    '/brand',
    '/brand-kit',
    '/labs',
    '/compare/nexuscut-vs-nexusclips',
    '/tutorial',
    '/help',
    '/blog',
    '/academy',
    '/instagram-reels-editor',
    '/tiktok-video-editor',
    '/youtube-shorts-editor',
    '/creator-challenge',
    '/products/desktop',
    '/products/mobile',
    '/products/pad',
    '/terms',
    '/privacy',
    '/refund-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const toolRoutes = [
    '/tools/ai-image-generator',
    '/tools/animated-subtitles',
    '/tools/audio-studio',
    '/tools/auto-captions',
    '/tools/nexus-animate',
    '/tools/nexus-dream',
    '/tools/remove-background',
    '/tools/subtitle-style-generator',
    '/tools/tiktok-caption-generator',
    '/tools/video-effects',
    '/tools/viral-hook-generator',
    '/tools/youtube-shorts-maker',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Static posts resolve from the in-memory array; published Soro drafts hit
  // the database once per slug. Drafts that disappeared between the two calls
  // are simply omitted instead of emitting a URL that would 404.
  const blogSlugs = await getAllBlogSlugs();
  const blogRoutes = (
    await Promise.all(
      blogSlugs.map(async (slug) => {
        const post = await getBlogPostBySlug(slug);
        if (!post) return null;
        return {
          url: `${baseUrl}/blog/${slug}`,
          lastModified: post.publishedAt ?? post.importedAt,
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        };
      }),
    )
  ).flatMap((route) => (route ? [route] : []));

  const academyRoutes = academyLessons.map((lesson) => ({
    url: `${baseUrl}/academy/${lesson.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes, ...blogRoutes, ...academyRoutes];
}
