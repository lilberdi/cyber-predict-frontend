import { Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/predictions', label: 'Прогнозы' },
  { to: '/matches', label: 'Матчи' },
  { to: '/teams', label: 'Команды' },
  { to: '/tournaments', label: 'Турниры' },
  { to: '/statistics', label: 'Статистика' },
  { to: '/about', label: 'О проекте' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink className="brand" to="/" onClick={() => setIsOpen(false)}>
          <span>CyberPredict</span>
          <small>AI for smarter esports.</small>
        </NavLink>
        <button className="nav-toggle" type="button" onClick={() => setIsOpen((value) => !value)} aria-label="Открыть меню">
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav ${isOpen ? 'main-nav--open' : ''}`}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setIsOpen(false)} className={({ isActive }) => (isActive ? 'active' : undefined)} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ai-status" title="Демонстрационный статус ML-сервиса">
          <Activity size={16} />
          <span>AI система активна</span>
        </div>
      </div>
    </header>
  );
}
