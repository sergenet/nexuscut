// Replays captured Stripe-origin payloads with locally generated signatures.
// This is NOT a fresh Stripe-origin delivery to the patched route.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const Stripe = require('stripe');
const { createLab } = require('./billing-lab.cjs');
async function main() {
  const directory = path.join(os.tmpdir(), 'nexuscut-billing-lab-Zs00D9');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'run.json'), 'utf8'));
  const key = fs.readFileSync(path.join(os.homedir(), '.codex/private/nexuscut-stripe-test-key.txt'), 'utf8').replace(/^\uFEFF/, '').trim();
  assert.match(key, /^sk_test_[A-Za-z0-9]+$/);
  const stripe = new Stripe(key, { maxNetworkRetries: 0, timeout: 15000 });
  assert.equal((await stripe.accounts.retrieve()).id, manifest.accountId);
  assert.equal((await stripe.balance.retrieve()).livemode, false);
  const events = manifest.events.map(row => JSON.parse(fs.readFileSync(path.join(directory, `${row.id}.json`), 'utf8')));
  const checkout = events.find(e => e.type === 'checkout.session.completed').data.object;
  const invoice = events.find(e => e.type === 'invoice.paid').data.object;
  assert.equal(checkout.id, manifest.sessionId); assert.equal(checkout.livemode, false);
  const lab = await createLab({ testKey: key });
  try {
    lab.env.STRIPE_CREATOR_PRICE_ID = manifest.priceId;
    await lab.prisma.user.update({ where: { id: lab.user.id }, data: {
      clerkId: checkout.client_reference_id, email: checkout.customer_details.email,
    } });
    assert.equal((await lab.deliver('invoice.paid', invoice)).status, 503);
    assert.equal((await lab.deliver('checkout.session.completed', checkout)).status, 200);
    assert.equal((await lab.deliver('invoice.paid', invoice)).status, 200);
    assert.equal((await lab.deliver('invoice.paid', invoice)).status, 200);
    assert.equal(await lab.prisma.conversionEvent.count({ where: { eventName: 'Subscribe' } }), 1);
    const refundEvents = events.filter(e => e.type.startsWith('refund.'));
    assert.ok(refundEvents.length > 0);
    for (const event of refundEvents) {
      assert.equal((await lab.deliver(event.type, event.data.object)).status, 200);
      assert.equal((await lab.deliver(event.type, event.data.object)).status, 200);
    }
    const afterRefund = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
    assert.equal(afterRefund.isPro, true);
    const charges = await stripe.charges.list({ customer: checkout.customer, limit: 10 });
    assert.equal(charges.data.length, 1);
    const total = (await lab.prisma.conversionEvent.aggregate({ where: { eventName: { in: ['Subscribe', 'Refund'] }, currency: 'USD' }, _sum: { value: true } }))._sum.value;
    assert.equal(total, (charges.data[0].amount - charges.data[0].amount_refunded) / 100);
    for (const event of events.filter(e => e.type.startsWith('customer.subscription.'))) {
      assert.equal((await lab.deliver(event.type, event.data.object)).status, 200);
    }
    const subscription = await stripe.subscriptions.retrieve(checkout.subscription);
    const finalUser = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
    assert.equal(finalUser.isPro, ['active', 'trialing'].includes(subscription.status));
    const result = { passed: true, method: 'Local signed replay of captured Stripe payloads plus read-only Stripe state',
      sourceRun: manifest.runId, isolatedDb: lab.databasePath, paidInvoiceRecordedOnce: true,
      firstPaidAtPresent: !!finalUser.firstPaidAt, partialOrFullRefund: charges.data[0].amount_refunded / 100,
      netTrackedUsd: total, refundPreservedAccess: afterRefund.isPro,
      stripeSubscription: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end,
      finalPlan: finalUser.planTier, refundRecords: await lab.prisma.conversionEvent.count({ where: { eventName: 'Refund' } }),
      liveWrites: false, advertisingSent: false };
    fs.writeFileSync(path.join(directory, `patched-replay-${Date.now()}.json`), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally { await lab.close(); }
}
main().catch(error => { console.error(JSON.stringify({ errorType: error.type || error.name, status: error.statusCode,
  assertion: error.code === 'ERR_ASSERTION' ? { actual: error.actual, expected: error.expected } : undefined })); process.exitCode = 1; });
