// One player's spins. Lives in memory only.
import { AREAS, SPINS, GAME_NAME, VERTICAL, type Area } from './content';
import type { Contact, GameResult } from '../_shared/types';
import { SOURCE, newSessionId, scoreFromSeverities } from '../_shared/env';

export const run = {
  sessionId: newSessionId(),
  startedAt: Date.now(),
  /** Area ids in the order the wheel landed on them. */
  landed: [] as string[],
  answers: {} as Record<string, number>, // area id -> answer index
  contact: undefined as Contact | undefined,
};

export function remaining(): Area[] {
  return AREAS.filter((a) => !run.landed.includes(a.id));
}

/** Picks where the next spin lands: any area not asked yet. */
export function nextLanding(): Area {
  const pool = remaining();
  const area = pool[Math.floor(Math.random() * pool.length)];
  run.landed.push(area.id);
  return area;
}

/** Records that the player caught this area's orb (the catcher picks areas itself). */
export function land(area: Area) {
  run.landed.push(area.id);
}

export function answer(area: Area, idx: number) {
  run.answers[area.id] = idx;
}

export function spinsLeft() {
  return SPINS - run.landed.length;
}

export function buildResult(): GameResult {
  const picked = run.landed.map((id) => {
    const area = AREAS.find((a) => a.id === id)!;
    return { area, a: area.answers[run.answers[id] ?? 0] };
  });
  // Confidence is the inverse of how much they'd like to change.
  const top = picked.slice().sort((x, y) => y.a.severity - x.a.severity)[0];
  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    score: scoreFromSeverities(picked.map(({ a }) => a.severity)),
    findings: picked.map(({ area, a }) => ({ area: area.name, detail: `${a.label} — ${a.finding}`, severity: a.severity })),
    topRecommendation: top && top.a.severity > 0 ? top.area.recommendation : undefined,
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
