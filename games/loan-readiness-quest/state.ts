// One player's climb through the challenges. Lives in memory only.
import { CHALLENGES, GAME_NAME, VERTICAL, tierFor } from './content';
import type { Contact, GameResult } from '../_shared/types';
import { SOURCE, newSessionId, scoreFromSeverities } from '../_shared/env';

export const run = {
  sessionId: newSessionId(),
  startedAt: Date.now(),
  index: 0,
  answers: {} as Record<string, number>, // challenge id -> answer index
  contact: undefined as Contact | undefined,
};

export const MAX_POINTS = CHALLENGES.length * 2;

export function current() {
  return CHALLENGES[run.index];
}

export function answer(idx: number) {
  run.answers[current().id] = idx;
}

export function advance() {
  run.index += 1;
}

export function done() {
  return run.index >= CHALLENGES.length;
}

/**
 * Readiness so far, 0-100, counted against the *whole* quest — so the bar only ever
 * climbs as you answer, and tiers unlock along the way.
 */
export function progressScore(): number {
  const earned = CHALLENGES.reduce((sum, c) => {
    const i = run.answers[c.id];
    return i === undefined ? sum : sum + (2 - c.answers[i].severity);
  }, 0);
  return Math.round((earned / MAX_POINTS) * 100);
}

export function pointsFor(idx: number) {
  return (2 - current().answers[idx].severity) * 10;
}

export function buildResult(): GameResult {
  const picked = CHALLENGES.map((c) => ({ c, a: c.answers[run.answers[c.id] ?? 0] }));
  const score = scoreFromSeverities(picked.map(({ a }) => a.severity));
  const weakest = picked.slice().sort((x, y) => y.a.severity - x.a.severity)[0];
  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    score,
    findings: [
      { area: 'Tier reached', detail: tierFor(score).name, severity: 0 },
      ...picked.map(({ c, a }) => ({ area: c.area, detail: `${a.label} — ${a.finding}`, severity: a.severity })),
    ],
    topRecommendation: weakest && weakest.a.severity > 0 ? weakest.c.recommendation : undefined,
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
