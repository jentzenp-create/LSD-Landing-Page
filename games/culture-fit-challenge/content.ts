// Everything Culture Fit Challenge *says*. Each round is a timed trivia question
// (a well-known, sourced hiring stat) followed by a "how about you?" question about
// the player's own team — the trivia hooks them, the follow-up qualifies them.
// Written for an HR consultancy / recruiting firm selling to business owners.
// Keep the stats sourced: if you add a round, cite where the number comes from.

export const VERTICAL = 'HR & Recruiting';
export const GAME_NAME = 'Culture Fit Challenge';

/** Seconds on the clock for each trivia question. */
export const ROUND_SECONDS = 15;

export type Severity = 0 | 1 | 2;

export interface Trivia {
  question: string;
  options: string[];
  correct: number; // index into options
  explain: string; // shown after answering, with the source
}

export interface FollowUp {
  prompt: string;
  answers: { label: string; severity: Severity; finding: string }[];
}

export interface Round {
  id: string;
  area: string;
  trivia: Trivia;
  followUp: FollowUp;
  recommendation: string;
}

export const ROUNDS: Round[] = [
  {
    id: 'bad-hire',
    area: 'Hiring accuracy',
    trivia: {
      question: 'The U.S. Department of Labor estimates a bad hire can cost up to what share of that person’s first-year earnings?',
      options: ['5%', '15%', '30%', '75%'],
      correct: 2,
      explain: 'Up to 30% of first-year earnings (U.S. Department of Labor) — before counting lost time and team morale.',
    },
    followUp: {
      prompt: 'In the last year, how many hires didn’t work out?',
      answers: [
        { label: 'None', severity: 0, finding: 'No mis-hires this year — your selection process is doing its job.' },
        { label: 'One', severity: 1, finding: 'One mis-hire is common, but it usually points to a gap in how candidates are screened or scored.' },
        { label: 'More than one', severity: 2, finding: 'Repeated mis-hires usually mean the interview process measures the wrong things. Structured scorecards fix this fast.' },
      ],
    },
    recommendation: 'Structured interview & scorecard setup',
  },
  {
    id: 'onboarding',
    area: 'Onboarding',
    trivia: {
      question: 'Research from Brandon Hall Group found a strong onboarding process improves new-hire retention by about how much?',
      options: ['10%', '25%', '50%', '82%'],
      correct: 3,
      explain: 'About 82% (Brandon Hall Group). The first 90 days decide whether most people stay.',
    },
    followUp: {
      prompt: 'How structured is your onboarding?',
      answers: [
        { label: 'Documented 30/60/90 plan', severity: 0, finding: 'A documented 30/60/90 plan puts you ahead of most small businesses.' },
        { label: 'A basic checklist', severity: 1, finding: 'A checklist covers paperwork; a short ramp-up plan covers whether people feel set up to succeed.' },
        { label: 'Shadow someone and figure it out', severity: 2, finding: "Learn-as-you-go onboarding is where early turnover starts. A simple program pays for itself with one saved hire." },
      ],
    },
    recommendation: 'Onboarding program build',
  },
  {
    id: 'engagement',
    area: 'Engagement',
    trivia: {
      question: 'According to Gallup, roughly what share of U.S. employees are engaged at work?',
      options: ['About 1 in 10', 'About 1 in 3', 'About half', 'About 3 in 4'],
      correct: 1,
      explain: 'About 1 in 3 (Gallup). The rest are just showing up — or quietly looking.',
    },
    followUp: {
      prompt: 'When did you last formally ask your team how they feel about working there?',
      answers: [
        { label: 'In the last 6 months', severity: 0, finding: "Regular check-ins mean you hear about problems before they turn into resignations." },
        { label: 'Over a year ago', severity: 1, finding: "A year is a long time in a small team. A quick pulse survey shows what's changed." },
        { label: 'Never', severity: 2, finding: "Without asking, the first sign of disengagement is usually a resignation letter. Start with a five-question pulse." },
      ],
    },
    recommendation: 'Team engagement pulse survey',
  },
  {
    id: 'pay-transparency',
    area: 'Job postings',
    trivia: {
      question: 'States including California, Colorado, New York, and Washington now require many job postings to include what?',
      options: ['A pay range', 'Remote-work policy', 'A benefits list', 'Company headcount'],
      correct: 0,
      explain: 'A pay range — pay-transparency laws now cover a large share of U.S. job seekers, and candidates increasingly skip postings without one.',
    },
    followUp: {
      prompt: 'Do your job postings list a pay range?',
      answers: [
        { label: 'Always', severity: 0, finding: 'Listing pay builds trust and filters for candidates who fit your budget.' },
        { label: 'Sometimes', severity: 1, finding: 'Inconsistent pay info can create compliance risk in some states and costs you applicants everywhere.' },
        { label: 'Never', severity: 2, finding: "Postings without pay get fewer qualified applicants, and in some states they're out of compliance." },
      ],
    },
    recommendation: 'Job posting rewrite & compliance check',
  },
  {
    id: 'turnover',
    area: 'Retention',
    trivia: {
      question: 'Gallup estimates replacing an employee costs how much?',
      options: ['A few weeks of pay', 'About 10% of salary', 'Half to 2x their salary', 'About 5x their salary'],
      correct: 2,
      explain: 'One-half to two times annual salary (Gallup) — recruiting, ramp-up, and lost output add up fast.',
    },
    followUp: {
      prompt: 'How has turnover been on your team this past year?',
      answers: [
        { label: 'Almost no one left', severity: 0, finding: "Low turnover is one of the most valuable things a small business can have. Protect it." },
        { label: 'A few — about normal', severity: 1, finding: 'Normal turnover still has a price tag. Exit conversations usually reveal one fixable pattern.' },
        { label: "More than we'd like", severity: 2, finding: 'High turnover compounds — every departure adds load to the people who stay. A retention review finds the cause.' },
      ],
    },
    recommendation: 'Retention risk review',
  },
];
