import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashSessionId } from '@/lib/auth';

/** Returns true only for the owner who completed the NexusCut magic-link flow. */
export async function isOwnerRequest() {
  const ownerEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const sessionId = (await cookies()).get('nexus_session_id')?.value;
  if (!ownerEmail || !sessionId) return false;

  const user = await prisma.user.findUnique({
    where: { clerkId: hashSessionId(sessionId) },
    select: { email: true },
  });

  return user?.email?.toLowerCase() === ownerEmail;
}
