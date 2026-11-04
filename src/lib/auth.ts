import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

/**
 * Session cookies stay raw in the browser but are stored hashed, so a database
 * leak cannot be replayed as a live session. This must stay byte-identical to
 * the hashing used by the export route.
 */
export function hashSessionId(sessionId: string): string {
  return crypto.createHash('sha256').update(sessionId).digest('hex');
}

/** A user is authenticated only after completing an emailed magic link. */
export async function getVerifiedUser() {
  const sessionId = (await cookies()).get('nexus_session_id')?.value;
  if (!sessionId) return null;

  const user = await prisma.user.findUnique({ where: { clerkId: hashSessionId(sessionId) } });
  return user?.email ? user : null;
}

export async function requireVerifiedUser() {
  const user = await getVerifiedUser();
  if (!user) throw new Error('AUTH_REQUIRED');
  return user;
}
