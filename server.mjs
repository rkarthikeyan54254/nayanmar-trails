import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.PORT || 3000);
const release = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.COMMIT_REF || 'local';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};

function json(res, status, value, extra = {}) {
  res.writeHead(status, {
    ...securityHeaders,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extra,
  });
  res.end(JSON.stringify(value));
}

async function readJsonBody(req, maxBytes = 16_384) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('payload_too_large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function safeEvent(value) {
  const allowed = new Set([
    'page_view',
    'start_here_view',
    'start_here_action',
    'saint_selected',
    'story_open',
    'site_selected',
    'search_select',
    'map_interaction',
    'sources_open',
    'share',
    'route_open',
    'app_error',
  ]);
  if (!value || !allowed.has(value.event)) return null;
  return {
    event: value.event,
    session: String(value.session || '').slice(0, 80),
    path: String(value.path || '').slice(0, 300),
    locale: value.locale === 'ta' ? 'ta' : 'en',
    properties: value.properties && typeof value.properties === 'object' ? value.properties : {},
    ts: String(value.ts || '').slice(0, 40),
    release,
  };
}

createServer(async (req, res) => {
  try {
    const parsed = new URL(req.url || '/', 'http://localhost');

    if (req.method === 'GET' && parsed.pathname === '/healthz') {
      return json(res, 200, { ok: true, service: 'nayanmar-trails', release });
    }

    if (req.method === 'POST' && parsed.pathname === '/api/event') {
      const event = safeEvent(await readJsonBody(req));
      if (!event) return json(res, 400, { ok: false });
      console.log('NAYANMAR_EVENT', JSON.stringify(event));
      res.writeHead(204, { ...securityHeaders, 'Cache-Control': 'no-store' });
      return res.end();
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return json(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'GET, HEAD, POST' });
    }

    const urlPath = decodeURIComponent(parsed.pathname);
    const relative = normalize(urlPath).replace(/^([/\\])+/, '');
    let target = join(root, relative || 'index.html');
    if (!target.startsWith(root.endsWith(sep) ? root : root + sep)) {
      return json(res, 400, { ok: false, error: 'invalid_path' });
    }

    let info;
    try { info = await stat(target); } catch { info = null; }
    if (info?.isDirectory()) {
      target = join(target, 'index.html');
      try { info = await stat(target); } catch { info = null; }
    }

    if (!info?.isFile()) {
      target = join(root, 'index.html');
      info = await stat(target);
    }

    const extension = extname(target);
    const immutable = target.includes(`${sep}assets${sep}`);
    const body = req.method === 'HEAD' ? null : await readFile(target);
    res.writeHead(200, {
      ...securityHeaders,
      'Content-Type': mime[extension] || 'application/octet-stream',
      'Cache-Control': extension === '.html'
        ? 'public, max-age=0, must-revalidate'
        : immutable
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=3600',
    });
    res.end(body);
  } catch (error) {
    console.error('SERVER_ERROR', error);
    json(res, 500, { ok: false, error: 'server_error' });
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Nayanmar Trails listening on ${port} · release ${release}`);
});
