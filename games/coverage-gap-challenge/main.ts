import { GAME_NAME, QUESTIONS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, currentQuestion, answerCurrent, hasMoreCards, advanceCard, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm as renderLeadFormScreen, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');

  const eyebrow = el('div', 'eyebrow', `Insurance · ${QUESTIONS.length} Cards`);
  const title = el('h1', 'title', GAME_NAME);
  const sub = el('p', 'sub', 'Flip through 6 quick cards about your coverage. Each one reveals a finding. At the end you get a coverage score and your biggest gap — takes about 90 seconds.');
  const btn = el('button', 'btn-primary', 'Start');
  btn.onclick = () => renderCard();

  screen.append(eyebrow, title, sub, btn);
  stage.appendChild(screen);
}

function renderProgress(container: HTMLElement) {
  const bar = el('div', 'progress');
  QUESTIONS.forEach((_, i) => {
    const dot = el('div', 'progress-dot');
    if (i < run.cardIndex) dot.classList.add('done');
    if (i === run.cardIndex) dot.classList.add('active');
    bar.appendChild(dot);
  });
  container.appendChild(bar);
}

function renderCard() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  renderProgress(screen);

  const q = currentQuestion();
  const cardArea = el('div', 'card-area');
  const card = el('div', 'card');

  const front = el('div', 'card-face card-front');
  front.appendChild(el('div', 'area-tag', q.area));
  front.appendChild(el('div', 'prompt', q.prompt));

  const back = el('div', 'card-face card-back');

  card.append(front, back);
  cardArea.appendChild(card);

  const answers = el('div', 'answers');
  q.answers.forEach((a, idx) => {
    const btn = el('button', 'answer-btn', a.label);
    btn.onclick = () => {
      if (card.classList.contains('flipped')) return; // already answered
      answerCurrent(idx);

      back.innerHTML = '';
      const sevTag = el('span', `severity-tag sev-${a.severity}`, ['Looking good', 'Worth a look', 'Real gap'][a.severity]);
      back.appendChild(sevTag);
      back.appendChild(el('p', 'finding', a.finding));

      card.classList.add('flipped');
      answers.querySelectorAll('button').forEach((b) => (b.style.opacity = '0.4'));

      setTimeout(() => {
        const nextBtn = el('button', 'btn-primary', hasMoreCards() ? 'Next card' : 'See your results');
        nextBtn.style.marginTop = '20px';
        nextBtn.onclick = () => {
          if (hasMoreCards()) {
            advanceCard();
            renderCard();
          } else {
            renderLeadForm();
          }
        };
        screen.appendChild(nextBtn);
      }, 300);
    };
    answers.appendChild(btn);
  });

  screen.append(cardArea, answers);
  stage.appendChild(screen);
}

function renderLeadForm() {
  renderLeadFormScreen(stage, {
    sub: 'Where should we send your coverage score and findings?',
    note: "No spam — just your results and, if there's a real gap, a note from an advisor.",
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);
      renderResult(stage, result, {
        eyebrow: 'Your Coverage Score',
        titles: ["You're in solid shape", 'A few real gaps to close', 'Your coverage needs attention'],
        ctaLabel: 'Talk to an advisor',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

renderIntro();
