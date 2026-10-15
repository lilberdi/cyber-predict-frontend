import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Team } from '../types';
import { initials } from '../utils/format';

export function Pic({ src, name, size = 40, round = false }: { src?: string | null; name: string; size?: number; round?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`logo ${round ? 'logo--round' : ''}`} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {src && !failed ? <img src={src} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} /> : initials(name)}
    </span>
  );
}

export const TeamLogo = ({ team, size = 40 }: { team: Team; size?: number }) => <Pic src={team.image_url} name={team.name} size={size} />;

export function TeamBadge({ team, size = 40, mirror = false, link = true }: { team: Team; size?: number; mirror?: boolean; link?: boolean }) {
  const inner = (
    <>
      <TeamLogo team={team} size={size} />
      <span className="tbadge__name" title={team.name}>{team.name}</span>
    </>
  );
  const cls = `tbadge ${mirror ? 'tbadge--mirror' : ''}`;
  return link ? <Link className={`${cls} tbadge--link`} to={`/teams/${team.id}`}>{inner}</Link> : <span className={cls}>{inner}</span>;
}
