// Dev-мок для экранов игроков: node mocks/server.mjs, затем VITE_PROXY_TARGET=http://localhost:18081 npm run dev
// Режим: curl localhost:18081/__mode/ok|empty|error. Остальные пути проксируются на настоящий бэкенд (18080).
// Без бэкенда: MOCK_ONLY=1 node mocks/server.mjs — лента матчей тоже берётся из моков.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const load = (f) => readFileSync(join(dir, f), 'utf8');
const REAL = { host: 'localhost', port: 18080 };
let mode = 'ok';

const ONLY = process.env.MOCK_ONLY === '1';
const routes = [
  [/^\/api\/v1\/rankings\/players/, (u) => (u.searchParams.get('min_games') > 0 ? '{"data":[]}' : load('rankings.json'))],
  [/^\/api\/v1\/players\/999001$/, () => load('player.sample-history.json')],
  [/^\/api\/v1\/players\/404$/, () => load('player.seed.json')],
  [/^\/api\/v1\/teams\/20$/, () => load('team.json')],
  // Синтетика из make-samples.mjs: рейтинг команд, история Elo, личные встречи, сенсации.
  [/^\/api\/v1\/rankings\/teams/, () => load('rankings.teams.json')],
  [/^\/api\/v1\/teams\/9991007$/, () => load('team.elo-history.json')],
  [/^\/api\/v1\/matches\/999101\/h2h$/, () => load('h2h.sample.json')],
  [/^\/api\/v1\/matches\/999101$/, () => load('match.sample.json')],
  [/^\/api\/v1\/matches\/upsets/, () => load('upsets.sample.json')],
  [/^\/api\/v1\/transfers/, () => (mode === 'ok' ? load('transfers.sample.json') : load('transfers.empty.json'))],
];

if (ONLY) {
  routes.push(
    [/^\/api\/v1\/matches\/upcoming/, () => load('upcoming.sample.json')],
    [/^\/api\/v1\/matches\/finished/, () => JSON.stringify({ data: JSON.parse(load('upsets.sample.json')).data.items })],
    [/^\/api\/v1\/model\/live-accuracy/, () => '{"data":{"evaluated":212,"correct":131,"accuracy":0.618,"by_confidence":{},"by_model":{},"note":"sample"}}'],
  );
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/__mode/')) { mode = u.pathname.split('/').pop(); res.end(mode); return; }
  if (ONLY && u.pathname === '/health') { res.end('{"status":"ok"}'); return; }
  const hit = routes.find(([re]) => re.test(u.pathname));
  if (hit) {
    res.setHeader('content-type', 'application/json');
    if (mode === 'error') { res.statusCode = 500; res.end('{"error":{"code":"db_error","message":"boom"}}'); return; }
    if (mode === 'empty' && u.pathname.endsWith('/upsets')) { res.end('{"data":{"threshold":0.75,"confident":0,"upsets":0,"rate":0,"items":[],"note":""}}'); return; }
    if (mode === 'empty' && u.pathname.endsWith('/h2h')) { res.statusCode = 404; res.end('{"error":{"code":"not_found","message":"match not found"}}'); return; }
    if (mode === 'empty') { res.end(u.pathname.includes('rankings') || u.pathname.includes('transfers') ? '{"data":[]}' : '{"data":[]}'); return; }
    res.end(hit[1](u)); return;
  }
  const p = http.request({ ...REAL, path: req.url, method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  p.on('error', () => { res.statusCode = 502; res.end('{}'); });
  req.pipe(p);
}).listen(18081, () => console.log('mock on 18081'));
