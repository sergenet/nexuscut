import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, product } = await req.json();

    if (!email || !product) {
      return NextResponse.json(
        { error: "Email and product are required" },
        { status: 400 }
      );
    }

    // Upsert so if they try to join again with the same email, it just updates or ignores it without throwing a unique constraint error
    const entry = await prisma.waitlistEntry.upsert({
      where: {
        email: email,
      },
      update: {
        product: product, // Update product if they sign up for a different one
      },
      create: {
        email,
        product,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
