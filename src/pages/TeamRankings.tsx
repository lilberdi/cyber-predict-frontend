import { useSearchParams } from 'react-router-dom';
import { Delta, FormStrip } from '../components/FormStrip';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getTeamRanking } from '../services/api';
import { fmtNum } from '../utils/format';

const MIN_GAMES = 10;
const ACTIVE_DAYS = 90;

export function TeamRankingsPage() {
  const [params, setParams] = useSearchParams();
  const all = params.get('all') === '1';
  const { data, error, isLoading, reload } = useResource(
    (s) => getTeamRanking(all ? 0 : MIN_GAMES, all ? 0 : ACTIVE_DAYS, 100, s),
    [all],
  );
  const toggle = (v: boolean) => setParams(v ? { all: '1' } : {}, { replace: true });

  return (
    <>
      <div className="pagehead">
        <h1>Рейтинг команд</h1>
        <p className="muted">
          Наш рейтинг Elo — тот же, что модель использует в признаке «Рейтинг Elo». Пересчитывается раз в сутки по всем сыгранным матчам.
          Не совпадает с рейтингами HLTV и Valve.
        </p>
      </div>

      <label className="switch">
        <input type="checkbox" checked={all} onChange={(e) => toggle(e.target.checked)} />
        <span>Показать все команды <small className="muted">(по умолчанию скрыты команды с историей меньше {MIN_GAMES} матчей и без игр {ACTIVE_DAYS} дней)</small></span>
      </label>

      {error && data && <StaleBanner onRetry={reload} />}
      {isLoading && !data ? <Skeleton rows={8} height={52} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data?.length ? (
          <EmptyState title="Рейтинг пока пуст" text="Он появится после первого обучения модели.">
            {!all && <button className="btn" onClick={() => toggle(true)}>Показать все команды</button>}
          </EmptyState>
        ) : (
          <table className="rtable rtable--teams">
            <thead>
              <tr>
                <th>#</th><th>Команда</th><th className="num">Elo</th><th className="num">За 7 дней</th>
                <th>Форма <small className="muted">(новые слева)</small></th><th className="num">Матчей</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.team.id}>
                  <td data-label="Место" className="rtable__rank">{r.rank}</td>
                  <td><TeamBadge team={r.team} size={28} /></td>
                  <td data-label="Elo" className="num"><b>{fmtNum(r.elo)}</b></td>
                  <td data-label="За 7 дней" className="num"><Delta value={r.change_7d} /></td>
                  <td data-label="Форма"><FormStrip form={r.form} /></td>
                  <td data-label="Матчей в истории" className="num">{fmtNum(r.elo_matches)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </>
  );
}
