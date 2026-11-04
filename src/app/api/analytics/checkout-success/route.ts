import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getVerifiedUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getVerifiedUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Checkout reference is unavailable.' }, { status: 400 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-06-24.dahlia' });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const tier = session.metadata?.tier;
  if (session.client_reference_id !== user.clerkId || session.status !== 'complete' || session.mode !== 'subscription' || !tier || !['creator', 'pro', 'agency'].includes(tier) || !['paid', 'no_payment_required'].includes(session.payment_status)) {
    return NextResponse.json({ error: 'This checkout could not be verified.' }, { status: 403 });
  }
  if (tier === 'creator') {
    const invoiceId = typeof session.invoice === 'string' ? session.invoice : session.invoice?.id;
    if (session.payment_status !== 'paid' || !invoiceId) return NextResponse.json({ error: 'Payment confirmation is pending.' }, { status: 409 });
    return NextResponse.json({ verified: true, eventName: 'Subscribe', eventId: `paid_${invoiceId}`, tier,
      value: (session.amount_total || 0) / 100, currency: (session.currency || 'usd').toUpperCase() }, { headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ verified: true, eventName: 'StartTrial', eventId: `trial_${session.id}`, tier, value: tier === 'agency' ? 49 : 29, currency: 'USD' }, { headers: { 'Cache-Control': 'no-store' } });
}
