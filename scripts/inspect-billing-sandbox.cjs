const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Stripe = require('stripe');
async function main() {
  const directory = path.join(os.tmpdir(), 'nexuscut-billing-lab-Zs00D9');
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'run.json'), 'utf8'));
  const key = fs.readFileSync(path.join(os.homedir(), '.codex/private/nexuscut-stripe-test-key.txt'), 'utf8').replace(/^\uFEFF/, '').trim();
  if (!/^sk_test_[A-Za-z0-9]+$/.test(key)) throw Error('Test key required');
  const stripe = new Stripe(key, { maxNetworkRetries: 0, timeout: 15000 });
  const [account, balance] = await Promise.all([stripe.accounts.retrieve(), stripe.balance.retrieve()]);
  if (account.id !== manifest.accountId || balance.livemode !== false) throw Error('Environment mismatch');
  const session = await stripe.checkout.sessions.retrieve(manifest.sessionId);
  if (session.livemode !== false || session.status !== 'complete' || session.payment_status !== 'paid') throw Error('Test checkout not paid');
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  if (subscription.livemode !== false || subscription.customer !== session.customer || subscription.items.data[0].price.id !== manifest.priceId) throw Error('Subscription scope mismatch');
  const product = await stripe.products.retrieve(manifest.productId);
  if (product.metadata.nexuscut_qa_run !== manifest.runId || product.livemode !== false) throw Error('Product scope mismatch');
  const invoice = await stripe.invoices.retrieve(session.invoice);
  const charges = await stripe.charges.list({ customer: session.customer, limit: 10 });
  if (charges.has_more || charges.data.length !== 1) throw Error('Ambiguous charge');
  const charge = charges.data[0];
  if (charge.livemode !== false || !charge.paid || charge.amount !== 1200 || charge.currency !== 'usd') throw Error('Charge scope mismatch');
  const action = process.argv[2] || 'inspect';
  let result;
  if (action === 'refund-part') {
    result = await stripe.refunds.create({ charge: charge.id, amount: 300, metadata: { nexuscut_qa_run: manifest.runId } }, { idempotencyKey: `${manifest.runId}-partial-refund` });
  } else if (action === 'refund-rest') {
    result = await stripe.refunds.create({ charge: charge.id, amount: 900, metadata: { nexuscut_qa_run: manifest.runId } }, { idempotencyKey: `${manifest.runId}-remaining-refund` });
  } else if (action === 'schedule-cancel') {
    result = await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true }, { idempotencyKey: `${manifest.runId}-schedule-cancel` });
  } else if (action === 'cancel') {
    result = subscription.status === 'canceled' ? subscription : await stripe.subscriptions.cancel(subscription.id, { invoice_now: false, prorate: false });
  } else if (action !== 'inspect') throw Error('Unknown action');
  const output = { action, testMode: true, checkout: session.status, payment: session.payment_status,
    subscription: subscription.status, cancelAtPeriodEnd: subscription.cancel_at_period_end,
    invoiceId: invoice.id, invoicePaid: invoice.amount_paid, invoiceStatus: invoice.status,
    chargeId: charge.id, chargeInvoice: charge.invoice || null, refunded: charge.amount_refunded,
    invoicePayments: invoice.payments?.data?.map(p => ({ id: p.id, payment: p.payment })),
    result: result && { id: result.id, status: result.status, amount: result.amount, cancelAtPeriodEnd: result.cancel_at_period_end } };
  fs.writeFileSync(path.join(directory, `${action}-${Date.now()}.json`), JSON.stringify(output, null, 2));
  console.log(JSON.stringify(output, null, 2));
}
main().catch(error => { console.error(JSON.stringify({ errorType: error.type || error.name, status: error.statusCode })); process.exitCode = 1; });
