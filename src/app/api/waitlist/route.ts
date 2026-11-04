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

    // Check if email is already on the waitlist for THIS specific product
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { 
        email_product: {
          email,
          product
        }
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: `You are already on the waitlist for ${product}!` },
        { status: 409 }
      );
    }

    // Create new entry
    const entry = await prisma.waitlistEntry.create({
      data: {
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
