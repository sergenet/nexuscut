import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isOwnerRequest } from '@/lib/adminAuth';
import { parseSoroRss } from '@/lib/soroRss';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!await isOwnerRequest()) return NextResponse.redirect(new URL('/admin', request.url), 303);

  const config = await prisma.soroFeedConfig.findUnique({ where: { id: 'primary' } });
  if (!config) return NextResponse.redirect(new URL('/admin?soro=missing-feed', request.url), 303);

  try {
    const response = await fetch(config.feedUrl, {
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml',
        // Some feed hosts reject Node's default undici user agent even though
        // the same private URL works in a browser.
        'User-Agent': 'NexusCut RSS draft importer/1.0',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Soro RSS returned ${response.status}`);
    const xml = await response.text();
    if (xml.length > 5 * 1024 * 1024) throw new Error('Soro RSS response is unexpectedly large');
    const items = parseSoroRss(xml);

    await Promise.all(items.map((item) => prisma.soroDraft.upsert({
      where: { sourceGuid: item.sourceGuid },
      create: item,
      update: {
        title: item.title,
        slug: item.slug,
        sourceUrl: item.sourceUrl,
        excerpt: item.excerpt,
        contentHtml: item.contentHtml,
        publishedAt: item.publishedAt,
      },
    })));

    return NextResponse.redirect(new URL(`/admin?soro=imported-${items.length}`, request.url), 303);
  } catch (error) {
    console.error('Soro RSS import failed:', error);
    const message = error instanceof Error ? error.message.replaceAll(config.feedUrl, '[private feed]').slice(0, 140) : 'Unknown error';
    return NextResponse.redirect(new URL(`/admin?soro=import-failed&detail=${encodeURIComponent(message)}`, request.url), 303);
  }
}
