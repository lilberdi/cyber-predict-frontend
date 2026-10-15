import { StrictMode, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Skeleton } from './components/States';
import { MatchesProvider } from './data/MatchesContext';
import { MatchDetailPage } from './pages/MatchDetail';
import { MatchListPage } from './pages/MatchList';
import { PlayerPage } from './pages/Player';
import { RankingsPage } from './pages/Rankings';
import { ResultsPage } from './pages/Results';
import { TeamPage } from './pages/Team';
import { TransfersPage } from './pages/Transfers';
import './styles/global.css';

// Страница с графиками грузится лениво.
const AboutPage = lazy(() => import('./pages/About'));

const router = createBrowserRouter([
  {
    element: <MatchesProvider><Layout /></MatchesProvider>,
    children: [
      { path: '/', element: <MatchListPage /> },
      { path: '/match/:id', element: <MatchDetailPage /> },
      { path: '/results', element: <ResultsPage /> },
      { path: '/players', element: <RankingsPage /> },
      { path: '/players/:id', element: <PlayerPage /> },
      { path: '/teams/:id', element: <TeamPage /> },
      { path: '/transfers', element: <TransfersPage /> },
      { path: '/about', element: <Suspense fallback={<Skeleton rows={3} height={140} />}><AboutPage /></Suspense> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
