/**
 * Email templates. Each returns { subject, html, text }.
 * House rule: no em dashes in client-facing copy.
 */
import { SIGN_OFF_NAME, SITE_URL, type PackageConfig } from './purchaseConfig.js';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface PurchaseDetails {
  firstName: string;
  fullName: string;
  email: string;
  amount: string;
  items: string[];
  pkg: PackageConfig;
  sessionId: string;
  livemode: boolean;
}

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

function layout(bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F9F8F4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F8F4;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Inter,Helvetica,Arial,sans-serif;color:#111111;">
        <tr><td style="height:6px;background:#F2B705;"></td></tr>
        <tr><td style="padding:32px 28px 28px;font-size:16px;line-height:1.6;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 28px 24px;font-size:12px;color:#777777;border-top:1px solid #eeeeee;">
          Local Sun Digital &middot; <a href="${SITE_URL}" style="color:#777777;">localsundigital.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${esc(href)}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;">${esc(label)}</a></p>`;
}

/** Day 0: sent to the client right after payment clears. */
export function welcomeEmail(p: PurchaseDetails): RenderedEmail {
  const onboardingUrl = p.pkg.onboardingSlug ? `${SITE_URL}/onboarding/${p.pkg.onboardingSlug}` : '';
  const schedulingUrl = process.env.SCHEDULING_URL || '';

  const steps: string[] = [];
  if (onboardingUrl) {
    steps.push('Take the onboarding interview (link below). It takes about 15 minutes and replaces a long intake form.');
  }
  if (schedulingUrl) {
    steps.push('Book your kickoff call so we can walk through the plan together.');
  } else {
    steps.push('I will reach out within one business day to set up your kickoff call.');
  }
  steps.push(...(p.pkg.extraNextSteps ?? []));
  steps.push('Questions in the meantime? Just reply to this email. It comes straight to me.');

  const greeting = p.firstName ? `Hi ${p.firstName},` : 'Hi there,';
  const subject = `Welcome to Local Sun Digital: here is what happens next`;

  const html = layout(`
    <p style="margin:0 0 16px;">${esc(greeting)}</p>
    <p style="margin:0 0 16px;">Thank you for trusting us with ${esc(p.pkg.displayName)}. Your payment${p.amount ? ` of ${esc(p.amount)}` : ''} went through, and we are officially getting started.</p>
    <p style="margin:0 0 8px;font-weight:600;">Here is what happens next:</p>
    <ol style="margin:0 0 16px;padding-left:20px;">${steps.map((s) => `<li style="margin-bottom:8px;">${esc(s)}</li>`).join('')}</ol>
    ${onboardingUrl ? button(onboardingUrl, 'Start your onboarding interview') : ''}
    ${schedulingUrl ? button(schedulingUrl, 'Book your kickoff call') : ''}
    <p style="margin:16px 0 0;">Excited to build this with you.</p>
    <p style="margin:4px 0 0;">${esc(SIGN_OFF_NAME)}<br><span style="color:#777777;">Local Sun Digital</span></p>
  `);

  const text = [
    greeting,
    '',
    `Thank you for trusting us with ${p.pkg.displayName}. Your payment${p.amount ? ` of ${p.amount}` : ''} went through, and we are officially getting started.`,
    '',
    'Here is what happens next:',
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    onboardingUrl ? `Onboarding interview: ${onboardingUrl}` : null,
    schedulingUrl ? `Book your kickoff call: ${schedulingUrl}` : null,
    onboardingUrl || schedulingUrl ? '' : null,
    'Excited to build this with you.',
    '',
    SIGN_OFF_NAME,
    'Local Sun Digital',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  return { subject, html, text };
}

/** Internal heads-up to the agency owner for every purchase. */
export function ownerNotificationEmail(p: PurchaseDetails, welcomeStatus: string): RenderedEmail {
  const rows: [string, string][] = [
    ['Client', p.fullName || '(no name)'],
    ['Email', p.email || '(no email)'],
    ['Amount', p.amount || '(unknown)'],
    ['Package', p.pkg.displayName],
    ['Items', p.items.join(', ') || '(set STRIPE_SECRET_KEY to see items)'],
    ['Welcome email', welcomeStatus],
    ['Mode', p.livemode ? 'Live' : 'Test'],
    ['Checkout session', p.sessionId],
  ];
  const subject = `${p.livemode ? '' : '[TEST] '}New purchase: ${p.fullName || p.email} (${p.amount})`;
  const html = layout(`
    <p style="margin:0 0 16px;font-weight:600;">New Stripe purchase</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">
      ${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#777777;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;">${esc(v)}</td></tr>`).join('')}
    </table>
  `);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  return { subject, html, text };
}
