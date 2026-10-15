import { createContext, useContext, type ReactNode } from 'react';
import { useResource, type Resource } from '../hooks';
import { getUpcoming } from '../services/api';
import type { Match } from '../types';

const Ctx = createContext<Resource<Match[]> | null>(null);

/** Один общий запрос ближайших матчей на всё приложение (опрос раз в минуту). */
export function MatchesProvider({ children }: { children: ReactNode }) {
  const res = useResource((s) => getUpcoming(100, s), [], 60_000);
  return <Ctx.Provider value={res}>{children}</Ctx.Provider>;
}

export function useMatches(): Resource<Match[]> {
  const v = useContext(Ctx);
  if (!v) throw new Error('MatchesProvider отсутствует');
  return v;
}
