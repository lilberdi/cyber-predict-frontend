import { Filter } from 'lucide-react';
import { Fragment, useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LatestTransfers, TopPlayers } from '../components/HomePanels';
import { MatchRow } from '../components/MatchRow';
import { EmptyState, ErrorState, Skeleton, StaleBanner } from '../components/States';
import { useMatches } from '../data/MatchesContext';
import { useNow, useResource } from '../hooks';
import { getLiveAccuracy, getMetrics } from '../services/api';
import type { Confidence, Match } from '../types';
import { dayKey, dayLabel, edge, fmtNum, fmtPercent, parseDate } from '../utils/format';

type Sort = 'time' | 'edge';
const CONFS = ['high', 'medium', 'low'] as const;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      {hint && <span className="stat__hint">{hint}</span>}
    </div>
  );
}

function Hero({ count }: { count: number | undefined }) {
  const { data: metrics } = useResource(() => getMetrics(), []);
  const { data: acc } = useResource((s) => getLiveAccuracy(s), [], 300_000);
  let live = '—';
  let hint = 'Сыгранных матчей пока нет';
  if (acc && acc.evaluated > 0) {
    live = acc.evaluated < 10 ? `${acc.correct} из ${acc.evaluated}` : fmtPercent(acc.accuracy);
    hint = acc.evaluated < 10 ? 'Выборка пока мала' : `по ${fmtNum(acc.evaluated)} матчам`;
  }
  return (
    <section className="hero" aria-label="Сводка">
      <Stat label="Матчей в ленте" value={count === undefined ? '—' : fmtNum(count)} />
      <Stat label="Точность в бою" value={live} hint={hint} />
      <Stat label="Матчей в обучении" value={metrics?.extra?.data?.n_matches ? fmtNum(metrics.extra.data.n_matches) : metrics?.n_train ? fmtNum(metrics.n_train) : '—'} />
    </section>
  );
}

export function MatchListPage() {
  const { data, error, isLoading, reload } = useMatches();
  const now = useNow();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const q = params.get('q') ?? '';
  const conf = (CONFS as readonly string[]).includes(params.get('conf') ?? '') ? (params.get('conf') as Confidence) : null;
  const sort: Sort = params.get('sort') === 'edge' ? 'edge' : 'time';
  const dq = useDeferredValue(q);

  const set = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });

  const filtered = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    const list = (data ?? []).filter((m) => {
      if (conf && m.prediction?.confidence !== conf) return false;
      return !needle || [m.team1.name, m.team2.name, m.tournament ?? ''].some((s) => s.toLowerCase().includes(needle));
    });
    const time = (m: Match) => parseDate(m.scheduled_at)?.getTime() ?? Infinity;
    return list.sort((a, b) => (sort === 'edge' ? edge(b) - edge(a) || time(a) - time(b) : time(a) - time(b)));
  }, [data, dq, conf, sort]);

  const groups = useMemo(() => {
    if (sort === 'edge') return [{ key: 'all', label: 'По величине перевеса', items: filtered }];
    const out: { key: string; label: string; items: Match[] }[] = [];
    for (const m of filtered) {
      const d = parseDate(m.scheduled_at);
      const key = d ? dayKey(d) : 'tbd';
      let g = out.find((x) => x.key === key);
      if (!g) { g = { key, label: d ? dayLabel(d, now) : 'Время уточняется', items: [] }; out.push(g); }
      g.items.push(m);
    }
    return out;
  }, [filtered, sort, now]);

  const hasFilters = Boolean(q || conf || sort !== 'time');

  return (
    <>
      <div className="pagehead">
        <h1>Ближайшие матчи CS2</h1>
        <p className="muted">Вероятность победы по оценке модели. Это аналитика, а не ставки.</p>
      </div>
      <Hero count={data?.length} />

      <div className="layout">
        <section aria-label="Матчи">
          <div className="filters">
            <input type="search" placeholder="Поиск: команда или турнир" aria-label="Поиск команды или турнира" value={q} onChange={(e) => set('q', e.target.value)} />
            <button className="btn btn--filter" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}><Filter size={16} /> Фильтры</button>
            <div className={`filters__more ${filtersOpen ? 'filters__more--open' : ''}`}>
              <select aria-label="Уверенность" value={conf ?? ''} onChange={(e) => set('conf', e.target.value)}>
                <option value="">Любая уверенность</option>
                <option value="high">Высокая</option>
                <option value="medium">Средняя</option>
                <option value="low">Низкая</option>
              </select>
              <select aria-label="Порядок" value={sort} onChange={(e) => set('sort', e.target.value === 'edge' ? 'edge' : '')}>
                <option value="time">По времени</option>
                <option value="edge">По перевесу</option>
              </select>
            </div>
          </div>

          {error && data && <StaleBanner onRetry={reload} />}
          {isLoading && !data ? <Skeleton rows={5} />
            : error && !data ? <ErrorState onRetry={reload} text={error.message} />
            : !data?.length ? <EmptyState title="Сейчас нет ближайших матчей из топ-списка" text="Календарь обновляется раз в час." />
            : !filtered.length ? (
              <EmptyState title="Ничего не найдено" text="Измените запрос или фильтры." icon="search">
                {hasFilters && <button className="btn" onClick={() => setParams({}, { replace: true })}>Сбросить фильтры</button>}
              </EmptyState>
            ) : (
              groups.map((g) => (
                <Fragment key={g.key}>
                  <h2 className="day"><span>{g.label}</span><small>{g.items.length}</small></h2>
                  <div className="mlist">{g.items.map((m) => <MatchRow key={m.id} match={m} now={now} />)}</div>
                </Fragment>
              ))
            )}
        </section>
        <div className="side"><TopPlayers /></div>
        <div className="side"><LatestTransfers /></div>
      </div>
    </>
  );
}
