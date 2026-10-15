import { ArrowRight, LogIn, LogOut } from 'lucide-react';
import { PlayerLink } from '../components/PlayerParts';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getTransfers } from '../services/api';
import type { Transfer } from '../types';

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

function Row({ t }: { t: Transfer }) {
  const d = new Date(t.changed_at);
  return (
    <li className="trow">
      <span className="trow__date">{Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d)}</span>
      <span className="trow__what">
        <PlayerLink player={t.player} />
        {t.kind === 'transfer' && <>
          <span className="trow__sep">:</span>
          {t.from_team ? <TeamBadge team={t.from_team} size={22} /> : <span className="muted">?</span>}
          <ArrowRight size={16} aria-label="перешёл в" />
          {t.to_team ? <TeamBadge team={t.to_team} size={22} /> : <span className="muted">?</span>}
        </>}
        {t.kind === 'join' && <><LogIn size={16} aria-hidden="true" /> пришёл в {t.to_team ? <TeamBadge team={t.to_team} size={22} /> : <span className="muted">команду</span>}</>}
        {t.kind === 'leave' && <><LogOut size={16} aria-hidden="true" /> покинул {t.from_team ? <TeamBadge team={t.from_team} size={22} /> : <span className="muted">команду</span>}</>}
        {t.kind !== 'transfer' && t.kind !== 'join' && t.kind !== 'leave' && <span className="muted">{String(t.kind)}</span>}
      </span>
    </li>
  );
}

export function TransfersPage() {
  const { data, error, isLoading, reload } = useResource((s) => getTransfers(50, s), []);
  return (
    <>
      <div className="pagehead">
        <h1>Трансферы</h1>
        <p className="muted">Изменения составов, которые мы зафиксировали с момента запуска отслеживания.</p>
      </div>
      {error && data && <StaleBanner onRetry={reload} />}
      {isLoading && !data ? <Skeleton rows={5} height={52} />
        : error && !data ? <ErrorState onRetry={reload} text={error.message} />
        : !data?.length ? <EmptyState title="Пока трансферов не зафиксировано" text="Лента заполнится, когда мы заметим первые изменения в составах." />
        : <ul className="tlist">{data.map((t, i) => <Row key={`${t.player.id}-${t.changed_at}-${i}`} t={t} />)}</ul>}
    </>
  );
}
