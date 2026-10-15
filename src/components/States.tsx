import { AlertTriangle, Inbox, SearchX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function Skeleton({ rows = 4, height = 112 }: { rows?: number; height?: number }) {
  return (
    <div className="skeletons" aria-busy="true" aria-label="Загрузка">
      {Array.from({ length: rows }, (_, i) => <div key={i} className="skeleton" style={{ height }} />)}
    </div>
  );
}

export function EmptyState({ title, text, icon, children }: { title: string; text?: string; icon?: 'search'; children?: ReactNode }) {
  const Icon = icon === 'search' ? SearchX : Inbox;
  return (
    <div className="state">
      <Icon size={28} aria-hidden="true" />
      <strong>{title}</strong>
      {text && <span>{text}</span>}
      {children}
    </div>
  );
}

export function ErrorState({ onRetry, text }: { onRetry?: () => void; text?: string }) {
  return (
    <div className="state state--error" role="alert">
      <AlertTriangle size={28} aria-hidden="true" />
      <strong>Не удалось загрузить данные</strong>
      <span>{text ?? 'Проверьте соединение и попробуйте ещё раз.'}</span>
      {onRetry && <button className="btn" onClick={onRetry}>Повторить</button>}
    </div>
  );
}

export function StaleBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="stale" role="status">
      <AlertTriangle size={16} aria-hidden="true" /> Показаны прошлые данные: обновить не удалось.
      <button className="link" onClick={onRetry}>Повторить</button>
    </div>
  );
}

export function NotFound({ title = 'Матч не найден', backTo = '/', backLabel = 'К списку матчей' }: { title?: string; backTo?: string; backLabel?: string }) {
  return (
    <EmptyState title={title} text="Возможно, ссылка устарела.">
      <Link className="btn" to={backTo}>{backLabel}</Link>
    </EmptyState>
  );
}
