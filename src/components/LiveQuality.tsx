import type { AccuracyBucket, LiveAccuracy } from '../types';
import { fmtNum, fmtPercent } from '../utils/format';

const TIER_LABELS: Record<string, string> = { s: 'Тир S', a: 'Тир A', b: 'Тир B', c: 'Тир C', d: 'Тир D', unknown: 'Тир не указан' };
const TIER_ORDER = ['s', 'a', 'b', 'c', 'd', 'unknown'];
const MIN_SHOWN = 10; // меньше матчей: проценты шумят, показываем «угадано N из M»

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      <span className="stat__hint">{hint}</span>
    </div>
  );
}

function tierValue(b: AccuracyBucket) {
  return b.evaluated >= MIN_SHOWN ? fmtPercent(b.accuracy, 0) : `${b.correct} из ${b.evaluated}`;
}

const W = 640, H = 220, L = 44, R = 16, T = 14, B = 28;
const dayFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

function Timeline({ points }: { points: NonNullable<LiveAccuracy['timeline']> }) {
  // первые дни: 1–2 матча, процент прыгает, поэтому линию начинаем с 10-го матча
  const pts = points.filter((p) => p.evaluated >= MIN_SHOWN).map((p) => ({ ...p, t: Date.parse(`${p.date}T00:00:00Z`) }));
  if (pts.length < 2) return null;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const lo = Math.min(0.5, ...pts.map((p) => p.accuracy)) - 0.03;
  const hi = Math.max(...pts.map((p) => p.accuracy)) + 0.03;
  const x = (t: number) => L + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - L - R);
  const y = (v: number) => H - B - ((v - lo) / (hi - lo)) * (H - T - B);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.accuracy).toFixed(1)}`).join(' ');
  const ticks = [lo + 0.03, (lo + hi) / 2, hi - 0.03];
  return (
    <figure className="chart">
      <div className="rchart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="График накопленной точности прогнозов по дням">
          {ticks.map((tk) => (
            <g key={tk}>
              <line x1={L} x2={W - R} y1={y(tk)} y2={y(tk)} className="rel__grid" />
              <text x={L - 6} y={y(tk) + 4} textAnchor="end" className="rel__tick">{fmtPercent(tk, 0)}</text>
            </g>
          ))}
          <line x1={L} x2={W - R} y1={y(0.5)} y2={y(0.5)} className="rel__grid" strokeDasharray="4 4" />
          <text x={W - R} y={y(0.5) - 4} textAnchor="end" className="rel__tick">50% — как монетка</text>
          <text x={L} y={H - 8} className="rel__tick">{dayFmt.format(t0)}</text>
          <text x={W - R} y={H - 8} textAnchor="end" className="rel__tick">{dayFmt.format(t1)}</text>
          <path d={path} className="rchart__line" />
        </svg>
      </div>
      <details className="table-alt">
        <summary>Таблица данных</summary>
        <table>
          <thead><tr><th>Дата</th><th>Матчей</th><th>Угадано</th><th>Точность</th></tr></thead>
          <tbody>{pts.map((p) => <tr key={p.date}><td>{dayFmt.format(p.t)}</td><td>{p.evaluated}</td><td>{p.correct}</td><td>{fmtPercent(p.accuracy)}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

/** Расширенная статистика боя. Все поля необязательные: со старым backend блок просто не показывается. */
export function LiveQuality({ a }: { a: LiveAccuracy }) {
  const tiers = TIER_ORDER.filter((t) => a.by_tier?.[t]);
  const hasProbs = a.log_loss !== undefined && a.brier !== undefined;
  if (!tiers.length && !hasProbs && !a.reliability?.length && !a.timeline?.length) return null;

  return (
    <>
      {a.timeline && a.timeline.length > 1 && (
        <section className="panel">
          <h2 className="h-block">Как менялась точность</h2>
          <p className="muted">Накопленная доля угаданных матчей по дням. Пока матчей меньше {MIN_SHOWN}, линию не рисуем.</p>
          <Timeline points={a.timeline} />
        </section>
      )}

      {hasProbs && (
        <section className="panel">
          <h2 className="h-block">Качество вероятностей</h2>
          <p className="muted">Показывает не только «угадала или нет», но и насколько честно названы проценты. Меньше значит лучше.</p>
          <div className="stats">
            <Tile label="Log-loss" value={fmtNum(a.log_loss!, 3)} hint="ориентир «всегда 50%»: 0,693" />
            <Tile label="Brier" value={fmtNum(a.brier!, 3)} hint="ориентир «всегда 50%»: 0,250" />
          </div>
        </section>
      )}

      {tiers.length > 0 && (
        <section className="panel">
          <h2 className="h-block">По уровню турнира</h2>
          <p className="muted">Самые высокие тиры (S, A) сложнее всего: сильные команды близки по уровню. Малые выборки — ориентир, не вывод.</p>
          <div className="stats">
            {tiers.map((t) => {
              const b = a.by_tier![t];
              return <Tile key={t} label={TIER_LABELS[t] ?? t} value={tierValue(b)} hint={`матчей: ${b.evaluated}`} />;
            })}
          </div>
        </section>
      )}

      {a.reliability && a.reliability.length > 0 && (
        <section className="panel">
          <h2 className="h-block">Честны ли проценты</h2>
          <p className="muted">Если модель даёт фавориту 70%, он должен выигрывать примерно в 70% матчей. Корзины с малым числом матчей шумные.</p>
          <div className="table-alt">
            <table>
              <thead><tr><th>Модель дала фавориту</th><th>Матчей</th><th>В среднем</th><th>Фаворит выиграл</th></tr></thead>
              <tbody>
                {a.reliability.map((r) => (
                  <tr key={r.bin}>
                    <td>{r.bin.replace('-', '–').replace(/(\d)\.(\d)/g, '$1,$2')}</td>
                    <td>{r.n}</td>
                    <td>{fmtPercent(r.predicted, 0)}</td>
                    <td>{fmtPercent(r.actual, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
