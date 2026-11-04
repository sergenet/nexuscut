import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { hashSessionId } from '@/lib/auth';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured in the environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-06-24.dahlia',
  });
};

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('nexus_session_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: hashSessionId(userId) },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/editor`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe portal error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Stripe portal failed' }, { status: 500 });
  }
}
