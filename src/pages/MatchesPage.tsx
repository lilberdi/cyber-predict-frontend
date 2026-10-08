import { useMemo, useState } from 'react';
import { MatchList } from '../components/matches/MatchList';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { matches as mockMatches, predictions as mockPredictions, teams as mockTeams } from '../data/mockData';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getMatches, getPredictions, getTeams } from '../services/api';
import type { MatchStatus } from '../types';

const filters: Array<{ label: string; value: 'all' | 'today' | 'tomorrow' | MatchStatus }> = [
  { label: 'Все', value: 'all' },
  { label: 'Сегодня', value: 'today' },
  { label: 'Завтра', value: 'tomorrow' },
  { label: 'Завершённые', value: 'finished' },
];

export function MatchesPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]['value']>('all');
  const { data: matches } = useAsyncResource(getMatches, mockMatches);
  const { data: predictions } = useAsyncResource(getPredictions, mockPredictions);
  const { data: teams } = useAsyncResource(getTeams, mockTeams);
  const filteredMatches = useMemo(() => matches.filter((match) => {
    if (filter === 'all') return true;
    if (filter === 'today') return match.date === '2026-09-24';
    if (filter === 'tomorrow') return match.date === '2026-09-25';
    return match.status === filter;
  }), [filter]);

  return (
    <div className="page-stack">
      <SectionHeader title="Матчи" description="Список ближайших и завершённых матчей Counter-Strike 2." action={<Badge tone="yellow">Mock data</Badge>} />
      <div className="filters">
        {filters.map((item) => (
          <button key={item.value} className={filter === item.value ? 'active' : ''} onClick={() => setFilter(item.value)} type="button">{item.label}</button>
        ))}
      </div>
      <MatchList matches={filteredMatches} predictions={predictions} teams={teams} compact />
    </div>
  );
}
