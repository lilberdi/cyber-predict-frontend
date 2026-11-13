import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getUpsets } from '../services/api';
import { fmtDateTime, fmtPercent } from '../utils/format';

export function UpsetsPage() {
  const { data, error, isLoading, reload } = useResource((s) => getUpsets(0.75, 50, s), []);
  return (
    <>
      <div className="pagehead">
        <h1>Ошибки модели</h1>
        <p className="muted">Матчи, где уверенный фаворит (≥ 75%) проиграл. Прогноз учитывается, только если он был сделан до начала матча.</p>
      </div>
      {error && data && <StaleBanner onRetry={reload} />}
      {isLoading && !data ? <Skeleton rows={5} height={72} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data ? null : (
          <>
            <div className="callout">
              Уверенных прогнозов: <b>{data.confident}</b>, из них ошибочных: <b>{data.upsets}</b>
              {data.confident > 0 && <> ({fmtPercent(data.rate ?? 0)})</>}. Для честной модели доля ошибок не должна превышать ~25%.
              {data.note && <><br /><small className="muted">{data.note}</small></>}
            </div>
            {!data.items?.length ? <EmptyState title="Громких ошибок пока нет" text="Они появятся, когда накопятся сыгранные матчи." /> : (
              <table className="rtable">
                <thead><tr><th>Матч</th><th>Счёт</th><th className="num">Фаворит</th><th>Дата</th></tr></thead>
                <tbody>
                  {data.items!.map((m) => {
                    const fav = m.prediction ? (m.prediction.p_team1_win >= m.prediction.p_team2_win ? m.team1 : m.team2) : undefined;
                    const pf = m.prediction ? Math.max(m.prediction.p_team1_win, m.prediction.p_team2_win) : undefined;
                    return (
                      <tr key={m.id}>
                        <td><Link to={`/match/${m.id}`}><TeamBadge team={m.team1} size={24} link={false} /> vs <TeamBadge team={m.team2} size={24} link={false} /></Link></td>
                        <td data-label="Счёт">{m.score.team1}:{m.score.team2}</td>
                        <td data-label="Фаворит" className="num">{fav ? `${fav.name} · ${fmtPercent(pf!)}` : '—'}</td>
                        <td data-label="Дата">{fmtDateTime(m.scheduled_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
    </>
  );
}
