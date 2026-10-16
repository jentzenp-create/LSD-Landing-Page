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

A 2.5D (N64-style) platformer lead magnet built with Three.js. Players pick their business type, then play two worlds:

1. **World 1, "Get Found"** (night): collect reviews (or leads, for professional services) to light up the town. Questions are tailored to where that industry's customers come from. Boss: The Invisible Listing (1-star reviews) or The Ghoster (unanswered emails).
2. **World 2, "Speed to Lead"** (daytime): hot leads cool from orange to blue and disappear if you're slow. Questions cover response time, missed calls, follow-up and after-hours coverage. Boss: Captain Later (missed calls).

Power-ups come out of sun blocks: **Sunshine** (grow, survive an extra hit, smash bricks) and **Autopilot** (World 2: faster and invincible for a few seconds). Each boss's strength depends on the player's answers. After each world the results screen recommends the automation tied to the biggest gap; the email gate sits after World 1, and World 2's results are sent as an update.

- **Code:** `arcade/`, a separate Vite entry so the game never loads on the main site.
  - Questions, findings, automations and bosses per industry and world: `arcade/content.ts`
  - Level layouts: `arcade/levels.ts`
  - Gameplay: `arcade/world.ts`, `arcade/boss.ts`; 3D models are built in code in `arcade/render/models.ts` (no downloaded assets)
- **Leads go to GoHighLevel:** set `GHL_WEBHOOK_URL` in `arcade/config.ts` to the URL of an "Inbound Webhook" workflow trigger. Until it's set, the form still works but leads are only logged in the browser console. A lead is sent when the player submits the form (usually after World 1) and again with fuller results after World 2. Keys: `first_name`, `email`, `phone`, `business_name`, `industry`, `source` ("Bottleneck Busters"), `traffic_source`, `game_world_reached`, `game_diagnosis`, `game_health_score`, `game_w1_score`, `game_w2_score`, `game_top_automation`, `game_other_automations`, `game_answers`, `game_findings`, `game_score`, `game_play_seconds`, `game_session_id`, and `sms_summary` (a ready-made text for an internal SMS notification).
- **Embeds (Gatherly):** the game keeps a 16:9 frame that scales to fit any box. Sound defaults to off when embedded. Add `?src=gatherly` to tag leads by source, `?probe` to show the embed's viewport size, and `?lowfx` to force low resolution on slow machines (it also drops resolution automatically if frames are slow).
- **Phones:** sized to the visible screen (not hidden behind browser bars), pinch/double-tap zoom disabled, on-screen buttons on touch devices.
- **Attract mode:** when idle, a bot plays behind the title screen, alternating between the night and day worlds.
- **Local dev:** `npm run dev`, then open `http://localhost:3000/arcade/`.
