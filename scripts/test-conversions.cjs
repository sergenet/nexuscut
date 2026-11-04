// Isolated route tests: no credentials, real Stripe requests, email, or database writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true,
  }}).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports, require: name => {
      if (!(name in imports)) throw Error(`Unexpected import: ${name}`);
      return imports[name];
    }, URL, Request, Response, process: { env: {} }, console: { error() {} }, ...globals,
  });
  return exports;
}

const nextServer = { NextResponse: { json: (body, options) => Response.json(body, options) } };
const attribution = load('src/lib/attribution.ts', {});
const formData = { name: 'Isolated QA Fixture', email: 'qa@example.invalid', creatorType: 'Other' };

function testerHarness({ failDatabase = false, failMeta = false } = {}) {
  const applications = new Map(), conversions = new Map(), sent = [];
  const cookie = encodeURIComponent(JSON.stringify({visitorId:'qa-visitor',source:'tracking_qa',medium:'internal',campaign:'isolated_test',content:'test_form'}));
  const prisma = {
    foundingTesterApplication: { upsert: async query => {
      if (failDatabase) throw Error('Fixture database failure');
      const application = {id:'qa_application',...query.create};
      applications.set(query.where.email, application);
      return application;
    }},
    conversionEvent: { upsert: async query => {
      if (!conversions.has(query.where.externalEventId)) conversions.set(query.where.externalEventId,query.create);
    }},
  };
  const route = load('src/app/api/marketing/founding-testers/route.ts', {
    crypto: require('node:crypto'), 'next/server': nextServer,
    'next/headers': { cookies: async () => ({get:()=>({value:cookie})}) },
    nodemailer: { createTransport() { throw Error('SMTP must remain disabled in isolated tests'); } },
    '@/lib/prisma': prisma, '@/lib/attribution': attribution,
    '@/lib/metaConversions': { sendMetaConversion: async event => {
      sent.push(event); if(failMeta) throw Error('Fixture delivery failure');
      return {configured:true,ok:true};
    }},
  });
  return {applications,conversions,sent,post: body => route.POST(new Request('https://example.invalid/api/marketing/founding-testers',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),
  }))};
}

test('Valid tester application preserves attribution and one shared deduplication ID', async () => {
  const h=testerHarness(); const response=await h.post(formData); const body=await response.json();
  assert.equal(response.status,200); assert.equal(h.applications.size,1); assert.equal(h.conversions.size,1);
  assert.equal(body.eventId,'lead_qa_application');
  assert.equal(h.sent[0].eventId,body.eventId);
  const stored=h.conversions.get(body.eventId);
  assert.equal(stored.source,'tracking_qa'); assert.equal(stored.campaign,'isolated_test');
  assert.equal(stored.content,'test_form'); assert.equal(stored.value,0);
});
test('Repeated application does not create a second database conversion', async () => {
  const h=testerHarness(); const first=await (await h.post(formData)).json();
  const second=await (await h.post(formData)).json();
  assert.equal(first.eventId,second.eventId); assert.equal(h.conversions.size,1); assert.equal(h.applications.size,1);
});
test('Invalid inputs do not produce applications or conversion events', async () => {
  for(const input of [{}, {...formData,name:'X'}, {...formData,email:'bad'}, {...formData,creatorType:'invalid'}]) {
    const h=testerHarness(); assert.equal((await h.post(input)).status,400);
    assert.equal(h.applications.size,0); assert.equal(h.conversions.size,0); assert.equal(h.sent.length,0);
  }
});
test('Honeypot submissions do not create server conversion events', async () => {
  const h=testerHarness(); const response=await h.post({...formData,website:'spam'});
  assert.equal(response.status,200); assert.equal((await response.json()).eventId,undefined);
  assert.equal(h.applications.size,0); assert.equal(h.sent.length,0);
});
test('A Meta transport failure does not discard a saved application', async () => {
  const h=testerHarness({failMeta:true}); assert.equal((await h.post(formData)).status,200);
  assert.equal(h.applications.size,1); assert.equal(h.conversions.size,1);
});
test('A database failure does not send a successful conversion', async () => {
  const h=testerHarness({failDatabase:true}); assert.equal((await h.post(formData)).status,500);
  assert.equal(h.sent.length,0);
});

function confirmationHarness({ user = {clerkId:'qa-owner'}, status = 'complete', owner='qa-owner', tier='pro', payment='paid', mode='subscription' } = {}) {
  let lookups=0;
  class StripeFixture { checkout={sessions:{retrieve:async()=>{
    lookups++;return {id:'cs_qa',client_reference_id:owner,status,mode,payment_status:payment,invoice:'in_qa',amount_total:tier==='creator'?1200:0,currency:'usd',metadata:{tier}};
  }}}; }
  const route=load('src/app/api/analytics/checkout-success/route.ts',{
    'next/server':nextServer,stripe:StripeFixture,'@/lib/auth':{getVerifiedUser:async()=>user},
  },{process:{env:{STRIPE_SECRET_KEY:'fixture-not-a-secret'}}});
  return {get:()=>route.GET(new Request('https://example.invalid/api/analytics/checkout-success?session_id=cs_qa')),lookups:()=>lookups};
}
test('Unauthenticated checkout confirmation is denied before contacting Stripe', async()=>{
  const h=confirmationHarness({user:null}); assert.equal((await h.get()).status,401); assert.equal(h.lookups(),0);
});
test('Another customer or incomplete checkout cannot generate a verified trial', async()=>{
  for(const fixture of [{owner:'someone-else'},{status:'open'},{payment:'unpaid'},{mode:'payment'}]) {
    const h=confirmationHarness(fixture); assert.equal((await h.get()).status,403);
  }
});

test('Creator confirms a paid subscription with invoice deduplication ID, never a trial', async()=>{
  const response = await confirmationHarness({tier:'creator'}).get();
  const data = await response.json();
  assert.equal(response.status,200); assert.equal(data.eventName,'Subscribe');
  assert.equal(data.eventId,'paid_in_qa'); assert.equal(data.value,12);
  assert.equal((await confirmationHarness({tier:'creator',payment:'no_payment_required'}).get()).status,409);
});
test('Completed owner Pro/Agency checkouts use the same trial ID as the webhook', async()=>{
  for(const tier of ['pro','agency']) {
    const h=confirmationHarness({tier}); const response=await h.get(); const data=await response.json();
    assert.equal(response.status,200); assert.equal(data.verified,true); assert.equal(data.eventId,'trial_cs_qa');
    assert.equal(data.value,tier==='agency'?49:29); assert.equal(response.headers.get('Cache-Control'),'no-store');
  }
});
test('Production fails closed when the webhook signing secret is absent', async()=>{
  let stripeCalled=false;
  const route=load('src/app/api/stripe/webhook/route.ts', {
    'next/server':nextServer,stripe:class {constructor(){stripeCalled=true;}},
    '@/lib/prisma':{}, '@/lib/metaConversions':{},
  },{process:{env:{NODE_ENV:'production',STRIPE_SECRET_KEY:'fixture-not-a-secret'}}});
  const response=await route.POST(new Request('https://example.invalid/api/stripe/webhook',{method:'POST',body:'{}'}));
  assert.equal(response.status,503); assert.equal(stripeCalled,false);
});
