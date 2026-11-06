import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getUpsets } from '../services/api';
import type { Match } from '../types';
import { fmtDateTime, fmtPercent, modelLabel } from '../utils/format';

const THRESHOLDS = [0.65, 0.75, 0.85];

function UpsetRow({ m }: { m: Match }) {
  const p = m.prediction!;
  const fav = p.p_team1_win > p.p_team2_win ? 1 : 2;
  const favTeam = fav === 1 ? m.team1 : m.team2;
  const winner = fav === 1 ? m.team2 : m.team1;
  const pFav = Math.max(p.p_team1_win, p.p_team2_win);
  const [sw, sl] = fav === 1 ? [m.score.team2, m.score.team1] : [m.score.team1, m.score.team2];
  return (
    <article className="upset">
      <div className="upset__p" title="Вероятность победы фаворита по модели до начала матча">
        <b>{fmtPercent(pFav, 0)}</b><small>на фаворита</small>
      </div>
      <div className="upset__teams">
        <span className="upset__lost"><TeamBadge team={favTeam} size={28} /></span>
        <span className="upset__score">{sl ?? '—'}:{sw ?? '—'}</span>
        <span className="upset__won"><TeamBadge team={winner} size={28} mirror /></span>
      </div>
      <div className="upset__meta muted">
        {fmtDateTime(m.scheduled_at)}{m.tournament ? ` · ${m.tournament}` : ''}{m.tournament_tier ? ` · тир ${m.tournament_tier.toUpperCase()}` : ''} · {modelLabel(p.model_name)}
      </div>
      <Link className="link" to={`/match/${m.id}`}>Почему модель ошиблась</Link>
    </article>
  );
}

export function UpsetsPage() {
  const [params, setParams] = useSearchParams();
  const raw = Number(params.get('p'));
  const threshold = THRESHOLDS.includes(raw) ? raw : 0.75;
  const { data: u, error, isLoading, reload } = useResource((s) => getUpsets(threshold, 50, s), [threshold]);
  const expected = 1 - threshold;

  return (
    <>
      <Link to="/results" className="back">← Результаты прогнозов</Link>
      <div className="pagehead">
        <h1>Неожиданные результаты</h1>
        <p className="muted">
          Матчи, где модель была уверена в фаворите, а он проиграл. Учитываются только прогнозы, сохранённые до начала матча;
          отменённые матчи и технические поражения не входят.
        </p>
      </div>

      <div className="chips" role="group" aria-label="Порог уверенности">
        {THRESHOLDS.map((t) => (
          <button key={t} className={`chip ${t === threshold ? 'chip--on' : ''}`} aria-pressed={t === threshold}
            onClick={() => setParams(t === 0.75 ? {} : { p: String(t) }, { replace: true })}>
            фаворит ≥ {fmtPercent(t, 0)}
          </button>
        ))}
      </div>

      {error && u && <StaleBanner onRetry={reload} />}
      {isLoading && !u ? <Skeleton rows={4} height={72} />
        : error && !u ? <ErrorState onRetry={reload} text={error.message} />
        : u && (
          <>
            <section className="panel">
              <div className="stats">
                <div className="stat">
                  <span className="stat__label">Уверенных прогнозов</span>
                  <strong className="stat__value">{u.confident}</strong>
                  <span className="stat__hint">фаворит ≥ {fmtPercent(threshold, 0)}</span>
                </div>
                <div className="stat">
                  <span className="stat__label">Из них сенсаций</span>
                  <strong className="stat__value">{u.upsets}</strong>
                  <span className="stat__hint">фаворит проиграл</span>
                </div>
                <div className="stat">
                  <span className="stat__label">Доля ошибок</span>
                  <strong className="stat__value">{u.confident >= 10 ? fmtPercent(u.rate) : 'мало данных'}</strong>
                  <span className="stat__hint">честная модель: не больше {fmtPercent(expected, 0)}</span>
                </div>
              </div>
              {u.confident >= 10 && (
                <p className="note">
                  {u.rate <= expected + 0.05
                    ? `Ошибок не больше, чем обещает сама вероятность: при ${fmtPercent(threshold, 0)} уверенности фаворит должен проигрывать примерно в ${fmtPercent(expected, 0)} случаев.`
                    : `Ошибок больше, чем обещает вероятность (${fmtPercent(expected, 0)}): на этом пороге модель излишне уверена.`}
                </p>
              )}
            </section>

            {u.items.length === 0 ? (
              <EmptyState title="Сенсаций нет" text={u.confident ? 'Все уверенные прогнозы на этом пороге сбылись.' : 'Пока нет уверенных прогнозов с известным итогом.'} />
            ) : (
              <div className="upsets">{u.items.map((m) => <UpsetRow key={m.id} m={m} />)}</div>
            )}
          </>
        )}
    </>
  );
}
