import type { LiveAccuracy, Match, ModelMetrics, Player, PlayerDetail, TeamDetail, Transfer } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/v1${path}`, { signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError('Не удалось связаться с сервером', 0);
  }
  let body: { data?: T; error?: { code?: string; message?: string } } | undefined;
  try {
    body = await res.json();
  } catch {
    /* тело не JSON (например, 502 от прокси) */
  }
  if (!res.ok || !body || body.data === undefined) {
    throw new ApiError(body?.error?.message ?? 'Сервер временно недоступен', res.status, body?.error?.code);
  }
  return body.data;
}

export const getUpcoming = (limit = 100, signal?: AbortSignal) => get<Match[]>(`/matches/upcoming?limit=${limit}`, signal);
export const getFinished = (limit = 50, signal?: AbortSignal) => get<Match[]>(`/matches/finished?limit=${limit}`, signal);
export const getMatch = (id: string, signal?: AbortSignal) => get<Match>(`/matches/${encodeURIComponent(id)}`, signal);
export const getLiveAccuracy = (signal?: AbortSignal) => get<LiveAccuracy>('/model/live-accuracy', signal);

let metricsCache: Promise<ModelMetrics> | undefined;
/** Метрики грузим один раз за сессию. */
export function getMetrics(): Promise<ModelMetrics> {
  metricsCache ??= get<ModelMetrics>('/model/metrics').catch((e) => {
    metricsCache = undefined;
    throw e;
  });
  return metricsCache;
}

export async function getHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    return (await fetch(`${BASE}/health`, { signal })).ok;
  } catch {
    return false;
  }
}

export const getRanking = (minGames = 0, limit = 50, signal?: AbortSignal) =>
  get<Player[]>(`/rankings/players?limit=${limit}&min_games=${minGames}`, signal);
export const getPlayer = (id: string, signal?: AbortSignal) => get<PlayerDetail>(`/players/${encodeURIComponent(id)}`, signal);
export const getTeam = (id: string, signal?: AbortSignal) => get<TeamDetail>(`/teams/${encodeURIComponent(id)}`, signal);
export const getTransfers = (limit = 50, signal?: AbortSignal) => get<Transfer[]>(`/transfers?limit=${limit}`, signal);
