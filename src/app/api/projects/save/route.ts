import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const userId = "local-user"; // Hardcoded for no-auth

    const body = await req.json();
    const { id, name, editorState } = body;

    // Upsert the user in our DB if they don't exist
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });

    const serializedState = JSON.stringify(editorState);

    let project;
    if (id) {
      // Update existing project
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
  } catch (error: any) {
    console.error("Save project error:", error);
    return NextResponse.json({ error: error.message || 'Failed to save project' }, { status: 500 });
  }
}
