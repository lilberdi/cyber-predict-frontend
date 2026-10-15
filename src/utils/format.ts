import type { Confidence, FeatureContribution, Match, MatchSource, Prediction } from '../types';

const MINUS = '−';

export function fmtNum(n: number, digits = 0): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace('-', MINUS);
}

export function fmtSigned(n: number, digits = 0): string {
  const rounded = Number(n.toFixed(digits));
  if (rounded === 0) return fmtNum(0, digits);
  return (rounded > 0 ? '+' : MINUS) + fmtNum(Math.abs(rounded), digits);
}

export const fmtPercent = (p: number, digits = 1) => `${fmtNum(p * 100, digits)}%`;

/** Вероятности: p2 всегда 100 − p1, чтобы сумма была ровно 100. */
export function splitProb(p: Prediction) {
  const p1 = Math.round(p.p_team1_win * 100);
  const p2 = 100 - p1;
  const clamp = (v: number) => Math.min(96, Math.max(4, v * 100));
  const w1 = clamp(p.p_team1_win);
  return { p1, p2, w1, w2: 100 - w1, even: p1 === 50, fav: p1 === 50 ? 0 : p1 > 50 ? 1 : 2 } as const;
}

export const edge = (m: Match) => (m.prediction ? Math.abs(m.prediction.p_team1_win - 0.5) : -1);

export const FEATURE_LABELS: Record<string, string> = {
  elo_diff: 'Рейтинг Elo',
  form5_diff: 'Форма (5 матчей)',
  form10_diff: 'Форма (10 матчей)',
  ewm_form_diff: 'Свежая форма',
  h2h_diff: 'Личные встречи',
  exp_diff: 'Опыт (матчей в истории)',
  rest_diff: 'Отдых',
  margin_diff: 'Разница по картам',
  best_of: 'Формат серии',
  tier: 'Тир турнира',
};
export const featureLabel = (name: string) => FEATURE_LABELS[name] ?? name;

const TIERS: Record<number, string> = { 4: 'S', 3: 'A', 2: 'B', 1: 'C', 0: 'D' };

export function featureValue(f: FeatureContribution): string {
  const v = f.value;
  switch (f.name) {
    case 'elo_diff': return `${fmtSigned(v)} оч.`;
    case 'form5_diff':
    case 'form10_diff':
    case 'ewm_form_diff': return `${fmtSigned(v * 100)} п.п.`;
    case 'h2h_diff': return v === 0 ? 'нет встреч за год' : `${fmtSigned(v * 100)} п.п.`;
    case 'exp_diff': return fmtSigned(v);
    case 'rest_diff': return `${fmtSigned(v, 1)} дн.`;
    case 'margin_diff': return fmtSigned(v, 2);
    case 'best_of': return `BO${v}`;
    case 'tier': return TIERS[v] ?? String(v);
    default: return fmtNum(v, Number.isInteger(v) ? 0 : 2);
  }
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = { high: 'Высокая', medium: 'Средняя', low: 'Низкая' };

export function modelLabel(name: string): string {
  if (name === 'elo_xgboost') return 'XGBoost';
  if (name === 'elo_sync') return 'Быстрый Elo';
  return name;
}

export const SOURCE_LABELS: Partial<Record<MatchSource, string>> = { fixture: 'Демо-данные', dataset: 'Из истории' };

const userTZ = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const timeZoneName = userTZ;

export function parseDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function fmtDateTime(iso?: string): string {
  const d = parseDate(iso);
  if (!d) return 'Время уточняется';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
}

export const fmtClock = (d: Date) => new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(d);

export function relativeTime(m: Pick<Match, 'scheduled_at' | 'status'>, now: number): string | undefined {
  if (m.status === 'finished') return undefined;
  const d = parseDate(m.scheduled_at);
  if (m.status === 'running') return 'Идёт';
  if (!d) return undefined;
  const mins = Math.round((d.getTime() - now) / 60000);
  if (mins <= 0) return 'Должен был начаться';
  if (mins < 60) return `через ${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `через ${hours} ч ${mins % 60} мин`;
  const days = Math.floor(hours / 24);
  return `через ${days} д ${hours % 24} ч`;
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function dayLabel(d: Date, now: number): string {
  const today = new Date(now);
  const tomorrow = new Date(now + 86_400_000);
  const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(d);
  if (dayKey(d) === dayKey(today)) return `Сегодня · ${date}`;
  if (dayKey(d) === dayKey(tomorrow)) return `Завтра · ${date}`;
  const wd = new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(d);
  return `${wd[0].toUpperCase()}${wd.slice(1)} · ${date}`;
}

export function initials(name: string): string {
  const letters = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim();
  const parts = letters.split(/\s+/).filter(Boolean);
  const s = parts.length > 1 ? parts[0][0] + parts[1][0] : letters.slice(0, 2);
  return (s || '?').toUpperCase();
}
