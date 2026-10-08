export type MatchStatus = 'upcoming' | 'live' | 'finished';
export type MatchFormat = 'BO1' | 'BO3' | 'BO5';
export type ConfidenceLevel = 'Низкая' | 'Средняя' | 'Высокая';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  country: string;
  color: string;
  rating: number;
  winRate: number;
  form: Array<'W' | 'L'>;
  rank: number;
  wins: number;
  losses: number;
  ratingHistory: Array<{ month: string; rating: number }>;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  time: string;
  teamAId: string;
  teamBId: string;
  format: MatchFormat;
  status: MatchStatus;
  hasPrediction: boolean;
  score?: string;
}

export interface PredictionFactor {
  label: string;
  impact: number;
  description: string;
}

export interface Prediction {
  id: string;
  matchId: string;
  teamAId: string;
  teamBId: string;
  tournamentName: string;
  date: string;
  time: string;
  format: MatchFormat;
  probabilityA: number;
  probabilityB: number;
  predictedWinnerId: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  modelVersion: string;
  generatedAt: string;
  status: MatchStatus;
  factors: PredictionFactor[];
}

export interface Tournament {
  id: string;
  name: string;
  organizer: string;
  dateRange: string;
  teamsCount: number;
  status: 'Предстоящий' | 'Идёт' | 'Завершён';
  prizePool?: string;
}

export interface ModelMetrics {
  predictionsCount: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  monthlyAccuracy: Array<{ month: string; accuracy: number }>;
  predictionDistribution: Array<{ name: string; value: number }>;
  topTeams: Array<{ team: string; analyses: number }>;
  results: Array<{ label: string; value: number }>;
}
