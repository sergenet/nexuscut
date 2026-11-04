import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

/**
 * Guest usage counters roll over every day. They used to accumulate for the
 * lifetime of the row, which silently turned "3 per day" into "3 ever" for
 * every IP and device fingerprint.
 */
const USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;

const withinWindow = (lastUsedAt: Date | null | undefined): boolean =>
  Boolean(lastUsedAt && Date.now() - lastUsedAt.getTime() < USAGE_WINDOW_MS);

/**
 * The real client IP is the LAST entry in X-Forwarded-For when the site proxy
 * appends to the incoming chain. Earlier entries can be forged by the caller.
 */
function clientIp(req: NextRequest | Request): string {
  const raw = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : 'unknown';
}

/**
 * Scope keeps different limits independent (e.g. 'ai' for generation tools,
 * 'login' for password attempts) so one counter can never starve another.
 */
export async function checkGuestLimit(req: NextRequest | Request, maxLimit: number = 3, scope: string = 'ai'): Promise<{ allowed: boolean, error?: string }> {
  try {
    const ip = clientIp(req);
    const fingerprint = req.headers.get('x-device-fingerprint') || 'unknown';

    // Check IP
    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      const ipUsage = await prisma.guestUsage.upsert({
        where: { identifier: `${scope}:IP:${ip}` },
        update: {},
        create: { identifier: `${scope}:IP:${ip}`, type: 'IP' }
      });
      if (withinWindow(ipUsage.lastUsedAt) && ipUsage.usageCount >= maxLimit) {
        return { allowed: false, error: 'IP address usage limit reached.' };
      }
    }

    // Check Fingerprint
    if (fingerprint !== 'unknown') {
      const fpUsage = await prisma.guestUsage.upsert({
        where: { identifier: `${scope}:FP:${fingerprint}` },
        update: {},
        create: { identifier: `${scope}:FP:${fingerprint}`, type: 'FINGERPRINT' }
      });
      if (withinWindow(fpUsage.lastUsedAt) && fpUsage.usageCount >= maxLimit) {
        return { allowed: false, error: 'Device usage limit reached.' };
      }
    }

    return { allowed: true };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    // If the DB fails, fail open to not break the app for everyone.
    // (Export uploads have an additional in-memory IP throttle that does not
    // depend on the database.)
    return { allowed: true };
  }
}

export async function incrementGuestUsage(req: NextRequest | Request, scope: string = 'ai') {
  try {
    const ip = clientIp(req);
    const fingerprint = req.headers.get('x-device-fingerprint') || 'unknown';

    // A stale row starts a fresh window instead of counting forever.
    if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
      const identifier = `${scope}:IP:${ip}`;
      const row = await prisma.guestUsage.findUnique({ where: { identifier } });
      if (!row) {
        await prisma.guestUsage.create({ data: { identifier, type: 'IP', usageCount: 1, lastUsedAt: new Date() } });
      } else if (withinWindow(row.lastUsedAt)) {
        await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
      } else {
        await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: 1, lastUsedAt: new Date() } });
      }
    }

    if (fingerprint !== 'unknown') {
      const identifier = `${scope}:FP:${fingerprint}`;
      const row = await prisma.guestUsage.findUnique({ where: { identifier } });
      if (!row) {
        await prisma.guestUsage.create({ data: { identifier, type: 'FINGERPRINT', usageCount: 1, lastUsedAt: new Date() } });
      } else if (withinWindow(row.lastUsedAt)) {
        await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: { increment: 1 }, lastUsedAt: new Date() } });
      } else {
        await prisma.guestUsage.update({ where: { identifier }, data: { usageCount: 1, lastUsedAt: new Date() } });
      }
    }
  } catch (err) {
    console.error("Failed to increment usage:", err);
  }
}
