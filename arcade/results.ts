// Results screens + email gate. Plain HTML over the canvas so the form fields
// get real keyboard/autofill/mobile-keyboard behavior.
//  - After World 1: that world's diagnosis, the email gate, then "Play World 2".
//  - After World 2: the full report across both worlds. If they already gave
//    their email, the updated results are sent automatically.
import type { WorldDef } from './content';
import { sendLead } from './ghl';
import { answeredQuestions, industry, playedWorlds, run, topAutomations, world, worldHealth, type Contact } from './state';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function overlay() {
  return document.getElementById('overlay')!;
}

export function hideOverlay() {
  const el = overlay();
  el.hidden = true;
  el.innerHTML = '';
}

function show(html: string) {
  const el = overlay();
  el.hidden = false;
  el.innerHTML = html;
  el.scrollTop = 0;
  return el;
}

function healthBlock(w: WorldDef) {
  const h = worldHealth(w);
  const tone = h.score >= 80 ? 'good' : h.score >= 50 ? 'mid' : 'bad';
  return `<div class="health ${tone}">
    <div class="health-label">${esc(w.diagnosis)}</div>
    <div class="health-score">${h.score}<small>/100</small></div>
    <div class="health-name">${esc(h.label)}</div>
  </div>`;
}

function findingsList(worlds: WorldDef[]) {
  const rows = answeredQuestions(worlds)
    .slice()
    .sort((x, y) => y.a.severity - x.a.severity);
  return `<ul class="findings">${rows.map(({ q, a }) => `<li class="sev${a.severity}"><b>${esc(q.area)}.</b> ${esc(a.finding)}</li>`).join('')}</ul>`;
}

function automationBlock(worlds: WorldDef[], tag: string) {
  const autos = topAutomations(worlds);
  const noun = industry().noun;
  if (!autos.length)
    return `<div class="unlock"><div class="unlock-tag">Nice work</div><strong>No big gaps here</strong><p>Your foundations are solid. The full AI Audit digs into the parts of your business this game can't see.</p></div>`;
  return `<div class="unlock">
    <div class="unlock-tag">${esc(tag)}</div>
    <strong>${esc(autos[0].name)}</strong>
    <p>${esc(autos[0].description(noun))}</p>
    ${autos.length > 1 ? `<p class="also">Also worth automating: ${autos.slice(1).map((a) => esc(a.name)).join(', ')}</p>` : ''}
  </div>`;
}

function statsBlock(w: WorldDef) {
  const r = run.results[w.number];
  const secs = r?.seconds ?? 0;
  return `<div class="stats">
    <div><span>${r?.stars ?? 0}/${r?.starsTotal ?? 0}</span>${esc(w.collectible)}</div>
    <div><span>${run.score.toLocaleString()}</span>score</div>
    <div><span>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</span>time</div>
  </div>`;
}

const GATE = (title: string, sub: string, cta: string) => `
  <form id="gate" novalidate>
    <h2>${title}</h2>
    <p class="sub">${sub}</p>
    <label>First name<input name="firstName" autocomplete="given-name" maxlength="80" /></label>
    <label>Email<input name="email" type="email" autocomplete="email" required maxlength="200" /></label>
    <label>Mobile <em>(optional)</em><input name="phone" type="tel" autocomplete="tel" maxlength="30" /></label>
    <label>Business name <em>(optional)</em><input name="businessName" autocomplete="organization" maxlength="120" /></label>
    <p class="error" hidden></p>
    <button type="submit" class="primary">${cta} &#9654;</button>
    <button type="button" class="link" data-skip>Skip for now</button>
  </form>`;

function wireGate(el: HTMLElement, cta: string, onDone: (saved: boolean) => void) {
  const form = el.querySelector<HTMLFormElement>('#gate')!;
  const error = form.querySelector<HTMLParagraphElement>('.error')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const contact: Contact = {
      email: String(data.get('email') || '').trim(),
      firstName: String(data.get('firstName') || '').trim(),
      phone: String(data.get('phone') || '').trim(),
      businessName: String(data.get('businessName') || '').trim(),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email)) {
      error.textContent = 'Please enter a valid email so we can send your report.';
      error.hidden = false;
      return;
    }
    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Sending...';
    const res = await sendLead(contact);
    if (!res.ok) {
      submit.disabled = false;
      submit.innerHTML = `${cta} &#9654;`;
      error.textContent = "Couldn't send just now. Please try again.";
      error.hidden = false;
      return;
    }
    run.contact = contact;
    onDone(true);
  });
  form.querySelector('[data-skip]')!.addEventListener('click', () => onDone(false));
}

const AUDIT_CTA = `<div class="unlock">
  <div class="unlock-tag">Want the full picture?</div>
  <p>Book a 1:1 AI Audit and we'll map every bottleneck in your business, from first click to five-star review, with a plan to fix them.</p>
  <a class="primary" href="/contact" target="_top" rel="noopener">Book my AI Audit &#9654;</a>
</div>`;

/** After World 1: diagnosis + email gate, then on to World 2. */
export function showWorldResults({ onContinue }: { onContinue: () => void }) {
  const w = world(1);
  const cta = 'Send my report';
  const el = show(`
    <div class="card" role="dialog" aria-labelledby="res-title">
      <p class="eyebrow">World 1 clear &middot; ${esc(industry().label)}</p>
      <h1 id="res-title">Diagnosis: ${esc(w.diagnosis)}</h1>
      ${statsBlock(w)}
      ${healthBlock(w)}
      ${findingsList([w])}
      ${automationBlock([w], 'Your #1 automation')}
      ${GATE('Get your Bottleneck Report', "We'll email your report and keep adding to it as you clear more worlds.", cta)}
    </div>`);
  wireGate(el, cta, (saved) => {
    const next = world(2);
    const el2 = show(`
      <div class="card" role="dialog" aria-labelledby="next-title">
        <p class="eyebrow">${saved ? 'Report on its way' : 'World 1 complete'}</p>
        <h1 id="next-title">World 2: ${esc(next.diagnosis)}</h1>
        <p class="sub">The sun's up and the leads are coming in. Grab each one before it goes cold, and watch out for <b>Captain Later</b>.</p>
        <button type="button" class="primary" data-continue>Play World 2 &#9654;</button>
        <a class="link" href="/contact" target="_top" rel="noopener">Or book a 1:1 AI Audit</a>
      </div>`);
    el2.querySelector('[data-continue]')!.addEventListener('click', () => {
      hideOverlay();
      onContinue();
    });
  });
}

/** After World 2: the full report across both worlds. */
export function showFinalResults({ onPlayAgain }: { onPlayAgain: () => void }) {
  const worlds = playedWorlds();
  const w2 = world(2);
  const alreadySaved = !!run.contact;
  const cta = 'Send my full report';
  const el = show(`
    <div class="card" role="dialog" aria-labelledby="final-title">
      <p class="eyebrow">World 2 clear &middot; ${esc(industry().label)}</p>
      <h1 id="final-title">Your Bottleneck Report</h1>
      ${statsBlock(w2)}
      ${worlds.map(healthBlock).join('')}
      ${findingsList(worlds)}
      ${automationBlock(worlds, 'Your #1 automation')}
      <div data-gate>${
        alreadySaved
          ? `<p class="sent" data-sent>Sending your full report to <b>${esc(run.contact!.email)}</b>...</p>`
          : GATE('Get your full report', 'Both worlds, every finding and the automations that fix them, in your inbox.', cta)
      }</div>
      ${AUDIT_CTA}
      <button type="button" class="link" data-again>Play again</button>
    </div>`);
  el.querySelector('[data-again]')!.addEventListener('click', () => {
    hideOverlay();
    onPlayAgain();
  });
  const gate = el.querySelector<HTMLElement>('[data-gate]')!;
  if (alreadySaved) {
    void sendLead(run.contact!).then((r) => {
      const sent = gate.querySelector('[data-sent]');
      if (sent) sent.innerHTML = r.ok ? `Your full report is on its way to <b>${esc(run.contact!.email)}</b>.` : "We couldn't send the update just now, but your World 1 report is on its way.";
    });
  } else {
    wireGate(el, cta, (saved) => {
      gate.innerHTML = saved ? `<p class="sent">Your full report is on its way to <b>${esc(run.contact!.email)}</b>.</p>` : '';
    });
  }
}
