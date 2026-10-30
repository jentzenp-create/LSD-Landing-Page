// Contracts every vertical's game is expected to satisfy. Keep this file mechanic-agnostic —
// a platformer, a card-reveal game, and a calculator all produce the same *shape* of lead,
// even though their internal state looks nothing alike.

export interface Contact {
  firstName: string;
  email: string;
  phone?: string;
  businessName?: string;
}

/** One finding the game surfaced about the prospect (a gap, a strength, an answer). */
export interface Finding {
  area: string; // short label, e.g. "Review count", "Coverage gap"
  detail: string; // the actual finding shown in the report / sent to GHL
  severity: 0 | 1 | 2; // 0 = healthy, 2 = biggest opportunity
}

/** What a finished playthrough produced, independent of how the game got there. */
export interface GameResult {
  gameName: string; // e.g. "Coverage Gap Challenge"
  vertical: string; // e.g. "Insurance"
  score: number; // 0-100 overall score shown to the prospect
  findings: Finding[];
  topRecommendation?: string; // the single biggest opportunity/next step
  sessionId: string;
  playSeconds: number;
  source: string; // ?src= query param — where the play came from (web, embed, gatherly, etc.)
}

/** The config object a vertical's `content.ts` exports. */
export interface VerticalContent<TQuestion = unknown> {
  vertical: string;
  gameName: string;
  questions: TQuestion[];
}
