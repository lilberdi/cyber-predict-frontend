import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'blue' | 'green' | 'yellow' | 'muted' | 'purple';
}

export function Badge({ children, tone = 'blue' }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
