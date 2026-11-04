import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isOwnerRequest } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const ALLOWED = ['published', 'draft', 'archived'];

export async function POST(request: Request) {
  if (!(await isOwnerRequest())) {
    return NextResponse.redirect(new URL('/admin', request.url), 303);
  }

  // The dashboard submits a regular HTML form, so this arrives as
  // application/x-www-form-urlencoded — not JSON.
  const formData = await request.formData().catch(() => null);
  const id = String(formData?.get('id') ?? '').trim();
  const status = String(formData?.get('status') ?? '').trim();

  if (!id) {
    return NextResponse.redirect(new URL('/admin', request.url), 303);
  }

  if (!ALLOWED.includes(status)) {
    return NextResponse.redirect(new URL('/admin', request.url), 303);
  }

  try {
    await prisma.soroDraft.update({
      where: { id },
      data: { status },
    });
  } catch {
    // Unknown id — send the owner back to the list rather than 500-ing.
  }

  return NextResponse.redirect(new URL('/admin', request.url), 303);
}
