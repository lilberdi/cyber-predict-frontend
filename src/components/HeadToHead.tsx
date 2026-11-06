import { Link } from 'react-router-dom';
import { useResource } from '../hooks';
import { getHeadToHead } from '../services/api';
import type { Match, Team } from '../types';
import { fmtDateTime } from '../utils/format';
import { FormStrip } from './FormStrip';
import { Skeleton } from './States';
import { TeamBadge } from './TeamBadge';

function Meeting({ m, team1 }: { m: Match; team1: Team }) {
  // Счёт показываем с точки зрения команды 1 текущего матча.
  const flip = m.team1.id !== team1.id;
  const s1 = flip ? m.score.team2 : m.score.team1;
  const s2 = flip ? m.score.team1 : m.score.team2;
  const won1 = m.winner_team_id === team1.id;
  return (
    <li className="h2h__m">
      <span className="h2h__date">{fmtDateTime(m.scheduled_at)}</span>
      <Link to={`/match/${m.id}`} className={`h2h__score ${won1 ? 'h2h__score--t1' : 'h2h__score--t2'}`}>{s1 ?? '—'}:{s2 ?? '—'}</Link>
      <span className="h2h__tour muted">{m.tournament ?? ''}</span>
    </li>
  );
}

/** Личные встречи и форма команд до начала матча — данные под признаками h2h_diff и form5_diff. */
export function HeadToHeadPanel({ matchId }: { matchId: string }) {
  const { data: h, error, isLoading } = useResource((s) => getHeadToHead(matchId, s), [matchId]);

  if (isLoading && !h) return <section className="panel"><Skeleton rows={1} height={120} /></section>;
  // Блок вспомогательный: при ошибке (например, старый бэкенд без эндпоинта) просто не показываем его.
  if (error || !h) return null;

  const total = h.team1_wins + h.team2_wins;
  return (
    <section className="panel h2h">
      <h2 className="h-block">Личные встречи и форма</h2>
      <div className="h2h__head">
        <TeamBadge team={h.team1} size={36} />
        <div className="h2h__total" aria-label={`Личные встречи за ${h.window_days} дней: ${h.team1_wins} на ${h.team2_wins}`}>
          <b className="t1">{h.team1_wins}</b><span>:</span><b className="t2">{h.team2_wins}</b>
          <small className="muted">{total ? `за ${h.window_days} дней` : 'встреч за год не было'}</small>
        </div>
        <TeamBadge team={h.team2} size={36} mirror />
      </div>

      <div className="h2h__forms">
        <div><span className="muted small">Форма {h.team1.name}</span><FormStrip form={h.form1} /></div>
        <div className="h2h__form--r"><span className="muted small">Форма {h.team2.name}</span><FormStrip form={h.form2} /></div>
      </div>

      {h.meetings.length > 0 && (
        <>
          <h3 className="h2h__sub">Последние встречи</h3>
          <ul className="h2h__list">{h.meetings.map((m) => <Meeting key={m.id} m={m} team1={h.team1} />)}</ul>
        </>
      )}
      <p className="note">Учитываются только сыгранные и засчитанные матчи до начала этой игры. По ним модель считает признаки «Личные встречи» и «Форма».</p>
    </section>
  );
}
