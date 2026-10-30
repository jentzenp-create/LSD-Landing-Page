// Generic "send this lead to GoHighLevel" helper, shared across every vertical's game.
// Mirrors arcade/ghl.ts but takes a plain GameResult instead of reaching into
// mechanic-specific state, so a new vertical doesn't need to reimplement this.
import type { Contact, GameResult } from './types';

export function buildPayload(contact: Contact, result: GameResult) {
  const sortedFindings = result.findings.slice().sort((a, b) => b.severity - a.severity);

  const smsLines = [
    `${result.gameName} lead: ${contact.firstName}${contact.businessName ? ` (${contact.businessName})` : ''}`,
    `${result.vertical} - scored ${result.score}/100`,
    contact.email,
    contact.phone || null,
    result.topRecommendation ? `Top fix: ${result.topRecommendation}` : null,
    `Source: ${result.source}`,
  ].filter(Boolean);

  return {
    first_name: contact.firstName.trim(),
    email: contact.email.trim().toLowerCase(),
    phone: (contact.phone || '').trim(),
    business_name: (contact.businessName || '').trim(),
    source: result.gameName,
    traffic_source: result.source,
    vertical: result.vertical,
    game_score: result.score,
    game_top_recommendation: result.topRecommendation ?? '',
    game_findings: sortedFindings.map((f) => `• ${f.area}: ${f.detail}`).join('\n'),
    game_play_seconds: result.playSeconds,
    game_session_id: result.sessionId,
    sms_summary: smsLines.join('\n'),
  };
}

export async function sendLead(webhookUrl: string, contact: Contact, result: GameResult): Promise<{ ok: boolean }> {
  const payload = buildPayload(contact, result);
  if (!webhookUrl) {
    console.warn(`[${result.gameName}] webhook URL not set; lead not sent.`, payload);
    return { ok: true };
  }
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return { ok: res.ok };
  } catch (e) {
    console.error(`[${result.gameName}] webhook failed`, e);
    return { ok: false };
  }
}
