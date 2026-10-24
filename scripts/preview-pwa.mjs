import { createServer, request as proxyRequest } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist/mobility-frontend/browser');
const port = Number(process.env.MOBILITY_PREVIEW_PORT || 4300);
const upstream = new URL(process.env.MOBILITY_API_UPSTREAM || 'http://127.0.0.1:8000');
if (upstream.protocol !== 'http:') throw new Error('The local API upstream must use http:.');
if (!existsSync(resolve(root, 'ngsw.json')))
  throw new Error('Run npm run build before preview:pwa.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    // Preview only: use the existing Laravel contract, never serve index.html as an API response.
    res.setHeader('Cache-Control', 'no-store');
    const proxy = proxyRequest(
      new URL(url.pathname + url.search, upstream),
      {
        method: req.method,
        headers: { ...req.headers, host: upstream.host },
        timeout: 15000,
      },
      (reply) => {
        const headers = { ...reply.headers, 'cache-control': 'no-store' };
        res.writeHead(reply.statusCode ?? 502, headers);
        reply.pipe(res);
      },
    );
    proxy.on('timeout', () => proxy.destroy());
    proxy.on('error', () => {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ message: 'A API Laravel está indisponível na prévia local.' }));
    });
    req.pipe(proxy);
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405);
    res.end();
    return;
  }
  let filename;
  try {
    filename = resolve(root, '.' + decodeURIComponent(url.pathname));
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  if (filename !== root && !filename.startsWith(root + sep)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!existsSync(filename) || !statSync(filename).isFile()) {
    if (extname(url.pathname)) {
      res.writeHead(404);
      res.end();
      return;
    }
    filename = resolve(root, 'index.html');
  }
  res.setHeader('Content-Type', types[extname(filename)] || 'application/octet-stream');
  if (filename.endsWith('/ngsw-worker.js')) res.setHeader('Service-Worker-Allowed', '/');
  res.writeHead(200);
  if (req.method === 'HEAD') res.end();
  else createReadStream(filename).pipe(res);
});
server.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () =>
  console.log(`Mobility PWA: http://localhost:${port} (API: ${upstream.origin})`),
);
