import { GAME_NAME, STATEMENTS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, swipe, done, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;
const THRESHOLD = 90; // px of drag that counts as a swipe
let keyHandler: ((e: KeyboardEvent) => void) | undefined;

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const btn = el('button', 'btn-primary', 'Start swiping');
  btn.onclick = () => renderDeck();

  const how = el('div', 'how');
  how.append(howItem('←', 'Not me'), howItem('→', "That's me"));

  screen.append(
    el('div', 'eyebrow', `Fitness · ${STATEMENTS.length} Cards`),
    el('h1', 'title', GAME_NAME),
    el('p', 'sub', "Swipe through 8 quick statements about how you train. Right if it's you, left if it's not. At the end you get a fit-readiness score and the program that matches how you actually work."),
    how,
    btn,
  );
  stage.appendChild(screen);
}

function howItem(arrow: string, label: string) {
  const item = el('div', 'how-item');
  item.append(el('span', 'how-arrow', arrow), el('span', '', label));
  return item;
}

function renderDeck() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');

  const counter = el('div', 'counter');
  const deck = el('div', 'deck');
  const insight = el('p', 'insight');
  insight.setAttribute('aria-live', 'polite');

  const controls = el('div', 'swipe-controls');
  const noBtn = el('button', 'swipe-btn no', '✕');
  noBtn.setAttribute('aria-label', 'Not me');
  const yesBtn = el('button', 'swipe-btn yes', '✓');
  yesBtn.setAttribute('aria-label', "That's me");
  controls.append(noBtn, el('span', 'swipe-hint', 'Swipe or tap'), yesBtn);

  screen.append(counter, deck, controls, insight);
  stage.appendChild(screen);

  let busy = false;

  const layout = () => {
    counter.textContent = `${Math.min(run.index + 1, STATEMENTS.length)} / ${STATEMENTS.length}`;
    deck.innerHTML = '';
    // Next card sits behind the top one so the deck reads as a stack.
    const next = STATEMENTS[run.index + 1];
    if (next) deck.appendChild(cardFor(next.area, next.text, 'behind'));
    const top = cardFor(current().area, current().text, 'top');
    deck.appendChild(top);
    attachDrag(top);
  };

  const commit = (isMe: boolean, card: HTMLElement) => {
    if (busy) return;
    busy = true;
    const s = current();
    const outcome = isMe ? s.yes : s.no;
    card.classList.add('leaving');
    card.style.transform = `translateX(${isMe ? 140 : -140}%) rotate(${isMe ? 24 : -24}deg)`;
    card.style.opacity = '0';
    swipe(isMe);
    insight.textContent = outcome.finding;
    insight.className = `insight sev-${outcome.severity} show`;
    setTimeout(() => {
      busy = false;
      if (done()) {
        if (keyHandler) document.removeEventListener('keydown', keyHandler);
        renderLead();
      } else {
        layout();
      }
    }, 320);
  };

  const topCard = () => deck.querySelector<HTMLElement>('.swipe-card.top')!;
  noBtn.onclick = () => commit(false, topCard());
  yesBtn.onclick = () => commit(true, topCard());

  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = (e) => {
    if (e.key === 'ArrowLeft') commit(false, topCard());
    if (e.key === 'ArrowRight') commit(true, topCard());
  };
  document.addEventListener('keydown', keyHandler);

  function attachDrag(card: HTMLElement) {
    let startX = 0;
    let dx = 0;
    let dragging = false;
    const yesTag = card.querySelector<HTMLElement>('.stamp.yes')!;
    const noTag = card.querySelector<HTMLElement>('.stamp.no')!;

    card.addEventListener('pointerdown', (e) => {
      if (busy) return;
      dragging = true;
      startX = e.clientX;
      dx = 0;
      card.setPointerCapture(e.pointerId);
      card.classList.add('dragging');
    });
    card.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      yesTag.style.opacity = String(Math.max(0, Math.min(1, dx / THRESHOLD)));
      noTag.style.opacity = String(Math.max(0, Math.min(1, -dx / THRESHOLD)));
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('dragging');
      if (Math.abs(dx) >= THRESHOLD) {
        commit(dx > 0, card);
      } else {
        card.style.transform = '';
        yesTag.style.opacity = '0';
        noTag.style.opacity = '0';
      }
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
  }

  layout();
}

function cardFor(area: string, text: string, pos: 'top' | 'behind') {
  const card = el('div', `swipe-card ${pos}`);
  card.append(
    el('div', 'stamp yes', "That's me"),
    el('div', 'stamp no', 'Not me'),
    el('div', 'area-tag', area),
    el('div', 'statement', text),
  );
  return card;
}

function renderLead() {
  renderLeadForm(stage, {
    sub: 'Where should we send your fit score and program match?',
    note: "No spam — just your results and, if you want it, a free intro session.",
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);
      renderResult(stage, result, {
        eyebrow: 'Your Fit Readiness',
        titles: ['You\'re set up to win', 'A couple of things to plan around', 'Structure is your missing piece'],
        recLabel: 'Your best-fit program',
        ctaLabel: 'Claim a free intro session',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

renderIntro();
