import { matches, predictions, teams, tournaments } from '../data/mockData';
import type { Match, Prediction, Team, Tournament } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function requestWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export const getMatches = () => requestWithFallback<Match[]>('/matches', matches);
export const getMatch = (id: string) => requestWithFallback<Match | undefined>(`/matches/${id}`, matches.find((match) => match.id === id));
export const getTeams = () => requestWithFallback<Team[]>('/teams', teams);
export const getTeam = (id: string) => requestWithFallback<Team | undefined>(`/teams/${id}`, teams.find((team) => team.id === id));
export const getPredictions = () => requestWithFallback<Prediction[]>('/predictions', predictions);
export const getPrediction = (id: string) => requestWithFallback<Prediction | undefined>(`/predictions/${id}`, predictions.find((prediction) => prediction.id === id));
export const getTournaments = () => requestWithFallback<Tournament[]>('/tournaments', tournaments);
