// Dev-мок для экранов игроков: node mocks/server.mjs, затем VITE_PROXY_TARGET=http://localhost:18081 npm run dev
// Режим: curl localhost:18081/__mode/ok|empty|error. Остальные пути проксируются на настоящий бэкенд (18080).
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const load = (f) => readFileSync(join(dir, f), 'utf8');
const REAL = { host: 'localhost', port: 18080 };
let mode = 'ok';

const routes = [
  [/^\/api\/v1\/rankings\/players/, (u) => (u.searchParams.get('min_games') > 0 ? '{"data":[]}' : load('rankings.json'))],
  [/^\/api\/v1\/players\/999001$/, () => load('player.sample-history.json')],
  [/^\/api\/v1\/players\/404$/, () => load('player.seed.json')],
  [/^\/api\/v1\/teams\/20$/, () => load('team.json')],
  [/^\/api\/v1\/transfers/, () => (mode === 'ok' ? load('transfers.sample.json') : load('transfers.empty.json'))],
];

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/__mode/')) { mode = u.pathname.split('/').pop(); res.end(mode); return; }
  const hit = routes.find(([re]) => re.test(u.pathname));
  if (hit) {
    res.setHeader('content-type', 'application/json');
    if (mode === 'error') { res.statusCode = 500; res.end('{"error":{"code":"db_error","message":"boom"}}'); return; }
    if (mode === 'empty') { res.end(u.pathname.includes('rankings') || u.pathname.includes('transfers') ? '{"data":[]}' : '{"data":[]}'); return; }
    res.end(hit[1](u)); return;
  }
  const p = http.request({ ...REAL, path: req.url, method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  p.on('error', () => { res.statusCode = 502; res.end('{}'); });
  req.pipe(p);
}).listen(18081, () => console.log('mock on 18081'));
