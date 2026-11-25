# Jackie Harris · Quinn proposal · DESIGN.md (awwwards skill)

## Brief
- Subject: Jackie Harris. Connector in the Acres of Diamonds (AOD) circle, several ventures at once: credit management courses and content, real estate, a t-shirt line, her own bookkeeping. Angel is the second user (wants the information, not the email work). Archie does not use it.
- Pitch: Quinn, a custom AI agent ("Athena's sister", built for her). Release 1 = inbox monitoring, WhatsApp digest, drafting replies by WhatsApp. Then one feature at a time, unlimited agents and usage.
- Price: $5,000/mo, card on file, no contract (from the June Canva quote, reconfirmed with Joe on 2026-11-25). Joe flagged an onboarding fee because she will need a lot of hands-on time.
- Sources: Granola 2026-06-03 (room demo), 2026-06-03 (Joe debrief: decision paralysis, unlimited model), 2026-06-08 (Quinn scope with Jackie + Angel), 2026-05-26 (real estate site, t-shirts), 2026-11-25 (she is ready, only looking at us, board not needed again).
- Job: get a yes on the call where we walk her through it.
- Stack: single static `index.html` (project convention for /proposals/<slug>), GSAP + ScrollTrigger from cdnjs. No build step.

## Concepts considered
1. **One message instead of a hundred (picked).** The page is Quinn's overnight shift. Your inbox from five businesses piles up, Quinn reads it all, and at 7:00 am you get one message. Anchor: her first feature literally is inbox to WhatsApp digest, and her wish that the AI does everything. Originality 4, fit 5, feasibility 5, portability 2.
2. The house crew. Her own line: she does not want a superstar cleaning her house, she wants the crew built for her house. Strong copy line (used in the "why unlimited" section) but weak as a visual system.
3. The board deck. Proposal styled as a board packet. Portable to any client; rejected.

## Concept card
- Idea: everything from all your businesses, read for you, handed back as one short message.
- Metaphor: the mail room at dawn: letters come in, get sorted, one note goes up to the boss.
- Signature: the sort. A sticky stage where ~13 email cards from her real ventures sit scattered; scroll files them one by one into the phone, which then writes the morning digest. Driver = section scroll progress. Idle: unsorted cards drift slightly, the phone's online dot pulses.
- Emotion: relief. "Oh, that's my inbox and it's handled."
- Motion verb: sort like mail (slide, stack, file away; nothing bounces).
- Screenshot: half-sorted stage with the digest writing itself in the phone.

## System
- Palette: night #0F1012 (ground), ink-2 #17181B (surfaces), paper #EFEAE0 (light breather sections, envelopes), gold #F2B705 (LSD, CTA only), dawn #E8893A (warm accent from the photos, charts), signal #47D18C (Quinn online / read receipts, tiny doses).
- Type: Bricolage Grotesque (display, 600 to 800, tight negative tracking) · Inter (body 17px/1.55) · JetBrains Mono (timestamps, labels with real info).
- Grid: 12 col, 24px gutter, max 1280.
- Shape: 18px radius for phone/cards/messages (chat world), 999px on buttons.
- Sections (each different family): full-bleed photo hero with phone · editorial split "what we heard" · sticky sort stage · light chat demo · staircase chart + roadmap list · release loop diagram · photo + checklist · hours calculator · ledger investment · partners strip · CTA.

## Genericness test
- Generic version = LSD dark template with cards and a price table. Replaced with her own inbox as the hero object and a signature tied to Quinn's actual first feature.
- Generic hover = color swap. Here buttons slide their label up like a letter into a slot.
- Kept quiet: no loader, no GL, no smooth scroll. It's a proposal she reads on her phone.

## Placeholders / assumptions
- Email subjects, counts and the digest text are illustrative (marked on page).
- No onboarding fee (decided 2026-11-25): $5,000 to start, then $5,000/mo.
- CTA button `#start-quinn` points to a placeholder; swap in the Stripe payment link.
- Cafe photo is AI-generated, no face; swap if it does not suit.
- Board meetings were not found in Granola; nothing on the page cites them beyond "after the board conversations".
