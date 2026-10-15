import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Match } from '../types';
import { fmtClock, parseDate, relativeTime, splitProb } from '../utils/format';
import { ConfidenceBadge, MatchTags, ModelBadge } from './Badges';
import { FeatureBars } from './FeatureBars';
import { Percent, ProbabilityBar } from './ProbabilityBar';
import { TeamBadge } from './TeamBadge';

export function MatchRow({ match: m, now }: { match: Match; now: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const p = m.prediction;
  const d = parseDate(m.scheduled_at);
  const rel = relativeTime(m, now);
  const fav = p ? splitProb(p).fav : 0;

  return (
    <article className={`mrow ${fav ? `mrow--fav${fav}` : ''}`}>
      <div className="mrow__time">
        <strong>{d ? fmtClock(d) : '—'}</strong>
        <span>{d ? rel : 'Время уточняется'}</span>
      </div>

      <div className="mrow__body">
        <div className="mrow__meta">
          <span className="mrow__tour" title={m.tournament}>{m.tournament ?? 'Турнир не указан'}</span>
          <MatchTags match={m} />
        </div>

        <div className="mrow__main">
          <div className="mrow__t1">
            <TeamBadge team={m.team1} />
            {p && <Percent prediction={p} side={1} />}
          </div>
          <div className="mrow__mid">
            {p ? (
              <>
                <ProbabilityBar prediction={p} name1={m.team1.name} name2={m.team2.name} />
                {splitProb(p).even && <span className="note">Равные шансы</span>}
              </>
            ) : (
              <span className="badge badge--pending"><i className="dot dot--pulse" /> Прогноз считается</span>
            )}
          </div>
          <div className="mrow__t2">
            <TeamBadge team={m.team2} mirror />
            {p && <Percent prediction={p} side={2} />}
          </div>
        </div>

        <div className="mrow__foot">
          <span className="badges">
            {p && <ModelBadge name={p.model_name} />}
            {p && <ConfidenceBadge confidence={p.confidence} />}
          </span>
          <span className="mrow__actions">
            {p && (
              <button className="link" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
                Почему такой прогноз <ChevronDown size={16} className={open ? 'rot' : ''} aria-hidden="true" />
              </button>
            )}
            <Link className="link" to={`/match/${m.id}`}>Страница матча →</Link>
          </span>
        </div>

        {p && (
          <div id={panelId} className={`expand ${open ? 'expand--open' : ''}`} aria-hidden={!open}>
            <div className="expand__in">
              {p.model_name === 'elo_sync' && <p className="note">Предварительная оценка, скоро обновится.</p>}
              {p.explanation && <p>{p.explanation}</p>}
              {p.top_features && p.top_features.length > 0 && <FeatureBars features={p.top_features} name1={m.team1.name} name2={m.team2.name} />}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
