# LSD Brand Reference — Game Landing Page Template

Same system as `public/proposals/_template/brand.md` — reuse it, don't reinvent it.

## Logo
`LSD-logo.svg` — already in this folder, copy it into every new `public/games/<slug>/` folder.
If the client wants their own logo in the nav instead/also, add it as `CLIENT-logo.svg` and
reference both — don't replace LSD's.

## Colors (dark AI theme, approved July 2026 — use for all new pages)
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

All wired as CSS custom properties (`--gold`, `--bg`, etc.) at the top of `index.html` —
reference the variables, don't hardcode hex values in new markup.

## Typography
Inter (Google Fonts). Headings bold/black, `#fff`. Body copy uses `--text-muted`.

## Notes
- Every game landing page is a single self-contained `index.html` — no build step, no
  external JS framework — same pattern as the proposal pages. The actual *game* is a
  separate app (built under `games/<slug>/`, served at `/games/<slug>/play` or embedded
  via iframe) — this page is purely the funnel wrapper around it.
- Reuse section patterns from `index.html` (`.hero`, `.play-frame`, `.reveal-card`,
  `.lead-form`, `.cta-section`) rather than inventing new CSS, so every vertical's
  landing page reads as one product line.
- CTA / "talk to a human" `mailto:` links go to `jentzen@localsundigital.com`.
- Swap `{{...}}` placeholders per vertical: hook copy, what-you-discover bullets, the
  game's name/color accent (optional per-vertical accent is fine, but keep gold as the
  dominant brand color so it's still recognizably an LSD product).
