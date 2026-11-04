import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const brandKit = await prisma.brandKit.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ brandKit });
  } catch (error) {
    console.error('Error fetching brand kit:', error);
    return NextResponse.json({ error: 'Failed to fetch brand kit' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    if (!['pro', 'agency'].includes(user.planTier)) {
      return NextResponse.json({ error: 'NexusCut Pro is required for the Brand Kit.' }, { status: 403 });
    }

    const { primaryColor, secondaryColor, fontUrl, logoUrl } = await req.json();
    const colorPattern = /^#[0-9a-f]{6}$/i;
    if (!colorPattern.test(primaryColor) || !colorPattern.test(secondaryColor)) {
      return NextResponse.json({ error: 'Brand colors must use six-digit hex values.' }, { status: 400 });
    }
    const validAssetUrl = (value: unknown) => {
      if (!value) return true;
      try { return new URL(String(value)).protocol === 'https:'; } catch { return false; }
    };
    if (!validAssetUrl(fontUrl) || !validAssetUrl(logoUrl)) {
      return NextResponse.json({ error: 'Brand font and logo URLs must use HTTPS.' }, { status: 400 });
    }

    const brandKit = await prisma.brandKit.upsert({
      where: { userId: user.id },
      update: {
        primaryColor,
        secondaryColor,
        fontUrl,
        logoUrl,
      },
      create: {
        userId: user.id,
        primaryColor,
        secondaryColor,
        fontUrl,
        logoUrl,
      },
    });

    return NextResponse.json({ brandKit });
  } catch (error) {
    console.error('Error updating brand kit:', error);
    return NextResponse.json({ error: 'Failed to update brand kit' }, { status: 500 });
  }
}
