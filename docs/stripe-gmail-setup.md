# Stripe purchase automation + Gmail emails

When someone pays through any Stripe Payment Link:

1. Stripe calls `https://localsundigital.com/api/stripe-webhook`.
2. The webhook checks Stripe's signature, logs the purchase in Supabase (`stripe_purchases`), and
3. sends the **Day 0 welcome email** from your Gmail, plus a **purchase alert** to you.

Files: `api/stripe-webhook.ts`, `lib/server/` (gmail, stripe, templates, package config).

## One-time setup (about 20 minutes)

### 1. Supabase table
Open the Supabase SQL editor, paste `scripts/stripe_purchases_table.sql`, and run it.

### 2. Gmail access
1. In Google Cloud Console, create or pick a project and enable the **Gmail API**.
2. On the OAuth consent screen, add your sending Gmail address as a test user. Then **publish** the app. Otherwise the token expires after 7 days.
3. Under Credentials, create an **OAuth client ID** of type **Desktop app**.
4. In a terminal in the project folder, run `node scripts/gmail-auth.mjs`. Paste the Client ID and secret when asked, then open the link it prints and approve.
5. Copy the `GMAIL_REFRESH_TOKEN` it prints.

The only permission requested is `gmail.send`. The site can send mail but cannot read your inbox.

### 3. Stripe webhook
Go to Stripe Dashboard > Developers > Webhooks > Add endpoint.
- URL: `https://localsundigital.com/api/stripe-webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
- Copy the signing secret (`whsec_...`).

Optional: create a **restricted key** with read access to Checkout Sessions so purchase alerts list the items bought.

### 4. Vercel environment variables
| Variable | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_SECRET_KEY` | optional restricted key `rk_live_...` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from step 2 |
| `GMAIL_REFRESH_TOKEN` | from step 2 |
| `GMAIL_SENDER` | the Gmail address you approved with |
| `GMAIL_SENDER_NAME` | optional, defaults to `Local Sun Digital` |
| `OWNER_EMAIL` | where purchase alerts go |
| `SCHEDULING_URL` | optional kickoff booking link |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Settings > API (keep secret) |
| `EMAIL_MODE` | leave **unset** at first. Set to `live` when ready. |

Redeploy after adding them.

### 5. Test, then go live
While `EMAIL_MODE` is not `live`, the client's welcome email goes **to you** with a `[PREVIEW for client@...]` subject line. Clients get nothing.
1. In Stripe test mode, add the same webhook (its test-mode secret differs), then buy something with card `4242 4242 4242 4242`.
2. Check your inbox for the preview and the alert, and check the Supabase row.
3. When it looks right, set `EMAIL_MODE=live` and redeploy.

## Tailoring emails per purchase
Use metadata on each Payment Link (Stripe > Payment Links > the link > Metadata). No code changes needed:
- `package_name` = `the Automation Bundle`. Used in "Thank you for trusting us with ___".
- `onboarding_slug` = `jane-manning`. Adds a button linking to `/onboarding/jane-manning`. The client must exist in `lib/onboardingClients.ts`.

For extra "what happens next" steps per package, add an entry to `PACKAGES` in `lib/server/purchaseConfig.ts`, then set metadata `package` to its key.

Edit the email wording in `lib/server/emailTemplates.ts`.

## What's next
- Day 3 / Day 7 follow-ups: a queue table plus a Vercel cron job that sends whatever is due.
- An email when the onboarding interview finishes (hook into `api/onboarding-chat.ts`).
- A daily Claude scheduled task that drafts personal follow-ups into Gmail Drafts for your review.
