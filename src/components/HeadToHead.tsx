import { Link } from 'react-router-dom';
import { useResource } from '../hooks';
import { getHeadToHead } from '../services/api';
import { fmtDateTime } from '../utils/format';
import { FormStrip } from './FormStrip';

/** Личные встречи и форма команд перед матчем. Ошибка блока не ломает страницу. */
export function HeadToHeadBlock({ matchId }: { matchId: string }) {
  const { data, error } = useResource((s) => getHeadToHead(matchId, s), [matchId]);
  if (error || !data) return null;
  const { team1, team2 } = data;
  const meetings = data.meetings ?? [];
  return (
    <section className="panel">
      <h2 className="h-block">Личные встречи и форма</h2>
      <p>
        За {data.window_days} дней: <b>{team1.name} {data.team1_wins}</b> : <b>{data.team2_wins} {team2.name}</b>
      </p>
      {meetings.length === 0 ? (
        <p className="muted">Личных встреч за этот период не было.</p>
      ) : (
        <ul>
          {meetings.map((m) => (
            <li key={m.id}>
              <Link to={`/match/${m.id}`}>{m.team1.name} {m.score.team1 ?? '–'}:{m.score.team2 ?? '–'} {m.team2.name}</Link>
              <small className="muted"> · {fmtDateTime(m.scheduled_at)}</small>
            </li>
          ))}
        </ul>
      )}
      <p><b>{team1.name}</b> <FormStrip form={data.form1 ?? []} /></p>
      <p><b>{team2.name}</b> <FormStrip form={data.form2 ?? []} /></p>
    </section>
  );
}
