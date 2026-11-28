/**
 * Stripe webhook: runs automations after a purchase.
 *
 * Stripe dashboard > Developers > Webhooks > Add endpoint
 *   URL:    https://localsundigital.com/api/stripe-webhook
 *   Events: checkout.session.completed, checkout.session.async_payment_succeeded
 *
 * Env vars:
 *   STRIPE_WEBHOOK_SECRET      (required) whsec_... from that endpoint
 *   STRIPE_SECRET_KEY          (optional) restricted key, read Checkout Sessions, to list items bought
 *   OWNER_EMAIL                (required) where purchase alerts go
 *   EMAIL_MODE                 "live" emails the client. Anything else sends the client email to OWNER_EMAIL as a preview.
 *   SCHEDULING_URL             (optional) kickoff call booking link used in the welcome email
 *   SUPABASE_SERVICE_ROLE_KEY  (optional, recommended) logs purchases and prevents duplicate emails on Stripe retries
 *   + Gmail vars, see lib/server/gmail.ts
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { verifyStripeSignature, fetchLineItemNames, formatAmount } from '../lib/server/stripe.js';
import { sendEmail, gmailConfigured } from '../lib/server/gmail.js';
import { welcomeEmail, ownerNotificationEmail, type PurchaseDetails } from '../lib/server/emailTemplates.js';
import { resolvePackage } from '../lib/server/purchaseConfig.js';

// Stripe signs the exact bytes it sent, so we need the unparsed body.
export const config = { api: { bodyParser: false } };

interface CheckoutSession {
  id: string;
  livemode: boolean;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  amount_total: number | null;
  currency: string | null;
  customer_details: { email: string | null; name: string | null } | null;
  customer_email: string | null;
  payment_link: string | null;
  metadata: Record<string, string> | null;
}

interface StripeEvent {
  id: string;
  type: string;
  livemode: boolean;
  data: { object: CheckoutSession };
}

const TABLE = 'stripe_purchases';

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  if (chunks.length) return Buffer.concat(chunks).toString('utf8');
  // Fallback if a runtime already buffered the body.
  const body = (req as unknown as { body?: unknown }).body;
  if (Buffer.isBuffer(body)) return body.toString('utf8');
  return typeof body === 'string' ? body : '';
}

function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('stripe-webhook: STRIPE_WEBHOOK_SECRET is not set');
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }

  const rawBody = await readRawBody(req);
  const signature = req.headers['stripe-signature'];
  if (!verifyStripeSignature(rawBody, Array.isArray(signature) ? signature[0] : signature, secret)) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  const event = JSON.parse(rawBody) as StripeEvent;
  const session = event.data?.object;

  const isPaidCheckout =
    (event.type === 'checkout.session.completed' && session?.payment_status !== 'unpaid') ||
    event.type === 'checkout.session.async_payment_succeeded';

  if (!isPaidCheckout) {
    // Acknowledge everything else so Stripe stops retrying.
    res.status(200).json({ received: true, ignored: event.type });
    return;
  }

  try {
    const result = await handlePurchase(event, session);
    res.status(200).json({ received: true, ...result });
  } catch (err) {
    console.error('stripe-webhook: purchase handling failed', err);
    // 500 makes Stripe retry (with backoff, for up to 3 days). Already-sent emails are not resent.
    res.status(500).json({ error: 'Purchase handling failed' });
  }
}

async function handlePurchase(event: StripeEvent, session: CheckoutSession) {
  const db = supabaseAdmin();

  // Idempotency: one row per Checkout Session. Skip if the welcome email already went out.
  if (db) {
    const { data: existing, error } = await db.from(TABLE).select('welcome_sent_at').eq('stripe_session_id', session.id).maybeSingle();
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    if (existing?.welcome_sent_at) return { duplicate: true };
  } else {
    console.warn('stripe-webhook: Supabase not configured; Stripe retries could send duplicate emails.');
  }

  const email = session.customer_details?.email || session.customer_email || '';
  const fullName = session.customer_details?.name?.trim() || '';
  const { key: packageKey, config: pkg } = resolvePackage(session.metadata, session.payment_link);
  const items = await fetchLineItemNames(session.id);

  const details: PurchaseDetails = {
    firstName: fullName.split(/\s+/)[0] || '',
    fullName,
    email,
    amount: formatAmount(session.amount_total, session.currency),
    items,
    pkg,
    sessionId: session.id,
    livemode: event.livemode,
  };

  if (db) {
    const { error } = await db.from(TABLE).upsert(
      {
        stripe_session_id: session.id,
        stripe_event_id: event.id,
        livemode: event.livemode,
        customer_email: email || null,
        customer_name: fullName || null,
        amount_total: session.amount_total,
        currency: session.currency,
        payment_link: session.payment_link,
        package_key: packageKey,
        items,
        metadata: session.metadata ?? {},
      },
      { onConflict: 'stripe_session_id' },
    );
    if (error) throw new Error(`Supabase write failed: ${error.message}`);
  }

  if (!gmailConfigured()) {
    console.warn('stripe-webhook: Gmail not configured; purchase logged but no emails sent.');
    return { logged: Boolean(db), emailed: false };
  }

  const ownerEmail = process.env.OWNER_EMAIL || process.env.GMAIL_SENDER!;
  const live = process.env.EMAIL_MODE === 'live';

  // Day 0 welcome. In preview mode it goes to the owner instead of the client.
  let welcomeStatus: string;
  if (!email) {
    welcomeStatus = 'Not sent: Stripe had no customer email';
  } else {
    const welcome = welcomeEmail(details);
    const to = live ? email : ownerEmail;
    const subject = live ? welcome.subject : `[PREVIEW for ${email}] ${welcome.subject}`;
    await sendEmail({ ...welcome, to, subject, replyTo: process.env.GMAIL_SENDER });
    welcomeStatus = live ? `Sent to ${email}` : `Preview sent to you (EMAIL_MODE is not "live")`;
  }

  if (db) {
    const { error } = await db.from(TABLE).update({ welcome_sent_at: new Date().toISOString() }).eq('stripe_session_id', session.id);
    if (error) console.error('stripe-webhook: could not mark welcome_sent_at', error.message);
  }

  // Owner alert is best effort: a failure here should not trigger a retry that resends the welcome.
  try {
    await sendEmail({ ...ownerNotificationEmail(details, welcomeStatus), to: ownerEmail });
  } catch (err) {
    console.error('stripe-webhook: owner notification failed', err);
  }

  return { logged: Boolean(db), emailed: true, live };
}
