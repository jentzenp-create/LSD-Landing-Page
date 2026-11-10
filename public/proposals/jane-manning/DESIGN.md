# Jane Manning proposal · DESIGN.md (awwwards skill, Phase 0 to 2)

## Brief
- Subject: Jane Manning, painter (SFAI BFA), Sea Anatomy series: human anatomy with botanicals growing through it, acrylic on wood panel. T-shirt line already printed under the Sea Anatomy label (organic, limited runs, $45 to $55). A quote-tee line called Playwright is next (spelling per Granola notes, confirm).
- Audience: Jane herself (59, creative, self-described "not organized", shy about selling). Secondary: anyone she forwards it to.
- Job: get a yes on a $3,000 build (site + shopping flow) and $500/mo (care, AI agent upkeep, distribution).
- Source: Granola call 2026-11-09, janemanningart.com, iCloud album she shared (44 photos).
- Stack: static single `index.html` (project convention for /proposals/<slug>), GSAP + ScrollTrigger from cdnjs. No build step so the link works immediately.

## Concepts considered
1. **Bone botanicals (picked).** The proposal is an anatomical plate. Her business is a body: the message is the heart (already strong), the shop is the spine, the AI agent is the nervous system, distribution is circulation. A single painted-style vine grows down the page as you read, the same way vines grow through the bones in her panels. Anchor: her own line on the call that organs work together like a tribe, plus the Sea Anatomy statement "bones are only made possible by life." Originality 4, fit 5, feasibility 5, portability 1.
2. Fruit off the tree. Her metaphor from the call. Strong, but trees are generic and it would push toward orchard imagery she doesn't paint. Fit 3.
3. Gallery wall. Proposal as an exhibition with wall labels. Portable to any artist. Portability 4, rejected.

## Concept card
- Idea: your business, drawn as one of your paintings: structure with life growing through it.
- Metaphor: an anatomical plate on a birch panel.
- Signature: the vine. One SVG path grows down the left margin tied to scroll and puts out a bud at each "organ" (section). Idle: buds sway on the GSAP ticker.
- Emotion: calm, warm, "oh, he actually looked at my work."
- Motion verb: grow like a vine (things unfurl from a point, slow out, never bounce).
- Screenshot: hero type beside the spine painting with plate labels pointing to Fig. 1, 2, 3.

## System
- Palette: birch #EADBC2 (ground, her wood panels), bone #F7F2E8 (light plate), ink #172033 (deep sea navy text), vein #185C59 (teal vine, links), coral #C8402F (the heart, CTA only), sea #0F1A2B (nervous-system chapter + footer). Lifted from her paintings, not a preset.
- Type: Cormorant Garamond (display, engraved plate feel) · Instrument Sans (body 17px/1.55) · IBM Plex Mono (plate labels, 12 to 13px, real info only).
- Grid: 12 col, 24px gutter, max 1320, 72px left channel for the vine on desktop (18px on phone).
- Shape: 2px radius on frames, pill only on size chips.
- Sections (each a different layout family): split hero · editorial notes + annotated screenshot · interactive product mock in a browser frame · dark chat + inventory chart · radial circulation diagram · ledger-style investment · short checklist · CTA.

## Genericness test
- A generic model would ship the LSD dark template with cards. Replaced with her palette, her paintings and a body metaphor from the call.
- Generic hover = color swap. Here: buttons fill from the left like ink soaking wood, links get a vine underline that grows.
- Kept quiet: no loader, no WebGL. The brief is a proposal, not a launch.

## Placeholders / assumptions to confirm
- Product names, prices ($48) and stock counts in the mockups are illustrative.
- "Playwright" spelling from the transcript.
- Timeline "about 4 to 6 weeks" is an estimate.
