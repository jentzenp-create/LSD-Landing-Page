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
| 1 | Business automation (generic) | Bottleneck Busters | Platformer | **Live** — `arcade/` |
| 2 | Financial advisory / wealth mgmt | Financial Clarity Quest | Branching story | Built in AOD repo (not here) |
| 3 | Insurance (life/health) | Coverage Gap Challenge | Card-reveal / flip-match | Not started |
| 4 | Real estate (buyers/investors) | Home Readiness Quest | Progress-map journey | Not started |
| 5 | Home services (roofing, solar, remodel) | Project Fit Finder | Interactive calculator | Not started |
| 6 | Legal (estate planning, injury) | Case Clarity Quiz | Scorecard / gauge | Not started |
| 7 | Fitness / wellness / gyms | Fitness Fit Check | Swipe-card sorter | Not started |
| 8 | Marketing agencies / B2B SaaS | Growth Readiness Quest | Build-your-own | Not started |
| 9 | Med spa / dental / aesthetics | Confidence Assessment | Spin-wheel + reveal | Not started |
| 10 | Mortgage / lending | Loan Readiness Quest | Tier-unlock challenge | Not started |
| 11 | HR / recruiting / staffing | Culture Fit Challenge | Trivia challenge | Not started |

Build order: ship the 2-3 verticals where there's already a client relationship first
(real case-study data beats a portfolio of demos), then back-fill the rest.

## Architecture

```
games/
  README.md          this file
  _shared/
    types.ts         shared contracts every vertical's content config implements
    leads.ts          generic "send this lead to GHL" helper (no game-specific state)
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

Each mechanic (platformer, card-reveal, calculator, etc.) needs its own engine — that's
the real build cost per *mechanic*, not per vertical. Once a mechanic's engine exists,
reskinning it for a new vertical should mostly mean writing a new `content.ts`, not new
engine code. `_shared/` only holds things that are truly identical across every mechanic
(lead delivery, shared types) — don't put mechanic-specific logic there.

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

## Next step

Pick the first new vertical to prototype (recommend the one with a live client interested
now) and build its mechanic end-to-end — that's the real template; everything after is
reskinning.
