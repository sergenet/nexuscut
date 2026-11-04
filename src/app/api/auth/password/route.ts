import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireVerifiedUser } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser();
    const body = await request.json().catch(() => null) as { password?: string } | null;
    const password = body?.password || '';
    if (password.length < 10 || password.length > 128) {
      return NextResponse.json({ error: 'Use a password between 10 and 128 characters.' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Verify your email before setting a password.' }, { status: 401 });
    }
    console.error('Set password error:', error);
    return NextResponse.json({ error: 'Password could not be saved.' }, { status: 500 });
  }
}
