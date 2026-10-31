// One player's trip along the map. Lives in memory only.
import { STOPS, GAME_NAME, VERTICAL } from './content';
import type { Contact, GameResult } from '../_shared/types';
import { SOURCE, newSessionId, scoreFromSeverities } from '../_shared/env';

export const run = {
  sessionId: newSessionId(),
  startedAt: Date.now(),
  index: 0,
  answers: {} as Record<string, number>, // stop id -> answer index
  contact: undefined as Contact | undefined,
};

export function current() {
  return STOPS[run.index];
}

export function answer(idx: number) {
  run.answers[current().id] = idx;
}

export function advance() {
  run.index += 1;
}

export function done() {
  return run.index >= STOPS.length;
}

export function severityAt(i: number) {
  const s = STOPS[i];
  const a = run.answers[s.id];
  return a === undefined ? undefined : s.answers[a].severity;
}

export function buildResult(): GameResult {
  const picked = STOPS.map((s) => ({ s, a: s.answers[run.answers[s.id] ?? 0] }));
  const weakest = picked.slice().sort((x, y) => y.a.severity - x.a.severity)[0];
  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    score: scoreFromSeverities(picked.map(({ a }) => a.severity)),
    findings: picked.map(({ s, a }) => ({ area: s.area, detail: `${a.label} — ${a.finding}`, severity: a.severity })),
    topRecommendation: weakest && weakest.a.severity > 0 ? weakest.s.recommendation : undefined,
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
