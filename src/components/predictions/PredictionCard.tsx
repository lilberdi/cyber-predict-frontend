import { ArrowRight, BrainCircuit } from 'lucide-react';
import type { Prediction, Team } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { TeamLogo } from '../ui/TeamLogo';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ProbabilityBar } from './ProbabilityBar';

interface PredictionCardProps {
  prediction: Prediction;
  teamA: Team;
  teamB: Team;
}

export function PredictionCard({ prediction, teamA, teamB }: PredictionCardProps) {
  const winner = prediction.predictedWinnerId === teamA.id ? teamA : teamB;

  return (
    <Card className="prediction-card" interactive>
      <div className="prediction-card__top">
        <span className="mini-label"><BrainCircuit size={15} /> Прогноз модели</span>
        <span>{prediction.modelVersion}</span>
      </div>
      <div className="prediction-card__teams">
        <div className={winner.id === teamA.id ? 'winner' : ''}>
          <TeamLogo name={teamA.name} color={teamA.color} />
          <strong>{teamA.name}</strong>
          <b>{prediction.probabilityA}%</b>
        </div>
        <span className="versus">vs</span>
        <div className={winner.id === teamB.id ? 'winner' : ''}>
          <TeamLogo name={teamB.name} color={teamB.color} />
          <strong>{teamB.name}</strong>
          <b>{prediction.probabilityB}%</b>
        </div>
      </div>
      <ProbabilityBar leftLabel={teamA.shortName} rightLabel={teamB.shortName} leftValue={prediction.probabilityA} rightValue={prediction.probabilityB} />
      <div className="prediction-card__meta">
        <span>Прогноз: <strong>{winner.name}</strong></span>
        <ConfidenceBadge confidence={prediction.confidence} />
        <span>Форма: {teamA.form.join(' ')} / {teamB.form.join(' ')}</span>
      </div>
      <Button to={`/predictions/${prediction.id}`} variant="secondary" icon={<ArrowRight size={16} />}>
        Открыть анализ
      </Button>
    </Card>
  );
}
