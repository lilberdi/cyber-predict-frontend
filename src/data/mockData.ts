import type { Match, ModelMetrics, Prediction, Team, Tournament } from '../types';

export const teams: Team[] = [
  { id: 'navi', name: 'NAVI', shortName: 'NAVI', country: 'Украина', color: '#f3c64e', rating: 1842, winRate: 68, form: ['W', 'W', 'L', 'W', 'W'], rank: 2, wins: 34, losses: 16, ratingHistory: [{ month: 'Апр', rating: 1760 }, { month: 'Май', rating: 1798 }, { month: 'Июн', rating: 1814 }, { month: 'Июл', rating: 1831 }, { month: 'Авг', rating: 1842 }] },
  { id: 'spirit', name: 'Team Spirit', shortName: 'Spirit', country: 'Россия', color: '#6aa7ff', rating: 1894, winRate: 71, form: ['W', 'W', 'W', 'L', 'W'], rank: 1, wins: 39, losses: 14, ratingHistory: [{ month: 'Апр', rating: 1812 }, { month: 'Май', rating: 1840 }, { month: 'Июн', rating: 1868 }, { month: 'Июл', rating: 1885 }, { month: 'Авг', rating: 1894 }] },
  { id: 'vitality', name: 'Vitality', shortName: 'VIT', country: 'Франция', color: '#f0d56d', rating: 1810, winRate: 64, form: ['L', 'W', 'W', 'W', 'L'], rank: 3, wins: 31, losses: 17, ratingHistory: [{ month: 'Апр', rating: 1792 }, { month: 'Май', rating: 1802 }, { month: 'Июн', rating: 1788 }, { month: 'Июл', rating: 1805 }, { month: 'Авг', rating: 1810 }] },
  { id: 'g2', name: 'G2', shortName: 'G2', country: 'Европа', color: '#c5c8d6', rating: 1764, winRate: 61, form: ['W', 'L', 'W', 'L', 'W'], rank: 5, wins: 28, losses: 18, ratingHistory: [{ month: 'Апр', rating: 1710 }, { month: 'Май', rating: 1734 }, { month: 'Июн', rating: 1751 }, { month: 'Июл', rating: 1748 }, { month: 'Авг', rating: 1764 }] },
  { id: 'faze', name: 'FaZe', shortName: 'FaZe', country: 'США', color: '#e06064', rating: 1738, winRate: 58, form: ['L', 'W', 'L', 'W', 'W'], rank: 6, wins: 26, losses: 19, ratingHistory: [{ month: 'Апр', rating: 1745 }, { month: 'Май', rating: 1728 }, { month: 'Июн', rating: 1732 }, { month: 'Июл', rating: 1722 }, { month: 'Авг', rating: 1738 }] },
  { id: 'mouz', name: 'MOUZ', shortName: 'MOUZ', country: 'Германия', color: '#e54d55', rating: 1782, winRate: 62, form: ['W', 'W', 'L', 'L', 'W'], rank: 4, wins: 29, losses: 18, ratingHistory: [{ month: 'Апр', rating: 1728 }, { month: 'Май', rating: 1744 }, { month: 'Июн', rating: 1771 }, { month: 'Июл', rating: 1768 }, { month: 'Авг', rating: 1782 }] },
  { id: 'astralis', name: 'Astralis', shortName: 'AST', country: 'Дания', color: '#ff6f61', rating: 1658, winRate: 52, form: ['L', 'L', 'W', 'W', 'L'], rank: 9, wins: 21, losses: 20, ratingHistory: [{ month: 'Апр', rating: 1622 }, { month: 'Май', rating: 1648 }, { month: 'Июн', rating: 1635 }, { month: 'Июл', rating: 1661 }, { month: 'Авг', rating: 1658 }] },
  { id: 'liquid', name: 'Liquid', shortName: 'TL', country: 'США', color: '#4da4ff', rating: 1686, winRate: 55, form: ['W', 'L', 'L', 'W', 'L'], rank: 8, wins: 23, losses: 19, ratingHistory: [{ month: 'Апр', rating: 1660 }, { month: 'Май', rating: 1672 }, { month: 'Июн', rating: 1668 }, { month: 'Июл', rating: 1680 }, { month: 'Авг', rating: 1686 }] },
];

export const tournaments: Tournament[] = [
  { id: 'blast-fall', name: 'BLAST Premier Fall', organizer: 'BLAST', dateRange: '24 сентября - 2 октября', teamsCount: 16, status: 'Идёт', prizePool: '$425 000' },
  { id: 'iem-cologne', name: 'IEM Cologne 2026', organizer: 'ESL', dateRange: '12-23 августа', teamsCount: 16, status: 'Завершён', prizePool: '$1 000 000' },
  { id: 'major-eu', name: 'CS2 Major Europe', organizer: 'Valve', dateRange: '4-18 ноября', teamsCount: 24, status: 'Предстоящий', prizePool: '$1 250 000' },
  { id: 'esl-pro', name: 'ESL Pro League', organizer: 'ESL', dateRange: '8-28 октября', teamsCount: 32, status: 'Предстоящий', prizePool: '$750 000' },
];

export const matches: Match[] = [
  { id: 'match-1', tournamentId: 'blast-fall', tournamentName: 'BLAST Premier Fall', date: '2026-09-24', time: '19:00', teamAId: 'navi', teamBId: 'spirit', format: 'BO3', status: 'upcoming', hasPrediction: true },
  { id: 'match-2', tournamentId: 'blast-fall', tournamentName: 'BLAST Premier Fall', date: '2026-09-24', time: '21:30', teamAId: 'vitality', teamBId: 'g2', format: 'BO3', status: 'upcoming', hasPrediction: true },
  { id: 'match-3', tournamentId: 'esl-pro', tournamentName: 'ESL Pro League', date: '2026-09-25', time: '18:00', teamAId: 'faze', teamBId: 'mouz', format: 'BO3', status: 'upcoming', hasPrediction: true },
  { id: 'match-4', tournamentId: 'major-eu', tournamentName: 'CS2 Major Europe', date: '2026-09-25', time: '20:00', teamAId: 'astralis', teamBId: 'liquid', format: 'BO1', status: 'upcoming', hasPrediction: false },
  { id: 'match-5', tournamentId: 'iem-cologne', tournamentName: 'IEM Cologne 2026', date: '2026-08-23', time: '22:00', teamAId: 'navi', teamBId: 'vitality', format: 'BO5', status: 'finished', hasPrediction: true, score: '3:1' },
];

export const predictions: Prediction[] = [
  { id: 'pred-1', matchId: 'match-1', teamAId: 'navi', teamBId: 'spirit', tournamentName: 'BLAST Premier Fall', date: '2026-09-24', time: '19:00', format: 'BO3', probabilityA: 58, probabilityB: 42, predictedWinnerId: 'navi', confidence: 78, confidenceLevel: 'Высокая', modelVersion: 'Model v1.0', generatedAt: 'сегодня, 14:20', status: 'upcoming', factors: [{ label: 'Форма последних матчей', impact: 12, description: 'Стабильность результатов за пять последних карт.' }, { label: 'Win rate', impact: 8, description: 'Сводный процент побед в демо-выборке.' }, { label: 'Head-to-head', impact: 4, description: 'История очных встреч в mock-наборе.' }, { label: 'Рейтинг команды', impact: 7, description: 'CyberPredict Rating перед матчем.' }] },
  { id: 'pred-2', matchId: 'match-2', teamAId: 'vitality', teamBId: 'g2', tournamentName: 'BLAST Premier Fall', date: '2026-09-24', time: '21:30', format: 'BO3', probabilityA: 63, probabilityB: 37, predictedWinnerId: 'vitality', confidence: 74, confidenceLevel: 'Высокая', modelVersion: 'Model v1.0', generatedAt: 'сегодня, 14:36', status: 'upcoming', factors: [{ label: 'Рейтинг команды', impact: 10, description: 'Разница в демонстрационном рейтинге.' }, { label: 'Форма последних матчей', impact: 6, description: 'Больше побед в последних играх.' }, { label: 'Стабильность карт', impact: 5, description: 'Меньше просадок по выбранным картам.' }] },
  { id: 'pred-3', matchId: 'match-3', teamAId: 'faze', teamBId: 'mouz', tournamentName: 'ESL Pro League', date: '2026-09-25', time: '18:00', format: 'BO3', probabilityA: 39, probabilityB: 61, predictedWinnerId: 'mouz', confidence: 74, confidenceLevel: 'Средняя', modelVersion: 'Model v1.0', generatedAt: 'вчера, 22:10', status: 'upcoming', factors: [{ label: 'Win rate', impact: 9, description: 'MOUZ выше по общей форме в mock-данных.' }, { label: 'Последние 5 матчей', impact: 7, description: 'Более сильная серия последних матчей.' }, { label: 'Рейтинг команды', impact: 6, description: 'Разница CyberPredict Rating.' }] },
  { id: 'pred-4', matchId: 'match-5', teamAId: 'navi', teamBId: 'vitality', tournamentName: 'IEM Cologne 2026', date: '2026-08-23', time: '22:00', format: 'BO5', probabilityA: 64, probabilityB: 36, predictedWinnerId: 'navi', confidence: 82, confidenceLevel: 'Высокая', modelVersion: 'Model v1.0', generatedAt: '23 августа, 18:00', status: 'finished', factors: [{ label: 'Форма последних матчей', impact: 12, description: 'Преимущество в форме перед финалом.' }, { label: 'Head-to-head', impact: 4, description: 'Демо-история очных встреч.' }, { label: 'Рейтинг команды', impact: 7, description: 'Рейтинг выше в демонстрационном наборе.' }] },
];

export const modelMetrics: ModelMetrics = {
  predictionsCount: 1248,
  accuracy: 72.4,
  precision: 70.8,
  recall: 68.9,
  f1Score: 69.8,
  monthlyAccuracy: [
    { month: 'Апр', accuracy: 66.2 },
    { month: 'Май', accuracy: 68.8 },
    { month: 'Июн', accuracy: 70.1 },
    { month: 'Июл', accuracy: 71.5 },
    { month: 'Авг', accuracy: 72.4 },
  ],
  predictionDistribution: [
    { name: 'Высокая уверенность', value: 42 },
    { name: 'Средняя уверенность', value: 45 },
    { name: 'Низкая уверенность', value: 13 },
  ],
  topTeams: [
    { team: 'NAVI', analyses: 142 },
    { team: 'Team Spirit', analyses: 138 },
    { team: 'Vitality', analyses: 121 },
    { team: 'G2', analyses: 117 },
  ],
  results: [
    { label: 'Верные прогнозы', value: 904 },
    { label: 'Ошибочные прогнозы', value: 344 },
  ],
};

export const platformStats = [
  { label: 'Матчей проанализировано', value: '1 248' },
  { label: 'Команд', value: '96' },
  { label: 'Средняя точность модели', value: '72.4%' },
  { label: 'Активных турниров', value: '12' },
];

export const getTeamById = (id: string) => teams.find((team) => team.id === id);
export const getPredictionById = (id: string) => predictions.find((prediction) => prediction.id === id);
export const getMatchById = (id: string) => matches.find((match) => match.id === id);
