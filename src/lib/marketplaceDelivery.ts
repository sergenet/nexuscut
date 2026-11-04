import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Purchased files live OUTSIDE public/ so they are only ever served by the
 * signed download route. Each product has its own subfolder; the folder name
 * is the catalog item id.
 */
export const FILES_DIR =
  process.env.MARKETPLACE_FILES_DIR || path.join(process.cwd(), 'marketplace-files');

/** Bundle products grant access to the files of their member products. */
const BUNDLE_MEMBERS: Record<string, string[]> = {
  'bg-all-access-bundle': ['bg-satisfying-loops', 'bg-gameplay-loops'],
};

export type DownloadFile = { ownerItem: string; file: string };

/** Every downloadable file a purchased item grants access to. */
export function filesForItem(itemId: string): DownloadFile[] {
  const owners = BUNDLE_MEMBERS[itemId] ?? [itemId];
  return owners.flatMap((owner) => {
    const dir = path.join(FILES_DIR, owner);
    let names: string[];
    try {
      names = fs.readdirSync(dir);
    } catch {
      return [];
    }
    return names
      .filter((name) => !name.startsWith('.'))
      .sort()
      .map((file) => ({ ownerItem: owner, file }));
  });
}

/**
 * Download tokens are HMAC-signed so links cannot be forged or edited, and
 * they expire. The signing key is derived from the Stripe secret, which only
 * the server ever sees — no new environment variable is required.
 */
function signingKey(): Buffer {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('STRIPE_SECRET_KEY is not configured');
  return crypto.createHash('sha256').update(`marketplace-download:${secret}`).digest();
}

function sign(grantItemId: string, fileIndex: number, expires: number): string {
  return crypto
    .createHmac('sha256', signingKey())
    .update(`${grantItemId}.${fileIndex}.${expires}`)
    .digest('hex');
}

/** Default validity window for delivered download links. */
export const LINK_TTL_SECONDS = 30 * 24 * 60 * 60;

export function createDownloadToken(grantItemId: string, fileIndex: number): string {
  const expires = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  return `${grantItemId}.${fileIndex}.${expires}.${sign(grantItemId, fileIndex, expires)}`;
}

export function verifyDownloadToken(
  token: string,
): { file: DownloadFile; filename: string } | null {
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [grantItemId, indexRaw, expiresRaw, signature] = parts;
  const fileIndex = Number(indexRaw);
  const expires = Number(expiresRaw);
  if (!Number.isInteger(fileIndex) || !Number.isFinite(expires)) return null;
  if (expires < Math.floor(Date.now() / 1000)) return null;

  const expected = sign(grantItemId, fileIndex, expires);
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const files = filesForItem(grantItemId);
  const file = files[fileIndex];
  if (!file) return null;
  return { file, filename: file.file };
}
