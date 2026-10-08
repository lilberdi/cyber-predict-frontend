import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Team } from '../../types';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { TeamLogo } from '../ui/TeamLogo';

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link to={`/teams/${team.id}`} className="team-card-link">
      <Card className="team-card" interactive>
        <div className="team-card__head">
          <TeamLogo name={team.name} color={team.color} size="lg" />
          <div>
            <h3>{team.name}</h3>
            <span>{team.country}</span>
          </div>
          <ArrowRight size={18} />
        </div>
        <div className="team-card__stats">
          <span>Позиция <strong>#{team.rank}</strong></span>
          <span>CyberPredict Rating <strong>{team.rating}</strong></span>
        </div>
        <ProgressBar value={team.winRate} label="Win Rate" />
        <div className="form-row">
          {team.form.map((result, index) => <span key={`${team.id}-${index}`} className={result === 'W' ? 'form-win' : 'form-loss'}>{result}</span>)}
        </div>
      </Card>
    </Link>
  );
}
