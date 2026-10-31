// One player's run through the rounds. Lives in memory only.
import { ROUNDS, ROUND_SECONDS, GAME_NAME, VERTICAL } from './content';
import type { Contact, GameResult } from '../_shared/types';
import { SOURCE, newSessionId, scoreFromSeverities } from '../_shared/env';

export const run = {
  sessionId: newSessionId(),
  startedAt: Date.now(),
  index: 0,
  /** Trivia points: 100 per correct answer plus 10 per second left on the clock. */
  points: 0,
  correct: 0,
  followUps: {} as Record<string, number>, // round id -> follow-up answer index
  contact: undefined as Contact | undefined,
};

export const MAX_POINTS = ROUNDS.length * (100 + ROUND_SECONDS * 10);

export function current() {
  return ROUNDS[run.index];
}

/** Records a trivia answer (null = time ran out) and returns points earned. */
export function answerTrivia(choice: number | null, secondsLeft: number): number {
  if (choice === null || choice !== current().trivia.correct) return 0;
  const earned = 100 + Math.max(0, Math.round(secondsLeft)) * 10;
  run.points += earned;
  run.correct += 1;
  return earned;
}

export function answerFollowUp(idx: number) {
  run.followUps[current().id] = idx;
}

export function advance() {
  run.index += 1;
}

export function done() {
  return run.index >= ROUNDS.length;
}

export function buildResult(): GameResult {
  const picked = ROUNDS.map((r) => ({ r, a: r.followUp.answers[run.followUps[r.id] ?? 0] }));
  const weakest = picked.slice().sort((x, y) => y.a.severity - x.a.severity)[0];
  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    // The gauge scores their team's hiring health, not their trivia.
    score: scoreFromSeverities(picked.map(({ a }) => a.severity)),
    findings: [
      { area: 'Trivia', detail: `${run.correct}/${ROUNDS.length} correct · ${run.points} pts`, severity: 0 },
      ...picked.map(({ r, a }) => ({ area: r.area, detail: `${a.label} — ${a.finding}`, severity: a.severity })),
    ],
    topRecommendation: weakest && weakest.a.severity > 0 ? weakest.r.recommendation : undefined,
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
