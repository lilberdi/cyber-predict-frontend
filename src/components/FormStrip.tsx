import type { FormResult } from '../types';

/** Последние матчи команды: W/L с подсказкой «соперник, счёт». */
export function FormStrip({ form }: { form: FormResult[] }) {
  if (!form?.length) return <span className="muted">нет данных</span>;
  return (
    <span className="formstrip" style={{ display: 'inline-flex', gap: 4 }}>
      {form.map((f) => (
        <span
          key={f.match_id}
          className={`badge ${f.won ? 'badge--high' : 'badge--low'}`}
          title={`${f.opponent.name}${f.score_for !== null ? `, ${f.score_for}:${f.score_against}` : ''}`}
        >
          {f.won ? 'W' : 'L'}
        </span>
      ))}
    </span>
  );
}
