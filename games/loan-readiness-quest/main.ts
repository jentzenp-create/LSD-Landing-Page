import { GAME_NAME, CHALLENGES, TIERS, tierFor } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, answer, advance, done, progressScore, pointsFor, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const btn = el('button', 'btn-primary', 'Start the quest');
  btn.onclick = () => renderChallenge();

  const tiers = el('div', 'tier-preview');
  TIERS.forEach((t, i) => {
    const chip = el('div', `tier-chip${i === 0 ? ' unlocked' : ''}`);
    chip.append(el('span', 'lock', i === 0 ? '●' : '🔒'), el('span', '', t.name));
    tiers.appendChild(chip);
  });

  screen.append(
    el('div', 'eyebrow', `Home Buying · ${CHALLENGES.length} Challenges`),
    el('h1', 'title', GAME_NAME),
    el('p', 'sub', 'Answer 6 quick challenges about your finances. Every answer earns readiness points — climb high enough to unlock the next buyer tier. See exactly where you stand before you talk to a lender.'),
    tiers,
    btn,
  );
  stage.appendChild(screen);
}

/** Horizontal ladder: a fill bar with a marker for each tier threshold. */
function ladder(score: number) {
  const wrap = el('div', 'ladder');
  const track = el('div', 'ladder-track');
  const fill = el('div', 'ladder-fill');
  fill.style.width = `${score}%`;
  track.appendChild(fill);
  TIERS.forEach((t) => {
    const node = el('div', `ladder-node${score >= t.at ? ' unlocked' : ''}`);
    // The 0% node sits flush with the track's start instead of hanging off it.
    node.style.left = t.at === 0 ? '9px' : `${t.at}%`;
    node.dataset.at = String(t.at);
    node.title = t.name;
    track.appendChild(node);
  });
  const labels = el('div', 'ladder-labels');
  const label = el('span', 'ladder-tier', tierFor(score).name);
  const pts = el('span', 'ladder-score', `${score} / 100`);
  labels.append(label, pts);
  wrap.append(track, labels);
  return wrap;
}

function updateLadder(wrap: HTMLElement, score: number) {
  wrap.querySelector<HTMLElement>('.ladder-fill')!.style.width = `${score}%`;
  wrap.querySelectorAll<HTMLElement>('.ladder-node').forEach((n) => {
    n.classList.toggle('unlocked', score >= Number(n.dataset.at));
  });
  wrap.querySelector('.ladder-tier')!.textContent = tierFor(score).name;
  wrap.querySelector('.ladder-score')!.textContent = `${score} / 100`;
}

function renderChallenge() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const before = progressScore();
  const bar = ladder(before);

  const c = current();
  const card = el('div', 'challenge');
  card.append(
    el('div', 'area-tag', `Challenge ${run.index + 1} of ${CHALLENGES.length} · ${c.area}`),
    el('div', 'prompt', c.prompt),
  );

  const answers = el('div', 'answers');
  const feedback = el('div', 'feedback');
  feedback.setAttribute('aria-live', 'polite');

  c.answers.forEach((a, idx) => {
    const btn = el('button', 'answer-btn', a.label);
    btn.onclick = () => {
      if (answers.dataset.locked) return;
      answers.dataset.locked = '1';
      answers.querySelectorAll('button').forEach((b) => b !== btn && b.classList.add('dim'));
      btn.classList.add('picked', `sev-${a.severity}`);

      const pts = pointsFor(idx);
      answer(idx);
      const after = progressScore();
      updateLadder(bar, after);

      const floater = el('div', 'floater', pts > 0 ? `+${pts} pts` : '+0 pts');
      bar.appendChild(floater);

      feedback.innerHTML = '';
      feedback.className = `feedback sev-${a.severity} show`;
      feedback.appendChild(el('p', '', a.finding));

      const unlocked = TIERS.find((t) => t.at > before && t.at <= after);
      if (unlocked) {
        const banner = el('div', 'unlock-banner');
        banner.append(el('span', 'unlock-icon', '🔓'), el('span', '', `Tier unlocked: ${unlocked.name}`));
        screen.insertBefore(banner, card);
      }

      advance();
      const next = el('button', 'btn-primary', done() ? 'See my tier' : 'Next challenge');
      next.onclick = () => (done() ? renderLead() : renderChallenge());
      feedback.appendChild(next);
      next.focus();
    };
    answers.appendChild(btn);
  });

  card.appendChild(answers);
  screen.append(bar, card, feedback);
  stage.appendChild(screen);
}

function renderLead() {
  renderLeadForm(stage, {
    sub: 'Where should we send your readiness report and next steps?',
    note: 'No credit pull, no obligation — just your results and a note from a loan officer if you want one.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const tier = tierFor(result.score);
      const extra = el('div', 'result-extra');
      extra.append(
        el('div', 'label', 'Tier reached'),
        el('div', 'value', tier.name),
        el('div', 'note', tier.blurb),
        ladder(result.score),
      );

      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
        eyebrow: 'Your Loan Readiness',
        titles: ['You\'re ready to shop', 'Close — a few things to tighten up', 'Let\'s build your plan first'],
        recLabel: 'Your next unlock',
        extra,
        ctaLabel: 'Talk to a loan officer',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

renderIntro();
