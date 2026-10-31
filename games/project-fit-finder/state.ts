// The calculator's current inputs, plus turning them into a scored result.
import {
  PROJECTS, TIMELINE, FINANCING, DECISION, BUDGETS, BUDGET_RECOMMENDATION,
  estimate, budgetVerdict, GAME_NAME, VERTICAL,
  type ProjectDef, type ChoiceGroup, type Verdict,
} from './content';
import type { Contact, Finding, GameResult } from '../_shared/types';
import { SOURCE, newSessionId, scoreFromSeverities } from '../_shared/env';

export const run = {
  sessionId: newSessionId(),
  startedAt: Date.now(),
  projectId: undefined as string | undefined,
  sqft: 2000,
  age: 15,
  budgetId: undefined as string | undefined,
  picks: {} as Partial<Record<ChoiceGroup['id'], string>>,
  contact: undefined as Contact | undefined,
};

export function project(): ProjectDef | undefined {
  return PROJECTS.find((p) => p.id === run.projectId);
}

export function currentEstimate(): [number, number] | undefined {
  const p = project();
  return p ? estimate(p, run.sqft, run.age) : undefined;
}

export function isComplete() {
  return !!run.projectId && !!run.budgetId && [TIMELINE, FINANCING, DECISION].every((g) => run.picks[g.id]);
}

interface Scored extends Verdict { area: string; recommendation?: string }

/** Every input that has been answered so far, as a verdict. */
export function verdicts(): Scored[] {
  const out: Scored[] = [];
  const p = project();
  const est = currentEstimate();
  if (p) out.push({ area: `${p.ageLabel} (${run.age} yrs)`, ...p.condition(run.age), recommendation: p.recommendation });
  const budget = BUDGETS.find((b) => b.id === run.budgetId);
  if (budget && est) out.push({ area: 'Budget fit', ...budgetVerdict(budget, est), recommendation: BUDGET_RECOMMENDATION });
  for (const g of [DECISION, TIMELINE, FINANCING]) {
    const c = g.choices.find((x) => x.id === run.picks[g.id]);
    if (c) out.push({ area: g.area, severity: c.severity, finding: c.finding, recommendation: c.recommendation });
  }
  return out;
}

export function liveScore(): number | undefined {
  return isComplete() ? scoreFromSeverities(verdicts().map((v) => v.severity)) : undefined;
}

export function buildResult(): GameResult {
  const vs = verdicts();
  const findings: Finding[] = vs.map((v) => ({ area: v.area, detail: v.finding, severity: v.severity }));
  // Stable sort keeps the condition/budget/decision ordering on ties.
  const top = vs.slice().sort((a, b) => b.severity - a.severity)[0];
  const est = currentEstimate()!;
  const fmt = (n: number) => `$${n.toLocaleString('en-US')}`;
  findings.unshift({
    area: 'Ballpark estimate',
    detail: `${project()!.label}, ${run.sqft.toLocaleString('en-US')} sq ft: ${fmt(est[0])} – ${fmt(est[1])}`,
    severity: 0,
  });

  return {
    gameName: GAME_NAME,
    vertical: VERTICAL,
    score: scoreFromSeverities(vs.map((v) => v.severity)),
    findings,
    topRecommendation: top && top.severity > 0 ? top.recommendation : undefined,
    sessionId: run.sessionId,
    playSeconds: Math.round((Date.now() - run.startedAt) / 1000),
    source: SOURCE,
  };
}
