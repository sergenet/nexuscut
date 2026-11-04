const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLab, checkoutFixture } = require('./billing-lab.cjs');

test('Already signed-in customer stays linked to Stripe after checkout', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  assert.equal((await lab.deliver('checkout.session.completed', checkoutFixture(lab))).status, 200);
  const user = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
  assert.equal(user.planTier, 'creator');
  assert.equal(user.stripeCustomerId, 'cus_lab_customer');
});

test('Checkout → paid invoice → repeated invoice → cancellation has correct database state', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  await lab.deliver('checkout.session.completed', checkoutFixture(lab));
  const invoice = { id: 'in_lab_paid', customer: 'cus_lab_customer', amount_paid: 1200, currency: 'usd' };
  assert.equal((await lab.deliver('invoice.paid', invoice)).status, 200);
  assert.equal((await lab.deliver('invoice.paid', invoice)).status, 200);
  const paid = await lab.prisma.conversionEvent.findMany({ where: { eventName: 'Subscribe' } });
  assert.equal(paid.length, 1); assert.equal(paid[0].value, 12);
  assert.ok((await lab.prisma.user.findUnique({ where: { id: lab.user.id } })).firstPaidAt);
  assert.equal((await lab.deliver('customer.subscription.deleted', { id: 'sub_lab', customer: 'cus_lab_customer' })).status, 200);
  const user = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
  assert.equal(user.planTier, 'free'); assert.equal(user.isPro, false);
});

test('Scheduling cancellation preserves access until subscription actually ends', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  await lab.deliver('checkout.session.completed', checkoutFixture(lab));
  const subscription = { id: 'sub_lab', customer: 'cus_lab_customer', status: 'active', cancel_at_period_end: true,
    items: { data: [{ price: { id: 'price_lab_creator' } }] } };
  assert.equal((await lab.deliver('customer.subscription.updated', subscription)).status, 200);
  assert.equal((await lab.prisma.user.findUnique({ where: { id: lab.user.id } })).isPro, true);
});

test('Pro trial grants Pro without counting zero-dollar invoice as revenue, then records first payment and cancellation', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  const checkout = checkoutFixture(lab, 'pro');
  await lab.deliver('invoice.paid', { id: 'in_trial_zero', customer: 'cus_lab_customer', amount_paid: 0, currency: 'usd' });
  await lab.deliver('checkout.session.completed', checkout);
  await lab.deliver('checkout.session.completed', checkout);
  await lab.deliver('customer.subscription.created', { id: 'sub_trial', customer: 'cus_lab_customer', status: 'trialing',
    items: { data: [{ price: { id: 'price_lab_pro' } }] } });
  let user = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
  assert.equal(user.planTier, 'pro'); assert.equal(user.isPro, true); assert.ok(user.trialStartedAt);
  assert.equal(user.firstPaidAt, null);
  assert.equal(await lab.prisma.conversionEvent.count({ where: { eventName: 'StartTrial' } }), 1);
  assert.equal(await lab.prisma.conversionEvent.count({ where: { eventName: 'Subscribe' } }), 0);
  await lab.deliver('invoice.paid', { id: 'in_first_paid', customer: 'cus_lab_customer', amount_paid: 2900, currency: 'usd' });
  const paid = await lab.prisma.conversionEvent.findFirst({ where: { eventName: 'Subscribe' } });
  assert.equal(paid.value, 29);
  await lab.deliver('customer.subscription.deleted', { id: 'sub_trial', customer: 'cus_lab_customer' });
  user = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
  assert.equal(user.planTier, 'free'); assert.equal(user.isPro, false);
});

test('Invalid signatures cannot grant access or create conversion records', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  assert.equal((await lab.deliver('checkout.session.completed', checkoutFixture(lab), { invalidSignature: true })).status, 400);
  assert.equal((await lab.prisma.user.findUnique({ where: { id: lab.user.id } })).isPro, false);
  assert.equal(await lab.prisma.conversionEvent.count(), 0);
});

test('Billing lab refuses live keys before opening a database', async () => {
  await assert.rejects(createLab({ testKey: 'sk_live_never_use_in_lab' }), /refuses/);
});

test('Cross-mode signed webhook is rejected before account mutation', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  assert.equal((await lab.deliver('checkout.session.completed', checkoutFixture(lab), { livemode: true })).status, 400);
  assert.equal((await lab.prisma.user.findUnique({ where: { id: lab.user.id } })).isPro, false);
});

test('Invoice before checkout requests retry, then records payment exactly once', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  const invoice = { id: 'in_early', customer: 'cus_lab_customer', amount_paid: 1200, currency: 'usd',
    lines: { data: [{ pricing: { price_details: { price: 'price_lab_creator' } } }] } };
  assert.equal((await lab.deliver('invoice.paid', invoice)).status, 503);
  assert.equal(await lab.prisma.conversionEvent.count(), 0);
  await lab.deliver('checkout.session.completed', checkoutFixture(lab));
  assert.equal((await lab.deliver('invoice.paid', invoice)).status, 200);
  assert.equal((await lab.deliver('invoice.paid', invoice)).status, 200);
  assert.equal(await lab.prisma.conversionEvent.count({ where: { eventName: 'Subscribe' } }), 1);
});

test('Unrelated invoice on the shared Stripe account is ignored, not retried forever', async t => {
  const lab = await createLab(); t.after(() => lab.close());
  assert.equal((await lab.deliver('invoice.paid', { id: 'in_other', customer: 'cus_other', amount_paid: 1000,
    lines: { data: [{ price: { id: 'price_other_business' } }] } })).status, 200);
  assert.equal(await lab.prisma.conversionEvent.count(), 0);
});

test('Refunds reconcile partial/full amounts, duplicate/late events and failed/pending state without revoking access', async t => {
  const refunds = { re_one: { id: 're_one', charge: 'ch_lab', amount: 300, currency: 'usd', status: 'succeeded' },
    re_two: { id: 're_two', charge: 'ch_lab', amount: 900, currency: 'usd', status: 'pending' } };
  const lab = await createLab({ stripeMocks: {
    refunds: { retrieve: async id => refunds[id] },
    charges: { retrieve: async () => ({ id: 'ch_lab', payment_intent: 'pi_lab' }) },
    invoicePayments: { list: async () => ({ data: [{ invoice: 'in_lab_paid' }], has_more: false }) },
    invoices: { retrieve: async () => ({ lines: { data: [{ price: { id: 'price_lab_creator' } }] } }) },
  } }); t.after(() => lab.close());
  // Refund-before-invoice also requests retry rather than silently losing money.
  assert.equal((await lab.deliver('refund.created', { id: 're_one' })).status, 503);
  await lab.deliver('checkout.session.completed', checkoutFixture(lab));
  await lab.deliver('invoice.paid', { id: 'in_lab_paid', customer: 'cus_lab_customer', amount_paid: 1200, currency: 'usd' });
  const net = async () => (await lab.prisma.conversionEvent.aggregate({ where: { eventName: { in: ['Subscribe', 'Refund'] } }, _sum: { value: true } }))._sum.value;
  assert.equal((await lab.deliver('refund.created', { id: 're_one' })).status, 200);
  assert.equal(await net(), 9);
  await lab.deliver('refund.created', { id: 're_one' });
  await lab.deliver('refund.updated', { id: 're_one', status: 'pending' }); // Stale snapshot, current state wins.
  assert.equal(await net(), 9);
  await lab.deliver('refund.created', { id: 're_two' });
  assert.equal(await net(), 9);
  refunds.re_two.status = 'succeeded';
  await lab.deliver('refund.updated', { id: 're_two' });
  assert.equal(await net(), 0);
  assert.equal((await lab.prisma.user.findUnique({ where: { id: lab.user.id } })).isPro, true);
  refunds.re_two.status = 'failed';
  await lab.deliver('refund.failed', { id: 're_two' });
  assert.equal(await net(), 9);
  assert.equal(await lab.prisma.conversionEvent.count({ where: { eventName: 'Refund' } }), 2);
  assert.equal(lab.sent.filter(event => event.eventName === 'Refund').length, 0);
});
