import { RefreshCw } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { RefreshError, refreshMatches } from '../services/api';
import type { RefreshResult } from '../types';
import { useNow } from '../hooks';

// Лимит общий на весь сервис, поэтому таймер храним на уровне модуля: он один для всех кнопок на странице.
let until = 0;
const listeners = new Set<() => void>();
const setUntil = (ms: number) => { until = ms; listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const getUntil = () => until;

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10, m100 = n % 100;
  return `${n} ${m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many}`;
}

export function summarize(r: RefreshResult): string {
  if (r.checked === 0) return 'Все матчи в актуальном состоянии';
  const parts: string[] = [];
  if (r.finished) parts.push(`${plural(r.finished, 'матч сыгран', 'матча сыграно', 'матчей сыграно')}`);
  if (r.voided) parts.push(`${plural(r.voided, 'матч не засчитан', 'матча не засчитано', 'матчей не засчитано')}`);
  if (r.running) parts.push(`${r.running} ${r.running === 1 ? 'идёт' : 'идут'} сейчас`);
  if (r.rescheduled) parts.push(`${plural(r.rescheduled, 'матч перенесён', 'матча перенесено', 'матчей перенесено')}`);
  if (!parts.length) return r.still_pending ? `Новых итогов нет, ждём результатов: ${r.still_pending}` : 'Новых итогов нет';
  return `Обновлено: ${parts.join(', ')}`;
}

interface Props {
  onDone: (result: RefreshResult) => void;
  hint?: string;
}

export function RefreshMatches({ onDone, hint }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'info' | 'error'; text: string }>();
  const [failed, setFailed] = useState(false);
  const until = useSyncExternalStore(subscribe, getUntil);
  const now = useNow(500);
  const wait = Math.max(0, Math.ceil((until - now) / 1000));

  const click = async () => {
    if (busy || wait > 0) return;
    setBusy(true);
    setFailed(false);
    setMsg(undefined);
    try {
      const r = await refreshMatches();
      setUntil(Date.now() + r.cooldown_seconds * 1000);
      setMsg({ kind: 'ok', text: summarize(r) });
      onDone(r);
    } catch (e) {
      if (e instanceof RefreshError && e.kind === 'cooldown') {
        const secs = e.retryAfter ?? 0;
        if (secs > 0) setUntil(Date.now() + secs * 1000);
        setMsg({ kind: 'info', text: secs > 0 ? `Матчи уже обновлялись, повторите через ${secs} с` : 'Матчи уже обновлялись, повторите чуть позже' });
      } else {
        setFailed(true);
        setMsg({ kind: 'error', text: (e as Error).message });
      }
    } finally {
      setBusy(false);
    }
  };

  const label = busy ? 'Обновляем…' : wait > 0 ? `Обновить через ${wait} с` : failed ? 'Повторить' : 'Обновить матчи';
  return (
    <div className="refresh">
      <button className="btn" onClick={click} disabled={busy || wait > 0} aria-busy={busy}>
        <RefreshCw size={16} className={busy ? 'spin' : ''} aria-hidden="true" /> {label}
      </button>
      {hint && !msg && <span className="note">{hint}</span>}
      <span className={`note ${msg?.kind === 'error' ? 'bad' : ''}`} role="status" aria-live="polite">{msg?.text}</span>
    </div>
  );
}
