import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, packId } = await req.json();

    if (!email || !packId) {
      return NextResponse.json(
        { error: "Email and packId are required" },
        { status: 400 }
      );
    }

    const source = `templates_${packId}`;

    await prisma.lead.upsert({
      where: {
        email_source: {
          email: email,
          source: source,
        },
      },
      update: {},
      create: {
        email: email,
        source: source,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Templates marketing route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
