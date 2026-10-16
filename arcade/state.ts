// One player's run. Lives in memory; sent to GHL at the email gate.
import { getIndustry, type Industry } from './content';

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

export function industry() {
  return getIndustry(run.industry);
}

export function world() {
  return industry().world1;
}

/** Answered questions with their chosen answer, worst first. */
export function answeredQuestions() {
  return world()
    .questions.filter((q) => q.id in run.answers)
    .map((q) => ({ q, a: q.answers[run.answers[q.id]] }));
}

export function worldSeverities() {
  return world().questions.map((q) => q.answers[run.answers[q.id] ?? 0].severity);
}

/** The automation tied to the player's biggest gap (first question wins ties). */
export function topAutomations() {
  const ranked = answeredQuestions()
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
