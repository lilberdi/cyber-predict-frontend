import { Link, useParams } from 'react-router-dom';
import { Flag, fullName, InfoHint, Rating } from '../components/PlayerParts';
import { RatingChart } from '../components/RatingChart';
import { EmptyState, ErrorState, NotFound, Skeleton } from '../components/States';
import { Pic, TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { ApiError, getPlayer } from '../services/api';

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const fmt = (iso?: string | null) => {
  const d = iso ? new Date(iso) : undefined;
  return d && !Number.isNaN(d.getTime()) ? dateFmt.format(d) : '—';
};

export function PlayerPage() {
  const { id = '' } = useParams();
  const { data: p, error, isLoading, reload } = useResource((s) => getPlayer(id, s), [id]);

  if (!p) {
    if (isLoading && !error) return <Skeleton rows={3} height={150} />;
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return <NotFound title="Игрок не найден" backTo="/players" backLabel="К рейтингу игроков" />;
    return <ErrorState onRetry={reload} text={error?.message} />;
  }

  const history = p.rating_history ?? [];
  const stints = p.teams ?? [];
  const name = fullName(p);

  return (
    <>
      <Link to="/players" className="back">← Рейтинг игроков</Link>
      <section className="panel playerhero">
        <Pic src={p.image_url} name={p.nickname} size={104} round />
        <div className="playerhero__info">
          <h1>{p.nickname}</h1>
          <p className="muted">{name ?? 'Имя не указано'}</p>
          <div className="playerhero__meta">
            <span><small className="muted">Страна</small>{p.nationality ? <Flag code={p.nationality} withName /> : <span className="muted">не указана</span>}</span>
            <span><small className="muted">Команда</small>{p.team ? <TeamBadge team={p.team} size={24} /> : <span className="muted">Без команды</span>}</span>
          </div>
        </div>
        <div className="playerhero__rating">
          <small className="muted">Team Impact Rating <InfoHint /></small>
          <Rating player={p} size="lg" />
          <small className="muted">оценённых матчей: {p.rated_matches}</small>
        </div>
      </section>

      <section className="panel">
        <h2 className="h-block">Изменение рейтинга</h2>
        {history.length === 0 ? (
          <EmptyState title="Оценённых матчей пока нет" text="График появится после первых матчей команды, пока игрок в составе. Сейчас рейтинг равен Elo команды." />
        ) : (
          <RatingChart history={history} />
        )}
      </section>

      <section className="panel">
        <h2 className="h-block">История команд</h2>
        {stints.length === 0 ? (
          <EmptyState title="История пока пуста" />
        ) : (
          <ul className="stints">
            {stints.map((s, i) => (
              <li key={`${s.team.id}-${s.joined_at}-${i}`}>
                <TeamBadge team={s.team} size={32} />
                <span className="muted small">
                  впервые замечен в составе: {fmt(s.joined_at)} → {s.left_at ? fmt(s.left_at) : <b className="ok">сейчас</b>}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="note">История составов ведётся только с момента запуска отслеживания. Дата — когда мы впервые увидели игрока в команде, а не реальная дата вступления.</p>
      </section>
    </>
  );
}
