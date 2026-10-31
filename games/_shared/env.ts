// Runtime context every game needs: are we embedded, where did the play come from,
// and a session id for the lead record.

export const IN_IFRAME = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const params = new URLSearchParams(window.location.search);
// ?src=<tag> is sent with the lead so you know where the play came from.
export const SOURCE = params.get('src') || (IN_IFRAME ? 'embed' : 'web');

export function newSessionId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** 0-2 severities averaged onto a 0-100 score (100 = no gaps). */
export function scoreFromSeverities(severities: number[]): number {
  if (!severities.length) return 0;
  const avg = severities.reduce((a, b) => a + b, 0) / severities.length;
  return Math.round(100 - (avg / 2) * 100);
}
