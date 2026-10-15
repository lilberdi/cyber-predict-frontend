import { ArrowRight, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useResource } from '../hooks';
import { getRanking, getTransfers } from '../services/api';
import type { Transfer } from '../types';
import { Flag, InfoHint, Rating } from './PlayerParts';
import { ErrorState, Skeleton } from './States';
import { Pic, TeamLogo } from './TeamBadge';

export function TopPlayers() {
  const { data, error, isLoading, reload } = useResource((s) => getRanking(0, 10, s), []);
  return (
    <aside className="panel" aria-label="Топ игроков по рейтингу">
      <h2 className="h-block">Топ игроков <InfoHint /></h2>
      {isLoading && !data ? <Skeleton rows={5} height={40} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data?.length ? <p className="muted small">Рейтинг пока пуст.</p>
        : (
          <ol className="toplist">
            {data.map((p) => (
              <li key={p.id}>
                <Link to={`/players/${p.id}`}>
                  <span className="toplist__rank">{p.rank ?? '—'}</span>
                  <Pic src={p.image_url} name={p.nickname} size={28} round />
                  <span className="toplist__name" title={p.nickname}>{p.nickname}</span>
                  <Flag code={p.nationality} />
                  <Rating player={p} compact />
                </Link>
              </li>
            ))}
          </ol>
        )}
      <Link className="btn btn--block" to="/players">Весь рейтинг</Link>
    </aside>
  );
}

function Item({ t }: { t: Transfer }) {
  const d = new Date(t.changed_at);
  const date = Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(d);
  const from = t.from_team, to = t.to_team;
  return (
    <li>
      <Link to={`/players/${t.player.id}`} className="tf__player">
        <Pic src={t.player.image_url} name={t.player.nickname} size={32} round />
        <span><strong>{t.player.nickname}</strong><small className="muted">{date}</small></span>
      </Link>
      <span className="tf__teams" aria-label={t.kind === 'join' ? 'пришёл в команду' : t.kind === 'leave' ? 'покинул команду' : 'перешёл в другую команду'}>
        {from ? <Link to={`/teams/${from.id}`} title={from.name}><TeamLogo team={from} size={26} /></Link> : t.kind === 'join' ? <LogIn size={16} aria-hidden="true" /> : null}
        {t.kind === 'transfer' && <ArrowRight size={14} aria-hidden="true" />}
        {to ? <Link to={`/teams/${to.id}`} title={to.name}><TeamLogo team={to} size={26} /></Link> : t.kind === 'leave' ? <LogOut size={16} aria-hidden="true" /> : null}
      </span>
    </li>
  );
}

export function LatestTransfers() {
  const { data, error, isLoading, reload } = useResource((s) => getTransfers(8, s), []);
  return (
    <aside className="panel" aria-label="Последние трансферы">
      <h2 className="h-block">Последние трансферы</h2>
      {isLoading && !data ? <Skeleton rows={4} height={44} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data?.length ? <p className="muted small">Пока трансферов не зафиксировано.</p>
        : <ul className="tf">{data.map((t, i) => <Item key={`${t.player.id}-${t.changed_at}-${i}`} t={t} />)}</ul>}
      <Link className="btn btn--block" to="/transfers">Все трансферы</Link>
    </aside>
  );
}
