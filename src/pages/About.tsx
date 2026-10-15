import { AlertTriangle, Info } from 'lucide-react';
import { ErrorState, Skeleton, EmptyState } from '../components/States';
import { DISCLAIMER } from '../components/Layout';
import { useResource } from '../hooks';
import { ApiError, getMetrics } from '../services/api';
import type { ModelMetrics, ReliabilityBin } from '../types';
import { featureLabel, fmtNum, fmtPercent, fmtSigned } from '../utils/format';

const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const dateYear = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      {hint && <span className="stat__hint">{hint}</span>}
    </div>
  );
}

function Compare({ m }: { m: ModelMetrics }) {
  const entries = ['elo_only', 'elo_logreg', 'elo_xgboost'].map((k) => [k, m.extra?.comparison?.[k]] as const).filter(([, v]) => v);
  if (!entries.length) return null;
  const col = (key: 'accuracy' | 'log_loss', title: string, lo: number, hi: number, fmt: (v: number) => string, note: string) => (
    <figure className="chart">
      <figcaption>{title}<small>{note}</small></figcaption>
      <div className="cols">
        {entries.map(([k, v]) => {
          const val = v![key];
          const h = Math.max(4, Math.min(100, ((val - lo) / (hi - lo)) * 100));
          return (
            <div key={k} className="cols__item" title={`${v!.label}: ${fmt(val)}`}>
              <span className="cols__val">{fmt(val)}</span>
              <span className={`cols__bar ${k === 'elo_xgboost' ? 'cols__bar--accent' : ''}`} style={{ height: `${h}%` }} />
              <span className="cols__label">{v!.label}</span>
            </div>
          );
        })}
      </div>
    </figure>
  );
  const accs = entries.map(([, v]) => v!.accuracy);
  const lls = entries.map(([, v]) => v!.log_loss);
  return (
    <div className="charts">
      {col('accuracy', 'Доля угаданных матчей', 0.5, Math.max(0.7, Math.max(...accs) + 0.02), (v) => fmtPercent(v), 'Ось начинается с 50%: больше — лучше')}
      {col('log_loss', 'Log-loss (качество вероятностей)', 0.6, Math.max(...lls) + 0.02, (v) => fmtNum(v, 3), 'Ось начинается с 0,600: меньше — лучше')}
    </div>
  );
}

function Reliability({ bins }: { bins: ReliabilityBin[] }) {
  const S = 260, P = 34;
  const x = (v: number) => P + v * (S - P - 8);
  const y = (v: number) => S - P - v * (S - P - 8);
  const maxN = Math.max(...bins.map((b) => b.n), 1);
  return (
    <figure className="chart">
      <figcaption>Совпадает ли предсказанная вероятность с реальной частотой побед<small>Чем ближе точки к диагонали, тем честнее вероятности</small></figcaption>
      <svg viewBox={`0 0 ${S} ${S}`} className="rel" role="img" aria-label="График надёжности: предсказанная и фактическая доля побед">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={y(0)} y2={y(1)} className="rel__grid" />
            <line x1={x(0)} x2={x(1)} y1={y(t)} y2={y(t)} className="rel__grid" />
            <text x={x(t)} y={S - P + 14} textAnchor="middle" className="rel__tick">{t * 100}</text>
            <text x={P - 6} y={y(t) + 3} textAnchor="end" className="rel__tick">{t * 100}</text>
          </g>
        ))}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} className="rel__ideal" />
        {bins.map((b) => (
          <circle key={b.bin} cx={x(b.predicted)} cy={y(b.actual)} r={3 + 6 * Math.sqrt(b.n / maxN)} className="rel__dot">
            <title>{`Предсказано ${fmtPercent(b.predicted, 0)}, фактически ${fmtPercent(b.actual, 0)} (матчей: ${b.n})`}</title>
          </circle>
        ))}
        <text x={S / 2} y={S - 2} textAnchor="middle" className="rel__axis">предсказано, %</text>
        <text x={9} y={S / 2} textAnchor="middle" className="rel__axis" transform={`rotate(-90 9 ${S / 2})`}>фактически, %</text>
      </svg>
      <details className="table-alt">
        <summary>Таблица данных</summary>
        <table>
          <thead><tr><th>Интервал</th><th>Матчей</th><th>Предсказано</th><th>Фактически</th></tr></thead>
          <tbody>{bins.map((b) => <tr key={b.bin}><td>{b.bin.replace('.', ',').replace('.', ',')}</td><td>{fmtNum(b.n)}</td><td>{fmtPercent(b.predicted, 0)}</td><td>{fmtPercent(b.actual, 0)}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

function Content({ m }: { m: ModelMetrics }) {
  const e = m.extra;
  const sig = e?.significance?.xgboost_minus_elo;
  const noDiff = sig ? sig.ci95[0] < 0 && sig.ci95[1] > 0 : false;
  const wf = e?.walk_forward?.results?.elo_xgboost?.accuracy;
  const importance = Object.entries(e?.feature_importance ?? {}).sort((a, b) => b[1] - a[1]);
  const maxImp = Math.max(...importance.map(([, v]) => v), 1e-9);
  const ablation = Object.entries(e?.ablation ?? {}).sort((a, b) => b[1].log_loss_gain - a[1].log_loss_gain);
  const from = e?.data?.from ? new Date(e.data.from) : undefined;
  const to = e?.data?.to ? new Date(e.data.to) : undefined;
  const ci = (k: 'xgboost_accuracy' | 'elo_accuracy') => e?.significance?.[k]?.ci95;

  return (
    <>
      <div className="pagehead">
        <h1>О модели</h1>
        <p className="muted">
          Модель оценивает вероятность победы по рейтингу Elo, форме команд, личным встречам и формату матча. Прогноз — вероятность, а не ответ «кто выиграет».
        </p>
      </div>

      {e?.data?.source === 'synthetic' && (
        <div className="callout callout--warn" role="alert"><AlertTriangle size={18} /> Модель обучена на синтетических данных. Метрики не отражают реальную точность.</div>
      )}

      <section className="panel">
        <h2 className="h-block">Коротко</h2>
        <div className="stats">
          {m.accuracy !== undefined && <Tile label="Accuracy" value={fmtPercent(m.accuracy)} hint="доля угаданных матчей на тесте" />}
          {m.log_loss !== undefined && <Tile label="Log-loss" value={fmtNum(m.log_loss, 3)} hint="меньше — лучше" />}
          {m.brier !== undefined && <Tile label="Brier" value={fmtNum(m.brier, 3)} hint="меньше — лучше" />}
          {m.n_test !== undefined && <Tile label="Тестовая выборка" value={`${fmtNum(m.n_test)} матчей`} hint={m.n_train ? `обучение: ${fmtNum(m.n_train)}` : undefined} />}
        </div>
        <p className="note">
          {m.model_name} v{m.model_version} · обучена {new Date(m.trained_at).toLocaleString('ru-RU')}
          {from && to && ` · данные: ${dateFmt.format(from)} — ${dateYear.format(to)}`}
          {e?.data && ` · ${fmtNum(e.data.n_matches)} матчей, ${fmtNum(e.data.n_teams)} команд`}
        </p>
      </section>

      {e?.comparison && (
        <section className="panel">
          <h2 className="h-block">Сравнение с базовыми методами</h2>
          <Compare m={m} />
          {noDiff && (
            <div className="callout"><Info size={18} /> По числу угаданных матчей XGBoost статистически не отличается от Elo. Преимущество — в более точных вероятностях (log-loss).</div>
          )}
          <ul className="facts">
            {wf && <li>Устойчивость: {fmtPercent(wf.mean)} ± {fmtNum(wf.std * 100, 1)} п.п. по {e.walk_forward.folds} окнам</li>}
            {ci('xgboost_accuracy') && <li>XGBoost, доверительный интервал: {fmtPercent(ci('xgboost_accuracy')![0])} … {fmtPercent(ci('xgboost_accuracy')![1])}</li>}
            {ci('elo_accuracy') && <li>Elo, доверительный интервал: {fmtPercent(ci('elo_accuracy')![0])} … {fmtPercent(ci('elo_accuracy')![1])}</li>}
            {sig && <li>Разница XGBoost − Elo: {fmtSigned(sig.mean * 100, 1)} п.п. (интервал {fmtSigned(sig.ci95[0] * 100, 1)} … {fmtSigned(sig.ci95[1] * 100, 1)} п.п.)</li>}
          </ul>
        </section>
      )}

      {(importance.length > 0 || ablation.length > 0) && (
        <section className="panel">
          <h2 className="h-block">Какие признаки важны</h2>
          {importance.length > 0 && (
            <ul className="hbars">
              {importance.map(([name, v]) => (
                <li key={name}>
                  <span>{featureLabel(name)}</span>
                  <span className="bar"><span style={{ width: `${(v / maxImp) * 100}%` }} /></span>
                  <b>{fmtNum(v * 100, 1)}%</b>
                </li>
              ))}
            </ul>
          )}
          {ablation.length > 0 && (
            <details className="table-alt" open>
              <summary>Прирост качества от признака</summary>
              <p className="note">Что будет, если убрать признак. Положительный прирост log-loss — признак помогает.</p>
              <table>
                <thead><tr><th>Признак</th><th>Прирост log-loss</th><th>Прирост accuracy</th></tr></thead>
                <tbody>{ablation.map(([n, a]) => <tr key={n}><td>{featureLabel(n)}</td><td>{fmtSigned(a.log_loss_gain, 4)}</td><td>{fmtSigned(a.accuracy_gain * 100, 1)} п.п.</td></tr>)}</tbody>
              </table>
            </details>
          )}
        </section>
      )}

      {e?.calibration?.reliability && e.calibration.reliability.length > 0 && (
        <section className="panel">
          <h2 className="h-block">Насколько можно доверять вероятностям</h2>
          <Reliability bins={e.calibration.reliability} />
          <p className="note">Ошибка калибровки (ECE): {fmtNum(e.calibration.ece, 3)}</p>
        </section>
      )}

      <section className="panel">
        <h2 className="h-block">Данные и ограничения</h2>
        <p>{m.disclaimer || DISCLAIMER}</p>
        {e?.known_teams_only && <p className="note">Только команды с историей ≥ {e.known_teams_only.min_games} матчей ({fmtNum(e.known_teams_only.n)} матчей): у новых команд оценка менее надёжна.</p>}
        {m.data_sources?.length > 0 && (
          <details className="table-alt">
            <summary>Источники данных</summary>
            <ul>{m.data_sources.map((s) => <li key={s}>{s}</li>)}</ul>
          </details>
        )}
      </section>
    </>
  );
}

export default function AboutPage() {
  const { data, error, isLoading, reload } = useResource(() => getMetrics(), []);
  if (isLoading && !data) return <Skeleton rows={3} height={140} />;
  if (error && !data) {
    return error instanceof ApiError && error.status === 404
      ? <EmptyState title="Модель ещё не обучена" text="Метрики появятся после первого обучения." />
      : <ErrorState onRetry={reload} text={error.message} />;
  }
  return data ? <Content m={data} /> : null;
}
