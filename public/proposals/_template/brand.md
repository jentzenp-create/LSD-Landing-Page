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

All of these are already wired as CSS custom properties (`--gold`, `--bg`, etc.) at the top of `index.html` — don't hardcode hex values in new markup, reference the variables.

## Typography
Inter (loaded via Google Fonts `<link>` in `<head>`). Headings are bold/black weight, `#fff`. Body copy uses `--text-muted`.

## Notes
- Every proposal is a single self-contained `index.html` — no build step, no external JS framework. Keep it that way so it can be dropped straight into `public/proposals/<slug>/` and just work.
- Reuse section patterns from `index.html` (`.card`, `.package-header` + `.pkg-num`/`.pkg-price`, `.pricing-table`, `.why-card`, `.cta-section`) rather than inventing new CSS — this keeps every proposal visually consistent.
- CTA `mailto:` links go to `jentzenp@gmail.com`.
