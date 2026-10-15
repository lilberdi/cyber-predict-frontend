import { CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Percent } from '../components/ProbabilityBar';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getFinished, getLiveAccuracy } from '../services/api';
import type { AccuracyBucket, Match } from '../types';
import { CONFIDENCE_LABELS, fmtDateTime, fmtNum, fmtPercent, modelLabel, splitProb } from '../utils/format';

const five = 300_000;

function Bucket({ label, b }: { label: string; b: AccuracyBucket }) {
  const enough = b.evaluated >= 5;
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{enough ? (b.evaluated >= 10 ? fmtPercent(b.accuracy) : `${b.correct} из ${b.evaluated}`) : 'мало данных'}</strong>
      <span className="stat__hint">{enough ? `матчей: ${b.evaluated}` : `учтено: ${b.evaluated}`}</span>
    </div>
  );
}

function ResultRow({ m }: { m: Match }) {
  const p = m.prediction;
  const w = m.winner_team_id === m.team1.id ? 1 : 2;
  const s = p ? splitProb(p) : undefined;
  return (
    <article className="rrow">
      <div className="rrow__when">{fmtDateTime(m.scheduled_at)}<small>{m.tournament}</small></div>
      <div className={`rrow__team ${w === 1 ? 'is-winner' : ''}`}><TeamBadge team={m.team1} size={32} /></div>
      <div className="rrow__score">{m.score.team1}:{m.score.team2}</div>
      <div className={`rrow__team rrow__team--r ${w === 2 ? 'is-winner' : ''}`}><TeamBadge team={m.team2} size={32} mirror /></div>
      <div className="rrow__p">
        {p && s && <><Percent prediction={p} side={1} /><i>/</i><Percent prediction={p} side={2} /></>}
        {p && <small>{modelLabel(p.model_name)}</small>}
      </div>
      <div className={`rrow__mark ${m.prediction_correct ? 'ok' : 'bad'}`}>
        {m.prediction_correct === undefined ? null : m.prediction_correct ? <><CheckCircle2 size={16} /> Угадали</> : <><XCircle size={16} /> Не угадали</>}
      </div>
      <Link className="link rrow__link" to={`/match/${m.id}`}>Подробнее</Link>
    </article>
  );
}

export function ResultsPage() {
  const acc = useResource((s) => getLiveAccuracy(s), [], five);
  const fin = useResource((s) => getFinished(50, s), [], five);
  const a = acc.data;

  return (
    <>
      <div className="pagehead">
        <h1>Результаты прогнозов</h1>
        <p className="muted">Учитываются только прогнозы, сделанные до начала матча.</p>
      </div>

      <section className="panel">
        <h2 className="h-block">Точность в бою</h2>
        {acc.isLoading && !a ? <Skeleton rows={1} height={90} />
          : acc.error && !a ? <ErrorState onRetry={acc.reload} text={acc.error.message} />
          : a && a.evaluated === 0 ? <EmptyState title="Копим статистику" text="Появятся после первых сыгранных матчей." />
          : a && (
            <>
              <div className="bigacc">
                {a.evaluated >= 10 ? <strong>{fmtPercent(a.accuracy)}</strong> : <strong>Угадано {a.correct} из {a.evaluated}</strong>}
                <span className="muted">{a.evaluated < 10 ? 'Выборка пока мала, процент не показываем.' : `по ${fmtNum(a.evaluated)} сыгранным матчам`}</span>
              </div>
              <div className="stats">
                {(['high', 'medium', 'low'] as const).map((c) => a.by_confidence[c] && <Bucket key={c} label={`Уверенность: ${CONFIDENCE_LABELS[c].toLowerCase()}`} b={a.by_confidence[c]!} />)}
                {Object.entries(a.by_model).map(([name, b]) => <Bucket key={name} label={modelLabel(name)} b={b} />)}
              </div>
            </>
          )}
      </section>

      <section aria-label="Сыгранные матчи">
        <h2 className="h-block">Сыгранные матчи</h2>
        {fin.error && fin.data && <StaleBanner onRetry={fin.reload} />}
        {fin.isLoading && !fin.data ? <Skeleton rows={4} height={64} />
          : fin.error && !fin.data ? <ErrorState onRetry={fin.reload} text={fin.error.message} />
          : !fin.data?.length ? <EmptyState title="Копим статистику" text="Сыгранные матчи появятся после первых завершённых игр." />
          : <div className="rlist">{fin.data.map((m) => <ResultRow key={m.id} m={m} />)}</div>}
      </section>
    </>
  );
}
