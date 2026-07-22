// Servidor local con proxy para Google Apps Script (evita CORS en desarrollo)
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT        = 8080;
const APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbzxCygphFeyT6x4s3eStxixxvbp0M4dk_WUKG1TgAuRgt2WujH8bA7O0VaJmXpo_bvS/exec';

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

function proxyRequest(req, res, targetUrl, method, body) {
  const parsed = new url.URL(targetUrl);
  const options = {
    hostname: parsed.hostname,
    path:     parsed.pathname + parsed.search,
    method,
    headers: { 'Content-Type': 'application/json' },
    // Seguir redirecciones manualmente
  };

  function doRequest(reqUrl, redirectCount) {
    if (redirectCount > 10) { res.writeHead(500); res.end('Too many redirects'); return; }
    const p = new url.URL(reqUrl);
    const mod = p.protocol === 'https:' ? https : http;
    const opts = {
      hostname: p.hostname,
      path: p.pathname + p.search,
      method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': body ? Buffer.byteLength(body) : 0 },
    };
    const preq = mod.request(opts, pres => {
      if ([301,302,303,307,308].includes(pres.statusCode) && pres.headers.location) {
        const next = pres.headers.location.startsWith('http')
          ? pres.headers.location
          : p.origin + pres.headers.location;
        // En redirect POST->GET para 302/303
        const nextMethod = [302,303].includes(pres.statusCode) ? 'GET' : method;
        const nextBody   = nextMethod === 'GET' ? null : body;
        doRequest(next, redirectCount + 1, nextMethod, nextBody);
        return;
      }
      res.writeHead(pres.statusCode, {
        'Content-Type': pres.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      pres.pipe(res);
    });
    preq.on('error', e => { res.writeHead(500); res.end(e.message); });
    if (body && method !== 'GET') preq.write(body);
    preq.end();
  }

  doRequest(targetUrl, 0);
}

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(); return;
  }

  // Proxy para la API
  if (req.url.startsWith('/api-proxy')) {
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const target = APPS_SCRIPT + qs;
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => proxyRequest(req, res, target, req.method, body || null));
    return;
  }

  // Servir archivos estáticos con headers anti-caché en desarrollo
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  if (!path.extname(filePath)) filePath += '.html';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Dev server en http://localhost:${PORT}  (proxy activo)`));
