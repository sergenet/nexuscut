import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isOwnerRequest } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!await isOwnerRequest()) return NextResponse.redirect(new URL('/admin', request.url), 303);

  const formData = await request.formData();
  const feedUrl = String(formData.get('feedUrl') || '').trim();
  try {
    const url = new URL(feedUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'app.trysoro.com' || !url.pathname.startsWith('/api/rss/')) {
      throw new Error('Invalid Soro RSS URL');
    }
  } catch {
    return NextResponse.redirect(new URL('/admin?soro=invalid-feed', request.url), 303);
  }

  await prisma.soroFeedConfig.upsert({
    where: { id: 'primary' },
    create: { id: 'primary', feedUrl },
    update: { feedUrl },
  });
  return NextResponse.redirect(new URL('/admin?soro=feed-saved', request.url), 303);
}
