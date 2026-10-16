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

A 2.5D (N64-style) platformer lead magnet built with Three.js. Players pick their business type; each world asks questions tailored to where that industry gets its customers, and the boss's strength depends on the answers. The results screen recommends the automation tied to their biggest gap, then collects their details for GoHighLevel. World 1 ("Get Found") is playable for all four industries.

- **Code:** `arcade/`, a separate Vite entry so the game never loads on the main site.
  - Questions, findings, automations and bosses per industry: `arcade/content.ts`
  - Level layout: `arcade/level1.ts`
  - Gameplay: `arcade/world.ts`, `arcade/boss.ts`; 3D models are built in code in `arcade/render/models.ts` (no downloaded assets)
- **Leads go to GoHighLevel:** set `GHL_WEBHOOK_URL` in `arcade/config.ts` to the URL of an "Inbound Webhook" workflow trigger. Until it's set, the form still works but leads are only logged in the browser console. The webhook receives flat keys: `first_name`, `email`, `phone`, `business_name`, `industry`, `source` ("Bottleneck Busters"), `traffic_source`, `game_diagnosis`, `game_health_score`, `game_health_label`, `game_top_automation`, `game_other_automations`, `game_answers`, `game_findings`, `game_score`, `game_play_seconds`, `game_world_reached`, `game_session_id`, and `sms_summary` (a ready-made text for an internal SMS notification).
- **Embeds (Gatherly):** the game keeps a 16:9 frame that scales to fit any box. Sound defaults to off when embedded. Add `?src=gatherly` to tag leads by source, `?probe` to show the embed's viewport size, and `?lowfx` to force low resolution on slow machines (it also drops resolution automatically if frames are slow).
- **Attract mode:** when idle, a bot plays the level behind the title screen until someone clicks or presses a key.
- **Local dev:** `npm run dev`, then open `http://localhost:3000/arcade/`.
