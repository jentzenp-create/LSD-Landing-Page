// Sends a lead + their game results to a GoHighLevel inbound webhook.
// Keys are flat snake_case so they're easy to map in the GHL workflow, plus a
// ready-made `sms_summary` for the "text me when someone plays" notification.
// It's sent after World 1 (if they enter their email) and again after World 2
// with the fuller results; GHL updates the same contact by email.
import { GHL_WEBHOOK_URL, SOURCE } from './config';
import { answeredQuestions, industry, playedWorlds, run, topAutomations, worldHealth, type Contact } from './state';

export function buildPayload(input: Contact) {
  const ind = industry();
  const worlds = playedWorlds();
  const healths = worlds.map((w) => ({ w, h: worldHealth(w) }));
  const autos = topAutomations(worlds);
  const answered = answeredQuestions(worlds);
  const gaps = answered.filter(({ a }) => a.severity > 0).sort((x, y) => y.a.severity - x.a.severity);
  const reached = run.results[2] ? 2 : 1;
  const seconds = Object.values(run.results).reduce((sum, r) => sum + (r?.seconds ?? 0), 0);
  const overall = healths.length ? Math.round(healths.reduce((s, x) => s + x.h.score, 0) / healths.length) : 0;
  const w1 = healths.find((x) => x.w.number === 1)?.h;
  const w2 = healths.find((x) => x.w.number === 2)?.h;

  const smsLines = [
    `Bottleneck Busters lead: ${input.firstName || 'New player'}${input.businessName ? ` (${input.businessName})` : ''}`,
    `${ind.label} - reached World ${reached}`,
    ...healths.map(({ w, h }) => `${w.diagnosis}: ${h.score}/100`),
    input.email,
    input.phone || null,
    autos[0] ? `Top fix: ${autos[0].name}` : null,
    gaps.length ? `Gaps: ${gaps.map(({ q, a }) => `${q.area} (${a.label})`).join('; ')}` : 'No big gaps found',
    `Source: ${SOURCE}`,
  ].filter(Boolean);

  return {
    first_name: input.firstName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    business_name: input.businessName.trim(),
    source: 'Bottleneck Busters',
    traffic_source: SOURCE,
    industry: ind.label,
    game_world_reached: reached,
    game_diagnosis: healths.map(({ w, h }) => `${w.diagnosis} ${h.score}/100`).join(' | '),
    game_health_score: overall,
    game_w1_score: w1?.score ?? '',
    game_w2_score: w2?.score ?? '',
    game_top_automation: autos[0]?.name ?? '',
    game_other_automations: autos.slice(1).map((a) => a.name).join(', '),
    game_answers: answered.map(({ q, a }) => `${q.area}: ${a.label}`).join('\n'),
    game_findings: answered
      .slice()
      .sort((x, y) => y.a.severity - x.a.severity)
      .map(({ a }) => `• ${a.finding}`)
      .join('\n'),
    game_score: run.score,
    game_play_seconds: seconds,
    game_session_id: run.sessionId,
    sms_summary: smsLines.join('\n'),
  };
}

export async function sendLead(input: Contact): Promise<{ ok: boolean }> {
  const payload = buildPayload(input);
  if (!GHL_WEBHOOK_URL) {
    console.warn('[arcade] GHL_WEBHOOK_URL is not set in arcade/config.ts; lead not sent.', payload);
    return { ok: true };
  }
  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return { ok: res.ok };
  } catch (e) {
    console.error('[arcade] GHL webhook failed', e);
    return { ok: false };
  }
}
