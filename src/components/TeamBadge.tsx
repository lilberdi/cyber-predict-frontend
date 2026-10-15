import { useState } from 'react';
import type { Team } from '../types';
import { initials } from '../utils/format';

export function TeamLogo({ team, size = 40 }: { team: Team; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="logo" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {team.image_url && !failed ? (
        <img src={team.image_url} alt="" width={size} height={size} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initials(team.name)
      )}
    </span>
  );
}

export function TeamBadge({ team, size = 40, mirror = false }: { team: Team; size?: number; mirror?: boolean }) {
  return (
    <span className={`tbadge ${mirror ? 'tbadge--mirror' : ''}`}>
      <TeamLogo team={team} size={size} />
      <span className="tbadge__name" title={team.name}>{team.name}</span>
    </span>
  );
}
