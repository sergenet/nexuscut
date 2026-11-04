const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const Stripe = require('stripe');
const { loadRoute } = require('./billing-lab.cjs');
async function main() {
  const directory = path.join(os.tmpdir(), 'nexuscut-billing-lab-VHun6X');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'run.json'), 'utf8'));
  const key = fs.readFileSync(path.join(os.homedir(), '.codex/private/nexuscut-stripe-test-key.txt'), 'utf8').trim();
  assert.match(key, /^sk_test_[A-Za-z0-9]+$/);
  const stripe = new Stripe(key, { maxNetworkRetries: 0, timeout: 15000 });
  assert.equal((await stripe.accounts.retrieve()).id, manifest.accountId);
  assert.equal((await stripe.balance.retrieve()).livemode, false);
  const checkout = await stripe.checkout.sessions.retrieve(manifest.sessionId);
  assert.equal(checkout.livemode, false); assert.equal(checkout.status, 'complete');
  assert.equal(checkout.metadata.tier, 'pro'); assert.equal(checkout.amount_total, 0);
  const sub = await stripe.subscriptions.retrieve(checkout.subscription);
  assert.equal(sub.livemode, false); assert.equal(sub.customer, checkout.customer);
  assert.equal(sub.items.data[0].price.id, manifest.priceId);
  const product = await stripe.products.retrieve(manifest.productId);
  assert.equal(product.metadata.nexuscut_qa_run, manifest.runId);
  const duration = sub.trial_end - sub.trial_start;
  assert.equal(duration, 7 * 86400);
  const action = process.argv[2] || 'inspect';
  if (action === 'cancel') {
    assert.equal(sub.status, 'trialing');
    const canceled = await stripe.subscriptions.cancel(sub.id, { prorate: false, invoice_now: false });
    assert.equal(canceled.status, 'canceled');
    const result = { canceled: true, testMode: true, trialDays: duration / 86400, charged: 0, subscriptionId: sub.id };
    fs.writeFileSync(path.join(directory, 'pro-canceled.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result)); return;
  }
  assert.equal(action, 'inspect'); assert.equal(sub.status, 'trialing');
  const errors = [];
  const route = loadRoute('src/app/api/analytics/checkout-success/route.ts', {
    stripe: Stripe, 'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/auth': { getVerifiedUser: async () => ({ clerkId: checkout.client_reference_id }) },
  }, { STRIPE_SECRET_KEY: key }, errors);
  const confirmation = await route.GET(new Request(`http://127.0.0.1:4178/api/analytics/checkout-success?session_id=${checkout.id}`));
  assert.equal(confirmation.status, 200);
  const confirmed = await confirmation.json();
  assert.equal(confirmed.eventId, `trial_${checkout.id}`);
  const status = await (await fetch(manifest.statusUrl)).json();
  assert.equal(status.user.planTier, 'pro'); assert.equal(status.user.firstPaidAt, null);
  assert.equal(status.conversions.filter(e => e.eventName === 'StartTrial').length, 1);
  assert.equal(status.conversions.filter(e => e.eventName === 'Subscribe').length, 0);
  assert.ok(status.events.every(e => e.status === 200));
  const result = { passed: true, stripeStatus: sub.status, trialDays: duration / 86400, dueNow: checkout.amount_total,
    monthlyPrice: sub.items.data[0].price.unit_amount / 100, plan: status.user.planTier,
    trialEvents: 1, paidEvents: 0, analyticsConfirmationVerified: true, actualStripeDeliveries: status.events.length,
    liveWrites: false, externalAnalyticsSent: false };
  fs.writeFileSync(path.join(directory, 'pro-verified.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
main().catch(e => { console.error(JSON.stringify({ type: e.type || e.name, status: e.statusCode,
  assertion: e.code === 'ERR_ASSERTION' ? { actual: e.actual, expected: e.expected } : undefined })); process.exitCode = 1; });
