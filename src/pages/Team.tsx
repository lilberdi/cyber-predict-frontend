import { Link, useParams } from 'react-router-dom';
import { Delta, FormStrip } from '../components/FormStrip';
import { PlayerCard } from '../components/PlayerParts';
import { RatingChart } from '../components/RatingChart';
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
  const history = t.elo_history ?? [];
  // Изменение за последние 10 матчей: от рейтинга до первого из них до текущего.
  const last10 = history.slice(-10);
  const change10 = last10.length ? last10[last10.length - 1].rating_after - (last10[0].rating_after - last10[0].delta) : undefined;

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
            {change10 !== undefined && (
              <div className="stat">
                <span className="stat__label">За {last10.length} последних матчей</span>
                <strong className="stat__value"><Delta value={change10} /></strong>
                <span className="stat__hint">изменение Elo</span>
              </div>
            )}
            {t.form && t.form.length > 0 && (
              <div className="stat">
                <span className="stat__label">Форма</span>
                <span className="stat__value"><FormStrip form={t.form} /></span>
                <span className="stat__hint">новые слева</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {history.length > 1 && (
        <section className="panel">
          <h2 className="h-block">Elo по матчам</h2>
          <RatingChart history={history} label={`График рейтинга Elo команды ${t.name} по матчам`} />
          <p className="note">Показаны последние {history.length} матчей. Рейтинг пересчитывается раз в сутки при переобучении модели.</p>
        </section>
      )}

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
