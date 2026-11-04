import crypto from 'crypto';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { hashSessionId } from '@/lib/auth';
import { checkGuestLimit, incrementGuestUsage } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() || '';
  const password = body?.password || '';
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

  // Password attempts are throttled per IP and per device so the login form
  // cannot be brute-forced. Failures consume the budget; successes do not.
  const limitCheck = await checkGuestLimit(request, 8, 'login');
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many sign-in attempts. Please wait a few minutes and try again.' }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false;
  if (!user || !valid) {
    await incrementGuestUsage(request, 'login');
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }

  const sessionId = crypto.randomUUID();
  await prisma.user.update({ where: { id: user.id }, data: { clerkId: hashSessionId(sessionId) } });
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'nexus_session_id', value: sessionId, httpOnly: true,
    secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
