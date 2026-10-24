import { mkdirSync, writeFileSync } from 'node:fs';
const base = 'http://127.0.0.1:9333';
const tab = await (
  await fetch(base + '/json/new?http://localhost:4300/', { method: 'PUT' })
).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let seq = 0;
const pending = new Map();
const exceptions = [];
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown')
    exceptions.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const promise = pending.get(message.id);
  if (!promise) return;
  pending.delete(message.id);
  clearTimeout(promise.timeout);
  if (message.error) promise.reject(new Error(JSON.stringify(message.error)));
  else promise.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error('Timeout: ' + method));
    }, 15000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function until(expression, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Condition timed out: ' + expression);
}
async function screenshot(name) {
  await evaluate('document.fonts.ready');
  await evaluate(
    'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
  );
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync('docs/previews/' + name + '.png', Buffer.from(r.data, 'base64'));
}
const report = {};
try {
  mkdirSync('docs/previews', { recursive: true });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  // This harness must run against the dedicated, disposable browser profile.
  await send('Storage.clearDataForOrigin', {
    origin: 'http://localhost:4300',
    storageTypes: 'all',
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:4300/' });
  await until("!!document.querySelector('app-onboarding')");
  await evaluate('document.fonts.ready');
  await screenshot('onboarding-desktop');
  report.manifest = await send('Page.getAppManifest');
  try {
    report.installability = await send('Page.getInstallabilityErrors');
  } catch (e) {
    report.installability = { unavailable: e.message };
  }
  await until('!!navigator.serviceWorker.controller', 40000);
  report.worker = await evaluate(
    'navigator.serviceWorker.getRegistration().then(r => ({scope:r.scope,state:r.active?.state,controller:!!navigator.serviceWorker.controller}))',
  );
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await screenshot('onboarding-mobile');
  report.mobile = await evaluate(
    '({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bottomNavigation:!!document.querySelector("app-bottom-nav")})',
  );
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'display-mode', value: 'standalone' }],
  });
  report.standaloneEmulation = await evaluate('matchMedia("(display-mode: standalone)").matches');
  if (report.standaloneEmulation) await screenshot('onboarding-standalone-emulated');
  await evaluate(`document.querySelector('a[href="/login"]').click()`);
  await until("!!document.querySelector('app-login')");
  await screenshot('login-mobile-light');
  await evaluate(`document.querySelector('button[aria-label="Tema escuro"]').click()`);
  await until('document.documentElement.classList.contains("dark")');
  await screenshot('login-mobile-dark');
  await evaluate(`document.querySelector('a[href="/register"]').click()`);
  await until("!!document.querySelector('app-register')");
  await screenshot('register-mobile-dark');
  report.register = await evaluate(
    '({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,inputs:document.querySelectorAll("app-register input").length,bottomNavigation:!!document.querySelector("app-bottom-nav")})',
  );
  await send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await until('!navigator.onLine');
  await send('Page.navigate', { url: 'http://localhost:4300/login' });
  await until("!!document.querySelector('app-login')");
  report.offline = await evaluate(
    '({onLine:navigator.onLine,publicPage:!!document.querySelector("app-login"),notice:document.querySelector("app-pwa-status")?.textContent})',
  );
  await screenshot('login-offline');
  await send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  report.cache = await evaluate(
    'caches.keys().then(async keys => ({names:keys,requests:(await Promise.all(keys.map(async key => (await (await caches.open(key)).keys()).map(r=>r.url)))).flat()}))',
  );
  if (report.cache.requests.some((url) => new URL(url).pathname.startsWith('/api')))
    throw new Error('API URL found in service worker cache');
  report.exceptions = exceptions;
  if (exceptions.length) throw new Error('Browser runtime exceptions: ' + exceptions.join(', '));
  writeFileSync('docs/previews/pwa-browser-validation.json', JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        worker: report.worker,
        installability: report.installability,
        mobile: report.mobile,
        register: report.register,
        offline: report.offline,
        standaloneEmulation: report.standaloneEmulation,
        cacheRequests: report.cache.requests.length,
        exceptions,
      },
      null,
      2,
    ),
  );
} finally {
  await send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  }).catch(() => {});
  socket.close();
}
