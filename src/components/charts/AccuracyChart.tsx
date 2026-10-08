import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ModelMetrics } from '../../types';

export function AccuracyChart({ data }: { data: ModelMetrics['monthlyAccuracy'] }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="accuracyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5e8cff" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#5e8cff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#26304a" strokeDasharray="4 4" />
          <XAxis dataKey="month" stroke="#8290b5" />
          <YAxis stroke="#8290b5" domain={[60, 80]} />
          <Tooltip contentStyle={{ background: '#101625', border: '1px solid #2d3653', color: '#e7ecff' }} />
          <Area type="monotone" dataKey="accuracy" stroke="#5e8cff" fill="url(#accuracyFill)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
