<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1n6ith86C1JZrV8Or4bB9hn11nwF980lh

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## AI Client Onboarding (`/onboarding/:clientSlug`)

A conversational, voice-enabled AI interview that gathers website requirements from a new client (service areas, services, design preferences, must-have features, etc.) before a build starts.

- **Add a client:** add an entry to `lib/onboardingClients.ts`, then send them their link, e.g. `/onboarding/beautyscapes`.
- **Review responses:** open `/onboarding-admin` (no login — keep the URL private, don't link it from nav).
- **Required setup:**
  - `GEMINI_API_KEY` must be set as a (non-`VITE_`) environment variable in your Vercel project — it's read server-side by `api/onboarding-chat.ts` and is never exposed to the browser.
  - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (already used by Studio) must be set, and you need to run `scripts/seed_onboarding_table.sql` once in the Supabase SQL editor to create the `onboarding_sessions` table.
- **Local testing:** `npm run dev` (Vite) does not serve the `/api` serverless function. Use `vercel dev` (after `vercel link`) to test the AI conversation locally, or test against a deployed Vercel preview.
- Voice input uses the browser's built-in Speech Recognition API (Chrome/Edge; no extra API key or cost) and falls back to typing where unsupported. Voice output (the AI reading its questions aloud) uses the browser's Speech Synthesis API and is off by default — toggle it on in the chat header.
