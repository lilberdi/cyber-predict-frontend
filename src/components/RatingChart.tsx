import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { RatingPoint } from '../types';
import { fmtNum, fmtSigned } from '../utils/format';

const W = 640, H = 260, L = 48, R = 16, T = 16, B = 32;
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: '2-digit' });

export function RatingChart({ history }: { history: RatingPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const pts = history
    .map((p) => ({ ...p, t: new Date(p.played_at).getTime() }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);
  if (pts.length === 0) return null;

  const ts = pts.map((p) => p.t);
  const rs = pts.map((p) => p.rating_after);
  const t0 = Math.min(...ts), t1 = Math.max(...ts);
  const pad = Math.max(10, (Math.max(...rs) - Math.min(...rs)) * 0.15);
  const r0 = Math.min(...rs) - pad, r1 = Math.max(...rs) + pad;
  const x = (t: number) => L + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - L - R);
  const y = (r: number) => H - B - ((r - r0) / (r1 - r0)) * (H - T - B);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.rating_after).toFixed(1)}`).join(' ');
  const ticks = [r0, (r0 + r1) / 2, r1];
  const a = active !== null ? pts[active] : undefined;

  return (
    <figure className="chart">
      <div className="rchart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="График изменения рейтинга игрока по матчам" onMouseLeave={() => setActive(null)}>
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={L} x2={W - R} y1={y(tk)} y2={y(tk)} className="rel__grid" />
              <text x={L - 6} y={y(tk) + 4} textAnchor="end" className="rel__tick">{fmtNum(tk)}</text>
            </g>
          ))}
          <text x={L} y={H - 8} className="rel__tick">{dateFmt.format(t0)}</text>
          <text x={W - R} y={H - 8} textAnchor="end" className="rel__tick">{dateFmt.format(t1)}</text>
          {pts.length > 1 && <path d={path} className="rchart__line" />}
          {pts.map((p, i) => (
            <g key={p.match_id}>
              <circle cx={x(p.t)} cy={y(p.rating_after)} r={i === active ? 6 : 4} className="rchart__dot" />
              <circle
                cx={x(p.t)} cy={y(p.rating_after)} r={14} fill="transparent" tabIndex={0}
                aria-label={`${dateFmt.format(p.t)}: рейтинг ${fmtNum(p.rating_after)}, изменение ${fmtSigned(p.delta, 1)}`}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} onClick={() => setActive(i)}
              />
            </g>
          ))}
        </svg>
        {a && (
          <div className="rchart__tip" style={{ left: `${(x(a.t) / W) * 100}%` }} role="status">
            <b>{fmtNum(a.rating_after)}</b> <span className={a.delta >= 0 ? 'ok' : 'bad'}>{fmtSigned(a.delta, 1)}</span>
            <small>{dateFmt.format(a.t)} · <Link to={`/match/${a.match_id}`}>матч #{a.match_id}</Link></small>
          </div>
        )}
      </div>
      <details className="table-alt">
        <summary>Таблица данных</summary>
        <table>
          <thead><tr><th>Дата</th><th>Матч</th><th>Рейтинг</th><th>Изменение</th></tr></thead>
          <tbody>{[...pts].reverse().map((p) => <tr key={p.match_id}><td>{dateFmt.format(p.t)}</td><td><Link to={`/match/${p.match_id}`}>#{p.match_id}</Link></td><td>{fmtNum(p.rating_after)}</td><td>{fmtSigned(p.delta, 1)}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
