// Everything Fitness Fit Check *says*: the statements a prospect swipes on, what each
// swipe means, and which program it points toward. Written for a gym / studio that
// sells personal training, small-group coaching, and nutrition coaching. Rename the
// PROGRAMS to match the client's actual offers.

export const VERTICAL = 'Fitness';
export const GAME_NAME = 'Fitness Fit Check';

export type Severity = 0 | 1 | 2;
export type ProgramId = 'pt' | 'group' | 'nutrition' | 'open';

export const PROGRAMS: Record<ProgramId, string> = {
  pt: '1-on-1 Personal Training',
  group: 'Small-Group Coaching',
  nutrition: 'Nutrition Coaching',
  open: 'Open Gym Membership',
};

export interface SwipeOutcome {
  severity: Severity; // 0 = working for you, 2 = the thing most likely to derail you
  finding: string;
  /** Programs this answer points toward. */
  points?: ProgramId[];
}

export interface Statement {
  id: string;
  area: string;
  text: string;
  yes: SwipeOutcome; // swiped right — "That's me"
  no: SwipeOutcome; // swiped left — "Not me"
}

export const STATEMENTS: Statement[] = [
  {
    id: 'quit',
    area: 'Consistency',
    text: "I've started a routine before and quit within the first month.",
    yes: { severity: 2, finding: 'The first 30 days are where most people drop off. You need structure built in — not more willpower.', points: ['pt', 'group'] },
    no: { severity: 0, finding: "You've shown you can stick with it once you start. That's the hardest part.", points: ['open'] },
  },
  {
    id: 'accountability',
    area: 'Accountability',
    text: "I show up more when someone's expecting me.",
    yes: { severity: 1, finding: "You're accountability-driven, so training alone is hard mode for you. A set time and a coach who notices fixes that.", points: ['group', 'pt'] },
    no: { severity: 0, finding: "You're self-directed. A flexible schedule works in your favor.", points: ['open'] },
  },
  {
    id: 'knowhow',
    area: 'Know-how',
    text: "I walk into a gym and I'm not sure what to actually do.",
    yes: { severity: 2, finding: "Without a plan, sessions turn into guesswork, and guesswork doesn't build results. A programmed plan changes everything.", points: ['pt'] },
    no: { severity: 0, finding: 'You know your way around the equipment — you can get more from less coaching.', points: ['open'] },
  },
  {
    id: 'nutrition',
    area: 'Nutrition',
    text: 'My eating habits undo most of my workouts.',
    yes: { severity: 2, finding: "You can't out-train your plate. Pairing training with simple nutrition coaching is usually the fastest unlock.", points: ['nutrition'] },
    no: { severity: 0, finding: "Your nutrition is supporting your training instead of fighting it." },
  },
  {
    id: 'time',
    area: 'Time',
    text: 'I can realistically commit 3+ hours a week.',
    yes: { severity: 0, finding: 'Three hours a week is plenty for real, visible change.' },
    no: { severity: 1, finding: 'Short on time means every session has to count. Efficient, programmed workouts matter more for you than anyone.', points: ['pt'] },
  },
  {
    id: 'goal',
    area: 'Goal clarity',
    text: 'I have a specific goal and a date I want to hit it by.',
    yes: { severity: 0, finding: "A concrete target and deadline — that's what makes progress measurable." },
    no: { severity: 1, finding: '"Get in shape" is hard to measure. A clear target makes progress visible, and visible progress keeps you going.', points: ['pt', 'group'] },
  },
  {
    id: 'injury',
    area: 'Limitations',
    text: "I've got an injury, ache, or limitation I work around.",
    yes: { severity: 1, finding: 'Training around a limitation needs coaching, not guesswork. The wrong program sets you back.', points: ['pt'] },
    no: { severity: 0, finding: 'No limitations to work around — you can train at full intensity from day one.' },
  },
  {
    id: 'social',
    area: 'Community',
    text: "I'd enjoy working out with a small group at my level.",
    yes: { severity: 0, finding: 'Community is one of the biggest reasons people stick with it. Lean into that.', points: ['group', 'group'] },
    no: { severity: 0, finding: "You'd rather focus on your own thing. One-on-one or solo training suits you.", points: ['pt'] },
  },
];

const TIE_ORDER: ProgramId[] = ['pt', 'group', 'open'];

/** Best-fit program from the points each swipe handed out; nutrition rides along as an add-on. */
export function matchProgram(points: ProgramId[]): string {
  const tally: Record<ProgramId, number> = { pt: 0, group: 0, nutrition: 0, open: 0 };
  points.forEach((p) => (tally[p] += 1));
  const main = TIE_ORDER.slice().sort((a, b) => tally[b] - tally[a])[0];
  return tally.nutrition > 0 ? `${PROGRAMS[main]} + ${PROGRAMS.nutrition}` : PROGRAMS[main];
}
