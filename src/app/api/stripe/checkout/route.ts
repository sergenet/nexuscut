import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-06-24.dahlia' as any,
});

export async function POST(req: Request) {
  try {
    const userId = "local-user";

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID || "price_1TnD7sFJK8JMTXAGmhhuuqLr",
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexuscut.io"}/editor?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexuscut.io"}/editor?canceled=true`,
      client_reference_id: userId,
      customer_email: "test@example.com",
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
