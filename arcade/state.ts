// One player's run. Lives in memory; saved to Supabase at the email gate.
import type { Industry } from './questions';
import { INDUSTRIES } from './questions';

export interface RunState {
  sessionId: string;
  industry: Industry;
  answers: Record<string, number>; // question id -> answer index
  stars: number;
  starsTotal: number;
  score: number;
  deaths: number;
  startedAt: number;
  finishedAt: number;
  bossHp: number;
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export const run: RunState = {
  sessionId: newId(),
  industry: 'home',
  answers: {},
  stars: 0,
  starsTotal: 0,
  score: 0,
  deaths: 0,
  startedAt: 0,
  finishedAt: 0,
  bossHp: 0,
};

export function resetRun(industry: Industry) {
  Object.assign(run, {
    sessionId: newId(),
    industry,
    answers: {},
    stars: 0,
    starsTotal: 0,
    score: 0,
    deaths: 0,
    startedAt: Date.now(),
    finishedAt: 0,
    bossHp: 0,
  });
}

export function industryNoun() {
  return INDUSTRIES.find((i) => i.id === run.industry)?.noun ?? 'job';
}
