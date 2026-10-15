import { useSearchParams } from 'react-router-dom';
import { Flag, InfoHint, PlayerLink, Rating } from '../components/PlayerParts';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { Pic, TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getRanking } from '../services/api';

const MIN_GAMES = 5;

export function RankingsPage() {
  const [params, setParams] = useSearchParams();
  const hide = params.get('hide') === '1';
  const { data, error, isLoading, reload } = useResource((s) => getRanking(hide ? MIN_GAMES : 0, 50, s), [hide]);
  const toggle = (v: boolean) => setParams(v ? { hide: '1' } : {}, { replace: true });
  const allSeed = Boolean(data?.length) && data!.every((p) => p.rating_is_seed);

  return (
    <>
      <div className="pagehead">
        <h1>Рейтинг игроков <InfoHint /></h1>
        <p className="muted">Team Impact Rating. {`Рассчитан по результатам команд, пока игрок в составе. Не оценивает личную игру (K/D, ADR) и не совпадает с рейтингами HLTV и Valve.`}</p>
      </div>

      <label className="switch">
        <input type="checkbox" checked={hide} onChange={(e) => toggle(e.target.checked)} />
        <span>Скрыть новичков <small className="muted">(меньше {MIN_GAMES} оценённых матчей)</small></span>
      </label>

      {allSeed && (
        <div className="callout">
          Рейтинг стартует с Elo команды, поэтому у игроков одной команды он пока одинаковый. Различия появятся после новых матчей и трансферов.
        </div>
      )}

      {error && data && <StaleBanner onRetry={reload} />}
      {isLoading && !data ? <Skeleton rows={8} height={52} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data?.length ? (
          <EmptyState title={hide ? `Нет игроков с ${MIN_GAMES}+ оценёнными матчами` : 'Рейтинг пока пуст'} text={hide ? 'Данные ещё накапливаются.' : 'Игроки появятся после первой синхронизации составов.'}>
            {hide && <button className="btn" onClick={() => toggle(false)}>Показать всех</button>}
          </EmptyState>
        ) : (
          <table className="rtable">
            <thead>
              <tr><th>#</th><th>Игрок</th><th>Страна</th><th>Команда</th><th className="num">Рейтинг</th><th className="num">Матчей</th></tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td data-label="Место" className="rtable__rank">{p.rank ?? '—'}</td>
                  <td>
                    <span className="rtable__player">
                      <Pic src={p.image_url} name={p.nickname} size={32} round />
                      <PlayerLink player={p} />
                    </span>
                  </td>
                  <td data-label="Страна"><Flag code={p.nationality} /></td>
                  <td data-label="Команда">{p.team ? <TeamBadge team={p.team} size={24} /> : <span className="muted">Без команды</span>}</td>
                  <td data-label="Рейтинг" className="num"><Rating player={p} /></td>
                  <td data-label="Оценённых матчей" className="num">{p.rated_matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </>
  );
}
