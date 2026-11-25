# Jackie Harris · Quinn proposal · DESIGN.md (awwwards skill)

## Brief (revision 2)
- Subject: Jackie Harris, consultant. Immediate priority: a client-facing Quinn agent that extends her consulting work, so she can take on Working Entrepreneurs without leading every Zoom call.
- Agent one: a custom RAG chatbot. Her books are the reference library and primary source. Source citations on every answer, a clean fallback when the books don't cover a topic, invite-only client access controls. Her example site informs the design only.
- Package: same subscription, unlimited agents added one at a time. A marketing agent for her book or consulting services is a possible later agent.
- Not promised: an exact copy of her example, her likeness or voice, a standalone app, fully autonomous consultations.
- Delivery: subscribe, onboarding call, testing version about 7 to 14 days after onboarding (estimate), review at 3 to 6 months.
- Price: $5,000/mo, card on file, no setup fee, no contract, cancel anytime. CTA goes to the Stripe subscription link.
- Audience: Jackie and her board (C-corporation protocol). Board summary sits right after the hero; questions invited in advance.
- Stack: single static `index.html` (project convention for /proposals/<slug>), GSAP + ScrollTrigger from cdnjs. No build step.

## Concept card
- Idea: your coaching, available to clients between calls, answered from your own books.
- Signature: the sticky stage. Client questions sit scattered; scroll files them into the phone, which writes Jackie a recap with flagged questions. Driver = section scroll progress. Idle: unanswered cards drift slightly.
- Motion verb: sort like mail (slide, stack, file away; nothing bounces).

## System
- Palette: night #0F1012, ink-2 #17181B, paper #EFEAE0 (light sections), gold #F2B705 (LSD, CTA only), dawn #E8893A (charts), signal #47D18C (status, included items).
- Type: Bricolage Grotesque (display) · Inter (body) · JetBrains Mono (labels).
- Sections: photo hero with price strip · board summary (sticky intro + fact list) · what you told us · sticky question stage · light chat demo · agent one RAG spec (flow diagram, four specs, straight talk, stack) · scope included / not included · agents over time · delivery path ring · photo + checklist · calls calculator · ledger investment · partners · CTA.

## Placeholders / assumptions
- Client questions, counts, the recap and the chat are illustrative (marked on page). Nothing quotes her actual book.
- Stack is a recommendation, confirmed at onboarding.
- Cafe photo is AI-generated, no face; swap if it does not suit.
