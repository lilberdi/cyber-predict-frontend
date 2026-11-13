import { CheckCircle2, Clock, MinusCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LiveQuality } from '../components/LiveQuality';
import { RefreshMatches } from '../components/RefreshMatches';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { TeamBadge } from '../components/TeamBadge';
import { useResource } from '../hooks';
import { getFinished, getLiveAccuracy } from '../services/api';
import type { AccuracyBucket, Match } from '../types';
import { CONFIDENCE_LABELS, fmtDateTime, fmtNum, fmtPercent, modelLabel, splitProb } from '../utils/format';

const five = 300_000;
const VOID_TEXT = { canceled: 'Матч отменён', forfeit: 'Технический результат', draw: 'Ничья' } as const;

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

function Verdict({ m }: { m: Match }) {
  if (m.voided_reason) {
    return <div className="rrow__mark void"><MinusCircle size={16} /> Не засчитан<small>{VOID_TEXT[m.voided_reason] ?? m.voided_reason}</small></div>;
  }
  if (m.status === 'running') return <div className="rrow__mark pending"><Clock size={16} /> Идёт сейчас</div>;
  if (m.prediction_correct === true) return <div className="rrow__mark ok"><CheckCircle2 size={16} /> Угадала</div>;
  if (m.prediction_correct === false) return <div className="rrow__mark bad"><XCircle size={16} /> Не угадала</div>;
  if (!m.prediction) return <div className="rrow__mark void"><MinusCircle size={16} /> Без оценки<small>Прогноза не было</small></div>;
  return <div className="rrow__mark void"><MinusCircle size={16} /> Прогноз не засчитан<small>Сделан после начала матча</small></div>;
}

function ResultRow({ m, fresh }: { m: Match; fresh: boolean }) {
  const p = m.prediction;
  const s = p ? splitProb(p) : undefined;
  const voided = Boolean(m.voided_reason);
  const running = m.status === 'running';
  const hasScore = !voided && !running && m.score.team1 !== null;
  const w = voided || running ? 0 : m.winner_team_id === m.team1.id ? 1 : m.winner_team_id === m.team2.id ? 2 : 0;
  const favName = s && !s.even ? (s.fav === 1 ? m.team1.name : m.team2.name) : undefined;

  return (
    <article className={`rrow ${fresh ? 'rrow--new' : ''} ${voided ? 'rrow--void' : ''}`}>
      <div className="rrow__when">{fmtDateTime(m.scheduled_at)}<small>{m.tournament}</small></div>
      <div className={`rrow__team ${w === 1 ? 'is-winner' : ''}`}><TeamBadge team={m.team1} size={32} /></div>
      <div className="rrow__score">{hasScore ? `${m.score.team1}:${m.score.team2}` : 'vs'}</div>
      <div className={`rrow__team rrow__team--r ${w === 2 ? 'is-winner' : ''}`}><TeamBadge team={m.team2} size={32} mirror /></div>
      <div className="rrow__p">
        {p && s ? (
          <>
            <span>{s.even ? `Равные шансы ${s.p1}/${s.p2}` : `Прогноз: ${favName} ${Math.max(s.p1, s.p2)}%`}</span>
            <small>{modelLabel(p.model_name)}</small>
          </>
        ) : <span className="muted">Прогноза нет</span>}
      </div>
      <Verdict m={m} />
      <Link className="link rrow__link" to={`/match/${m.id}`}>Подробнее</Link>
    </article>
  );
}

export function ResultsPage() {
  const acc = useResource((s) => getLiveAccuracy(s), [], five);
  const fin = useResource((s) => getFinished(50, s), [], five);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const a = acc.data;

  useEffect(() => {
    if (!fresh.size) return;
    const t = setTimeout(() => setFresh(new Set()), 4000);
    return () => clearTimeout(t);
  }, [fresh]);

  return (
    <>
      <div className="pagehead">
        <h1>Факт против прогноза</h1>
        <p className="muted">Учитываются только прогнозы, сделанные до начала матча.</p>
        <RefreshMatches
          onDone={(r) => {
            setFresh(new Set(r.newly_finished.map((m) => m.id)));
            acc.reload();
            fin.reload();
          }}
        />
      </div>

      <section className="panel">
        <h2 className="h-block">Точность в бою</h2>
        {acc.isLoading && !a ? <Skeleton rows={1} height={90} />
          : acc.error && !a ? <ErrorState onRetry={acc.reload} text={acc.error.message} />
          : a && a.evaluated === 0 ? <EmptyState title="Пока нет сыгранных матчей с прогнозом, сделанным до старта" text="Счётчик начнёт копиться после первых итогов." />
          : a && (
            <>
              <div className="bigacc" aria-live="polite">
                <strong>{a.evaluated >= 10 ? fmtPercent(a.accuracy) : `Угадано ${a.correct} из ${a.evaluated}`}</strong>
                <span className="muted">
                  {a.evaluated >= 10 ? `Угадано ${a.correct} из ${fmtNum(a.evaluated)} сыгранных матчей` : 'Процент не показываем: матчей слишком мало.'}
                  {a.evaluated < 30 && ' Выборка мала, точность ориентировочная.'}
                </span>
              </div>
              <div className="stats">
                {(['high', 'medium', 'low'] as const).map((c) => a.by_confidence[c] && <Bucket key={c} label={`Уверенность: ${CONFIDENCE_LABELS[c].toLowerCase()}`} b={a.by_confidence[c]!} />)}
                {Object.entries(a.by_model).map(([name, b]) => <Bucket key={name} label={modelLabel(name)} b={b} />)}
              </div>
            </>
          )}
      </section>

      {a && a.evaluated > 0 && <LiveQuality a={a} />}

      <section aria-label="Сыгранные матчи">
        <h2 className="h-block">Сыгранные матчи</h2>
        {fin.error && fin.data && <StaleBanner onRetry={fin.reload} />}
        {fin.isLoading && !fin.data ? <Skeleton rows={4} height={64} />
          : fin.error && !fin.data ? <ErrorState onRetry={fin.reload} text={fin.error.message} />
          : !fin.data?.length ? <EmptyState title="Копим статистику" text="Сыгранные матчи появятся после первых итогов. Нажмите «Обновить матчи», если матчи уже прошли." />
          : <div className="rlist">{fin.data.map((m) => <ResultRow key={m.id} m={m} fresh={fresh.has(m.id)} />)}</div>}
      </section>
    </>
  );
}
