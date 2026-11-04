// Read-only credential preflight. Never loads app .env or prints a secret.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const Stripe = require('stripe');

async function main() {
  const file = path.join(os.homedir(), '.codex', 'private', 'nexuscut-stripe-test-key.txt');
  const key = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim() : '';
  if (!/^sk_test_[A-Za-z0-9]+$/.test(key)) {
    console.log('BLOCKED: Save only the existing NexusCut Stripe test secret key in the private handoff file. No Stripe API call was made.');
    process.exitCode = 2;
    return;
  }
  const stripe = new Stripe(key, { maxNetworkRetries: 0, timeout: 15000 });
  const [account, balance] = await Promise.all([stripe.accounts.retrieve(), stripe.balance.retrieve()]);
  if (balance.livemode !== false) throw Error('Expected sandbox data; refusing to proceed');
  console.log(JSON.stringify({ authenticated: true, testModeVerified: true,
    accountId: account.id, businessName: account.business_profile?.name || null,
    writesPerformed: false, liveConfigurationLoaded: false }, null, 2));
}
main().catch(error => {
  console.log(JSON.stringify({ preflightFailed: true, errorType: error.type || error.name,
    statusCode: error.statusCode || null }));
  process.exitCode = 1;
});
