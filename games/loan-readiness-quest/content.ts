// Everything Loan Readiness Quest *says*: the challenges a prospect answers, the
// readiness points each answer earns, and the tiers those points unlock. Written for
// a mortgage broker / loan officer working with home buyers. General education only —
// nothing here is a credit decision or a rate quote.

export const VERTICAL = 'Mortgage';
export const GAME_NAME = 'Loan Readiness Quest';

export type Severity = 0 | 1 | 2;

export interface Answer {
  label: string;
  severity: Severity; // 0 = strong, 2 = likely blocker
  finding: string;
}

export interface Challenge {
  id: string;
  area: string;
  prompt: string;
  answers: Answer[];
  recommendation: string; // offered if this is the player's weakest area
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'credit',
    area: 'Credit score',
    prompt: 'Roughly where is your credit score?',
    answers: [
      { label: '740 or higher', severity: 0, finding: '740+ typically qualifies for the best-priced loan options.' },
      { label: '680 – 739', severity: 0, finding: 'A solid score for most loan programs. A few points higher can still lower your rate.' },
      { label: '620 – 679', severity: 1, finding: 'You likely qualify, but pricing improves meaningfully above 680. Small fixes can move this fast.' },
      { label: "Under 620 / not sure", severity: 2, finding: 'Below 620 narrows your options, and not knowing is a risk in itself. A soft-pull review is the first step.' },
    ],
    recommendation: 'Credit readiness review (soft pull)',
  },
  {
    id: 'down',
    area: 'Down payment',
    prompt: 'How much could you put down?',
    answers: [
      { label: '20% or more', severity: 0, finding: '20%+ avoids mortgage insurance on conventional loans and strengthens any offer.' },
      { label: '10 – 19%', severity: 0, finding: 'A strong down payment. You may carry mortgage insurance for a while, but it comes off.' },
      { label: '3 – 9%', severity: 1, finding: 'Plenty of programs work at this level, including low-down-payment conventional and FHA options.' },
      { label: 'Under 3%', severity: 2, finding: 'Very low down payment limits options — but down payment assistance programs exist that many buyers never hear about.' },
    ],
    recommendation: 'Down payment assistance check',
  },
  {
    id: 'debt',
    area: 'Monthly debts',
    prompt: 'Car, card, and student loan payments add up to about what share of your monthly income?',
    answers: [
      { label: 'Under 15%', severity: 0, finding: 'Low existing debt leaves lots of room in your budget for a mortgage payment.' },
      { label: '15 – 35%', severity: 1, finding: 'Workable, but it caps how much house you qualify for. Paying down one balance can raise your buying power.' },
      { label: 'Over 35%', severity: 2, finding: 'High debt-to-income is the most common reason buyers get approved for less than they expected.' },
      { label: 'Not sure', severity: 1, finding: "Debt-to-income drives your approval amount. It's quick to calculate together, and worth knowing before you shop." },
    ],
    recommendation: 'Debt-to-income game plan',
  },
  {
    id: 'income',
    area: 'Income history',
    prompt: 'How would you describe your work history?',
    answers: [
      { label: '2+ years, W-2, same field', severity: 0, finding: 'Steady W-2 income in the same field is the easiest profile to document.' },
      { label: 'Self-employed 2+ years', severity: 1, finding: "Self-employed buyers qualify every day — it's about having the right two years of returns ready." },
      { label: 'Under 2 years or recent change', severity: 1, finding: 'A recent job change is often fine, especially in the same field. Lenders will want to see the details.' },
      { label: 'Between jobs right now', severity: 2, finding: "Most loans need current, verifiable income. Timing your application after you've started is key." },
    ],
    recommendation: 'Income documentation prep',
  },
  {
    id: 'reserves',
    area: 'Cash reserves',
    prompt: 'After down payment and closing costs, how much savings would you have left?',
    answers: [
      { label: '3+ months of payments', severity: 0, finding: 'Healthy reserves make you a stronger borrower and protect you after move-in.' },
      { label: '1 – 2 months', severity: 1, finding: 'Enough to close, but tight. Seller credits or rolling costs in can protect your cushion.' },
      { label: 'Not much', severity: 2, finding: 'Closing costs often run 2–5% of the price. Planning for them now avoids a last-minute scramble.' },
    ],
    recommendation: 'Closing cost & reserves plan',
  },
  {
    id: 'preapproval',
    area: 'Pre-approval',
    prompt: 'Where are you with pre-approval?',
    answers: [
      { label: 'Fully pre-approved', severity: 0, finding: "A current pre-approval makes your offers credible — sellers take you seriously." },
      { label: 'Pre-qualified online only', severity: 1, finding: "Online pre-quals aren't underwritten. A full pre-approval is what wins in a competitive market." },
      { label: "Haven't started", severity: 1, finding: 'Getting pre-approved before you tour homes saves heartbreak and shows you your real budget.' },
    ],
    recommendation: 'Full pre-approval',
  },
];

export interface Tier {
  name: string;
  /** Readiness score (0-100) needed to unlock. */
  at: number;
  blurb: string;
}

export const TIERS: Tier[] = [
  { name: 'Getting Started', at: 0, blurb: 'Early in the process — a plan now saves months later.' },
  { name: 'Pre-Approval Ready', at: 40, blurb: 'You have the basics to apply for pre-approval.' },
  { name: 'Strong Buyer', at: 65, blurb: 'Most programs are open to you, with room to negotiate.' },
  { name: 'Prime Borrower', at: 85, blurb: 'Top-tier profile — the best-priced options are within reach.' },
];

export function tierFor(score: number): Tier {
  return TIERS.slice().reverse().find((t) => score >= t.at)!;
}
