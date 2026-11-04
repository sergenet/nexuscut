import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const { id, name, editorState } = body;

    // Upsert the user in our DB if they don't exist
    const serializedState = JSON.stringify(editorState);

    let project;
    if (id) {
      // Never allow a session to update a project owned by somebody else.
      const existing = await prisma.project.findFirst({ where: { id, userId: user.id } });
      if (!existing) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      project = await prisma.project.update({
        where: { id: id },
        data: {
          name: name || undefined,
          editorState: serializedState,
        },
      });
    } else {
      // Create new project
      project = await prisma.project.create({
        data: {
          name: name || "Untitled Project",
          editorState: serializedState,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    console.error("Save project error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save project' }, { status: 500 });
  }
}
