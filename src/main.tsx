import { StrictMode, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Skeleton } from './components/States';
import { MatchesProvider } from './data/MatchesContext';
import { MatchDetailPage } from './pages/MatchDetail';
import { MatchListPage } from './pages/MatchList';
import { ResultsPage } from './pages/Results';
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
