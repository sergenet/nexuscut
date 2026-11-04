import { NextResponse } from 'next/server';
import { getVerifiedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { authenticated: false, email: null, isPro: false, planTier: 'free' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json({
      authenticated: true,
      email: user.email,
      isPro: user.isPro,
      planTier: user.isPro ? user.planTier : 'free',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: unknown) {
    console.error("User me error:", error);
    return NextResponse.json(
      { authenticated: false, email: null, isPro: false, planTier: 'free' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
