// Post-boss results screen + email gate. Plain HTML over the canvas so the
// email field gets real keyboard/autofill/mobile-keyboard behavior.
import { WORLD1_QUESTIONS, WORLD1_UNLOCK, visibilityHealth } from './questions';
import { industryNoun, run } from './state';
import { saveLead } from './save';

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
  const severities = WORLD1_QUESTIONS.map((q) => q.answers[run.answers[q.id] ?? 0].severity);
  const health = visibilityHealth(severities);
  const findings = WORLD1_QUESTIONS.map((q) => q.answers[run.answers[q.id] ?? 0])
    .slice()
    .sort((a, b) => b.severity - a.severity);
  const seconds = run.finishedAt && run.startedAt ? Math.round((run.finishedAt - run.startedAt) / 1000) : 0;
  const tone = health.score >= 80 ? 'good' : health.score >= 50 ? 'mid' : 'bad';

  const el = overlay();
  el.hidden = false;
  el.innerHTML = `
    <div class="card" role="dialog" aria-labelledby="res-title">
      <p class="eyebrow">World 1 clear &middot; Ghost Town</p>
      <h1 id="res-title">Diagnosis: Visibility</h1>
      <div class="stats">
        <div><span>${run.stars}/${run.starsTotal}</span>reviews</div>
        <div><span>${run.score.toLocaleString()}</span>score</div>
        <div><span>${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}</span>time</div>
      </div>
      <div class="health ${tone}">
        <div class="health-label">Visibility health</div>
        <div class="health-score">${health.score}<small>/100</small></div>
        <div class="health-name">${health.label}</div>
      </div>
      <ul class="findings">
        ${findings.map((f) => `<li class="sev${f.severity}">${esc(f.finding)}</li>`).join('')}
      </ul>
      <div class="unlock">
        <div class="unlock-tag">Automation unlocked</div>
        <strong>${WORLD1_UNLOCK.name}</strong>
        <p>${esc(WORLD1_UNLOCK.description(industryNoun()))}</p>
      </div>
      <form id="gate" novalidate>
        <h2>Save your progress</h2>
        <p class="sub">Get your full <b>Bottleneck Report</b> emailed to you as you unlock each world of your business.</p>
        <label>First name<input name="firstName" autocomplete="given-name" maxlength="80" /></label>
        <label>Email<input name="email" type="email" autocomplete="email" required maxlength="200" /></label>
        <label>Business name <em>(optional)</em><input name="businessName" autocomplete="organization" maxlength="120" /></label>
        <p class="error" hidden></p>
        <button type="submit" class="primary">Save &amp; get my report &#9654;</button>
        <button type="button" class="link" data-skip>Skip for now</button>
      </form>
    </div>`;

  const form = el.querySelector<HTMLFormElement>('#gate')!;
  const error = form.querySelector<HTMLParagraphElement>('.error')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  form.querySelector<HTMLInputElement>('input[name=firstName]')?.focus({ preventScroll: true });

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
    submit.textContent = 'Saving...';
    const res = await saveLead({ email, firstName: String(data.get('firstName') || ''), businessName: String(data.get('businessName') || '') });
    if (!res.ok) {
      submit.disabled = false;
      submit.innerHTML = 'Save &amp; get my report &#9654;';
      error.textContent = "Couldn't save just now. Please try again.";
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
      <p class="eyebrow">${saved ? 'Progress saved' : 'Thanks for playing'}</p>
      <h1 id="next-title">World 2: The Leaky Funnel</h1>
      <p class="sub">Under construction. ${saved ? "We'll email you the moment it opens, along with your Visibility report." : 'Save your progress next time to get your report and an invite when it opens.'}</p>
      <div class="unlock">
        <div class="unlock-tag">Want the full picture now?</div>
        <p>Book a 1:1 AI Audit and we'll map every bottleneck in your business, from first click to five-star review.</p>
        <a class="primary" href="/contact" target="_top" rel="noopener">Book my AI Audit &#9654;</a>
      </div>
      <button type="button" class="link" data-again>Play World 1 again</button>
    </div>`;
  el.querySelector('[data-again]')!.addEventListener('click', () => {
    hideOverlay();
    onPlayAgain();
  });
}
