import { Info } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Player } from '../types';
import { fmtNum } from '../utils/format';
import { Pic } from './TeamBadge';

export const RATING_HINT = 'Рассчитан по результатам команд, пока игрок в составе. Не оценивает личную игру (K/D, ADR) и не совпадает с рейтингами HLTV и Valve.';

export function InfoHint({ text = RATING_HINT }: { text?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="hint">
      <button type="button" className="hint__btn" aria-label="Что означает рейтинг" aria-expanded={open} aria-describedby={open ? id : undefined} onClick={() => setOpen((v) => !v)} onBlur={() => setOpen(false)}>
        <Info size={15} />
      </button>
      <span id={id} role="tooltip" className={`hint__pop ${open ? 'hint__pop--open' : ''}`}>{text}</span>
    </span>
  );
}

const regionNames = (() => {
  try { return new Intl.DisplayNames(['ru'], { type: 'region' }); } catch { return undefined; }
})();

export function countryName(code?: string | null): string | undefined {
  if (!code) return undefined;
  try { return regionNames?.of(code.toUpperCase()) ?? code; } catch { return code; }
}

function flagEmoji(code: string): string {
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');
}

export function Flag({ code, withName = false }: { code?: string | null; withName?: boolean }) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return <span className="muted">—</span>;
  const name = countryName(code);
  return (
    <span className="flag" title={name}>
      <span aria-hidden="true">{flagEmoji(code)}</span>
      <span className={withName ? '' : 'flag__code'}>{withName ? name : code.toUpperCase()}</span>
    </span>
  );
}

export function Rating({ player, size = 'md', compact = false }: { player: Pick<Player, 'rating' | 'rating_is_seed'>; size?: 'md' | 'lg'; compact?: boolean }) {
  if (player.rating === null || player.rating === undefined) return <span className="muted">—</span>;
  return (
    <span className={`rating rating--${size} ${player.rating_is_seed ? 'rating--seed' : ''}`}>
      <b>{fmtNum(player.rating)}</b>
      {player.rating_is_seed && <small title="Предварительный рейтинг: пока равен Elo команды">{compact ? 'предв.' : 'предварительный'}</small>}
    </span>
  );
}

export function fullName(p: Pick<Player, 'first_name' | 'last_name'>): string | undefined {
  return [p.first_name, p.last_name].filter(Boolean).join(' ') || undefined;
}

export const PlayerLink = ({ player }: { player: Pick<Player, 'id' | 'nickname'> }) => (
  <Link className="plink" to={`/players/${player.id}`}>{player.nickname}</Link>
);

export function PlayerCard({ player }: { player: Player }) {
  return (
    <Link className="pcard" to={`/players/${player.id}`}>
      <Pic src={player.image_url} name={player.nickname} size={56} round />
      <span className="pcard__body">
        <strong title={player.nickname}>{player.nickname}</strong>
        <small className="muted">{fullName(player) ?? 'Имя не указано'}</small>
        <Flag code={player.nationality} />
      </span>
      <Rating player={player} />
    </Link>
  );
}
