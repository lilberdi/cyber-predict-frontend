import { AlertTriangle, Database, Loader2 } from 'lucide-react';

interface StateBlockProps {
  type: 'loading' | 'empty' | 'error';
  title: string;
  description?: string;
}

export function StateBlock({ type, title, description }: StateBlockProps) {
  const Icon = type === 'loading' ? Loader2 : type === 'error' ? AlertTriangle : Database;
  return (
    <div className={`state-block state-block--${type}`}>
      <Icon className={type === 'loading' ? 'spin' : ''} size={22} />
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  );
}
