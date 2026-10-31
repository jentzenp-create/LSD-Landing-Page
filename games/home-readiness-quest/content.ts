// Everything Home Readiness Quest *says*: the six stops on the buyer's journey map,
// the question at each stop, and what each answer means. Written for a buyer's agent.
// Reorder or rewrite STOPS to fit a different journey (sellers, investors, relocation).

export const VERTICAL = 'Real Estate';
export const GAME_NAME = 'Home Readiness Quest';

export type Severity = 0 | 1 | 2;

export interface Answer {
  label: string;
  severity: Severity; // 0 = ready, 2 = likely to stall the search
  finding: string;
}

export interface Stop {
  id: string;
  /** Short name shown on the map. */
  name: string;
  area: string;
  prompt: string;
  answers: Answer[];
  recommendation: string; // offered if this is the player's weakest stop
}

export const STOPS: Stop[] = [
  {
    id: 'timeline',
    name: 'Timeline',
    area: 'Move timeline',
    prompt: 'When would you like to be in your new home?',
    answers: [
      { label: 'Within 3 months', severity: 1, finding: "Tight but doable — with three months, the steps after this one need to happen this month." },
      { label: '3 – 6 months', severity: 0, finding: 'A comfortable window to get ready, tour, and still negotiate without pressure.' },
      { label: '6 – 12 months', severity: 0, finding: 'Lots of runway. Use it to sharpen your budget and wish list before you tour.' },
      { label: 'Just exploring', severity: 1, finding: 'Exploring is a great time to learn the market — buyers who do usually move faster when they decide.' },
    ],
    recommendation: 'Personal buying timeline',
  },
  {
    id: 'budget',
    name: 'Budget',
    area: 'Monthly budget',
    prompt: 'Do you know the monthly payment you’d be comfortable with?',
    answers: [
      { label: 'Yes, a specific number', severity: 0, finding: 'Knowing your number keeps you shopping the right price range from day one.' },
      { label: 'A rough idea', severity: 1, finding: 'A rough idea is a start. Taxes, insurance, and HOA dues often add more than buyers expect.' },
      { label: 'No idea yet', severity: 2, finding: "Without a payment target, it's easy to fall for homes outside your range. This is the first thing to pin down." },
    ],
    recommendation: 'Buyer budget session',
  },
  {
    id: 'financing',
    name: 'Financing',
    area: 'Pre-approval',
    prompt: 'Where are you with a mortgage pre-approval?',
    answers: [
      { label: 'Pre-approved', severity: 0, finding: "Sellers take pre-approved offers seriously — you're ready to move when the right home shows up." },
      { label: 'Pre-qualified online', severity: 1, finding: "An online pre-qual is a ballpark, not an approval. A full pre-approval is what wins competitive offers." },
      { label: "Haven't started", severity: 2, finding: 'Most sellers won’t accept an offer without pre-approval. Starting now avoids losing a home you love.' },
    ],
    recommendation: 'Lender intro for pre-approval',
  },
  {
    id: 'wishlist',
    name: 'Wish list',
    area: 'Must-haves',
    prompt: 'Have you separated your must-haves from your nice-to-haves?',
    answers: [
      { label: 'Yes, written down', severity: 0, finding: 'A clear list means faster decisions and fewer wasted showings.' },
      { label: "It's in my head", severity: 1, finding: 'Writing it down (and agreeing on it, if you’re buying together) saves a lot of wasted showings.' },
      { label: 'Not yet / we disagree', severity: 2, finding: "Unclear or conflicting priorities are the #1 reason searches drag on. Sort it out before touring." },
    ],
    recommendation: 'Wish-list workshop',
  },
  {
    id: 'location',
    name: 'Location',
    area: 'Neighborhoods',
    prompt: 'How settled are you on where you want to live?',
    answers: [
      { label: '1 – 2 neighborhoods', severity: 0, finding: "A focused search area means you'll see new listings first and act fast." },
      { label: 'A few in mind', severity: 1, finding: "A short list is good. Touring each one at commute time and on a weekend narrows it quickly." },
      { label: 'Wide open', severity: 1, finding: "Wide open can work, but it spreads your search thin. A neighborhood tour helps you focus." },
    ],
    recommendation: 'Guided neighborhood tour',
  },
  {
    id: 'current',
    name: 'Current home',
    area: 'Current housing',
    prompt: "What's your current living situation?",
    answers: [
      { label: 'Renting, flexible lease', severity: 0, finding: 'No home to sell and no hard deadline — the most flexible position a buyer can be in.' },
      { label: 'Renting, lease ends soon', severity: 1, finding: 'A lease deadline can force rushed decisions. Line up a month-to-month option as a backup.' },
      { label: 'Own — need to sell first', severity: 2, finding: "Buying and selling at once is the trickiest move to time. A plan for both sides avoids paying two mortgages." },
    ],
    recommendation: 'Buy-and-sell timing plan',
  },
];
