// Генерирует синтетические моки для экранов команд, личных встреч и сенсаций: node mocks/make-samples.mjs
// Данные составлены вручную (id 9991xx), это не реальные матчи. Формат — как у API бэкенда.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const save = (f, data) => writeFileSync(join(dir, f), JSON.stringify({ data }, null, 2) + '\n');

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const DAY = 86_400_000;
const NOW = Date.parse('2026-11-06T12:00:00Z');
const iso = (t) => new Date(t).toISOString();

const names = ['Vitality', 'Spirit', 'MOUZ', 'FaZe', 'Natus Vincere', 'The MongolZ', 'FURIA', 'Legacy', 'G2', 'Aurora', 'Falcons', 'paiN', 'Astralis', 'Liquid'];
const teams = names.map((name, i) => ({ id: 9991000 + i, name }));
const team = (name) => teams.find((t) => t.name === name);

function form(t, n = 5) {
  return Array.from({ length: n }, (_, i) => {
    const opp = teams[(teams.indexOf(t) + i + 1) % teams.length];
    const won = rnd() < 0.6;
    return { match_id: 999100 + i, played_at: iso(NOW - (i + 1) * 2 * DAY), opponent: opp, won, score_for: won ? 2 : rnd() < 0.5 ? 1 : 0, score_against: won ? (rnd() < 0.5 ? 1 : 0) : 2 };
  });
}

// Рейтинг команд
let elo = 2010;
save('rankings.teams.json', teams.map((t, i) => {
  elo -= 12 + rnd() * 30;
  return { rank: i + 1, team: t, elo: Math.round(elo * 10) / 10, elo_matches: 40 + Math.floor(rnd() * 120), change_7d: Math.round((rnd() - 0.45) * 400) / 10, last_played: iso(NOW - rnd() * 5 * DAY), form: form(t) };
}));

// Команда с историей Elo
const legacy = team('Legacy');
let r = 1780;
const history = Array.from({ length: 40 }, (_, i) => {
  const won = rnd() < 0.58;
  const delta = (won ? 1 : -1) * (6 + rnd() * 14);
  r += delta;
  const opp = teams[(i * 5 + 3) % teams.length];
  return { match_id: 999200 + i, played_at: iso(NOW - (40 - i) * 3 * DAY), rating_after: Math.round(r * 10) / 10, delta: Math.round(delta * 10) / 10, opponent: opp.id === legacy.id ? teams[0] : opp, won };
});
save('team.elo-history.json', {
  ...legacy, elo: history.at(-1).rating_after, elo_matches: 112, roster: [], roster_note: 'Синтетические данные для проверки вёрстки.',
  elo_history: history, form: form(legacy),
});

// Матч и личные встречи
const prediction = (p1, created) => ({ match_id: 0, model_name: 'elo_xgboost', model_version: '0.2.0', p_team1_win: p1, p_team2_win: Math.round((1 - p1) * 1000) / 1000, confidence: Math.abs(p1 - 0.5) > 0.15 ? 'high' : Math.abs(p1 - 0.5) > 0.07 ? 'medium' : 'low', created_at: created, top_features: [{ name: 'elo_diff', value: 29, contribution: 0.094 }, { name: 'h2h_diff', value: 0.5, contribution: 0.061 }, { name: 'form5_diff', value: 0.2, contribution: 0.04 }] });
const match = (id, t1, t2, at, extra = {}) => ({ id, source: 'pandascore', status: 'upcoming', best_of: 3, scheduled_at: iso(at), tournament: 'Sample Masters 2026', tournament_tier: 'a', team1: t1, team2: t2, score: { team1: null, team2: null }, ...extra });

const furia = team('FURIA');
const upcoming = match(999101, legacy, furia, NOW + 5 * 3600_000, { prediction: { ...prediction(0.56, iso(NOW - 3600_000)), match_id: 999101 } });
save('match.sample.json', upcoming);
save('upcoming.sample.json', [upcoming]);

const meetings = [[2, 1], [0, 2], [2, 0], [1, 2]].map(([a, b], i) => {
  const t1First = i % 2 === 0;
  const [t1, t2, s1, s2] = t1First ? [legacy, furia, a, b] : [furia, legacy, b, a];
  const winner = s1 > s2 ? t1 : t2;
  return match(999110 + i, t1, t2, NOW - (20 + i * 40) * DAY, { status: 'finished', score: { team1: s1, team2: s2 }, winner_team_id: winner.id });
});
save('h2h.sample.json', {
  match_id: 999101, team1: legacy, team2: furia, before: iso(NOW), window_days: 365,
  team1_wins: meetings.filter((m) => m.winner_team_id === legacy.id).length,
  team2_wins: meetings.filter((m) => m.winner_team_id === furia.id).length,
  meetings, form1: form(legacy), form2: form(furia),
});

// Сенсации
const items = [[team('Vitality'), team('paiN'), 0.86, 0, 2, 'b'], [team('Spirit'), team('Astralis'), 0.81, 1, 2, 's'], [team('Falcons'), team('Aurora'), 0.78, 0, 2, 'a'], [team('G2'), team('Liquid'), 0.76, 1, 2, 'a']]
  .map(([fav, dog, p, sf, sd, tier], i) => {
    const favFirst = i % 2 === 0;
    const at = NOW - (i + 1) * 2 * DAY;
    const [t1, t2, p1, s1, s2] = favFirst ? [fav, dog, p, sf, sd] : [dog, fav, 1 - p, sd, sf];
    return match(999120 + i, t1, t2, at, { status: 'finished', tournament_tier: tier, score: { team1: s1, team2: s2 }, winner_team_id: dog.id, prediction: { ...prediction(Math.round(p1 * 1000) / 1000, iso(at - 3600_000)), match_id: 999120 + i }, prediction_correct: false });
  });
save('upsets.sample.json', { threshold: 0.75, confident: 31, upsets: items.length, rate: items.length / 31, items, note: 'Синтетические данные для проверки вёрстки.' });
console.log('mocks written');
