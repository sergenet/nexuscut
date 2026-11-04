import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getVerifiedUser } from '@/lib/auth';
import { marketplaceCatalog } from '@/lib/marketplaceData';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in the environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-06-24.dahlia',
  });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId } = body;
    
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required before checkout' }, { status: 401 });
    const userId = user.clerkId;


    if (!itemId) return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    const item = marketplaceCatalog.find(catalogItem => catalogItem.id === itemId);
    if (!item) return NextResponse.json({ error: 'Marketplace item not found' }, { status: 404 });

    // Convert decimal price (e.g. 9.99) to cents (999)
    const unitAmount = Math.round(item.price * 100);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: `NexusCut Marketplace: ${item.name}`,
              // You can add an image array here if you want the product image to show in checkout
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment, not subscription
      payment_intent_data: {
        statement_descriptor: 'NEXUSCUT', // Must be 22 chars max and contain no special characters like < > \ ' " *
      },
      // Stripe returns the buyer to the fulfillment route, which confirms the
      // payment server-side, records the sale, and emails signed download
      // links before redirecting to the success page.
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/marketplace/fulfill?session_id={CHECKOUT_SESSION_ID}&item_id=${itemId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/marketplace`,
      client_reference_id: userId,
      metadata: { itemId }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe addon checkout error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 });
  }
}
