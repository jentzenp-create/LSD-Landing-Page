# LSD Brand Reference — Proposal Template

## Logo
`LSD-logo.svg` — already in this folder, copy it into every new proposal folder.

## Colors (dark AI theme, approved July 2026 — use for all new proposals)
| Name       | Hex / Value              | Usage                        |
|------------|---------------------------|-------------------------------|
| Gold       | `#F2B705`                 | Buttons, accents, highlights |
| Background | `#0E0E0E`                  | Page background               |
| Surface    | `#1A1A1A`                  | Cards                          |
| Surface 2  | `#222222`                  | Nested cards / mockups         |
| Border     | `rgba(255,255,255,0.07)`   | Dividers, card borders         |
| Border Gold| `rgba(242,183,5,0.35)`     | Emphasis borders               |
| Text       | `#FFFFFF`                  | Headings                       |
| Text Muted | `rgba(255,255,255,0.55)`   | Body copy                      |
| Text Dim   | `rgba(255,255,255,0.35)`   | Captions, fine print           |

### Secondary accents (added Nov 2026 — for section variety, use sparingly)

Every proposal still reads as LSD gold-on-black. These exist only to stop every
section from being flat `#0E0E0E` — they tint section backgrounds and chart
accents, they do not replace gold as the primary CTA/emphasis color.

| Name        | Hex / Value   | Usage                                                   |
|-------------|---------------|----------------------------------------------------------|
| Accent Blue | `#4F8CFF`     | "Data / evidence" sections — comparisons, SERP evidence  |
| Accent Teal | `#2FD6B0`     | "Opportunity / positive" sections — wins, what's working |
| Accent Rose | `#FF5C5C`     | "Risk / critical finding" sections — audits, red flags   |

All three are wired as `--accent-blue`, `--accent-teal`, `--accent-rose` (plus
`-dim` and `-border` variants) in `index.html`. Gold stays the only color used
for buttons, the nav label, and primary CTAs — the secondary accents are for
section tinting and chart/data-viz color only, never for the main CTA button.

## Typography
Inter (loaded via Google Fonts `<link>` in `<head>`). Headings are bold/black weight, `#fff`. Body copy uses `--text-muted`.

## Visual variety practice (every proposal/audit from Nov 2026 on)

Flat black-on-black top to bottom reads monotonous and makes long pages feel
like one wall of text. Every proposal and audit should now vary section by
section while staying inside the palette above:

- **Alternate section backgrounds.** Don't leave every `<section>` on plain
  `--bg`. Apply one of the `.section-tint-gold` / `.section-tint-blue` /
  `.section-tint-teal` / `.section-tint-rose` classes (defined in
  `index.html`, radial-gradient tints at ~6-8% opacity) roughly every other
  section, picked by what that section is about (evidence/data → blue,
  wins/opportunity → teal, risk/critical → rose, everything else → gold or
  plain). Never stack two tinted sections back to back without a plain one
  between them — the variety only reads if it's not constant.
- **Use gradients, not flat fills, for emphasis blocks.** Stat tiles, callouts
  and the CTA section should use a subtle `linear-gradient`/`radial-gradient`
  between a tinted color and `--surface`, the way `.critical-block` and
  `.cta-section` already do in the template — don't add new flat-color boxes.
- **Include 2–4 visual assets per proposal/audit, not just cards of text.**
  At minimum one of: a hero decorative graphic (gradient mesh/orb, already
  started in `.hero-bg-lines`), a data visualization for any real numbers in
  the piece (a gauge, bar comparison, or donut — inline SVG, styled from the
  CSS tokens, see `index.html` for a worked example), and/or a simple
  decorative section divider. Build these as inline SVG sized and colored
  from the CSS custom properties — never raster screenshots pasted in as the
  only visual, and never a wall of cards with zero graphics. If the client
  has real photos (headshots, location photos, product shots), those count
  too and should be preferred over invented graphics where available.
- **Photographic/illustrated image generation:** the Canva connector
  (`plugin:marketing:canva`) can generate real images once the user has
  authorized it via `/mcp` — until then, build visual assets as inline SVG
  rather than skipping them.

## Notes
- Every proposal is a single self-contained `index.html` — no build step, no external JS framework. Keep it that way so it can be dropped straight into `public/proposals/<slug>/` and just work.
- Reuse section patterns from `index.html` (`.card`, `.package-header` + `.pkg-num`/`.pkg-price`, `.pricing-table`, `.why-card`, `.cta-section`, `.section-tint-*`) rather than inventing new CSS — this keeps every proposal visually consistent while still varied.
- CTA `mailto:` links go to `jentzen@localsundigital.com`.
