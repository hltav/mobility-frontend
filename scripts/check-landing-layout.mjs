// Run only against a disposable Chromium profile with desktop mouse/hover enabled.
// Example: LANDING_CDP_URL=http://127.0.0.1:9338 node scripts/check-landing-layout.mjs
// Evidence is written outside Git. No session or origin storage is cleared.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const endpoint = process.env.LANDING_CDP_URL ?? 'http://127.0.0.1:9338';
const base = process.env.LANDING_BASE_URL ?? 'http://127.0.0.1:4300';
const output = process.env.LANDING_EVIDENCE_DIR ?? `/tmp/ope37-landing-${Date.now()}`;
const recordOnly = process.argv.includes('--record-only');
mkdirSync(output, { recursive: true });
const tab = await (await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' })).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});
let sequence = 0;
const pending = new Map();
const exceptions = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown')
    exceptions.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const item = pending.get(message.id);
  if (!item) return;
  pending.delete(message.id);
  clearTimeout(item.timeout);
  if (message.error) item.reject(new Error(JSON.stringify(message.error)));
  else item.resolve(message.result);
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timeout: ${method}`));
    }, 15000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  assert(!response.exceptionDetails, JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return;
    await pause(100);
  }
  throw new Error(`Condition timed out: ${expression}`);
}
async function measure() {
  return evaluate(`(() => {
    const rect = (e) => { const r=e.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}; };
    const box = (e) => { const s=getComputedStyle(e); return {...rect(e),clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,heightCSS:s.height,minHeight:s.minHeight,maxHeight:s.maxHeight,overflow:s.overflow,padding:s.padding,margin:s.margin,gap:s.gap,flex:s.flex,display:s.display}; };
    const selectors=['.app-shell','main','app-onboarding','.entry-page','.entry-header','.entry-intro','.entry-map','h1','.entry-description','.entry-social','.entry-sheet','.sheet-handle','.entry-actions','.entry-install','.entry-meta','.entry-demo'];
    const blocks=Object.fromEntries(selectors.map(s=>[s,document.querySelector(s)]).filter(([,e])=>e).map(([s,e])=>[s,box(e)]));
    const main=document.querySelector('main'), frame=document.querySelector('.app-shell');
    const available=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine) and (display-mode:browser)').matches?rect(main):{top:0,left:0,right:innerWidth,bottom:innerHeight,height:innerHeight,width:innerWidth};
    const visible=(e)=>{const r=rect(e);return r.top>=available.top-1&&r.bottom<=available.bottom+1&&r.left>=available.left-1&&r.right<=available.right+1;};
    return {available,occupied:rect(document.querySelector('.entry-page')).height,blocks,buttons:[...document.querySelectorAll('.entry-button')].map(e=>({...rect(e),visible:visible(e)})),footerVisible:[...document.querySelectorAll('.entry-meta,.entry-demo')].every(visible),documentHeight:document.documentElement.scrollHeight,documentWidth:document.documentElement.scrollWidth,frame:rect(frame)};
  })()`);
}
const rows = [];
let fallback = null;
const sizes = [
  [320, 568],
  [360, 800],
  [375, 667],
  [390, 844],
  [393, 852],
  [412, 924],
  [440, 956],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
];
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setBlockedURLs', {
    urls: ['http://localhost:8000/*', 'http://127.0.0.1:8000/*'],
  });
  for (const [width, height] of sizes) {
    const mobile = width < 1024;
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    for (const theme of ['light', 'dark']) {
      await send('Emulation.setEmulatedMedia', {
        features: [
          { name: 'prefers-color-scheme', value: theme },
          { name: 'prefers-reduced-motion', value: 'reduce' },
        ],
      });
      await send('Page.navigate', { url: base + '/' });
      await until('!!document.querySelector("app-onboarding .entry-demo")');
      await evaluate('document.fonts.ready');
      if (!mobile) await until('matchMedia("(hover:hover) and (pointer:fine)").matches');
      const label = theme === 'light' ? 'Tema claro' : 'Tema escuro';
      await evaluate(`document.querySelector('button[aria-label="${label}"]').click()`);
      // Explicit browser-event fixture covers the optional install control without installing a PWA.
      await evaluate(
        `window.dispatchEvent(Object.assign(new Event('beforeinstallprompt',{cancelable:true}),{prompt:async()=>{},userChoice:Promise.resolve({outcome:'dismissed'})}))`,
      );
      await until('!!document.querySelector(".entry-install")');
      await until(`document.documentElement.classList.contains('dark') === ${theme === 'dark'}`);
      await pause(100);
      const measurement = await measure();
      const name = `${width}x${height}-${theme}`;
      rows.push({ name, width, height, theme, installPromptFixture: true, ...measurement });
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
      });
      writeFileSync(join(output, name + '.png'), Buffer.from(screenshot.data, 'base64'));
      if (!recordOnly) {
        const { available, blocks, buttons } = measurement;
        assert(
          blocks['.entry-page'].scrollHeight <= available.height + 1,
          name + ': landing vertical overflow',
        );
        assert(
          blocks.main.scrollHeight <= blocks.main.clientHeight + 1,
          name + ': main vertical overflow',
        );
        assert(measurement.documentHeight <= height + 1, name + ': document vertical overflow');
        assert(measurement.documentWidth <= width + 1, name + ': document horizontal overflow');
        assert(
          blocks.main.scrollWidth <= blocks.main.clientWidth + 1,
          name + ': main horizontal overflow',
        );
        assert(
          buttons.length === 3 && buttons.every((b) => b.visible && b.height >= 44),
          name + ': visible touch controls',
        );
        assert(measurement.footerVisible, name + ': visible footer');
        assert(
          blocks['.entry-install'].bottom <= available.bottom + 1,
          name + ': visible install control',
        );
      }
    }
  }
  if (!recordOnly) {
    // Accessibility fallback: enlarged text and a genuinely short viewport must remain scrollable.
    await send('Emulation.setDeviceMetricsOverride', {
      width: 320,
      height: 400,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await send('Page.navigate', { url: base + '/' });
    await until('!!document.querySelector(".entry-demo")');
    await evaluate('document.fonts.ready');
    await evaluate(
      `const style=document.createElement('style');style.textContent='app-onboarding h1, app-onboarding p, app-onboarding .entry-button {font-size:200% !important}';document.head.append(style)`,
    );
    await evaluate(
      'new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
    );
    await evaluate(`document.querySelectorAll('.entry-button')[2].focus()`);
    await pause(100);
    fallback = await evaluate(
      `(()=>{const m=document.querySelector('main'),r=document.activeElement.getBoundingClientRect();return {scrollHeight:m.scrollHeight,clientHeight:m.clientHeight,scrollTop:m.scrollTop,focusTop:r.top,focusBottom:r.bottom,innerHeight}})()`,
    );
    const fallbackShot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(output, 'enlarged-text.png'), Buffer.from(fallbackShot.data, 'base64'));
    assert(
      await evaluate(
        `(()=>{const m=document.querySelector('main'),r=document.activeElement.getBoundingClientRect();return m.scrollHeight>m.clientHeight&&r.top>=0&&r.bottom<=innerHeight})()`,
      ),
      'Enlarged text fallback must scroll to focused Google button',
    );
  }
  assert.equal(exceptions.length, 0, 'Browser runtime exceptions');
  console.log(JSON.stringify({ output, measurements: rows.length, recordOnly, exceptions }));
} finally {
  writeFileSync(
    join(output, 'report.json'),
    JSON.stringify({ base, recordOnly, rows, exceptions, fallback }, null, 2),
  );
  await send('Page.close').catch(() => {});
  socket.close();
}
