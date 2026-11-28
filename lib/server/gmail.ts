/**
 * Sends email from the agency Gmail / Google Workspace account through the Gmail API.
 * Server-only (used by /api functions). No SDK needed: an OAuth refresh token is
 * exchanged for a short-lived access token, then a raw MIME message is posted.
 *
 * Required env vars (set in Vercel):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 *   GMAIL_SENDER        the address mail is sent from, e.g. hello@localsundigital.com
 * Optional:
 *   GMAIL_SENDER_NAME   display name, defaults to "Local Sun Digital"
 *
 * Run `node scripts/gmail-auth.mjs` once to get GMAIL_REFRESH_TOKEN.
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  bcc?: string;
}

export function gmailConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN &&
      process.env.GMAIL_SENDER,
  );
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });
  const json = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(`Gmail token refresh failed: ${json.error ?? res.status} ${json.error_description ?? ''}`.trim());
  }
  return json.access_token;
}

/** RFC 2047 encode a header value so names/subjects with non-ASCII characters survive. */
function encodeHeader(value: string): string {
  return /^[\x20-\x7E]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

/** Strip CR/LF so values pulled from Stripe can never inject extra headers. */
function clean(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function buildMime(email: OutgoingEmail): string {
  const senderName = process.env.GMAIL_SENDER_NAME || 'Local Sun Digital';
  const from = `${encodeHeader(senderName)} <${process.env.GMAIL_SENDER}>`;
  const boundary = `lsd_${Math.random().toString(36).slice(2)}`;

  const headers = [
    `From: ${from}`,
    `To: ${clean(email.to)}`,
    email.bcc ? `Bcc: ${clean(email.bcc)}` : '',
    email.replyTo ? `Reply-To: ${clean(email.replyTo)}` : '',
    `Subject: ${encodeHeader(clean(email.subject))}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);

  const part = (type: string, body: string) =>
    [
      `--${boundary}`,
      `Content-Type: ${type}; charset="UTF-8"`,
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(body, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n'),
    ].join('\r\n');

  return [...headers, '', part('text/plain', email.text), part('text/html', email.html), `--${boundary}--`, ''].join('\r\n');
}

export async function sendEmail(email: OutgoingEmail): Promise<{ id: string }> {
  if (!gmailConfigured()) throw new Error('Gmail is not configured (missing GOOGLE_* / GMAIL_* env vars).');

  const accessToken = await getAccessToken();
  const raw = Buffer.from(buildMime(email), 'utf8').toString('base64url');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  const json = (await res.json()) as { id?: string; error?: { message?: string } };
  if (!res.ok || !json.id) {
    throw new Error(`Gmail send failed (${res.status}): ${json.error?.message ?? 'unknown error'}`);
  }
  return { id: json.id };
}
