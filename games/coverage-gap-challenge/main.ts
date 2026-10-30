import { GAME_NAME, QUESTIONS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, currentQuestion, answerCurrent, hasMoreCards, advanceCard, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import type { Contact, GameResult } from '../_shared/types';

const stage = document.getElementById('stage')!;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

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
  stage.innerHTML = '';
  const screen = el('div', 'screen');

  const title = el('h1', 'title', 'Almost there');
  const sub = el('p', 'sub', 'Where should we send your coverage score and findings?');

  const form = el('form', 'lead-form');
  const firstName = el('input'); firstName.placeholder = 'First name'; firstName.required = true; firstName.name = 'firstName';
  const email = el('input'); email.placeholder = 'Email'; email.type = 'email'; email.required = true; email.name = 'email';
  const phone = el('input'); phone.placeholder = 'Phone (optional)'; phone.type = 'tel'; phone.name = 'phone';
  const submit = el('button', 'btn-primary', 'Show my results');
  submit.type = 'submit';

  form.append(firstName, email, phone, submit);
  form.onsubmit = async (e) => {
    e.preventDefault();
    const contact: Contact = {
      firstName: firstName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || undefined,
    };
    run.contact = contact;
    submit.textContent = 'Scoring...';
    submit.setAttribute('disabled', 'true');

    const result = buildResult();
    await sendLead(GHL_WEBHOOK_URL, contact, result);
    renderResult(result);
  };

  screen.append(title, sub, form);
  const note = el('p', 'skip-note', 'No spam — just your results and, if there\'s a real gap, a note from an advisor.');
  screen.appendChild(note);
  stage.appendChild(screen);
}

function gaugeColor(score: number) {
  if (score >= 75) return '#2ecc71';
  if (score >= 45) return '#f2b705';
  return '#ff5c5c';
}

function renderGauge(score: number): HTMLElement {
  const wrap = el('div', 'gauge');
  const size = 160;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = gaugeColor(score);

  wrap.innerHTML = `
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="rgba(255,255,255,0.08)" stroke-width="${stroke}" fill="none" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${stroke}" fill="none"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" />
    </svg>
  `;
  const label = el('div', 'gauge-score', String(score));
  label.style.color = color;
  wrap.appendChild(label);
  return wrap;
}

function renderResult(result: GameResult) {
  stage.innerHTML = '';
  const screen = el('div', 'screen');

  const eyebrow = el('div', 'eyebrow', 'Your Coverage Score');
  screen.appendChild(eyebrow);
  screen.appendChild(renderGauge(result.score));

  const title = el('h1', 'title', result.score >= 75 ? "You're in solid shape" : result.score >= 45 ? 'A few real gaps to close' : 'Your coverage needs attention');
  screen.appendChild(title);

  if (result.topRecommendation) {
    const rec = el('div', 'recommendation');
    rec.appendChild(el('div', 'label', 'Your biggest opportunity'));
    rec.appendChild(el('div', 'rec-title', result.topRecommendation));
    screen.appendChild(rec);
  }

  const list = el('div', 'findings-list');
  result.findings
    .slice()
    .sort((a, b) => b.severity - a.severity)
    .forEach((f) => {
      const row = el('div', 'finding-row');
      row.appendChild(el('div', `finding-dot sev-${f.severity}`));
      const textWrap = el('div', 'finding-text');
      textWrap.appendChild(el('div', 'area', f.area));
      textWrap.appendChild(el('div', 'detail', f.detail));
      row.appendChild(textWrap);
      list.appendChild(row);
    });
  screen.appendChild(list);

  const cta = el('a', 'btn-primary', 'Talk to an advisor');
  cta.href = `mailto:jentzen@localsundigital.com?subject=${encodeURIComponent(GAME_NAME + ' - My Results')}`;
  screen.appendChild(cta);

  stage.appendChild(screen);
}

renderIntro();
