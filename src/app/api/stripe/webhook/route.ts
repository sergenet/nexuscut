import { NextResponse } from 'next/server';
import Stripe from 'stripe';
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

function tierFromSubscription(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const proPriceId = process.env.STRIPE_PRO_PLUS_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID;
  const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID;
  if (priceId === agencyPriceId) return 'agency';
  return priceId === proPriceId ? 'pro' : 'creator';
}

function subscriptionHasPaidAccess(subscription: Stripe.Subscription) {
  return subscription.status === 'active' || subscription.status === 'trialing';
}

function invoiceHasNexusCutPrice(invoice: Stripe.Invoice) {
  const prices = new Set([
    process.env.STRIPE_CREATOR_PRICE_ID, process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_PRO_PLUS_PRICE_ID, process.env.STRIPE_AGENCY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID, process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID, process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID,
  ].filter(Boolean));
  return invoice.lines?.data.some(line => {
    // The live webhook's older API version uses line.price; newer versions use pricing.
    const legacy = line as typeof line & { price?: { id: string } };
    const price = line.pricing?.price_details?.price;
    return prices.has(legacy.price?.id || (typeof price === 'string' ? price : price?.id));
  }) || false;
}

async function recordSubscriptionRefund(refundId: string) {
  const stripe = getStripe();
  // Read current state instead of trusting a delayed pending/failed event snapshot.
  const refund = await stripe.refunds.retrieve(refundId);
  const chargeId = typeof refund.charge === 'string' ? refund.charge : refund.charge?.id;
  if (!chargeId) return;
  const charge = await stripe.charges.retrieve(chargeId);
  const legacy = charge as typeof charge & { invoice?: string | { id: string } | null };
  let invoiceId = typeof legacy.invoice === 'string' ? legacy.invoice : legacy.invoice?.id;
  if (!invoiceId) {
    const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntent) return;
    const payments = await stripe.invoicePayments.list({ payment: { type: 'payment_intent', payment_intent: paymentIntent }, limit: 2 });
    if (!payments.data.length) return; // A non-invoice payment, not subscription revenue.
    if (payments.has_more || payments.data.length !== 1) throw Error('Ambiguous refund invoice');
    const invoice = payments.data[0].invoice;
    invoiceId = typeof invoice === 'string' ? invoice : invoice.id;
  }
  const paid = await prisma.conversionEvent.findUnique({ where: { externalEventId: `paid_${invoiceId}` } });
  if (!paid || paid.eventName !== 'Subscribe') {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    if (invoiceHasNexusCutPrice(invoice)) throw Error('Refund awaits its paid invoice');
    return; // Ignore other businesses sharing the Stripe account.
  }
  // A refund is an adjustment, not a cancellation or a new paid conversion.
  const value = refund.status === 'succeeded' ? -refund.amount / 100 : 0;
  const currency = refund.currency.toUpperCase();
  await prisma.conversionEvent.upsert({
    where: { externalEventId: `refund_${refund.id}` },
    update: { value, currency },
    create: {
      externalEventId: `refund_${refund.id}`, eventName: 'Refund', userId: paid.userId,
      visitorId: paid.visitorId, source: paid.source, medium: paid.medium,
      campaign: paid.campaign, content: paid.content, value, currency,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === 'production' && !webhookSecret) {
      console.error('Stripe webhook rejected: STRIPE_WEBHOOK_SECRET is not configured.');
      return NextResponse.json({ error: 'Webhook verification is not configured' }, { status: 503 });
    }

    let event;

    if (webhookSecret) {
      const stripe = getStripe();
      try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid signature';
        console.error(`Webhook Error: ${message}`);
        return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
      }
    } else {
      // Unsigned fixtures are accepted only for local development.
      event = JSON.parse(body);
    }

    // A correctly signed event must still belong to this environment. Never let
    // a sandbox event alter live accounts (or a live event enter a test DB).
    const apiKey = process.env.STRIPE_SECRET_KEY || '';
    const expectedLiveMode = /^(?:sk|rk)_live_/.test(apiKey) ? true
      : /^(?:sk|rk)_test_/.test(apiKey) ? false : undefined;
    if (expectedLiveMode !== undefined && event.livemode !== expectedLiveMode) {
      return NextResponse.json({ error: 'Webhook environment mismatch' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.client_reference_id;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      // Checkouts created before Creator/Pro existed were the original $12
      // subscription, so treat any missing tier as Creator rather than
      // accidentally granting the newer Pro-only benefits.
      const tier = session.metadata?.tier === 'agency' ? 'agency' : session.metadata?.tier === 'pro' ? 'pro' : 'creator';
      const affiliateCode = session.metadata?.affiliate_code;

      const itemId = session.metadata?.itemId;
      const customerEmail = session.customer_details?.email || session.customer_email;

      if (clerkId) {
        let user;

        if (customerEmail) {
          // Look for an existing user with this email
          user = await prisma.user.findUnique({
            where: { email: customerEmail }
          });

          if (user) {
            // Check if they are purchasing on a new browser session
            if (user.clerkId !== clerkId) {
              // We could optionally update the clerkId to instantly grant access to this browser
              // But doing so might "log out" their other browser. For a guest session app, it's usually fine
              // to just bind the session to the new browser.
              user = await prisma.user.update({
                where: { id: user.id },
                data: { 
                  clerkId: clerkId,
                  ...(stripeCustomerId && { stripeCustomerId })
                }
              });
            }
          } else {
            // Look for existing user with this clerkId (the current browser session)
            user = await prisma.user.findUnique({
              where: { clerkId }
            });

            if (user) {
              // Add the email to their existing guest account
              user = await prisma.user.update({
                where: { id: user.id },
                data: { 
                  email: customerEmail,
                  ...(stripeCustomerId && { stripeCustomerId })
                }
              });
            } else {
              // Create brand new user
              user = await prisma.user.create({
                data: { 
                  clerkId, 
                  email: customerEmail,
                  ...(stripeCustomerId && { stripeCustomerId })
                }
              });
            }
          }
        } else {
          // Fallback if Stripe didn't capture email
          user = await prisma.user.upsert({
            where: { clerkId },
            update: { ...(stripeCustomerId && { stripeCustomerId }) },
            create: { clerkId, ...(stripeCustomerId && { stripeCustomerId }) }
          });
        }

        // Existing email + unchanged login ID previously skipped this link.
        // Invoice and cancellation handlers locate the account by this ID.
        if (stripeCustomerId && user.stripeCustomerId !== stripeCustomerId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId },
          });
        }

        if (itemId) {
          // This is a marketplace item purchase
          const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
          await prisma.purchase.upsert({
            where: {
              userId_itemId: {
                userId: user.id,
                itemId: itemId
              }
            },
            update: { amount: amountPaid },
            create: {
              userId: user.id,
              itemId: itemId,
              amount: amountPaid
            }
          });
        } else {
          // This is a subscription purchase
          user = await prisma.user.update({
            where: { clerkId },
            data: { 
              isPro: true,
              planTier: tier,
              ...((tier === 'pro' || tier === 'agency') && { trialStartedAt: new Date() }),
              ...(session.metadata?.visitor_id && { attributionVisitorId: session.metadata.visitor_id }),
              ...(session.metadata?.utm_source && { attributionSource: session.metadata.utm_source }),
              ...(session.metadata?.utm_medium && { attributionMedium: session.metadata.utm_medium }),
              ...(session.metadata?.utm_campaign && { attributionCampaign: session.metadata.utm_campaign }),
              ...(session.metadata?.utm_content && { attributionContent: session.metadata.utm_content }),
              ...(session.metadata?.utm_term && { attributionTerm: session.metadata.utm_term }),
              ...(affiliateCode && { referredByCode: affiliateCode })
            },
          });

          if (tier === 'pro' || tier === 'agency') {
            const externalEventId = `trial_${session.id}`;
            await prisma.conversionEvent.upsert({
              where: { externalEventId }, update: {},
              create: {
                externalEventId, eventName: 'StartTrial', userId: user.id,
                visitorId: session.metadata?.visitor_id,
                source: session.metadata?.utm_source, medium: session.metadata?.utm_medium,
                campaign: session.metadata?.utm_campaign, content: session.metadata?.utm_content,
                value: tier === 'agency' ? 49 : 29,
              },
            });
            await sendMetaConversion({
              eventName: 'StartTrial', eventId: externalEventId, email: customerEmail,
              sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/pro/success`, value: tier === 'agency' ? 49 : 29,
            });
          }
        }

        if (affiliateCode) {
          const affiliate = await prisma.affiliate.findUnique({
            where: { affiliateCode }
          });

          if (affiliate) {
            // Check if referral already exists to prevent duplicates for this user
            const existingReferral = await prisma.referral.findUnique({
              where: { referredUserId: user.id }
            });

            if (!existingReferral) {
              const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
              const commissionAmount = amountPaid * affiliate.commissionRate;

              await prisma.referral.create({
                data: {
                  affiliateId: affiliate.id,
                  referredUserId: user.id,
                  amount: commissionAmount,
                  status: 'pending' // Will remain pending until threshold check in a cron or admin dashboard
                }
              });
            }
          }
        }
      }
    } else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
      const paidValue = (invoice.amount_paid || 0) / 100;
      if (stripeCustomerId && paidValue > 0) {
        const user = await prisma.user.findFirst({ where: { stripeCustomerId } });
        if (!user) {
          // Stripe does not guarantee ordering. Do not acknowledge and lose an
          // invoice that arrives before checkout has linked the customer.
          if (invoiceHasNexusCutPrice(invoice) || !invoice.lines?.data?.length) {
            return NextResponse.json({ error: 'Customer linking pending; retry invoice' }, { status: 503 });
          }
          return NextResponse.json({ received: true, ignored: 'Unrelated invoice' });
        }
        if (user) {
          const externalEventId = `paid_${invoice.id}`;
          await prisma.conversionEvent.upsert({
            where: { externalEventId }, update: {},
            create: {
              externalEventId, eventName: 'Subscribe', userId: user.id,
              visitorId: user.attributionVisitorId, source: user.attributionSource,
              medium: user.attributionMedium, campaign: user.attributionCampaign,
              content: user.attributionContent, value: paidValue, currency: (invoice.currency || 'usd').toUpperCase(),
            },
          });
          await prisma.user.update({ where: { id: user.id }, data: { firstPaidAt: user.firstPaidAt || new Date() } });
          await sendMetaConversion({
            eventName: 'Subscribe', eventId: externalEventId, email: user.email,
            sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nexuscut.io'}/account`, value: paidValue,
          });
        }
      }
    } else if (event.type === 'refund.created' || event.type === 'refund.updated' || event.type === 'refund.failed') {
      await recordSubscriptionRefund((event.data.object as Stripe.Refund).id);
    } else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

      if (stripeCustomerId) {
        await prisma.user.updateMany({
          where: { stripeCustomerId },
          data: subscriptionHasPaidAccess(subscription)
            ? { isPro: true, planTier: tierFromSubscription(subscription) }
            : { isPro: false, planTier: 'free' },
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;

      if (stripeCustomerId) {
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isPro: false, planTier: 'free' }
          });

          // Mark any pending referrals as cancelled
          await prisma.referral.updateMany({
            where: { referredUserId: user.id, status: 'pending' },
            data: { status: 'cancelled', cancelledAt: new Date() }
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook payload parsing error:', err);
    return NextResponse.json({ error: 'Webhook processing failed; retry delivery' }, { status: 503 });
  }
}
