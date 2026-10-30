// One player's run through the card deck. Lives in memory only.
import { QUESTIONS, scoreFromSeverities, GAME_NAME, VERTICAL } from './content';
import type { Contact, GameResult } from '../_shared/types';
import { SOURCE } from './config';

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export const run = {
  sessionId: newId(),
  cardIndex: 0,
  answers: {} as Record<string, number>, // question id -> answer index
  startedAt: Date.now(),
  contact: undefined as Contact | undefined,
};

export function currentQuestion() {
  return QUESTIONS[run.cardIndex];
}

export function answerCurrent(answerIndex: number) {
  run.answers[currentQuestion().id] = answerIndex;
}

export function hasMoreCards() {
  return run.cardIndex < QUESTIONS.length - 1;
}

export function advanceCard() {
  run.cardIndex += 1;
}

/** Builds the finished-run result once every card has been answered. */
export function buildResult(): GameResult {
  const severities = QUESTIONS.map((q) => q.answers[run.answers[q.id] ?? 0].severity);
  const findings = QUESTIONS.map((q) => {
    const a = q.answers[run.answers[q.id] ?? 0];
    return { area: q.area, detail: a.finding, severity: a.severity };
  });
  const biggestGap = QUESTIONS
    .map((q) => ({ q, a: q.answers[run.answers[q.id] ?? 0] }))
    .sort((x, y) => y.a.severity - x.a.severity)[0];

  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    score: scoreFromSeverities(severities),
    findings,
    topRecommendation: biggestGap && biggestGap.a.severity > 0 ? biggestGap.q.recommendation : undefined,
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
