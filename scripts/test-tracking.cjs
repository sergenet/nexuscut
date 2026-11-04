const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function load(relativePath, globals = {}, imports = {}) {
  const source = readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require: name => imports[name], ...globals,
  }, { filename: relativePath });
  return exports;
}

const queues = load('src/lib/trackingQueues.ts');
const commands = queue => Array.from(queue, command => Array.from(command));

test('Google uses the Arguments command protocol, not plain arrays', () => {
  const queue = [];
  const gtag = queues.createGoogleTag(command => queue.push(command));
  gtag('config', 'G-TEST', { send_page_view: true });
  gtag('event', 'generate_lead', { transaction_id: 'lead_test' });
  assert.equal(Object.prototype.toString.call(queue[0]), '[object Arguments]');
  assert.equal(Array.isArray(queue[0]), false);
  assert.deepEqual(commands(queue)[1], ['event', 'generate_lead', { transaction_id: 'lead_test' }]);
});

test('Google event bridge continues through the SDK dataLayer.push replacement', () => {
  const layer = [];
  const gtag = queues.createGoogleTag(command => layer.push(command));
  gtag('js', new Date());
  const received = [];
  layer.push = command => received.push(Array.from(command));
  gtag('event', 'export_complete');
  assert.deepEqual(received, [['event', 'export_complete']]);
  assert.equal(layer.length, 1);
});

test('Meta queues before SDK readiness and dispatches directly afterward, preserving eventID', () => {
  const fbq = queues.createMetaPixelQueue();
  fbq('init', 'TEST');
  fbq('track', 'PageView');
  assert.deepEqual(commands(fbq.queue), [['init', 'TEST'], ['track', 'PageView']]);
  assert.equal(fbq.push, fbq);
  assert.equal(fbq.loaded, true);
  assert.equal(fbq.version, '2.0');
  const received = [];
  fbq.callMethod = function (...args) {
    assert.equal(this, fbq);
    received.push(args);
  };
  fbq('track', 'Lead', { value: 0 }, { eventID: 'lead_test' });
  fbq('track', 'StartTrial', { value: 29 }, { eventID: 'trial_test' });
  assert.equal(fbq.queue.length, 2, 'Post-load events must not accumulate in the drained queue');
  assert.equal(received.length, 2);
  assert.deepEqual(received[0], ['track', 'Lead', { value: 0 }, { eventID: 'lead_test' }]);
});

function harness(component, pixelId = 'TEST') {
  const window = {};
  const scripts = [];
  const listeners = new Set();
  let pathname = '/creator-challenge';
  const document = {
    querySelector: selector => scripts.find(script => selector.includes(script.src)
      || (script.dataset.nexuscutGa && selector.includes(script.dataset.nexuscutGa))),
    createElement: () => ({ dataset: {} }),
    head: { appendChild: script => scripts.push(script) },
    addEventListener: (name, handler) => listeners.add(handler),
    removeEventListener: (name, handler) => listeners.delete(handler),
  };
  const cleanup = [];
  const module = load(`src/components/${component}.tsx`, {
    window, document, Element: class {}, process: { env: { NEXT_PUBLIC_META_PIXEL_ID: pixelId } },
  }, {
    react: { useEffect: effect => { const result = effect(); if (result) cleanup.push(result); } },
    'next/navigation': { usePathname: () => pathname },
    '@/lib/trackingQueues': queues,
  });
  return { window, scripts, listeners, mount: module.default,
    unmount: () => cleanup.splice(0).forEach(fn => fn()),
    navigate: next => { pathname = next; module.default(); },
  };
}

test('Google remount retains one SDK, one config/page view, and one click listener', () => {
  const app = harness('GoogleAnalytics');
  app.mount();
  const original = app.window.gtag;
  app.unmount();
  app.mount();
  assert.equal(app.window.gtag, original);
  assert.equal(app.scripts.length, 1);
  assert.equal(app.listeners.size, 1);
  assert.equal(commands(app.window.dataLayer).filter(command => command[0] === 'config').length, 1);
  app.unmount();
  assert.equal(app.listeners.size, 0);
});

test('Meta tracks SPA route changes once without duplicate SDK initialization', () => {
  const app = harness('MetaPixel');
  app.mount();
  app.mount();
  assert.equal(app.window._fbq, app.window.fbq);
  assert.equal(app.scripts.length, 1);
  assert.deepEqual(commands(app.window.fbq.queue), [['init', 'TEST'], ['track', 'PageView']]);
  const received = [];
  app.window.fbq.callMethod = (...args) => received.push(args);
  app.navigate('/pricing');
  app.navigate('/pricing');
  app.navigate('/creator-challenge');
  assert.deepEqual(received, [['track', 'PageView'], ['track', 'PageView']]);
  assert.equal(app.scripts.length, 1);
});

test('Meta is a no-op if its public pixel ID is not configured', () => {
  const app = harness('MetaPixel', '');
  app.mount();
  assert.equal(app.scripts.length, 0);
  assert.equal(app.window.fbq, undefined);
});
