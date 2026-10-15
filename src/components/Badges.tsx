import type { Confidence, Match } from '../types';
import { CONFIDENCE_LABELS, modelLabel, SOURCE_LABELS } from '../utils/format';

export function ConfidenceBadge({ confidence }: { confidence?: Confidence }) {
  if (!confidence) return null;
  return (
    <span className={`badge badge--${confidence}`} title="Показывает, насколько вероятность отличается от 50%, а не гарантию результата">
      <i className="dot" /> Уверенность: {CONFIDENCE_LABELS[confidence].toLowerCase()}
    </span>
  );
}

export function ModelBadge({ name }: { name: string }) {
  return <span className={`badge ${name === 'elo_xgboost' ? 'badge--accent' : ''}`}>{modelLabel(name)}</span>;
}

export function MatchTags({ match }: { match: Match }) {
  return (
    <>
      {match.best_of && <span className="tag">BO{match.best_of}</span>}
      {match.tournament_tier && <span className="tag tag--tier">Тир {match.tournament_tier.toUpperCase()}</span>}
      {SOURCE_LABELS[match.source] && <span className="badge badge--warn">{SOURCE_LABELS[match.source]}</span>}
      {match.status === 'running' && <span className="badge badge--live"><i className="dot dot--pulse" /> Идёт</span>}
      {match.status === 'finished' && <span className="badge">Завершён</span>}
    </>
  );
}
