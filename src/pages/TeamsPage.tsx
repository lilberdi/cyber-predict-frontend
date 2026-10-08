import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TeamCard } from '../components/teams/TeamCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateBlock } from '../components/ui/StateBlock';
import { teams as mockTeams } from '../data/mockData';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getTeams } from '../services/api';

export function TeamsPage() {
  const [query, setQuery] = useState('');
  const { data: teams, isLoading } = useAsyncResource(getTeams, mockTeams);
  const filteredTeams = useMemo(() => {
    const value = query.trim().toLowerCase();
    return teams.filter((team) => team.name.toLowerCase().includes(value) || team.country.toLowerCase().includes(value));
  }, [query]);

  return (
    <div className="page-stack">
      <SectionHeader title="Команды" description="Команды CS2 с демонстрационным рейтингом CyberPredict и текущей формой." />
      <label className="search-box">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск команды или страны" />
      </label>
      {isLoading ? <StateBlock type="loading" title="Загружаем команды" /> : filteredTeams.length === 0 ? <StateBlock type="empty" title="Команды не найдены" /> : (
        <div className="card-grid">
          {filteredTeams.map((team) => <TeamCard key={team.id} team={team} />)}
        </div>
      )}
    </div>
  );
}
