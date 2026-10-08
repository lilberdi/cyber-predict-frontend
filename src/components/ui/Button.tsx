import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  to?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function Button({ children, to, variant = 'primary', icon, onClick, type = 'button' }: ButtonProps) {
  const className = `button button--${variant}`;
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link className={className} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick} type={type}>
      {content}
    </button>
  );
}
