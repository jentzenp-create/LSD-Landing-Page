// Post-boss results screen + email gate. Plain HTML over the canvas so the
// form fields get real keyboard/autofill/mobile-keyboard behavior.
import { healthScore } from './content';
import { sendLead } from './ghl';
import { answeredQuestions, industry, run, topAutomations, world, worldSeverities } from './state';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function overlay() {
  return document.getElementById('overlay')!;
}

export function hideOverlay() {
  const el = overlay();
  el.hidden = true;
  el.innerHTML = '';
}

export function showResults({ onPlayAgain }: { onPlayAgain: () => void }) {
  const ind = industry();
  const w = world();
  const health = healthScore(worldSeverities());
  const findings = answeredQuestions()
    .slice()
    .sort((x, y) => y.a.severity - x.a.severity);
  const autos = topAutomations();
  const top = autos[0];
  const seconds = run.finishedAt && run.startedAt ? Math.round((run.finishedAt - run.startedAt) / 1000) : 0;
  const tone = health.score >= 80 ? 'good' : health.score >= 50 ? 'mid' : 'bad';

  const el = overlay();
  el.hidden = false;
  el.innerHTML = `
    <div class="card" role="dialog" aria-labelledby="res-title">
      <p class="eyebrow">World 1 clear &middot; ${esc(ind.label)}</p>
      <h1 id="res-title">Diagnosis: ${esc(w.diagnosis)}</h1>
      <div class="stats">
        <div><span>${run.stars}/${run.starsTotal}</span>${esc(w.collectible)}</div>
        <div><span>${run.score.toLocaleString()}</span>score</div>
        <div><span>${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}</span>time</div>
      </div>
      <div class="health ${tone}">
        <div class="health-label">${esc(w.meter)} health</div>
        <div class="health-score">${health.score}<small>/100</small></div>
        <div class="health-name">${esc(health.label)}</div>
      </div>
      <ul class="findings">
        ${findings.map(({ q, a }) => `<li class="sev${a.severity}"><b>${esc(q.area)}.</b> ${esc(a.finding)}</li>`).join('')}
      </ul>
      ${
        top
          ? `<div class="unlock">
        <div class="unlock-tag">Your #1 automation</div>
        <strong>${esc(top.name)}</strong>
        <p>${esc(top.description(ind.noun))}</p>
        ${autos.length > 1 ? `<p class="also">Also worth automating: ${autos.slice(1).map((a) => esc(a.name)).join(', ')}</p>` : ''}
      </div>`
          : `<div class="unlock"><div class="unlock-tag">Nice work</div><strong>No big gaps in this world</strong><p>Your foundations are solid. The next worlds dig into speed-to-lead and follow-up, where most businesses leak the most.</p></div>`
      }
      <form id="gate" novalidate>
        <h2>Get your Bottleneck Report</h2>
        <p class="sub">We'll send your full report and save your progress for World 2.</p>
        <label>First name<input name="firstName" autocomplete="given-name" maxlength="80" /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required maxlength="200" /></label>
        <label>Mobile <em>(optional)</em><input name="phone" type="tel" autocomplete="tel" maxlength="30" /></label>
        <label>Business name <em>(optional)</em><input name="businessName" autocomplete="organization" maxlength="120" /></label>
        <p class="error" hidden></p>
        <button type="submit" class="primary">Send my report &#9654;</button>
        <button type="button" class="link" data-skip>Skip for now</button>
      </form>
    </div>`;

  const form = el.querySelector<HTMLFormElement>('#gate')!;
  const error = form.querySelector<HTMLParagraphElement>('.error')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  el.scrollTop = 0;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      error.textContent = 'Please enter a valid email so we can send your report.';
      error.hidden = false;
      return;
    }
    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Sending...';
    const res = await sendLead({
      email,
      firstName: String(data.get('firstName') || ''),
      phone: String(data.get('phone') || ''),
      businessName: String(data.get('businessName') || ''),
    });
    if (!res.ok) {
      submit.disabled = false;
      submit.innerHTML = 'Send my report &#9654;';
      error.textContent = "Couldn't send just now. Please try again.";
      error.hidden = false;
      return;
    }
    showNextUp(onPlayAgain, true);
  });
  form.querySelector('[data-skip]')!.addEventListener('click', () => showNextUp(onPlayAgain, false));
}

function showNextUp(onPlayAgain: () => void, saved: boolean) {
  const el = overlay();
  el.innerHTML = `
    <div class="card" role="dialog" aria-labelledby="next-title">
      <p class="eyebrow">${saved ? 'Report on its way' : 'Thanks for playing'}</p>
      <h1 id="next-title">World 2: Speed to Lead</h1>
      <p class="sub">Under construction: how fast you answer new leads, and what happens to the ones you miss. ${saved ? "We'll let you know the moment it opens." : 'Send yourself the report next time to get an invite when it opens.'}</p>
      <div class="unlock">
        <div class="unlock-tag">Want the full picture now?</div>
        <p>Book a 1:1 AI Audit and we'll map every bottleneck in your business, from first click to five-star review.</p>
        <a class="primary" href="/contact" target="_top" rel="noopener">Book my AI Audit &#9654;</a>
      </div>
      <button type="button" class="link" data-again>Play again</button>
    </div>`;
  el.scrollTop = 0;
  el.querySelector('[data-again]')!.addEventListener('click', () => {
    hideOverlay();
    onPlayAgain();
  });
}
