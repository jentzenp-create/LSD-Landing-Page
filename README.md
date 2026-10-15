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
  - `ANTHROPIC_API_KEY` must be set as a (non-`VITE_`) environment variable in your Vercel project — it's read server-side by `api/onboarding-chat.ts` (using Claude Haiku 4.5) and is never exposed to the browser.
  - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (already used by Studio) must be set, and you need to run `scripts/seed_onboarding_table.sql` once in the Supabase SQL editor to create the `onboarding_sessions` table.
- **Local testing:** `npm run dev` (Vite) does not serve the `/api` serverless function. Use `vercel dev` (after `vercel link`) to test the AI conversation locally, or test against a deployed Vercel preview.
- Voice input uses the browser's built-in Speech Recognition API (Chrome/Edge; no extra API key or cost) and falls back to typing where unsupported. Voice output (the AI reading its questions aloud) uses the browser's Speech Synthesis API and is off by default — toggle it on in the chat header.

## Bottleneck Busters arcade game (`/arcade`)

A retro platformer lead magnet built with Phaser 3. Each world is a stage of the customer journey; sun blocks and bosses ask quick diagnostic questions, and the results screen turns the answers into a mini report with an email gate. World 1 ("Ghost Town", visibility & reviews) is playable.

- **Code:** `arcade/` (separate Vite entry, so Phaser never loads on the main site). Level layout: `arcade/level1.ts`. Questions, findings and scoring: `arcade/questions.ts`. All pixel art is drawn in code in `arcade/art.ts`.
- **Lead capture:** run `scripts/seed_arcade_table.sql` once in the Supabase SQL editor. It creates `arcade_leads` with insert-only access for the anon key (leads are not readable from the browser; view them in the Supabase dashboard). Uses the existing `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Without them the game still runs and logs the lead to the console.
- **Embeds (Gatherly):** the game renders at a fixed 480x272 and scales to fit any box. Sound defaults to off when embedded. Add `?src=gatherly` to the URL to tag leads by source, and `?probe` to show the exact viewport size of the embed.
- **Attract mode:** when idle, a bot plays the level behind the title screen until someone clicks or presses a key.
- **Local dev:** `npm run dev`, then open `http://localhost:3000/arcade/`.
