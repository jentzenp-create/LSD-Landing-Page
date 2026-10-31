import { GAME_NAME, AREAS, SPINS, OFFER, type Area } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, nextLanding, answer, spinsLeft, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;
const SVG_NS = 'http://www.w3.org/2000/svg';
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SPIN_MS = REDUCED_MOTION ? 600 : 3200;
const SIZE = 280;
const C = SIZE / 2;
const R = C - 6;
const SLICE = 360 / AREAS.length;

let rotation = 0; // cumulative wheel rotation in degrees

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

/** Point on the wheel's rim, angle measured clockwise from 12 o'clock. */
function polar(deg: number, r = R) {
  const rad = (deg * Math.PI) / 180;
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) };
}

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const btn = el('button', 'btn-primary', 'Spin the wheel');
  btn.onclick = () => renderWheel();
  screen.append(
    el('div', 'eyebrow', `Aesthetics · ${SPINS} Spins`),
    el('h1', 'title', GAME_NAME),
    el('p', 'sub', `Spin ${SPINS} times. Each spin lands on an area — tell us how you feel about it. At the end, see your confidence score and the treatment that matches what you'd most like to refresh.`),
    btn,
  );
  stage.appendChild(screen);
}

function buildWheel() {
  const wrap = el('div', 'wheel-wrap');
  const pointer = el('div', 'wheel-pointer');
  const s = svg('svg', { viewBox: `0 0 ${SIZE} ${SIZE}`, class: 'wheel', role: 'img', 'aria-label': 'Spin wheel' });
  const spinner = svg('g', { class: 'spinner' });

  AREAS.forEach((area, i) => {
    const a0 = i * SLICE;
    const a1 = a0 + SLICE;
    const p0 = polar(a0);
    const p1 = polar(a1);
    const seg = svg('path', {
      d: `M ${C} ${C} L ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y} Z`,
      class: `segment${i % 2 ? ' alt' : ''}`,
      'data-id': area.id,
    });
    const mid = a0 + SLICE / 2;
    const lp = polar(mid, R * 0.62);
    const label = svg('text', {
      x: lp.x, y: lp.y, class: `segment-label${i % 2 ? ' alt' : ''}`, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      transform: `rotate(${mid} ${lp.x} ${lp.y})`, 'data-id': area.id,
    });
    label.textContent = area.name;
    spinner.append(seg, label);
  });

  spinner.appendChild(svg('circle', { cx: C, cy: C, r: R, class: 'rim' }));
  s.appendChild(spinner);
  s.appendChild(svg('circle', { cx: C, cy: C, r: 26, class: 'hub' }));
  const hubText = svg('text', { x: C, y: C, class: 'hub-text', 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
  hubText.textContent = '✦';
  s.appendChild(hubText);

  wrap.append(pointer, s);

  const markUsed = () => {
    run.landed.forEach((id) => {
      s.querySelectorAll(`[data-id="${id}"]`).forEach((n) => n.classList.add('used'));
    });
  };

  const spinTo = (area: Area) =>
    new Promise<void>((resolve) => {
      const i = AREAS.indexOf(area);
      // Rotate so the slice's middle (plus a little jitter) ends under the top pointer.
      const jitter = (Math.random() - 0.5) * SLICE * 0.6;
      const target = (360 - (i * SLICE + SLICE / 2 + jitter)) % 360;
      const delta = (((target - rotation) % 360) + 360) % 360;
      rotation += (REDUCED_MOTION ? 0 : 360 * 4) + delta;
      spinner.style.transitionDuration = `${SPIN_MS}ms`;
      spinner.style.transform = `rotate(${rotation}deg)`;
      setTimeout(resolve, SPIN_MS + 50);
    });

  // Keep the rotation from the previous spin when the wheel is rebuilt.
  spinner.style.transform = `rotate(${rotation}deg)`;
  markUsed();
  return { wrap, spinTo, markUsed };
}

function renderWheel() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const counter = el('div', 'counter', `Spin ${run.landed.length + 1} of ${SPINS}`);
  const wheel = buildWheel();
  const panel = el('div', 'spin-panel');
  const spinBtn = el('button', 'btn-primary', 'Spin');
  panel.appendChild(spinBtn);
  screen.append(counter, wheel.wrap, panel);
  stage.appendChild(screen);

  spinBtn.onclick = async () => {
    spinBtn.disabled = true;
    spinBtn.textContent = 'Spinning...';
    const area = nextLanding();
    await wheel.spinTo(area);
    wheel.markUsed();
    showQuestion(panel, area);
  };
  spinBtn.focus();
}

function showQuestion(panel: HTMLElement, area: Area) {
  panel.innerHTML = '';
  const card = el('div', 'reveal');
  card.append(el('div', 'area-tag', `You landed on · ${area.name}`), el('div', 'prompt', area.prompt));
  const answers = el('div', 'answers');
  area.answers.forEach((a, idx) => {
    const btn = el('button', 'answer-btn', a.label);
    btn.onclick = () => {
      if (answers.dataset.locked) return;
      answers.dataset.locked = '1';
      answers.querySelectorAll('button').forEach((b) => b !== btn && b.classList.add('dim'));
      btn.classList.add('picked');
      answer(area, idx);
      card.appendChild(el('p', 'reveal-finding', a.finding));
      const last = spinsLeft() === 0;
      const next = el('button', 'btn-primary', last ? 'See my results' : 'Spin again');
      next.onclick = () => (last ? renderLead() : renderWheel());
      card.appendChild(next);
      next.focus();
    };
    answers.appendChild(btn);
  });
  card.appendChild(answers);
  panel.appendChild(card);
  card.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'nearest' });
}

function renderLead() {
  renderLeadForm(stage, {
    sub: 'Where should we send your confidence score and treatment match?',
    note: 'No spam — just your results and, if you want one, a note to book a consultation.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      let extra: HTMLElement | undefined;
      if (OFFER) {
        extra = el('div', 'result-extra offer');
        extra.append(el('div', 'label', 'You unlocked'), el('div', 'value', OFFER));
      }
      renderResult(stage, result, {
        eyebrow: 'Your Confidence Score',
        titles: ["You're feeling great", "A couple of things you'd love to refresh", 'You know exactly what you want'],
        recLabel: 'Your treatment match',
        extra,
        ctaLabel: 'Book my consultation',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

renderIntro();
