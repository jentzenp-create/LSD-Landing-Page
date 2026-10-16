// One player's run across worlds. Lives in memory; sent to GHL at the email gate.
import { getIndustry, getWorld, healthScore, type Industry, type WorldDef } from './content';

export interface WorldResult {
  stars: number;
  starsTotal: number;
  seconds: number;
}

export interface Contact {
  firstName: string;
  email: string;
  phone: string;
  businessName: string;
}

export interface RunState {
  sessionId: string;
  industry: Industry;
  world: 1 | 2; // world currently being played
  answers: Record<string, number>; // question id -> answer index (ids are unique across worlds)
  stars: number; // collectibles in the current world
  starsTotal: number;
  score: number; // total across worlds
  deaths: number;
  startedAt: number; // current world
  finishedAt: number;
  bossHp: number;
  results: Partial<Record<1 | 2, WorldResult>>;
  contact?: Contact;
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export const run: RunState = {
  sessionId: newId(),
  industry: 'home',
  world: 1,
  answers: {},
  stars: 0,
  starsTotal: 0,
  score: 0,
  deaths: 0,
  startedAt: 0,
  finishedAt: 0,
  bossHp: 0,
  results: {},
};

export function resetRun(industry: Industry) {
  Object.assign(run, {
    sessionId: newId(),
    industry,
    world: 1,
    answers: {},
    stars: 0,
    starsTotal: 0,
    score: 0,
    deaths: 0,
    startedAt: Date.now(),
    finishedAt: 0,
    bossHp: 0,
    results: {},
    contact: undefined,
  });
}

export function startWorld(n: 1 | 2) {
  run.world = n;
  run.stars = 0;
  run.starsTotal = 0;
  run.startedAt = Date.now();
  run.finishedAt = 0;
}

/** Record the finished world's stats. */
export function finishWorld() {
  run.finishedAt = Date.now();
  run.results[run.world] = {
    stars: run.stars,
    starsTotal: run.starsTotal,
    seconds: Math.round((run.finishedAt - run.startedAt) / 1000),
  };
}

export function industry() {
  return getIndustry(run.industry);
}

export function world(n: 1 | 2 = run.world): WorldDef {
  return getWorld(run.industry, n);
}

/** Worlds the player has finished (or at least answered questions in). */
export function playedWorlds(): WorldDef[] {
  return ([1, 2] as const).filter((n) => run.results[n] || world(n).questions.some((q) => q.id in run.answers)).map((n) => world(n));
}

/** Answered questions with their chosen answer, for the given worlds. */
export function answeredQuestions(worlds: WorldDef[] = [world()]) {
  return worlds
    .flatMap((w) => w.questions)
    .filter((q) => q.id in run.answers)
    .map((q) => ({ q, a: q.answers[run.answers[q.id]] }));
}

export function worldHealth(w: WorldDef = world()) {
  return healthScore(
    w.questions.map((q) => q.answers[run.answers[q.id] ?? 0].severity),
    w.labels,
  );
}

/** Automations tied to the biggest gaps, worst first, de-duplicated. */
export function topAutomations(worlds: WorldDef[] = [world()]) {
  const ranked = answeredQuestions(worlds)
    .filter(({ a }) => a.severity > 0)
    .sort((x, y) => y.a.severity - x.a.severity);
  const seen = new Set<string>();
  const list = [];
  for (const { q } of ranked) {
    if (seen.has(q.automation.name)) continue;
    seen.add(q.automation.name);
    list.push(q.automation);
  }
  return list;
}
