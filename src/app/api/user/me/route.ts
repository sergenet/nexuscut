import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const userId = "local-user"; // Hardcoded for no-auth

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });

    return NextResponse.json({ isPro: user.isPro });
  } catch (error: any) {
    console.error("User me error:", error);
    return NextResponse.json({ isPro: false });
  }
}
