import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const userId = "local-user"; // Hardcoded for no-auth

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ projects: [] });
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true }
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
