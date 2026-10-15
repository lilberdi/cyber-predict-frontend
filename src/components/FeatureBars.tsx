import type { FeatureContribution } from '../types';
import { featureLabel, featureValue } from '../utils/format';

export function FeatureBars({ features, name1, name2 }: { features: FeatureContribution[]; name1: string; name2: string }) {
  const hasShap = features.some((f) => f.contribution !== undefined);
  const max = Math.max(...features.map((f) => Math.abs(f.contribution ?? 0)), 1e-9);

  return (
    <div className="fbars">
      <div className="fbars__axis" aria-hidden="true">
        <span className="c1" title={name1}>← в пользу {name1}</span>
        <span className="c2" title={name2}>в пользу {name2} →</span>
      </div>
      <ul>
        {features.map((f) => {
          const side: 1 | 2 | 0 = f.contribution !== undefined ? (f.contribution > 0 ? 1 : f.contribution < 0 ? 2 : 0) : f.impact === 'favors_team1' ? 1 : f.impact === 'favors_team2' ? 2 : 0;
          const half = hasShap && f.contribution !== undefined ? (Math.abs(f.contribution) / max) * 50 : side ? 18 : 0;
          const who = side === 1 ? name1 : side === 2 ? name2 : null;
          return (
            <li key={f.name} className="fbars__row">
              <span className="fbars__name">{featureLabel(f.name)}</span>
              <span
                className="fbars__track"
                role="img"
                aria-label={`${featureLabel(f.name)}: ${who ? `в пользу ${who}` : 'нейтрально'}`}
              >
                {side !== 0 && <span className={`fbars__bar fbars__bar--${side}`} style={{ width: `${half}%` }} />}
              </span>
              <span className="fbars__val">{featureValue(f)}</span>
            </li>
          );
        })}
      </ul>
      {hasShap && <p className="note">Вклад признака в вероятность (SHAP)</p>}
    </div>
  );
}
