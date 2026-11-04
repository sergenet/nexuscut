import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashSessionId } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { Readable } from 'node:stream';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const clerkId = cookieStore.get('nexus_session_id')?.value;

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If an individual background pack is requested, also accept ownership of the all-access bundle
    const eligibleItemIds = [
      itemId,
      ...(itemId === 'bg-satisfying-loops' || itemId === 'bg-gameplay-loops' || itemId === 'bg-asmr' || itemId === 'bg-gta'
        ? ['bg-all-access-bundle']
        : []),
    ];

    const user = await prisma.user.findUnique({
      where: { clerkId: hashSessionId(clerkId) },
      include: {
        purchases: {
          where: {
            itemId: { in: eligibleItemIds },
          },
        },
      },
    });

    if (!user || user.purchases.length === 0) {
      return NextResponse.json({ error: 'Purchase not found or unauthorized' }, { status: 403 });
    }

    // Security: Map itemIds to actual filenames to prevent directory traversal
    const fileMap: Record<string, string> = {
      'bg-all-access-bundle': 'all_access_background_bundle.zip',
      'bg-satisfying-loops': 'asmr_backgrounds.zip',
      'bg-gameplay-loops': 'gta_backgrounds.zip',
      'cap-hormozi': 'hormozi_template.zip',
      'cap-creator-collection': 'caption_blueprint_collection.zip',
      'kit-hook-script': 'hook_script_toolkit.zip',
      'cap-abdaal': 'abdaal_template.zip',
      'bg-gta': 'gta_backgrounds.zip',
      'bg-asmr': 'asmr_backgrounds.zip',
      'addon-growth-mode': 'growth_mode_guide.pdf',
    };

    const filename = fileMap[itemId];
    if (!filename) {
      return NextResponse.json({ error: 'Asset not configured' }, { status: 404 });
    }

    // Serve from a secure non-public directory
    const filePath = path.join(process.cwd(), 'secure_assets', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    const stats = fs.statSync(filePath);
    const stream = Readable.toWeb(fs.createReadStream(filePath));

    return new Response(stream as ReadableStream, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': String(stats.size),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: unknown) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
