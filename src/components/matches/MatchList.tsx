import type { Match, Prediction, Team } from '../../types';
import { MatchCard } from './MatchCard';

interface MatchListProps {
  matches: Match[];
  predictions: Prediction[];
  teams: Team[];
  compact?: boolean;
}

export function MatchList({ matches, predictions, teams, compact }: MatchListProps) {
  return (
    <div className="card-grid">
      {matches.map((match) => {
        const teamA = teams.find((team) => team.id === match.teamAId);
        const teamB = teams.find((team) => team.id === match.teamBId);
        const prediction = predictions.find((item) => item.matchId === match.id);
        if (!teamA || !teamB) return null;
        return <MatchCard key={match.id} match={match} teamA={teamA} teamB={teamB} prediction={prediction} compact={compact} />;
      })}
    </div>
  );
}
