import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RateLimitEntry = { count: number; resetAt: number };
const apiRateLimits = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60_000;

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(request: NextRequest) {
  const isExpensive = /\/api\/(?:auth\/login|b-roll|pipeline|magic-clip|translate|tts|create-base|animate-image|export|smart-tools)/.test(request.nextUrl.pathname);
  const limit = isExpensive ? 10 : 120;
  const key = `${isExpensive ? 'expensive' : 'api'}:${getClientIp(request)}`;
  const now = Date.now();
  const existing = apiRateLimits.get(key);
  if (!existing || now >= existing.resetAt) {
    apiRateLimits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  existing.count += 1;
  return existing.count > limit;
}

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/') && isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  const response = NextResponse.next();
  if (!request.cookies.get('nexus_session_id')) {
    response.cookies.set({
      name: 'nexus_session_id',
      value: crypto.randomUUID(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/export|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
