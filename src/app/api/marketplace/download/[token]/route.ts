import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'node:stream';
import { FILES_DIR, verifyDownloadToken } from '@/lib/marketplaceDelivery';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const verified = verifyDownloadToken(decodeURIComponent(token));
  if (!verified) {
    return NextResponse.json(
      { error: 'This download link is invalid or has expired. Check your purchase email for a fresh link, or contact support.' },
      { status: 404 },
    );
  }

  const { file, filename } = verified;
  // ownerItem and filename both come from a directory listing (never from the
  // token), so this path cannot escape the files directory.
  const fullPath = path.join(FILES_DIR, file.ownerItem, filename);

  let stats: fs.Stats;
  try {
    stats = fs.statSync(fullPath);
  } catch {
    return NextResponse.json(
      { error: 'This product file is not available yet. Please contact support with your receipt.' },
      { status: 404 },
    );
  }

  const stream = Readable.toWeb(fs.createReadStream(fullPath));
  return new Response(stream as ReadableStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(stats.size),
      'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
      'Cache-Control': 'no-store',
    },
  });
}
