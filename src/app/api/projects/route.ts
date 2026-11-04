import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, updatedAt: true }
    });

    return NextResponse.json({ projects });
  } catch (error: unknown) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const { name, editorState } = body;

    // Check if we want to create a new project or overwrite an existing one by name
    const existing = await prisma.project.findFirst({
      where: { userId: user.id, name }
    });

    let project;
    if (existing) {
      project = await prisma.project.update({
        where: { id: existing.id },
        data: { editorState: JSON.stringify(editorState) }
      });
    } else {
      project = await prisma.project.create({
        data: {
          name: name || "Untitled Project",
          editorState: JSON.stringify(editorState),
          userId: user.id
        }
      });
    }

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (error: unknown) {
    console.error("Save project error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save project' }, { status: 500 });
  }
}
