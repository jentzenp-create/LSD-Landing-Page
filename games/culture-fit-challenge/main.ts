import { GAME_NAME, ROUNDS, ROUND_SECONDS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, answerTrivia, answerFollowUp, advance, done, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const btn = el('button', 'btn-primary', 'Start round 1');
  btn.onclick = () => renderTrivia();
  screen.append(
    el('div', 'eyebrow', `HR & Hiring · ${ROUNDS.length} Rounds`),
    el('h1', 'title', GAME_NAME),
    el('p', 'sub', `How well do you know the real cost of hiring? ${ROUNDS.length} timed trivia rounds — answer fast for bonus points. After each one, a quick question about your own team. At the end, see your hiring health score.`),
    btn,
  );
  stage.appendChild(screen);
}

function hud(screen: HTMLElement) {
  const bar = el('div', 'hud');
  bar.append(el('span', 'hud-round', `Round ${run.index + 1} / ${ROUNDS.length}`), el('span', 'hud-points', `${run.points} pts`));
  screen.appendChild(bar);
  return bar;
}

function renderTrivia() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const bar = hud(screen);
  const r = current();

  const timer = el('div', 'timer');
  const fill = el('div', 'timer-fill');
  const secs = el('span', 'timer-secs', String(ROUND_SECONDS));
  timer.append(fill);
  const timerRow = el('div', 'timer-row');
  timerRow.append(timer, secs);

  const card = el('div', 'trivia');
  card.append(el('div', 'area-tag', `Trivia · ${r.area}`), el('div', 'prompt', r.trivia.question));
  const grid = el('div', 'options');
  const buttons = r.trivia.options.map((label, i) => {
    const b = el('button', 'option', label);
    b.onclick = () => finish(i);
    grid.appendChild(b);
    return b;
  });
  card.appendChild(grid);
  const after = el('div', 'after');
  after.setAttribute('aria-live', 'polite');

  screen.append(timerRow, card, after);
  stage.appendChild(screen);

  const t0 = performance.now();
  let raf = 0;
  let over = false;
  const tick = (now: number) => {
    const left = Math.max(0, ROUND_SECONDS - (now - t0) / 1000);
    fill.style.width = `${(left / ROUND_SECONDS) * 100}%`;
    fill.classList.toggle('low', left <= 5);
    secs.textContent = String(Math.ceil(left));
    if (left <= 0) finish(null);
    else raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  // rAF pauses in background tabs; this guarantees the clock still runs out.
  const deadline = setTimeout(() => finish(null), ROUND_SECONDS * 1000);

  function finish(choice: number | null) {
    if (over) return;
    over = true;
    cancelAnimationFrame(raf);
    clearTimeout(deadline);
    const left = ROUND_SECONDS - (performance.now() - t0) / 1000;
    const earned = answerTrivia(choice, left);

    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === r.trivia.correct) b.classList.add('right');
      else if (i === choice) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    bar.querySelector('.hud-points')!.textContent = `${run.points} pts`;

    const verdict = choice === null ? "Time's up!" : earned ? `Correct! +${earned} pts` : 'Not quite';
    after.append(el('div', `verdict ${earned ? 'good' : 'bad'}`, verdict), el('p', 'explain', r.trivia.explain));
    const next = el('button', 'btn-primary', 'Now, about your team →');
    next.onclick = () => renderFollowUp();
    after.appendChild(next);
    next.focus();
  }
}

function renderFollowUp() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  hud(screen);
  const r = current();
  const card = el('div', 'trivia followup');
  card.append(el('div', 'area-tag', `Your team · ${r.area}`), el('div', 'prompt', r.followUp.prompt));
  const answers = el('div', 'answers');
  const after = el('div', 'after');
  r.followUp.answers.forEach((a, idx) => {
    const btn = el('button', 'answer-btn', a.label);
    btn.onclick = () => {
      if (answers.dataset.locked) return;
      answers.dataset.locked = '1';
      answers.querySelectorAll('button').forEach((b) => b !== btn && b.classList.add('dim'));
      btn.classList.add('picked', `sev-${a.severity}`);
      answerFollowUp(idx);
      advance();
      after.append(el('p', `explain sev-${a.severity}`, a.finding));
      const next = el('button', 'btn-primary', done() ? 'See my score' : `Start round ${run.index + 1}`);
      next.onclick = () => (done() ? renderLead() : renderTrivia());
      after.appendChild(next);
      next.focus();
    };
    answers.appendChild(btn);
  });
  card.appendChild(answers);
  screen.append(card, after);
  stage.appendChild(screen);
}

function renderLead() {
  renderLeadForm(stage, {
    sub: 'Where should we send your hiring health score and trivia results?',
    note: 'No spam — just your results and, if there’s a real gap, a note from our team.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const extra = el('div', 'result-extra');
      extra.append(
        el('div', 'label', 'Trivia'),
        el('div', 'value', `${run.correct} / ${ROUNDS.length} correct · ${run.points} pts`),
        el('div', 'note', 'The gauge scores your team’s hiring health — your trivia points are just bragging rights.'),
      );

      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
        eyebrow: 'Your Hiring Health',
        titles: ['Your team is in great shape', 'Solid, with a couple of leaks to plug', 'Hiring is costing you more than it should'],
        recLabel: 'Highest-impact fix',
        extra,
        ctaLabel: 'Talk to an HR advisor',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

renderIntro();
