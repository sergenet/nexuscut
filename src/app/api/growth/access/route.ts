import { NextResponse } from 'next/server';
import { getVerifiedUser } from '@/lib/auth';

export async function GET() {
  const user = await getVerifiedUser();
  const allowed = Boolean(user?.isPro && ['pro', 'agency'].includes(user.planTier));
  if (!allowed) {
    return NextResponse.json({ error: 'Growth Mode is available on the Pro plan.' }, { status: 403 });
  }
  return NextResponse.json({ authenticated: true, planTier: user!.planTier }, { headers: { 'Cache-Control': 'no-store' } });
}
