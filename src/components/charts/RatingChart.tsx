import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Team } from '../../types';

export function RatingChart({ team }: { team: Team }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={team.ratingHistory} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="month" stroke="#8290b5" />
          <YAxis stroke="#8290b5" domain={['dataMin - 30', 'dataMax + 30']} />
          <Tooltip contentStyle={{ background: '#101625', border: '1px solid #2d3653', color: '#e7ecff' }} />
          <Line type="monotone" dataKey="rating" stroke={team.color} strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
