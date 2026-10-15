// Diagnostic content for World 1 (Visibility & Reviews).
// Each answer carries a severity (0 = healthy, 2 = big bottleneck) and the finding
// that shows up on the player's results screen / report.

export type Industry = 'home' | 'health' | 'pro' | 'retail';

export const INDUSTRIES: { id: Industry; label: string; noun: string }[] = [
  { id: 'home', label: 'HOME SERVICES', noun: 'job' },
  { id: 'health', label: 'HEALTH & WELLNESS', noun: 'appointment' },
  { id: 'pro', label: 'PROFESSIONAL SERVICES', noun: 'project' },
  { id: 'retail', label: 'RETAIL & HOSPITALITY', noun: 'visit' },
];

export interface Answer {
  label: string;
  severity: 0 | 1 | 2;
  finding: string;
}

export interface Question {
  id: string;
  prompt: (noun: string) => string;
  answers: Answer[];
}

export const WORLD1_QUESTIONS: Question[] = [
  {
    id: 'w1_review_count',
    prompt: () => 'How many Google reviews does your business have right now?',
    answers: [
      { label: '100+', severity: 0, finding: 'Strong review base. Keep it fresh: how recent your reviews are matters as much as how many.' },
      { label: '25 to 100', severity: 1, finding: 'Decent review base, but the businesses ranking above you in the map results likely have more, and newer, reviews.' },
      { label: 'Under 25 / not sure', severity: 2, finding: 'A low review count is likely costing you visibility in local search and trust at first glance.' },
    ],
  },
  {
    id: 'w1_review_ask',
    prompt: (noun) => `After a ${noun}, how do customers get asked for a review?`,
    answers: [
      { label: 'Automatic text or email', severity: 0, finding: 'Review requests already run on autopilot. Next lever: replying to every review, automatically drafted.' },
      { label: 'We ask in person, sometimes', severity: 1, finding: 'Asking in person works when someone remembers. Most happy customers never actually get asked.' },
      { label: "We don't really ask", severity: 2, finding: 'No ask means no new reviews. This is the easiest automation win on the board.' },
    ],
  },
  {
    id: 'w1_profile',
    prompt: () => 'When did you last update your Google Business Profile (posts, photos, hours)?',
    answers: [
      { label: 'This month', severity: 0, finding: 'Active profile. Google favors listings that are kept complete and current.' },
      { label: 'A few months ago', severity: 1, finding: 'A stale profile quietly signals "maybe closed." Fresh posts and photos fix that.' },
      { label: "...What's that?", severity: 2, finding: 'Your Google Business Profile is one of the most important free visibility tools a local business has. Claiming and maintaining it is step one.' },
    ],
  },
];

export const WORLD1_UNLOCK = {
  name: 'REVIEW REQUEST AUTOPILOT',
  description: (noun: string) =>
    `Every finished ${noun} automatically gets a friendly text with your review link, plus a reminder if they forget. No remembering, no awkward asking.`,
};

export function visibilityHealth(severities: number[]) {
  const total = severities.reduce((a, b) => a + b, 0);
  const max = WORLD1_QUESTIONS.length * 2;
  const score = Math.round(100 - (total / max) * 84); // 16..100
  const label = score >= 80 ? 'LIGHTHOUSE' : score >= 50 ? 'FLICKERING SIGN' : 'GHOST TOWN';
  return { score, label, total };
}
