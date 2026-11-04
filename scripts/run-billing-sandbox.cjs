// Loopback-only lab. Never imports application environment files or live Prisma.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const Stripe = require('stripe');
const { createLab, loadRoute } = require('./billing-lab.cjs');

async function main() {
  const tier = process.argv[2] || 'creator';
  if (!['creator', 'pro'].includes(tier)) throw Error('Supported lab plans: creator or pro');
  const amount = tier === 'pro' ? 2900 : 1200;
  const privateDir = path.join(os.homedir(), '.codex', 'private');
  const key = fs.readFileSync(path.join(privateDir, 'nexuscut-stripe-test-key.txt'), 'utf8').replace(/^\uFEFF/, '').trim();
  if (!/^sk_test_[A-Za-z0-9]+$/.test(key)) throw Error('Test key required');
  const stripe = new Stripe(key, { maxNetworkRetries: 0, timeout: 15000 });
  const [account, balance] = await Promise.all([stripe.accounts.retrieve(), stripe.balance.retrieve()]);
  if (balance.livemode !== false || account.id !== 'acct_1QZissFJK8JMTXAG') throw Error('Wrong environment/account');
  const lab = await createLab({ testKey: key });
  const runId = `nexuscut-qa-${crypto.randomUUID()}`;
  const token = crypto.randomBytes(20).toString('hex');
  const base = 'http://127.0.0.1:4178';
  const events = [];
  let checkoutSession, listener, ready = false;
  const manifest = { runId, tier, accountId: account.id, testMode: true, databasePath: lab.databasePath, events };
  const persist = () => fs.writeFileSync(path.join(lab.directory, 'run.json'), JSON.stringify(manifest, null, 2));
  async function snapshot() {
    const user = await lab.prisma.user.findUnique({ where: { id: lab.user.id } });
    const conversions = await lab.prisma.conversionEvent.findMany({ select: { eventName: true, externalEventId: true, value: true } });
    return { runId, tier, testMode: true, listenerReady: ready, user: { planTier: user.planTier, isPro: user.isPro,
      customerLinked: !!user.stripeCustomerId, trialStartedAt: user.trialStartedAt, firstPaidAt: user.firstPaidAt }, conversions, events };
  }
  const server = http.createServer(async (req, res) => {
    try {
      if (req.headers.host !== '127.0.0.1:4178') { res.writeHead(403).end(); return; }
      const url = new URL(req.url, base);
      if (url.pathname === `/webhook/${token}` && req.method === 'POST') {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 2e6) throw Error('Payload too large'); chunks.push(chunk); }
        const body = Buffer.concat(chunks).toString('utf8');
        const sig = req.headers['stripe-signature'];
        let event;
        try { event = stripe.webhooks.constructEvent(body, sig, lab.env.STRIPE_WEBHOOK_SECRET); }
        catch { res.writeHead(400).end('Invalid signature'); return; }
        if (event.livemode !== false) { res.writeHead(400).end('Wrong mode'); return; }
        const object = event.data.object;
        // Scope account-wide CLI deliveries to this single hosted checkout only.
        if (!checkoutSession) { res.writeHead(200).end('Ignored'); return; }
        const current = await stripe.checkout.sessions.retrieve(checkoutSession.id);
        const customerId = typeof current.customer === 'string' ? current.customer : current.customer?.id;
        const eventCustomer = typeof object.customer === 'string' ? object.customer : object.customer?.id;
        let inScope = object.id === checkoutSession.id || (!!customerId && eventCustomer === customerId);
        if (!inScope && object.object === 'refund' && object.charge) {
          const charge = await stripe.charges.retrieve(typeof object.charge === 'string' ? object.charge : object.charge.id);
          inScope = charge.livemode === false && !!customerId && charge.customer === customerId;
        }
        if (!inScope) { res.writeHead(200).end('Ignored unrelated test event'); return; }
        const response = await lab.receive(new Request(`${base}/api/stripe/webhook`, { method: 'POST', body,
          headers: { 'stripe-signature': sig } }));
        events.push({ id: event.id, type: event.type, status: response.status, receivedAt: new Date().toISOString() });
        fs.writeFileSync(path.join(lab.directory, `${event.id}.json`), body);
        persist();
        console.log(JSON.stringify({ stripeOriginEvent: event.type, status: response.status }));
        res.writeHead(response.status, { 'Content-Type': 'application/json' }).end(await response.text());
        return;
      }
      if (url.pathname === `/status/${token}` && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify(await snapshot())); return;
      }
      if ((url.pathname === `/${token}` || url.pathname === '/pro/success' || url.pathname === '/pro') && req.method === 'GET') {
        const link = checkoutSession?.url;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
          'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'" });
        res.end(`<!doctype html><meta name="viewport" content="width=device-width"><title>NexusCut sandbox test</title>
          <style>body{font:20px system-ui;max-width:760px;margin:60px auto;padding:24px;background:#101528;color:#fff}a{color:#8fdfff}p{line-height:1.6}</style>
          <h1>NexusCut — TEST ONLY</h1><p>This is an isolated test. No real money, live accounts, emails, or advertising conversions are involved.</p>
          ${url.pathname === '/pro/success' ? '<h2>Stripe checkout returned successfully.</h2><p>Tell Codex the checkout is complete. The payment, refund and cancellation checks still need verification.</p>' :
          `<p>${tier === 'pro' ? 'Pro plan: <strong>7-day trial, then $29/month in TEST MODE' : 'Creator plan: <strong>$12/month in TEST MODE'}</strong>.</p><p>Use test card <strong>4242 4242 4242 4242</strong>, a future expiry, and any three-digit CVC. Do not use your real card.</p>
          ${link ? `<p><a href="${link}">Open Stripe test checkout</a></p>` : '<p>Preparing checkout…</p>'}`}
          <p><a href="/status/${token}">View isolated test status</a></p>`); return;
      }
      res.writeHead(404).end('Not found');
    } catch { res.writeHead(500).end('Sandbox handler failed; details suppressed'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(4178, '127.0.0.1', resolve); });
  const cli = path.join(privateDir, 'stripe-cli-tools/node_modules/@stripe/cli-win32-x64/bin/stripe.exe');
  listener = spawn(cli, ['listen', '--forward-to', `${base}/webhook/${token}`, '--events',
    'checkout.session.completed,invoice.paid,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,refund.created,refund.updated,refund.failed,charge.refunded',
    '--config', path.join(lab.directory, 'stripe-config.toml')], {
    cwd: lab.directory, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, TEMP: lab.directory,
      STRIPE_API_KEY: key, STRIPE_DEVICE_NAME: runId, STRIPE_CLI_TELEMETRY_OPTOUT: '1' },
  });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('Stripe listener readiness timed out')), 30000);
      let output = '';
      const inspect = chunk => {
        // Never forward raw CLI output: it contains the signing secret.
        output = (output + chunk.toString()).slice(-12000);
        const match = output.match(/whsec_[A-Za-z0-9]+/);
        if (match) { lab.env.STRIPE_WEBHOOK_SECRET = match[0]; ready = true; clearTimeout(timer); resolve(); }
      };
      listener.stdout.on('data', inspect); listener.stderr.on('data', inspect);
      listener.once('error', () => { clearTimeout(timer); reject(Error('Stripe listener could not start')); });
      listener.once('exit', code => { ready = false; clearTimeout(timer); reject(Error(`Stripe listener exited (${code})`)); });
    });
    const metadata = { nexuscut_qa_run: runId, purpose: 'isolated-billing-verification' };
    const product = await stripe.products.create({ name: `[TEST ONLY] NexusCut ${tier} ${runId}`, metadata });
    manifest.productId = product.id; persist();
    const price = await stripe.prices.create({ product: product.id, currency: 'usd', unit_amount: amount,
      recurring: { interval: 'month' }, metadata });
    manifest.priceId = price.id; persist();
    lab.env[tier === 'pro' ? 'STRIPE_PRO_PLUS_PRICE_ID' : 'STRIPE_CREATOR_PRICE_ID'] = price.id;
    const attribution = loadRoute('src/lib/attribution.ts', {}, lab.env, lab.errors);
    const checkout = loadRoute('src/app/api/stripe/checkout/route.ts', {
      ...lab.imports, 'next/headers': { cookies: async () => ({ get: () => undefined }) },
      // Lab-only identity injection; production authentication remains untouched.
      '@/lib/auth': { getVerifiedUser: async () => lab.prisma.user.findUnique({ where: { id: lab.user.id } }) },
      '@/lib/attribution': attribution,
    }, lab.env, lab.errors);
    const response = await checkout.POST(new Request(`${base}/api/stripe/checkout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tier }),
    }));
    const result = await response.json();
    if (response.status !== 200 || !result.url?.startsWith('https://checkout.stripe.com/')) throw Error('Hosted checkout creation failed');
    // Retrieve by the ID recorded by the actual checkout handler, not by parsing opaque URLs.
    const recorded = await lab.prisma.conversionEvent.findFirst({ where: { eventName: 'InitiateCheckout' } });
    if (!recorded) throw Error('Checkout was not recorded');
    checkoutSession = await stripe.checkout.sessions.retrieve(recorded.externalEventId.replace(/^checkout_/, ''));
    if (checkoutSession.livemode !== false) throw Error('Checkout mode mismatch');
    manifest.sessionId = checkoutSession.id; manifest.userId = lab.user.id;
    manifest.localUrl = `${base}/${token}`; manifest.statusUrl = `${base}/status/${token}`;
    persist();
    console.log(JSON.stringify({ ready: true, testMode: true, accountId: account.id,
      localUrl: manifest.localUrl, evidence: path.join(lab.directory, 'run.json'), listenerPid: listener.pid }));
    async function stop() { listener.kill(); server.close(); await lab.close(); process.exit(0); }
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
  } catch (error) { listener.kill(); server.close(); await lab.close(); throw error; }
}
main().catch(error => { console.error(`Sandbox setup stopped: ${error.type || error.name || 'Error'} (no secret details logged)`); process.exitCode = 1; });
