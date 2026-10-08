import { useMemo, useState } from 'react';
import { PredictionCard } from '../components/predictions/PredictionCard';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateBlock } from '../components/ui/StateBlock';
import { predictions as mockPredictions, teams as mockTeams, tournaments } from '../data/mockData';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getPredictions, getTeams } from '../services/api';
import type { MatchStatus } from '../types';

const filters: Array<{ label: string; value: 'all' | 'today' | MatchStatus }> = [
  { label: 'Все', value: 'all' },
  { label: 'Сегодня', value: 'today' },
  { label: 'Предстоящие', value: 'upcoming' },
  { label: 'Завершённые', value: 'finished' },
];

export function PredictionsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]['value']>('all');
  const [tournament, setTournament] = useState('all');
  const { data: predictions, isLoading, isError } = useAsyncResource(getPredictions, mockPredictions);
  const { data: teams } = useAsyncResource(getTeams, mockTeams);

  const filteredPredictions = useMemo(() => {
    return predictions.filter((prediction) => {
      const statusMatch = filter === 'all' || (filter === 'today' ? prediction.date === '2026-09-24' : prediction.status === filter);
      const tournamentMatch = tournament === 'all' || prediction.tournamentName === tournament;
      return statusMatch && tournamentMatch;
    });
  }, [filter, tournament]);

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="AI-прогнозы" title="AI-прогнозы" description="Прогнозы формируются на основе статистических характеристик команд и результатов прошлых матчей." action={<Badge tone="yellow">Демонстрационные данные</Badge>} />
      {isError && <StateBlock type="error" title="Backend недоступен" description="Показаны демонстрационные данные из frontend." />}
      {isLoading && <StateBlock type="loading" title="Загружаем прогнозы" description="Если backend недоступен, будет использован mock-набор." />}
      <div className="filters">
        {filters.map((item) => (
          <button key={item.value} className={filter === item.value ? 'active' : ''} onClick={() => setFilter(item.value)} type="button">{item.label}</button>
        ))}
        <select value={tournament} onChange={(event) => setTournament(event.target.value)} aria-label="Фильтр турнира">
          <option value="all">Все турниры</option>
          {tournaments.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
        </select>
      </div>
      {!isLoading && filteredPredictions.length === 0 ? (
        <StateBlock type="empty" title="Прогнозы не найдены" description="Попробуйте изменить фильтры." />
      ) : !isLoading && (
        <div className="card-grid card-grid--two">
          {filteredPredictions.map((prediction) => {
            const teamA = teams.find((team) => team.id === prediction.teamAId)!;
            const teamB = teams.find((team) => team.id === prediction.teamBId)!;
            return <PredictionCard key={prediction.id} prediction={prediction} teamA={teamA} teamB={teamB} />;
          })}
        </div>
      )}
    </div>
  );
}
