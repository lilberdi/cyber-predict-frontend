import { ArrowRight, BrainCircuit, CircleHelp } from 'lucide-react';
import { MatchList } from '../components/matches/MatchList';
import { PredictionCard } from '../components/predictions/PredictionCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { TeamLogo } from '../components/ui/TeamLogo';
import { matches, platformStats, predictions, teams } from '../data/mockData';

export function HomePage() {
  const preview = predictions[3] ?? predictions[0];
  const teamA = teams.find((team) => team.id === preview.teamAId)!;
  const teamB = teams.find((team) => team.id === preview.teamBId)!;
  const winner = preview.predictedWinnerId === teamA.id ? teamA : teamB;

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero__content">
          <Badge tone="purple">Демонстрационные данные</Badge>
          <h1>Прогнозируй киберспорт с помощью ИИ</h1>
          <p>CyberPredict анализирует статистику команд, игроков и прошлых матчей, чтобы определить вероятность победы.</p>
          <div className="hero__actions">
            <Button to="/predictions" icon={<ArrowRight size={17} />}>Смотреть прогнозы</Button>
            <Button to="/about" variant="secondary" icon={<CircleHelp size={17} />}>Как это работает</Button>
          </div>
        </div>
        <Card className="hero-prediction">
          <div className="hero-prediction__header">
            <span><BrainCircuit size={18} /> AI Prediction</span>
            <Badge tone="green">Уверенность модели: {preview.confidence}%</Badge>
          </div>
          <div className="hero-prediction__teams">
            <div className={winner.id === teamA.id ? 'winner' : ''}>
              <TeamLogo name={teamA.name} color={teamA.color} size="lg" />
              <span>{teamA.name}</span>
              <strong>{preview.probabilityA}%</strong>
            </div>
            <div className={winner.id === teamB.id ? 'winner' : ''}>
              <TeamLogo name={teamB.name} color={teamB.color} size="lg" />
              <span>{teamB.name}</span>
              <strong>{preview.probabilityB}%</strong>
            </div>
          </div>
          <div className="hero-prediction__line">
            <span style={{ width: `${preview.probabilityA}%` }} />
          </div>
          <p>Вероятность победы. Прогнозируемый победитель: <strong>{winner.name}</strong></p>
        </Card>
      </section>

      <section>
        <SectionHeader title="Ближайшие матчи" description="Матчи CS2, для которых уже подготовлен аналитический контекст." />
        <MatchList matches={matches.slice(0, 4)} predictions={predictions} teams={teams} />
      </section>

      <section>
        <SectionHeader title="Последние AI-прогнозы" description="Свежие прогнозы модели с вероятностями и уровнем уверенности." action={<Button to="/predictions" variant="ghost">Все прогнозы</Button>} />
        <div className="card-grid card-grid--two">
          {predictions.slice(0, 2).map((prediction) => {
            const predictionTeamA = teams.find((team) => team.id === prediction.teamAId)!;
            const predictionTeamB = teams.find((team) => team.id === prediction.teamBId)!;
            return <PredictionCard key={prediction.id} prediction={prediction} teamA={predictionTeamA} teamB={predictionTeamB} />;
          })}
        </div>
      </section>

      <section className="stats-strip">
        {platformStats.map((stat) => (
          <Card key={stat.label} className="stat-card">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </Card>
        ))}
      </section>
    </div>
  );
}
