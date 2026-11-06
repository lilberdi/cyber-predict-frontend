import { Link } from 'react-router-dom';
import type { FormResult } from '../types';
import { fmtDateTime, fmtSigned } from '../utils/format';

const score = (f: FormResult) =>
  f.score_for !== null && f.score_for !== undefined && f.score_against !== null && f.score_against !== undefined
    ? ` ${f.score_for}:${f.score_against}`
    : '';

/** Полоска W/L, новые матчи слева. Пустые ячейки добивают до `size`, чтобы колонки не прыгали. */
export function FormStrip({ form, size = 5 }: { form: FormResult[]; size?: number }) {
  const items = form.slice(0, size);
  const wins = items.filter((f) => f.won).length;
  return (
    <span className="form" role="list" aria-label={items.length ? `Форма: ${wins} побед из ${items.length}, новые слева` : 'Нет сыгранных матчей'}>
      {items.map((f) => {
        const title = `${f.won ? 'Победа' : 'Поражение'}${score(f)} — ${f.opponent.name}, ${fmtDateTime(f.played_at)}`;
        return (
          <Link key={f.match_id} role="listitem" to={`/match/${f.match_id}`} className={`form__i ${f.won ? 'form__i--w' : 'form__i--l'}`} title={title} aria-label={title}>
            {f.won ? 'W' : 'L'}
          </Link>
        );
      })}
      {Array.from({ length: Math.max(0, size - items.length) }, (_, i) => <i key={`e${i}`} className="form__i form__i--empty" aria-hidden="true" />)}
    </span>
  );
}

export function Delta({ value, digits = 1 }: { value?: number | null; digits?: number }) {
  if (value === null || value === undefined) return <span className="muted">—</span>;
  const r = Number(value.toFixed(digits));
  const cls = r > 0 ? 'delta delta--up' : r < 0 ? 'delta delta--down' : 'delta';
  return <span className={cls}>{r > 0 ? '▲ ' : r < 0 ? '▼ ' : ''}{fmtSigned(value, digits)}</span>;
}
