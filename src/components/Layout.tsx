import { Moon, Sun } from 'lucide-react';
import { NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { useMatches } from '../data/MatchesContext';
import { useNow, useTheme } from '../hooks';
import { fmtClock } from '../utils/format';

export const DISCLAIMER = 'Учебный прототип. Прогнозы не являются ставками или финансовой рекомендацией.';

function DataStatus() {
  const { data, error, updatedAt } = useMatches();
  useNow(60_000);
  if (!data) return error ? <span className="status status--bad"><i className="dot" /> Нет связи с API</span> : null;
  const demo = data.length > 0 && data.every((m) => m.source === 'fixture');
  const time = updatedAt ? ` · ${fmtClock(new Date(updatedAt))}` : '';
  return demo ? (
    <span className="status status--warn" title="Показаны демо-матчи"><i className="dot" /> Демо-данные<span className="status__more">{time}</span></span>
  ) : (
    <span className={`status ${error ? 'status--bad' : 'status--ok'}`} title={error ? 'Не удалось обновить данные' : 'Данные из PandaScore'}>
      <i className={`dot ${error ? '' : 'dot--pulse'}`} /> {error ? 'Данные устарели' : 'LIVE'}<span className="status__more">{error ? '' : ' · PandaScore'}{time}</span>
    </span>
  );
}

export function Layout() {
  const [theme, toggle] = useTheme();
  return (
    <div className="shell">
      <header className="header">
        <div className="wrap header__in">
          <NavLink to="/" className="brand" aria-label="Cyber Predict — на главную">
            <span className="brand__mark" aria-hidden="true"><i /><i /></span>
            <span>Cyber<b>Predict</b></span>
          </NavLink>
          <nav aria-label="Основная навигация">
            <NavLink to="/" end>Матчи</NavLink>
            <NavLink to="/results">Результаты</NavLink>
            <NavLink to="/players">Игроки</NavLink>
            <NavLink to="/transfers">Трансферы</NavLink>
            <NavLink to="/about">О модели</NavLink>
          </nav>
          <div className="header__right">
            <DataStatus />
            <button className="iconbtn" onClick={toggle} aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main className="wrap main"><Outlet /></main>
      <footer className="footer"><div className="wrap">{DISCLAIMER}</div></footer>
      <ScrollRestoration />
    </div>
  );
}
