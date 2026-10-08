import { CalendarDays, Trophy } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { tournaments as mockTournaments } from '../data/mockData';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { getTournaments } from '../services/api';

export function TournamentsPage() {
  const { data: tournaments } = useAsyncResource(getTournaments, mockTournaments);

  return (
    <div className="page-stack">
      <SectionHeader title="Турниры" description="Турниры, которые используются в демонстрационных матчах и прогнозах CyberPredict." />
      <div className="card-grid">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="tournament-card" interactive>
            <div className="tournament-card__icon"><Trophy size={24} /></div>
            <div>
              <h3>{tournament.name}</h3>
              <span>{tournament.organizer}</span>
            </div>
            <div className="info-list">
              <span><CalendarDays size={15} /> {tournament.dateRange}</span>
              <span>Команд <strong>{tournament.teamsCount}</strong></span>
              <span>Призовой фонд <strong>{tournament.prizePool ?? 'Не указан'}</strong></span>
            </div>
            <Badge tone={tournament.status === 'Завершён' ? 'muted' : tournament.status === 'Идёт' ? 'green' : 'blue'}>{tournament.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
