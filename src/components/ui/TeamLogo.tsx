import type { CSSProperties } from 'react';

interface TeamLogoProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamLogo({ name, color, size = 'md' }: TeamLogoProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={`team-logo team-logo--${size}`} style={{ '--team-color': color } as CSSProperties & Record<string, string>}>
      {initials}
    </span>
  );
}
