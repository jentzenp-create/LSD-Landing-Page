// Everything Confidence Assessment *says*: the wheel's concern areas, the question each
// one reveals, and the treatment consult it points toward. Written for a med spa /
// aesthetics practice. Rename treatments to the client's actual menu, and set OFFER to
// whatever they really give new clients — or leave it empty to skip the offer reveal.
// Copy is deliberately about what the player *wants* to refresh, never about flaws.

export const VERTICAL = 'Med Spa';
export const GAME_NAME = 'Confidence Assessment';

/** How many spins a round lasts (one area per spin, never repeated). */
export const SPINS = 5;

/** Revealed on the result screen. Must be a real offer from the client. */
export const OFFER = 'Complimentary consultation with our aesthetic team';

export type Severity = 0 | 1 | 2;

export interface Answer {
  label: string;
  severity: Severity; // 0 = happy as-is, 2 = top of their wish list
  finding: string;
}

export interface Area {
  id: string;
  /** Short wheel label. */
  name: string;
  prompt: string;
  answers: Answer[];
  recommendation: string;
}

export const AREAS: Area[] = [
  {
    id: 'texture',
    name: 'Texture',
    prompt: 'How do you feel about your skin’s texture — pores, roughness, or old acne marks?',
    answers: [
      { label: 'Happy with it', severity: 0, finding: "You're happy with your texture — nothing to change here." },
      { label: 'I notice it sometimes', severity: 1, finding: 'Light resurfacing treatments smooth texture gradually, with little to no downtime.' },
      { label: "It's what I'd change first", severity: 2, finding: 'Texture is one of the most treatable concerns — microneedling and peels build smoother skin over a few sessions.' },
    ],
    recommendation: 'Microneedling & peel consultation',
  },
  {
    id: 'lines',
    name: 'Fine lines',
    prompt: 'How do you feel about fine lines around your eyes or forehead?',
    answers: [
      { label: "They don't bother me", severity: 0, finding: "Fine lines aren't a priority for you right now." },
      { label: 'Starting to notice them', severity: 1, finding: 'Starting early with small, subtle doses keeps results natural-looking.' },
      { label: "I'd love to soften them", severity: 2, finding: 'Neuromodulators soften expression lines in about two weeks, and a consult maps exactly where.' },
    ],
    recommendation: 'Neuromodulator consultation',
  },
  {
    id: 'volume',
    name: 'Volume',
    prompt: 'How do you feel about fullness in your cheeks or lips?',
    answers: [
      { label: 'Happy as-is', severity: 0, finding: "You're happy with your volume — nothing to add here." },
      { label: 'Maybe a little more', severity: 1, finding: 'Subtle filler can restore a little lift without looking "done."' },
      { label: 'Top of my list', severity: 2, finding: 'Restoring volume is one of the biggest confidence boosts we see — a consult shows what natural looks like on you.' },
    ],
    recommendation: 'Dermal filler consultation',
  },
  {
    id: 'tone',
    name: 'Tone & spots',
    prompt: 'How do you feel about sun spots, redness, or uneven tone?',
    answers: [
      { label: 'Not a concern', severity: 0, finding: 'Even tone already — keep up the SPF.' },
      { label: 'A few spots', severity: 1, finding: 'A few spots usually fade with one or two light-based sessions.' },
      { label: "I'd love clearer skin", severity: 2, finding: 'Photofacials target spots and redness together, and many people notice a difference after the first session.' },
    ],
    recommendation: 'IPL / photofacial consultation',
  },
  {
    id: 'body',
    name: 'Body',
    prompt: "Any areas that don't respond to diet and exercise the way you'd like?",
    answers: [
      { label: 'Not really', severity: 0, finding: 'No body-contouring goals right now.' },
      { label: 'One small area', severity: 1, finding: 'Targeted non-surgical contouring works best on exactly this — one stubborn area.' },
      { label: 'A few areas', severity: 2, finding: 'Non-surgical contouring can treat several areas with a plan built around your goals.' },
    ],
    recommendation: 'Body contouring consultation',
  },
  {
    id: 'routine',
    name: 'Routine',
    prompt: 'How consistent is your at-home skincare routine?',
    answers: [
      { label: 'Daily, with SPF', severity: 0, finding: 'A daily routine with SPF is the foundation everything else builds on.' },
      { label: 'Some days', severity: 1, finding: 'A simple three-step routine makes every in-office treatment last longer.' },
      { label: 'Basically none', severity: 2, finding: "Medical-grade skincare is the easiest win — it's where most results start." },
    ],
    recommendation: 'Medical-grade skincare plan',
  },
];
