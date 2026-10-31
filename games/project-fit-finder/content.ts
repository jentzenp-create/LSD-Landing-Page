// Everything Project Fit Finder *says*: the project types, how a ballpark price is
// estimated, and the finding each input produces. Written for a home-services
// contractor (roofing, solar, remodel, HVAC). Swap the PROJECTS table to retarget it
// at a single trade — e.g. a roofer-only version with shingle/metal/tile options.

export const VERTICAL = 'Home Services';
export const GAME_NAME = 'Project Fit Finder';

export type Severity = 0 | 1 | 2;

export interface Verdict {
  severity: Severity;
  finding: string;
}

export interface ProjectDef {
  id: string;
  label: string;
  /** What the age slider measures for this project. */
  ageLabel: string;
  /** $/sq ft of home, low-high. */
  perSqft?: [number, number];
  /** Flat range for a 2,000 sq ft home; scaled gently by size. */
  flat?: [number, number];
  condition: (age: number) => Verdict;
  recommendation: string;
}

export const PROJECTS: ProjectDef[] = [
  {
    id: 'roof',
    label: 'Roof replacement',
    ageLabel: 'Roof age',
    perSqft: [5, 8],
    condition: (age) =>
      age >= 20
        ? { severity: 2, finding: `Most asphalt roofs last 20–25 years. At ${age} years, yours is at or past end of life — replacing before a leak costs far less than after.` }
        : age >= 12
          ? { severity: 1, finding: `A ${age}-year-old roof has life left, but it's worth an inspection before the next storm season.` }
          : { severity: 0, finding: `At ${age} years your roof is young — this is about upgrading, not urgency.` },
    recommendation: 'Free roof inspection',
  },
  {
    id: 'solar',
    label: 'Solar install',
    ageLabel: 'Roof age',
    perSqft: [8, 11],
    condition: (age) =>
      age >= 15
        ? { severity: 2, finding: `Panels last 25+ years. On a ${age}-year-old roof you'd likely pay to pull and reinstall them mid-life — a roof + solar bundle avoids that.` }
        : age >= 8
          ? { severity: 1, finding: 'Get the roof checked before install so the panels don\'t outlive what they\'re mounted on.' }
          : { severity: 0, finding: 'A young roof is the ideal base for solar — no reinstall cost down the road.' },
    recommendation: 'Roof + solar site assessment',
  },
  {
    id: 'kitchen',
    label: 'Kitchen remodel',
    ageLabel: 'Home age',
    flat: [25000, 60000],
    condition: (age) =>
      age >= 40
        ? { severity: 1, finding: `Homes ${age} years old often hide outdated wiring or plumbing behind the walls. Plan a 10–15% contingency.` }
        : { severity: 0, finding: 'A newer home means fewer surprises once the walls open up.' },
    recommendation: 'In-home design consultation',
  },
  {
    id: 'bath',
    label: 'Bathroom remodel',
    ageLabel: 'Home age',
    flat: [12000, 30000],
    condition: (age) =>
      age >= 40
        ? { severity: 1, finding: `At ${age} years, expect older supply lines and venting. A 10–15% contingency keeps the project on budget.` }
        : { severity: 0, finding: 'A newer home means fewer surprises behind the tile.' },
    recommendation: 'In-home design consultation',
  },
  {
    id: 'hvac',
    label: 'HVAC replacement',
    ageLabel: 'System age',
    perSqft: [3.5, 5.5],
    condition: (age) =>
      age >= 15
        ? { severity: 2, finding: `Most systems last 15–20 years. At ${age}, efficiency drops and breakdowns spike — replacing on your schedule beats replacing in a heat wave.` }
        : age >= 10
          ? { severity: 1, finding: `A ${age}-year-old system is entering its last third. A tune-up and efficiency check tells you how much runway is left.` }
          : { severity: 0, finding: 'Your system is young — this is an efficiency upgrade, not an emergency.' },
    recommendation: 'HVAC efficiency check',
  },
];

/** Ballpark low/high for a project, rounded to the nearest $500. */
export function estimate(project: ProjectDef, sqft: number, age: number): [number, number] {
  let lo: number;
  let hi: number;
  if (project.perSqft) {
    [lo, hi] = [project.perSqft[0] * sqft, project.perSqft[1] * sqft];
  } else {
    const k = Math.sqrt(sqft / 2000);
    [lo, hi] = [project.flat![0] * k, project.flat![1] * k];
  }
  if (age >= 40) { lo *= 1.1; hi *= 1.1; }
  const r = (n: number) => Math.round(n / 500) * 500;
  return [r(lo), r(hi)];
}

export interface Choice {
  id: string;
  label: string;
  severity: Severity;
  finding: string;
  recommendation?: string;
}

export interface ChoiceGroup {
  id: 'timeline' | 'financing' | 'decision';
  area: string;
  prompt: string;
  choices: Choice[];
}

export const TIMELINE: ChoiceGroup = {
  id: 'timeline',
  area: 'Timeline',
  prompt: 'When do you want it done?',
  choices: [
    { id: 'asap', label: 'ASAP', severity: 1, finding: 'Good contractors book out 4–8 weeks in peak season. Getting on the calendar now protects your timeline.', recommendation: 'Priority scheduling slot' },
    { id: '1-3', label: '1–3 months', severity: 0, finding: 'Ideal window — enough time for quotes, permits, and materials without losing a season.' },
    { id: '3-6', label: '3–6 months', severity: 0, finding: 'Plenty of runway. This is when you can lock in off-season pricing.' },
    { id: 'research', label: 'Just researching', severity: 1, finding: 'Early research is smart. A real number now keeps you from being surprised later.', recommendation: 'Free on-site estimate' },
  ],
};

export const FINANCING: ChoiceGroup = {
  id: 'financing',
  area: 'Financing',
  prompt: 'How are you paying for it?',
  choices: [
    { id: 'cash', label: 'Cash / savings', severity: 0, finding: 'Paying cash often gets you better pricing and faster scheduling.' },
    { id: 'finance', label: 'Want financing', severity: 1, finding: 'Get pre-qualified before collecting bids so every quote is apples-to-apples.', recommendation: 'Financing pre-qualification' },
    { id: 'unsure', label: 'Not sure yet', severity: 1, finding: 'Most homeowners don\'t know low-APR and 0% promo options exist for home projects. Worth a look before deciding.', recommendation: 'Financing options review' },
  ],
};

export const DECISION: ChoiceGroup = {
  id: 'decision',
  area: 'Decision makers',
  prompt: 'Who signs off?',
  choices: [
    { id: 'me', label: 'Just me', severity: 0, finding: 'One decision maker means you can move as fast as you want.' },
    { id: 'partner', label: 'Me + partner', severity: 1, finding: 'Projects stall when one decision maker misses the estimate. Plan to have both of you there.', recommendation: 'Joint estimate appointment' },
    { id: 'hoa', label: 'Needs HOA / landlord OK', severity: 2, finding: 'HOA or landlord approval can add 2–6 weeks. Start the application alongside your quotes, not after.', recommendation: 'HOA approval packet help' },
  ],
};

export interface BudgetChoice {
  id: string;
  label: string;
  /** Top of the range; null = player isn't sure. */
  max: number | null;
}

export const BUDGETS: BudgetChoice[] = [
  { id: 'u10', label: 'Under $10k', max: 10000 },
  { id: '10-25', label: '$10k–$25k', max: 25000 },
  { id: '25-50', label: '$25k–$50k', max: 50000 },
  { id: '50p', label: '$50k+', max: Infinity },
  { id: 'unsure', label: 'Not sure', max: null },
];

export const BUDGET_RECOMMENDATION = 'Financing options review';

export function budgetVerdict(budget: BudgetChoice, [lo, hi]: [number, number]): Verdict {
  if (budget.max === null) return { severity: 1, finding: 'Knowing your range up front keeps bids comparable — the ballpark above is a good starting anchor.' };
  if (budget.max >= hi) return { severity: 0, finding: 'Your budget covers the full ballpark range — room to choose materials instead of settling.' };
  if (budget.max >= lo) return { severity: 1, finding: 'Your budget lands inside the ballpark, toward the low end. Scope and material choices will matter.' };
  return { severity: 2, finding: 'Your budget is below the typical range for this project. Financing or a phased scope can close the gap.' };
}
