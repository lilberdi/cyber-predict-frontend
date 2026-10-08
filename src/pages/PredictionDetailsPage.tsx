import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { MatchList } from '../components/matches/MatchList';
import { ConfidenceBadge } from '../components/predictions/ConfidenceBadge';
import { ProbabilityBar } from '../components/predictions/ProbabilityBar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateBlock } from '../components/ui/StateBlock';
import { TeamLogo } from '../components/ui/TeamLogo';
import { getPredictionById, matches, predictions, teams } from '../data/mockData';

export function PredictionDetailsPage() {
  const { id } = useParams();
  const prediction = id ? getPredictionById(id) : undefined;

  if (!prediction) {
    return <StateBlock type="empty" title="Прогноз не найден" description="Проверьте ссылку или вернитесь к списку прогнозов." />;
  }

  const teamA = teams.find((team) => team.id === prediction.teamAId)!;
  const teamB = teams.find((team) => team.id === prediction.teamBId)!;
  const winner = prediction.predictedWinnerId === teamA.id ? teamA : teamB;
  const relatedMatches = matches.filter((match) => match.teamAId === teamA.id || match.teamBId === teamA.id || match.teamAId === teamB.id || match.teamBId === teamB.id).slice(0, 3);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/predictions"><ArrowLeft size={16} /> Назад к прогнозам</Link>
      <section className="details-hero">
        <div>
          <Badge tone="purple">{prediction.tournamentName}</Badge>
          <h1>{teamA.name} vs {teamB.name}</h1>
          <p>{new Date(prediction.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}, {prediction.time} · {prediction.format}</p>
        </div>
        <div className="details-hero__teams">
          <div className={winner.id === teamA.id ? 'winner' : ''}>
            <TeamLogo name={teamA.name} color={teamA.color} size="lg" />
            <span>{teamA.name}</span>
            <strong>{prediction.probabilityA}%</strong>
          </div>
          <span>vs</span>
          <div className={winner.id === teamB.id ? 'winner' : ''}>
            <TeamLogo name={teamB.name} color={teamB.color} size="lg" />
            <span>{teamB.name}</span>
            <strong>{prediction.probabilityB}%</strong>
          </div>
        </div>
      </section>

      <Card className="analysis-card">
        <div className="analysis-card__head">
          <span><BrainCircuit size={18} /> Прогнозируемый победитель: <strong>{winner.name}</strong></span>
          <ConfidenceBadge confidence={prediction.confidence} />
        </div>
        <ProbabilityBar leftLabel={teamA.name} rightLabel={teamB.name} leftValue={prediction.probabilityA} rightValue={prediction.probabilityB} />
      </Card>

      <section>
        <SectionHeader title="Ключевые факторы модели" description="Факторы рассчитаны на демонстрационных данных и подготовлены для будущего backend API." />
        <div className="factor-grid">
          {prediction.factors.map((factor) => (
            <Card key={factor.label} className="factor-card">
              <strong>{factor.label}</strong>
              <b>+{factor.impact}%</b>
              <span>{factor.description}</span>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Сравнение команд" />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Показатель</th><th>{teamA.name}</th><th>{teamB.name}</th></tr></thead>
            <tbody>
              <tr><td>Win Rate</td><td>{teamA.winRate}%</td><td>{teamB.winRate}%</td></tr>
              <tr><td>Последние 5 матчей</td><td>{teamA.form.filter((item) => item === 'W').length}W / {teamA.form.filter((item) => item === 'L').length}L</td><td>{teamB.form.filter((item) => item === 'W').length}W / {teamB.form.filter((item) => item === 'L').length}L</td></tr>
              <tr><td>Рейтинг CyberPredict</td><td>{teamA.rating}</td><td>{teamB.rating}</td></tr>
              <tr><td>Head-to-head</td><td>7</td><td>5</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionHeader title="Последние матчи команд" />
        <MatchList matches={relatedMatches} predictions={predictions} teams={teams} compact />
      </section>
    </div>
  );
}
