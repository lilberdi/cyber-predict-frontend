import { BrainCircuit, Code2, Database, LineChart, Server, Sigma } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';

const steps = [
  { title: 'Сбор статистических данных', icon: Database },
  { title: 'Формирование признаков', icon: Sigma },
  { title: 'ML-модель', icon: BrainCircuit },
  { title: 'Расчёт вероятности', icon: LineChart },
  { title: 'Отображение прогноза', icon: Code2 },
];

const technologies = [
  { label: 'Frontend', value: 'React + TypeScript', icon: Code2 },
  { label: 'Backend', value: 'FastAPI', icon: Server },
  { label: 'ML', value: 'scikit-learn', icon: BrainCircuit },
  { label: 'Data', value: 'CS2 Match Statistics', icon: Database },
];

export function AboutPage() {
  return (
    <div className="page-stack">
      <section className="about-intro">
        <Badge tone="purple">О CyberPredict</Badge>
        <h1>CyberPredict — интеллектуальная система анализа киберспортивных матчей Counter-Strike 2.</h1>
        <p>Система использует статистические данные команд и результаты предыдущих матчей для оценки вероятности победы.</p>
      </section>
      <section>
        <SectionHeader title="Как работает система" description="От данных до понятного прогноза для пользователя." />
        <div className="workflow">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="workflow-card">
                <span>Шаг {index + 1}</span>
                <Icon size={24} />
                <strong>{step.title}</strong>
              </Card>
            );
          })}
        </div>
      </section>
      <section>
        <SectionHeader title="Технологии" />
        <div className="card-grid">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <Card key={tech.label} className="tech-card">
                <Icon size={24} />
                <span>{tech.label}</span>
                <strong>{tech.value}</strong>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
