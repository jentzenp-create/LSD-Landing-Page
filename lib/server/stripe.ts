/**
 * Minimal Stripe helpers for the webhook, using Node crypto and fetch (no SDK).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

const TOLERANCE_SECONDS = 300;

/**
 * Verifies the `Stripe-Signature` header against the raw request body.
 * Mirrors stripe.webhooks.constructEvent: HMAC-SHA256 of `${t}.${body}` with the endpoint secret.
 */
export function verifyStripeSignature(rawBody: string, header: string | undefined, secret: string, now = Date.now()): boolean {
  if (!header) return false;

  let timestamp = '';
  const signatures: string[] = [];
  for (const piece of header.split(',')) {
    const [key, value] = piece.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1' && value) signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.abs(now / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const expected = Buffer.from(createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex'));
  return signatures.some((sig) => {
    const given = Buffer.from(sig);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/**
 * Optional: look up what was bought (product names) for a Checkout Session.
 * Only runs when STRIPE_SECRET_KEY is set; a restricted key with read access to
 * Checkout Sessions is enough. Returns [] on any failure so emails still go out.
 */
export async function fetchLineItemNames(sessionId: string): Promise<string[]> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=20`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { description?: string; quantity?: number }[] };
    return (json.data ?? [])
      .map((item) => (item.quantity && item.quantity > 1 ? `${item.description} x${item.quantity}` : item.description ?? ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function formatAmount(amountInCents: number | null | undefined, currency: string | null | undefined): string {
  if (amountInCents == null) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(amountInCents / 100);
}
