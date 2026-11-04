import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getVerifiedUser } from '@/lib/auth';
import { parseAttributionCookie, stripeAttributionMetadata, type CampaignAttribution } from '@/lib/attribution';
import prisma from '@/lib/prisma';
import { sendMetaConversion } from '@/lib/metaConversions';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in the environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-06-24.dahlia',
  });
};

async function trackCheckoutStarted({
  sessionId,
  user,
  tier,
  attribution,
}: {
  sessionId: string;
  user: { id: string; email: string | null };
  tier: 'creator' | 'pro' | 'agency';
  attribution: CampaignAttribution;
}) {
  const externalEventId = `checkout_${sessionId}`;
  const value = tier === 'agency' ? 49 : tier === 'pro' ? 29 : 12;
  try {
    await prisma.conversionEvent.upsert({
      where: { externalEventId },
      update: {},
      create: {
        externalEventId,
        eventName: 'InitiateCheckout',
        userId: user.id,
        visitorId: attribution.visitorId,
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
        value,
      },
    });
    await sendMetaConversion({
      eventName: 'InitiateCheckout',
      eventId: externalEventId,
      email: user.email,
      sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/pro`,
      value,
    });
  } catch (error) {
    // Tracking must never prevent a customer from reaching Stripe.
    console.error('InitiateCheckout tracking failed:', error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedTier = searchParams.get('plan') || 'creator';
    const tier = requestedTier === 'agency' ? 'agency' : requestedTier === 'pro' ? 'pro' : 'creator';
    
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required before checkout' }, { status: 401 });
    const cookieStore = await cookies();
    const userId = user.clerkId;
    const affiliateCode = cookieStore.get('nexuscut_affiliate')?.value;
    const attribution = parseAttributionCookie(cookieStore.get('nexus_attribution')?.value);

    // The existing $12 price remains the Creator plan during the transition.
    // Pro intentionally uses a separate price ID so it can never accidentally
    // charge the Creator amount.
    const creatorPriceId = process.env.STRIPE_CREATOR_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    const proPriceId = process.env.STRIPE_PRO_PLUS_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID;
    const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID;
    const priceId = tier === 'agency' ? agencyPriceId : tier === 'pro' ? proPriceId : creatorPriceId;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    const stripe = getStripe();
    // Never create a second subscription for an existing paid member. Stripe's
    // customer portal is the safe place to change or cancel their plan.
    if (user.isPro && user.stripeCustomerId) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/pricing`,
      });
      return NextResponse.redirect(portal.url);
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      ...((tier === 'pro' || tier === 'agency') && {
        subscription_data: { trial_period_days: 7 },
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexuscut.io"}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexuscut.io"}/pro?checkout=cancelled`,
      client_reference_id: userId,
      customer_email: user.email || undefined,
      metadata: { 
        tier,
        ...stripeAttributionMetadata(attribution),
        ...(affiliateCode && { affiliate_code: affiliateCode }) 
      }
    });

    await trackCheckoutStarted({ sessionId: session.id, user, tier, attribution });

    return NextResponse.redirect(session.url as string);
  } catch (error: unknown) {
    console.error('Stripe checkout GET error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) return NextResponse.json({ error: 'Sign in required before checkout' }, { status: 401 });
    const cookieStore = await cookies();
    const userId = user.clerkId;

    // Read affiliate code from cookies
    const affiliateCode = cookieStore.get('nexuscut_affiliate')?.value;
    const attribution = parseAttributionCookie(cookieStore.get('nexus_attribution')?.value);

    const body = await req.json().catch(() => ({}));
    const tier = body.tier === 'agency' ? 'agency' : body.tier === 'pro' ? 'pro' : 'creator';
    const creatorPriceId = process.env.STRIPE_CREATOR_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    const proPriceId = process.env.STRIPE_PRO_PLUS_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID;
    const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID;
    const priceId = tier === 'agency' ? agencyPriceId : tier === 'pro' ? proPriceId : creatorPriceId;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    const stripe = getStripe();
    if (user.isPro && user.stripeCustomerId) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/pricing`,
      });
      return NextResponse.json({ url: portal.url });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      ...((tier === 'pro' || tier === 'agency') && {
        subscription_data: { trial_period_days: 7 },
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexuscut.io"}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://nexuscut.io"}/pro?checkout=cancelled`,
      client_reference_id: userId,
      customer_email: user.email || undefined,
      metadata: { 
        tier,
        ...stripeAttributionMetadata(attribution),
        ...(affiliateCode && { affiliate_code: affiliateCode }) 
      }
    });

    await trackCheckoutStarted({ sessionId: session.id, user, tier, attribution });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 });
  }
}
