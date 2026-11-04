import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { hashSessionId } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const requestedReturn = searchParams.get('returnTo');
    const returnTo = requestedReturn?.startsWith('/') && !requestedReturn.startsWith('//')
      ? requestedReturn
      : '/account';

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/marketplace?error=missing_token`);
    }

    // 1. Validate token
    const magicLink = await prisma.magicLink.findUnique({
      where: { token }
    });

    if (!magicLink) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/marketplace?error=invalid_token`);
    }

    if (new Date() > magicLink.expiresAt) {
      await prisma.magicLink.delete({ where: { id: magicLink.id } });
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/marketplace?error=expired_token`);
    }

    // 2. Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: magicLink.email }
    });

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/marketplace?error=user_not_found`);
    }

    // 3. Give this browser a fresh session when it verifies the account.
    // Reusing a pre-login anonymous session could leave the browser attached
    // to an old free-tier record even after a successful email sign-in.
    const verifiedSessionId = crypto.randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { clerkId: hashSessionId(verifiedSessionId) }
    });

    // 4. Clean up token
    await prisma.magicLink.delete({
      where: { id: magicLink.id }
    });

    // 5. Redirect to downloads with the verified account session.
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}${returnTo}`);
    response.cookies.set({
      name: 'nexus_session_id', value: verifiedSessionId, httpOnly: true,
      secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
    });
    return response;

  } catch (error: unknown) {
    console.error('Verify error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/marketplace?error=server_error`);
  }
}
