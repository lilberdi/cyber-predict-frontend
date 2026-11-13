import { useSearchParams } from 'react-router-dom';
import { FormStrip } from '../components/FormStrip';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getTeamRanking } from '../services/api';

export function TeamsRankingPage() {
  const [params, setParams] = useSearchParams();
  const all = params.get('all') === '1';
  const { data, error, isLoading, reload } = useResource((s) => getTeamRanking(all ? 0 : 90, 50, s), [all]);

  return (
    <>
      <div className="pagehead">
        <h1>Рейтинг команд</h1>
        <p className="muted">Наш Elo (тот же, что в признаке elo_diff). Пересчитывается при переобучении модели, раз в сутки.</p>
      </div>
      <label className="switch">
        <input type="checkbox" checked={all} onChange={(e) => setParams(e.target.checked ? { all: '1' } : {}, { replace: true })} />
        <span>Показать неактивные <small className="muted">(без матчей более 90 дней)</small></span>
      </label>
      {error && data && <StaleBanner onRetry={reload} />}
      {isLoading && !data ? <Skeleton rows={8} height={52} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data?.length ? <EmptyState title="Рейтинг пока пуст" text="Команды появятся после обучения модели." />
        : (
          <table className="rtable">
            <thead><tr><th>#</th><th>Команда</th><th className="num">Elo</th><th className="num">За 7 дней</th><th>Форма</th><th className="num">Матчей</th></tr></thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.team.id}>
                  <td data-label="Место" className="rtable__rank">{r.rank}</td>
                  <td><TeamBadge team={r.team} size={32} /></td>
                  <td data-label="Elo" className="num">{r.elo == null ? '—' : Math.round(r.elo)}</td>
                  <td data-label="За 7 дней" className="num">{r.change_7d == null ? '—' : `${r.change_7d > 0 ? '+' : ''}${r.change_7d.toFixed(1)}`}</td>
                  <td data-label="Форма"><FormStrip form={r.form ?? []} /></td>
                  <td data-label="Матчей" className="num">{r.elo_matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </>
  );
}
