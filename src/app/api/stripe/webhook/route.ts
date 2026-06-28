import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-06-24.dahlia',
});

// Since we are running locally, we can bypass webhook signature verification or use a secret if provided.
// For Phase 4, we'll just check the event type for simplicity or verify if STRIPE_WEBHOOK_SECRET is available.

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.client_reference_id;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (clerkId) {
        await prisma.user.update({
          where: { clerkId },
          data: { 
            isPro: true,
            ...(stripeCustomerId && { stripeCustomerId })
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook payload parsing error:', err);
    return NextResponse.json({ error: 'Webhook payload error' }, { status: 400 });
  }
}
