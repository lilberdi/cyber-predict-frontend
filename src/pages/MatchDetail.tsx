import { CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ConfidenceBadge, MatchTags, ModelBadge } from '../components/Badges';
import { FeatureBars } from '../components/FeatureBars';
import { Percent, ProbabilityBar } from '../components/ProbabilityBar';
import { ErrorState, NotFound, Skeleton } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useMatches } from '../data/MatchesContext';
import { useNow, useResource } from '../hooks';
import { ApiError, getMatch } from '../services/api';
import { fmtDateTime, relativeTime, splitProb, timeZoneName } from '../utils/format';

export function MatchDetailPage() {
  const { id = '' } = useParams();
  const { data: list } = useMatches();
  const cached = list?.find((m) => String(m.id) === id);
  // Не запрашиваем матч, если он уже есть в списке.
  const { data: fetched, error, isLoading, reload } = useResource((s) => (cached ? Promise.resolve(undefined) : getMatch(id, s)), [id, Boolean(cached)]);
  const m = cached ?? fetched;
  const now = useNow();
  const navigate = useNavigate();
  const back = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  if (!m) {
    if (isLoading && !error) return <Skeleton rows={3} height={180} />;
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return <NotFound />;
    return <ErrorState onRetry={reload} text={error?.message} />;
  }

  const p = m.prediction;
  const s = p ? splitProb(p) : undefined;
  const rel = relativeTime(m, now);
  const finished = m.status === 'finished' && m.score.team1 !== null;
  const winner = m.winner_team_id === m.team1.id ? 1 : m.winner_team_id === m.team2.id ? 2 : 0;

  return (
    <>
      <Link to="/" className="back" onClick={(e) => { e.preventDefault(); back(); }}>← Назад к списку</Link>
      <section className="panel matchhero">
        <div className="matchhero__meta">
          <span>{m.tournament ?? 'Турнир не указан'}</span>
          <MatchTags match={m} />
        </div>
        <div className="matchhero__when">
          {fmtDateTime(m.scheduled_at)}{rel && ` · ${rel}`}
          {m.scheduled_at && <small> ({timeZoneName()})</small>}
        </div>

        <div className="matchhero__teams">
          <div className={`matchhero__team ${winner === 1 ? 'is-winner' : ''}`}>
            <TeamBadge team={m.team1} size={72} />
            {p && <Percent prediction={p} side={1} />}
          </div>
          <div className="matchhero__vs">{finished ? <b>{m.score.team1}:{m.score.team2}</b> : 'VS'}</div>
          <div className={`matchhero__team matchhero__team--right ${winner === 2 ? 'is-winner' : ''}`}>
            <TeamBadge team={m.team2} size={72} mirror />
            {p && <Percent prediction={p} side={2} />}
          </div>
        </div>

        {p ? (
          <>
            <ProbabilityBar large prediction={p} name1={m.team1.name} name2={m.team2.name} />
            <div className="badges">
              <ModelBadge name={p.model_name} />
              <ConfidenceBadge confidence={p.confidence} />
              {s?.even && <span className="badge">Равные шансы</span>}
              {m.prediction_correct !== undefined && (
                <span className={`badge ${m.prediction_correct ? 'badge--high' : 'badge--low'}`}>
                  {m.prediction_correct ? <><CheckCircle2 size={14} /> Угадали</> : <><XCircle size={14} /> Не угадали</>}
                </span>
              )}
            </div>
            {p.model_name === 'elo_sync' && <p className="note">Предварительная оценка, скоро обновится.</p>}
          </>
        ) : (
          <div className="badge badge--pending"><i className="dot dot--pulse" /> Прогноз считается</div>
        )}
      </section>

      {p && (p.explanation || p.top_features?.length) && (
        <section className="panel">
          <h2 className="h-block">Почему такой прогноз</h2>
          {p.explanation && <p className="explain">{p.explanation}</p>}
          {p.top_features && p.top_features.length > 0 && <FeatureBars features={p.top_features} name1={m.team1.name} name2={m.team2.name} />}
        </section>
      )}
    </>
  );
}
