// Isolated billing route harness. No application .env files or production DB are loaded.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let schemaSql;

function loadRoute(relativePath, imports, env, errors) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  }}).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, require(name) {
      if (!Object.hasOwn(imports, name)) throw Error(`Unapproved lab dependency: ${name}`);
      return imports[name];
    }, URL, Request, Response, Buffer, process: { env },
    console: { error() { errors.push('Route reported an error (details suppressed)'); } },
  }, { filename: relativePath });
  return exports;
}

async function createLab(options = {}) {
  if (options.testKey && !/^sk_test_[A-Za-z0-9]+$/.test(options.testKey)) {
    throw Error('Billing lab refuses live or malformed Stripe keys');
  }
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nexuscut-billing-lab-'));
  const databasePath = path.join(directory, 'isolated.sqlite');
  const databaseUrl = `file:${databasePath.replaceAll('\\', '/')}`;
  // Read-only schema generation. The SQL is applied only to this fresh temporary DB.
  schemaSql ??= execFileSync(process.execPath, [
    path.join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'diff',
    '--from-empty', '--to-schema-datamodel', path.join(root, 'prisma/schema.prisma'), '--script',
  ], { cwd: directory, env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: 'utf8' });
  const sqlite = new DatabaseSync(databasePath);
  sqlite.exec(schemaSql);
  sqlite.close();
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const key = options.testKey || 'sk_test_offlinefixture';
  const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
  const env = {
    NODE_ENV: 'production', DATABASE_URL: databaseUrl,
    STRIPE_SECRET_KEY: key, STRIPE_WEBHOOK_SECRET: secret,
    STRIPE_CREATOR_PRICE_ID: 'price_lab_creator', STRIPE_PRO_PLUS_PRICE_ID: 'price_lab_pro',
    STRIPE_AGENCY_PRICE_ID: 'price_lab_agency', NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:4178',
  };
  const sent = [], errors = [];
  const offlineHttp = {
    getClientName: () => 'network-disabled-billing-lab',
    makeRequest: async () => { throw Error('External Stripe requests are disabled in fixture tests'); },
  };
  class LabStripe extends Stripe {
    constructor(requestedKey, config) {
      if (requestedKey !== key || !requestedKey.startsWith('sk_test_')) throw Error('Unsafe Stripe key');
      super(requestedKey, { ...config, maxNetworkRetries: 0,
        ...(!options.testKey && { httpClient: offlineHttp }),
      });
      if (options.stripeMocks) Object.assign(this, options.stripeMocks);
    }
  }
  const user = await prisma.user.create({ data: {
    clerkId: `billing-lab-${crypto.randomUUID()}`,
    email: `billing-lab-${crypto.randomUUID()}@example.invalid`,
  }});
  const imports = {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init), redirect: url => Response.redirect(url, 303) } },
    stripe: LabStripe, '@/lib/prisma': prisma,
    '@/lib/metaConversions': { sendMetaConversion: async input => { sent.push(input); return { configured: false }; } },
  };
  const webhook = loadRoute('src/app/api/stripe/webhook/route.ts', imports, env, errors);
  return {
    directory, databasePath, prisma, user, env, sent, errors, imports,
    receive: request => webhook.POST(request),
    // This method exercises signatures and actual Prisma writes using synthetic events;
    // it is NOT a Stripe-origin delivery or a hosted Checkout test.
    async deliver(type, object, { livemode = false, invalidSignature = false, eventId } = {}) {
      const payload = JSON.stringify({ id: eventId || `evt_lab_${crypto.randomUUID()}`, object: 'event',
        type, livemode, created: Math.floor(Date.now() / 1000), data: { object } });
      const signature = Stripe.webhooks.generateTestHeaderString({ payload,
        secret: invalidSignature ? 'whsec_wrongfixture' : env.STRIPE_WEBHOOK_SECRET });
      return webhook.POST(new Request('http://127.0.0.1:4178/api/stripe/webhook', {
        method: 'POST', body: payload, headers: { 'stripe-signature': signature },
      }));
    },
    async close() { await prisma.$disconnect(); },
  };
}

function checkoutFixture(lab, tier = 'creator') {
  return { id: 'cs_lab_checkout', object: 'checkout.session', livemode: false,
    status: 'complete', mode: 'subscription', payment_status: tier === 'creator' ? 'paid' : 'no_payment_required',
    client_reference_id: lab.user.clerkId, customer: 'cus_lab_customer',
    customer_details: { email: lab.user.email }, amount_total: tier === 'creator' ? 1200 : 0,
    metadata: { tier, utm_source: 'internal_qa', utm_campaign: 'isolated_billing_test' } };
}

module.exports = { createLab, checkoutFixture, loadRoute };
