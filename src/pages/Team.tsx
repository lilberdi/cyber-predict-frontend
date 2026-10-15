import { Link, useParams } from 'react-router-dom';
import { PlayerCard } from '../components/PlayerParts';
import { EmptyState, ErrorState, NotFound, Skeleton } from '../components/States';
import { TeamLogo } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { ApiError, getTeam } from '../services/api';
import { fmtNum } from '../utils/format';

export function TeamPage() {
  const { id = '' } = useParams();
  const { data: t, error, isLoading, reload } = useResource((s) => getTeam(id, s), [id]);

  if (!t) {
    if (isLoading && !error) return <Skeleton rows={3} height={150} />;
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return <NotFound title="Команда не найдена" />;
    return <ErrorState onRetry={reload} text={error?.message} />;
  }
  const roster = t.roster ?? [];

  return (
    <>
      <Link to="/" className="back" onClick={(e) => { if (window.history.state?.idx > 0) { e.preventDefault(); window.history.back(); } }}>← Назад</Link>
      <section className="panel teamhero">
        <TeamLogo team={t} size={96} />
        <div>
          <h1>{t.name}</h1>
          <div className="stats stats--inline">
            <div className="stat">
              <span className="stat__label">Elo команды</span>
              <strong className="stat__value">{t.elo === null || t.elo === undefined ? '—' : fmtNum(t.elo)}</strong>
              <span className="stat__hint">учтено матчей: {fmtNum(t.elo_matches ?? 0)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="h-block">Текущий состав</h2>
        {roster.length === 0 ? (
          <EmptyState title="Состав пока не известен" />
        ) : (
          <div className="pgrid">{roster.map((p) => <PlayerCard key={p.id} player={p} />)}</div>
        )}
        {t.roster_note && <p className="note">{t.roster_note}</p>}
      </section>
    </>
  );
}
