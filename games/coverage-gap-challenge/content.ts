// Everything Coverage Gap Challenge *says*: the six cards a prospect flips, the
// finding each answer reveals, and the recommendation tied to their biggest gap.
// Written for a life/health insurance agency's prospects. Swap this file (and only
// this file, ideally) to retarget the same card-flip engine at a different line of
// insurance — P&C, commercial, Medicare supplement, etc.

export const VERTICAL = 'Insurance';
export const GAME_NAME = 'Coverage Gap Challenge';

export interface Answer {
  label: string;
  severity: 0 | 1 | 2; // 0 = well covered, 2 = real exposure
  finding: string; // shown on the back of the card once flipped
}

export interface Question {
  id: string;
  area: string; // short label used in the report / GHL
  prompt: string; // front of the card
  answers: Answer[];
  recommendation: string; // what to offer if this is the player's biggest gap
}

export const QUESTIONS: Question[] = [
  {
    id: 'life-coverage',
    area: 'Life insurance amount',
    prompt: "If something happened to you tomorrow, would your family's life insurance payout cover more than 2 years of your income?",
    answers: [
      { label: 'Yes, comfortably', severity: 0, finding: "A payout above 2 years of income is a solid foundation — most families underinsure here, so you're ahead." },
      { label: "I'm not sure", severity: 1, finding: "Not knowing your coverage multiple is the single most common gap we find — a 10-minute review usually clears it up." },
      { label: 'No, or I have no policy', severity: 2, finding: 'Under 2 years of income (or no policy) is the biggest exposure a family can carry. This is usually fixable fast and affordably.' },
    ],
    recommendation: 'Life Insurance Coverage Review',
  },
  {
    id: 'disability',
    area: 'Disability coverage',
    prompt: 'If you could not work for 6 months due to illness or injury, do you have income protection in place?',
    answers: [
      { label: 'Yes, I have a policy', severity: 0, finding: "Disability coverage is one of the most skipped policies — you're protected where most people aren't." },
      { label: 'Only what my employer provides', severity: 1, finding: 'Employer disability coverage usually caps out lower and shorter than people expect — worth confirming the real numbers.' },
      { label: 'No coverage', severity: 2, finding: "You're statistically more likely to face a disability than an early death, yet this is the policy almost everyone skips." },
    ],
    recommendation: 'Disability Income Protection Quote',
  },
  {
    id: 'critical-illness',
    area: 'Critical illness / health gap',
    prompt: 'If you were diagnosed with a serious illness, could your savings cover the out-of-pocket costs your health plan does not?',
    answers: [
      { label: 'Yes, we have a cushion', severity: 0, finding: "A dedicated cushion for out-of-pocket medical costs puts you ahead of most households we talk to." },
      { label: 'Maybe, it would be tight', severity: 1, finding: 'A tight cushion is common — a critical illness rider is usually a small add-on that closes this gap.' },
      { label: 'No, that would be a real problem', severity: 2, finding: 'Out-of-pocket medical costs are the #1 cause of financial strain after a serious diagnosis — this is worth a real look.' },
    ],
    recommendation: 'Critical Illness Rider Review',
  },
  {
    id: 'beneficiaries',
    area: 'Beneficiary designations',
    prompt: 'Have your beneficiary designations been updated in the last 3 years (marriage, kids, divorce, etc.)?',
    answers: [
      { label: 'Yes, up to date', severity: 0, finding: 'Up-to-date beneficiaries sound small but prevent the most common and painful claims mistakes.' },
      { label: 'Not sure / probably not', severity: 1, finding: "Outdated beneficiaries are an easy, free fix once you know to check — worth confirming this week." },
      { label: 'No, never updated', severity: 2, finding: 'Outdated beneficiary designations can send a payout to the wrong person entirely — this is worth fixing immediately, at no cost.' },
    ],
    recommendation: 'Beneficiary & Policy Audit',
  },
  {
    id: 'policy-review',
    area: 'Policy review recency',
    prompt: 'When was the last time an advisor actually reviewed your full insurance picture together, not just one policy?',
    answers: [
      { label: 'Within the last year', severity: 0, finding: 'A recent full review means your coverage is likely tracking your actual life, not an outdated snapshot of it.' },
      { label: '1-3 years ago', severity: 1, finding: 'A lot changes in a couple of years — income, dependents, debt. A refresh usually finds at least one easy win.' },
      { label: "Never, or can't remember", severity: 2, finding: "Most people's coverage was set once and never revisited — a full review usually finds gaps and savings in the same conversation." },
    ],
    recommendation: 'Full Coverage Portfolio Review',
  },
  {
    id: 'premium-check',
    area: 'Rate competitiveness',
    prompt: "Have you compared your current premiums against the market in the last 2 years?",
    answers: [
      { label: 'Yes, recently', severity: 0, finding: "Checking rates periodically keeps you from quietly overpaying — good habit." },
      { label: "No, I've just kept renewing", severity: 1, finding: 'Carriers reprice constantly; a quick comparison often finds the same coverage for less.' },
      { label: "No idea what I'm even paying for", severity: 2, finding: "Not knowing what you're covered for (or paying for) is the clearest sign a full review is overdue." },
    ],
    recommendation: 'Rate Comparison Shop',
  },
];

/** 0-100, higher = better covered. Mirrors the health-score shape used across the system. */
export function scoreFromSeverities(severities: number[]): number {
  if (!severities.length) return 100;
  const avg = severities.reduce((s, v) => s + v, 0) / severities.length;
  return Math.round(100 - (avg / 2) * 100);
}
