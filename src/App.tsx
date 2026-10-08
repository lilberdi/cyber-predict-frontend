import { Navigate, Route, Routes } from 'react-router-dom';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { MatchesPage } from './pages/MatchesPage';
import { PredictionDetailsPage } from './pages/PredictionDetailsPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { TeamDetailsPage } from './pages/TeamDetailsPage';
import { TeamsPage } from './pages/TeamsPage';
import { TournamentsPage } from './pages/TournamentsPage';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <PageContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/predictions/:id" element={<PredictionDetailsPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageContainer>
      <Footer />
    </div>
  );
}
