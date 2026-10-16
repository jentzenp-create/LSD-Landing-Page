// Sends a lead + their game results to a GoHighLevel inbound webhook.
// Keys are flat snake_case so they're easy to map in the GHL workflow, plus a
// ready-made `sms_summary` for the "text me when someone plays" notification.
import { GHL_WEBHOOK_URL, SOURCE } from './config';
import { healthScore } from './content';
import { answeredQuestions, industry, run, topAutomations, world, worldSeverities } from './state';

export interface LeadInput {
  firstName: string;
  email: string;
  phone: string;
  businessName: string;
}

export function buildPayload(input: LeadInput) {
  const ind = industry();
  const w = world();
  const health = healthScore(worldSeverities());
  const autos = topAutomations();
  const answered = answeredQuestions();
  const seconds = run.finishedAt && run.startedAt ? Math.round((run.finishedAt - run.startedAt) / 1000) : 0;
  const gaps = answered.filter(({ a }) => a.severity > 0).sort((x, y) => y.a.severity - x.a.severity);

  const smsLines = [
    `Bottleneck Busters lead: ${input.firstName || 'New player'}${input.businessName ? ` (${input.businessName})` : ''}`,
    `${ind.label} - ${w.diagnosis} ${health.score}/100`,
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
    game_world_reached: 1,
    game_diagnosis: w.diagnosis,
    game_health_score: health.score,
    game_health_label: health.label,
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

export async function sendLead(input: LeadInput): Promise<{ ok: boolean }> {
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
