// Use only with the dedicated browser on 9334 and XDG directories inside .migration-baselines.
import { writeFileSync } from 'node:fs';
const debug = 'http://127.0.0.1:9334';
async function connect(url) {
  const ws = new WebSocket(url);
  let seq = 0;
  const pending = new Map();
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const p = pending.get(message.id);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(message.id);
    message.error ? p.reject(new Error(JSON.stringify(message.error))) : p.resolve(message.result);
  });
  return {
    close: () => ws.close(),
    send: (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = ++seq;
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error('Timeout ' + method));
        }, 30000);
        pending.set(id, { resolve, reject, timer });
        ws.send(JSON.stringify({ id, method, params }));
      }),
  };
}
const version = await (await fetch(debug + '/json/version')).json();
const tab = await (
  await fetch(debug + '/json/new?http://localhost:4300/', { method: 'PUT' })
).json();
const browser = await connect(tab.webSocketDebuggerUrl);
let page;
const report = { browser: version.Browser, manifestId: 'http://localhost:4300/' };
try {
  await browser.send('PWA.install', {
    manifestId: report.manifestId,
    installUrlOrBundleUrl: report.manifestId,
  });
  report.osState = await browser.send('PWA.getOsAppState', { manifestId: report.manifestId });
  const launch = await browser.send('PWA.launch', { manifestId: report.manifestId });
  report.launch = launch;
  const tabs = await (await fetch(debug + '/json/list')).json();
  const target = tabs.find((t) => t.id === launch.targetId);
  if (!target) throw new Error('Launched app target not found');
  page = await connect(target.webSocketDebuggerUrl);
  await page.send('Runtime.enable');
  await page.send('Page.enable');
  const evaluate = async (expression) => {
    const r = await page.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  for (let i = 0; i < 100; i++) {
    if (await evaluate('!!document.querySelector("app-onboarding")')) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  report.standalone = await evaluate('matchMedia("(display-mode: standalone)").matches');
  if (!report.standalone) throw new Error('App did not launch in real standalone display mode');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate('document.fonts.ready');
  await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
  const image = await page.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  writeFileSync('docs/previews/onboarding-standalone.png', Buffer.from(image.data, 'base64'));
  report.viewport = await evaluate(
    '({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bottomNavigation:!!document.querySelector("app-bottom-nav")})',
  );
  writeFileSync('docs/previews/pwa-standalone-validation.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.validated = false;
  report.limitation = error.message;
  writeFileSync('docs/previews/pwa-standalone-validation.json', JSON.stringify(report, null, 2));
  throw error;
} finally {
  page?.close();
  browser.close();
}
