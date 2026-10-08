import { BarChart3 } from 'lucide-react';
import { AccuracyChart } from '../components/charts/AccuracyChart';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { modelMetrics } from '../data/mockData';

export function StatisticsPage() {
  const metrics = [
    { label: 'Количество прогнозов', value: modelMetrics.predictionsCount },
    { label: 'Accuracy', value: `${modelMetrics.accuracy}%` },
    { label: 'Precision', value: `${modelMetrics.precision}%` },
    { label: 'Recall', value: `${modelMetrics.recall}%` },
    { label: 'F1-score', value: `${modelMetrics.f1Score}%` },
  ];

  return (
    <div className="page-stack">
      <SectionHeader title="Статистика модели" description="Аналитика качества прогнозов и активности платформы." action={<Badge tone="yellow">Демонстрационные данные</Badge>} />
      <section className="stats-strip stats-strip--five">
        {metrics.map((metric) => <Card key={metric.label} className="stat-card"><span>{metric.label}</span><strong>{metric.value}</strong></Card>)}
      </section>
      <section className="two-column two-column--wide">
        <Card>
          <SectionHeader title="Точность модели" description="Изменение accuracy по месяцам." />
          <AccuracyChart data={modelMetrics.monthlyAccuracy} />
        </Card>
        <Card>
          <SectionHeader title="Распределение прогнозов" />
          <div className="metric-list">
            {modelMetrics.predictionDistribution.map((item) => (
              <div key={item.name}>
                <span>{item.name}</span>
                <ProgressBar value={item.value} label={item.name} />
              </div>
            ))}
          </div>
        </Card>
      </section>
      <section className="two-column">
        <Card>
          <SectionHeader title="Самые анализируемые команды" />
          <div className="rank-list">
            {modelMetrics.topTeams.map((item, index) => <span key={item.team}><b>{index + 1}</b>{item.team}<strong>{item.analyses}</strong></span>)}
          </div>
        </Card>
        <Card>
          <SectionHeader title="Результаты модели" />
          <div className="result-panel">
            <BarChart3 size={34} />
            {modelMetrics.results.map((item) => <span key={item.label}>{item.label}<strong>{item.value}</strong></span>)}
          </div>
        </Card>
      </section>
    </div>
  );
}
