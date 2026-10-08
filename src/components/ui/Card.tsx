import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({ children, className = '', interactive = false }: CardProps) {
  return <article className={`card ${interactive ? 'card--interactive' : ''} ${className}`}>{children}</article>;
}
