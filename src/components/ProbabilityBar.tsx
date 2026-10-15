import type { Prediction } from '../types';
import { splitProb } from '../utils/format';

interface Props {
  prediction: Prediction;
  name1: string;
  name2: string;
  large?: boolean;
}

export function ProbabilityBar({ prediction, name1, name2, large }: Props) {
  const s = splitProb(prediction);
  return (
    <div
      className={`pbar ${large ? 'pbar--large' : ''} ${s.even ? 'pbar--even' : ''}`}
      role="img"
      aria-label={s.even ? `${name1} ${s.p1}%, ${name2} ${s.p2}%. Равные шансы` : `${name1} ${s.p1}%, ${name2} ${s.p2}%`}
    >
      <span className="pbar__t1" style={{ width: `${s.w1}%` }} />
      <span className="pbar__t2" style={{ width: `${s.w2}%` }} />
    </div>
  );
}

export function Percent({ prediction, side }: { prediction: Prediction; side: 1 | 2 }) {
  const s = splitProb(prediction);
  const value = side === 1 ? s.p1 : s.p2;
  const cls = s.even ? 'pct pct--even' : `pct pct--t${side} ${s.fav === side ? 'pct--fav' : ''}`;
  return <span className={cls}>{value}%</span>;
}
