# Productized Games — Build System

This is the scaffold for turning the "gamified prospect-qualification" idea (the one
Gatherly reacted to) into a repeatable offering: a library of lead-qualification games,
one per industry vertical, each sold/deployed the same way a proposal page is.

`arcade/` (Bottleneck Busters) is the first proof this works — a platformer that scores
a prospect's automation gaps and hands the result to GHL. It's industry-aware already
(`arcade/content.ts` swaps copy per `Industry`), but it's one mechanic. The point of this
system is to support *several* mechanics, each reusable across verticals, instead of
hand-building a new engine per client.

## Planned verticals × mechanics

| # | Vertical | Game name | Mechanic | Status |
|---|----------|-----------|----------|--------|
| 1 | Business automation (generic) | Bottleneck Busters | 3D platformer | **Live** — `arcade/` code, served at `/games/bottleneck-busters` |
| 2 | Financial advisory / wealth mgmt | Financial Clarity Quest | Branching story | Built in AOD repo (not here) |
| 3 | Insurance (life/health) | Coverage Gap Challenge | Brick breaker (gold "gap" bricks ask) | **Built** — `games/coverage-gap-challenge/` |
| 4 | Real estate (buyers/investors) | Home Readiness Quest | Lane crossing (each safe strip is a stop) | **Built** — `games/home-readiness-quest/` |
| 5 | Home services (roofing, solar, remodel) | Project Fit Finder | Match-3 (each house section asks) | **Built** — `games/project-fit-finder/` |
| 6 | Legal (estate planning, injury) | Case Clarity Quiz | TBD arcade genre | Not started |
| 7 | Fitness / wellness / gyms | Fitness Fit Check | Endless runner (checkpoint flags ask) | **Built** — `games/fitness-fit-check/` |
| 8 | Marketing agencies / B2B SaaS | Growth Readiness Quest | TBD arcade genre | Not started |
| 9 | Med spa / dental / aesthetics | Confidence Assessment | Catcher (area orbs ask) | **Built** — `games/confidence-assessment/` |
| 10 | Mortgage / lending | Loan Readiness Quest | Maze chase (keys ask, vault opens) | **Built** — `games/loan-readiness-quest/` |
| 11 | HR / recruiting / staffing | Culture Fit Challenge | Team-builder snake (interview tokens ask) | **Built** — `games/culture-fit-challenge/` |

Every game is an original take on a classic arcade genre, not a copy of a specific
title. Keep it that way when adding one: pick the genre, then give it its own theme,
sprites, and rules.

Build order: ship the 2-3 verticals where there's already a client relationship first
(real case-study data beats a portfolio of demos), then back-fill the rest.

## Architecture

```
games/
  README.md          this file
  _shared/
    types.ts         shared contracts every vertical's content config implements
    leads.ts          generic "send this lead to GHL" helper (no game-specific state)
    env.ts            iframe/source detection, session ids, severity -> 0-100 score
    ui.ts             the screens every game ends on: lead form, gauge, result
    base.css          LSD theme + styles for those shared screens (@import it)
    arcade.ts         the canvas arcade kit: scaled 360x540 canvas, frame loop,
                      keyboard/swipe input, the ask() question pop-up, HUD, intro
    arcade.css        styles for the kit (@import after base.css)
  <vertical-slug>/     one real game build, e.g. games/coverage-gap-challenge/
    config.ts          webhook URL, constants (mirrors arcade/config.ts)
    content.ts          the industry-specific copy/questions/scoring (mirrors arcade/content.ts)
    state.ts             one player's run (mirrors arcade/state.ts, trimmed)
    main.ts              entry point, renders the UI and drives the flow
    style.css             LSD dark/gold theme, scoped to this game
    index.html
public/play/
  _template/            static landing-page template for a game's funnel page
  <vertical-slug>/       the built landing page for that vertical (copy of _template, filled in)
```

Each mechanic (brick breaker, maze chase, match-3, etc.) needs its own engine — that's
the real build cost per *mechanic*, not per vertical. Once a mechanic's engine exists,
reskinning it for a new vertical should mostly mean writing a new `content.ts`, not new
engine code. `_shared/` only holds things that are truly identical across every mechanic
(lead delivery, shared types, the arcade kit, the lead-form and result screens) — don't
put mechanic-specific logic there. A game's `main.ts` owns its intro and gameplay, then
hands off to `renderLeadForm` / `renderResult`; its `style.css` imports
`../_shared/base.css` and `../_shared/arcade.css` and adds only what the game needs.

### How a game asks its questions

Questions never end the game. Each game has a progress trigger (a gold brick breaks, a
stop is reached, a key is grabbed) that calls `ask()`, which pauses play, shows the
question, then the finding for the answer, and resumes. Getting hit costs arcade points
or sends the player back a little, but never loses answers or ends the run, so every
player who finishes has answered every question. Arcade points are shown on the result
screen and sent with the lead as an "Arcade score" finding; the gauge stays the
severity-based score.

### Thumbnails, play-testing

- `?thumb` renders one still frame of a game for the `/arcade` hub. Re-shoot them after
  a visual change with headless Edge or Chrome at a 540x810 window (headless browsers
  won't go narrower than about 500px), e.g.
  `msedge --headless=new --window-size=540,810 --virtual-time-budget=5000 --screenshot=arcade/thumbs/<slug>.png http://localhost:3000/games/<slug>/?thumb`.
- `?auto` (dev server only) has a bot play the game and answer at random, and
  `window.__arcade()` returns the live state, so a full run can be checked end to end.

Every game scores the same way: each answer carries a severity (0 = fine, 1 = worth a
look, 2 = real gap), and `scoreFromSeverities` maps the average onto 0-100. That keeps
the GHL payload, the gauge colors, and the score bands identical across verticals.

### URL split: `/games/<slug>` vs `/play/<slug>`

Two different things live at two different paths, same as `arcade` already does:

- **`/games/<slug>`** — the bare, embeddable game engine (built from `games/<slug>/` via
  its own Vite entry). This is what you'd drop in an iframe at a trade show booth, same
  as Bottleneck Busters is embedded for Gatherly. No marketing copy, just the game.
- **`/play/<slug>`** — the marketing/funnel landing page (static, from `public/play/<slug>/`):
  hook → "what you'll discover" → the game embedded via iframe pointing at `/games/<slug>`
  → result preview → lead capture copy → CTA. This is the link you'd actually send a
  prospect or run ads to.

They can't share the same URL prefix — the engine is a Vite build output, the landing
page is a static file in `public/`, and Vite would silently collide the two if they
shared a path. Keep them under separate prefixes.

## Landing page

`public/play/_template/` is the funnel page a prospect lands on before playing. It reuses
the exact dark/gold LSD theme from `public/proposals/_template/` (see that folder's
`brand.md` — same CSS variables, same section patterns) so every page in this system
looks like one product line, not ten one-offs.

## Wiring a new vertical into the site

1. Build (or reuse) the mechanic's engine under `games/<slug>/` (own `config.ts`,
   `content.ts`, `state.ts`, `main.ts`, `index.html`).
2. Add the engine's entry to `rollupOptions.input` in `vite.config.ts` (see
   `coverageGapChallenge` for the pattern).
3. Copy `public/play/_template/` → `public/play/<slug>/`, fill in the placeholders,
   point its iframe at `/games/<slug>`.
4. Vercel rewrites for `/games/:slug` and `/play/:slug` are already generic — a new slug
   needs no new rewrite rule, just the files in the right place.

## Before a game goes live

- Paste the client's GHL inbound-webhook URL into that game's `config.ts` (every built
  game ships with it empty, so leads are only logged to the console).
- Swap the mailto CTA in `renderResult` options for the client's booking link.
- Have the client review `content.ts` — the findings are written as general education,
  not advice. Mortgage, insurance, and med-spa copy in particular should be checked
  against their compliance rules, and Confidence Assessment's `OFFER` must be an offer
  the client actually honors (set it to `''` to hide it).
- Culture Fit Challenge's trivia cites published stats (DOL, Gallup, Brandon Hall Group);
  re-check them yearly, and cite a source for any round you add.

## Animation rule

The game loop itself runs on `requestAnimationFrame`, which pauses in background tabs
and hidden iframes; that's fine, since the game just pauses with it. Anything with a
deadline (the trivia clock in `ask()`) also needs a `setTimeout` so it still fires.

## Next step

Two verticals are left: legal and agencies / B2B. Pick an arcade genre not used yet
(e.g. a tower defense, a rhythm tapper, a pinball table) and build it on the kit.
