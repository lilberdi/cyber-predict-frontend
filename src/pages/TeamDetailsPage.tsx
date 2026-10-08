import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { RatingChart } from '../components/charts/RatingChart';
import { MatchList } from '../components/matches/MatchList';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StateBlock } from '../components/ui/StateBlock';
import { TeamLogo } from '../components/ui/TeamLogo';
import { getTeamById, matches, predictions, teams } from '../data/mockData';

export function TeamDetailsPage() {
  const { id } = useParams();
  const team = id ? getTeamById(id) : undefined;

  if (!team) {
    return <StateBlock type="empty" title="Команда не найдена" description="Проверьте ссылку или вернитесь к списку команд." />;
  }

  const teamMatches = matches.filter((match) => match.teamAId === team.id || match.teamBId === team.id).slice(0, 4);

  return (
    <div className="page-stack">
      <Link className="back-link" to="/teams"><ArrowLeft size={16} /> Назад к командам</Link>
      <section className="team-hero">
        <TeamLogo name={team.name} color={team.color} size="lg" />
        <div>
          <Badge tone="purple">#{team.rank} в рейтинге</Badge>
          <h1>{team.name}</h1>
          <p>{team.country}</p>
        </div>
      </section>
      <section className="stats-strip">
        <Card className="stat-card"><span>CyberPredict Rating</span><strong>{team.rating}</strong></Card>
        <Card className="stat-card"><span>Победы</span><strong>{team.wins}</strong></Card>
        <Card className="stat-card"><span>Поражения</span><strong>{team.losses}</strong></Card>
        <Card className="stat-card"><span>Win Rate</span><strong>{team.winRate}%</strong></Card>
      </section>
      <section className="two-column">
        <Card>
          <SectionHeader title="Статистика команды" description="Динамика рейтинга в демонстрационном наборе." />
          <RatingChart team={team} />
          <ProgressBar value={team.winRate} label="Win Rate" />
          <div className="form-row">
            {team.form.map((result, index) => <span key={index} className={result === 'W' ? 'form-win' : 'form-loss'}>{result}</span>)}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Профиль" />
          <div className="info-list">
            <span>Страна <strong>{team.country}</strong></span>
            <span>Матчи <strong>{team.wins + team.losses}</strong></span>
            <span>Позиция <strong>#{team.rank}</strong></span>
            <span>Форма <strong>{team.form.join(' ')}</strong></span>
          </div>
        </Card>
      </section>
      <section>
        <SectionHeader title="Последние матчи" />
        <MatchList matches={teamMatches} predictions={predictions} teams={teams} compact />
      </section>
    </div>
  );
}
