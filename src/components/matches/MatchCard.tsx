import { ArrowRight, CalendarClock } from 'lucide-react';
import type { Match, Prediction, Team } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TeamLogo } from '../ui/TeamLogo';

interface MatchCardProps {
  match: Match;
  teamA: Team;
  teamB: Team;
  prediction?: Prediction;
  compact?: boolean;
}

const statusLabel = {
  upcoming: 'Предстоящий',
  live: 'Live',
  finished: 'Завершён',
};

export function MatchCard({ match, teamA, teamB, prediction, compact = false }: MatchCardProps) {
  return (
    <Card className={`match-card ${compact ? 'match-card--compact' : ''}`} interactive>
      <div className="match-card__top">
        <span>{match.tournamentName}</span>
        <Badge tone={match.status === 'finished' ? 'muted' : 'blue'}>{statusLabel[match.status]}</Badge>
      </div>
      <div className="match-card__teams">
        <div>
          <TeamLogo name={teamA.name} color={teamA.color} />
          <strong>{teamA.name}</strong>
        </div>
        <span>{match.score ?? 'vs'}</span>
        <div>
          <TeamLogo name={teamB.name} color={teamB.color} />
          <strong>{teamB.name}</strong>
        </div>
      </div>
      <div className="match-card__details">
        <span><CalendarClock size={15} /> {new Date(match.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}, {match.time}</span>
        <Badge tone="purple">{match.format}</Badge>
      </div>
      {prediction ? (
        <div className="match-card__prediction">
          <span>{teamA.shortName} <strong>{prediction.probabilityA}%</strong></span>
          <span>{teamB.shortName} <strong>{prediction.probabilityB}%</strong></span>
          <Badge tone="green">AI прогноз доступен</Badge>
        </div>
      ) : (
        <div className="match-card__prediction match-card__prediction--empty">AI прогноз пока не сформирован</div>
      )}
      {!compact && prediction && (
        <Button to={`/predictions/${prediction.id}`} variant="ghost" icon={<ArrowRight size={16} />}>
          Подробнее
        </Button>
      )}
    </Card>
  );
}
