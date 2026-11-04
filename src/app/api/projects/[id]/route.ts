import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id: id },
    });

    if (!project || project.userId !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: unknown) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: 'Failed to load project' }, { status: 500 });
  }
}
