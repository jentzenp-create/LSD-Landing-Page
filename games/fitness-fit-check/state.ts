// One player's run through the swipe deck. Lives in memory only.
import { STATEMENTS, GAME_NAME, VERTICAL, matchProgram, type ProgramId } from './content';
import type { Contact, GameResult } from '../_shared/types';
import { SOURCE, newSessionId, scoreFromSeverities } from '../_shared/env';

export const run = {
  sessionId: newSessionId(),
  startedAt: Date.now(),
  index: 0,
  swipes: {} as Record<string, boolean>, // statement id -> true if "That's me"
  contact: undefined as Contact | undefined,
};

export function current() {
  return STATEMENTS[run.index];
}

export function swipe(isMe: boolean) {
  run.swipes[current().id] = isMe;
  run.index += 1;
}

export function done() {
  return run.index >= STATEMENTS.length;
}

function outcomes() {
  return STATEMENTS.map((s) => ({ s, o: run.swipes[s.id] ? s.yes : s.no }));
}

export function program(): string {
  return matchProgram(outcomes().flatMap(({ o }) => o.points ?? []) as ProgramId[]);
}

export function buildResult(): GameResult {
  const os = outcomes();
  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    score: scoreFromSeverities(os.map(({ o }) => o.severity)),
    findings: os.map(({ s, o }) => ({ area: s.area, detail: o.finding, severity: o.severity })),
    // Every player gets a program match, even a perfect score.
    topRecommendation: program(),
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
