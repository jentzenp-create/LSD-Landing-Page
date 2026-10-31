import { GAME_NAME, STOPS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, answer, advance, done, severityAt, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;
const SVG_NS = 'http://www.w3.org/2000/svg';
// One winding road; the stops and the "home" destination sit at even intervals along it.
const ROAD = 'M 24 168 C 96 168 64 96 132 96 C 200 96 176 36 244 36 C 316 36 292 128 336 128';
const SEV_COLOR = ['#2ecc71', '#f2b705', '#ff5c5c'];

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const btn = el('button', 'btn-primary', 'Start the journey');
  btn.onclick = () => renderJourney();
  screen.append(
    el('div', 'eyebrow', `Home Buying · ${STOPS.length} Stops`),
    el('h1', 'title', GAME_NAME),
    el('p', 'sub', 'Travel the road from "thinking about it" to "keys in hand." Six stops, one quick question at each. At the end you get a readiness score and the one thing that will speed up your search most.'),
    btn,
  );
  stage.appendChild(screen);
}

interface MapView {
  root: HTMLElement;
  moveTo: (stopIndex: number) => Promise<void>;
  refresh: () => void;
}

function buildMap(): MapView {
  const root = el('div', 'map');
  const s = svg('svg', { viewBox: '0 0 360 200', role: 'img', 'aria-label': 'Journey map' });
  const road = svg('path', { d: ROAD, class: 'road' });
  const traveled = svg('path', { d: ROAD, class: 'road-traveled' });
  s.append(road, traveled);
  root.appendChild(s);
  // Path measuring needs the SVG in the document; the caller moves `root` into place after.
  document.body.appendChild(root);

  const total = road.getTotalLength();
  const points = STOPS.length; // stops 0..n-1, plus home at the very end
  const lenAt = (i: number) => (total * i) / points;
  traveled.setAttribute('stroke-dasharray', `${total} ${total}`);
  traveled.setAttribute('stroke-dashoffset', String(total));

  const nodes = STOPS.map((stop, i) => {
    const p = road.getPointAtLength(lenAt(i));
    const g = svg('g', { class: 'stop' });
    const dot = svg('circle', { cx: p.x, cy: p.y, r: 9, class: 'stop-dot' });
    const label = svg('text', { x: p.x, y: p.y + 24, class: 'stop-label', 'text-anchor': 'middle' });
    label.textContent = stop.name;
    g.append(dot, label);
    s.appendChild(g);
    return { g, dot };
  });

  const end = road.getPointAtLength(total);
  const home = svg('text', { x: end.x, y: end.y + 7, class: 'home-icon', 'text-anchor': 'middle' });
  home.textContent = '🏡';
  s.appendChild(home);

  const start = road.getPointAtLength(0);
  const token = svg('circle', { cx: start.x, cy: start.y, r: 7, class: 'token' });
  s.appendChild(token);

  let at = 0;
  const place = (len: number) => {
    const p = road.getPointAtLength(len);
    token.setAttribute('cx', String(p.x));
    token.setAttribute('cy', String(p.y));
    traveled.setAttribute('stroke-dashoffset', String(total - len));
  };

  const refresh = () => {
    nodes.forEach(({ g, dot }, i) => {
      const sev = severityAt(i);
      g.classList.toggle('current', i === run.index);
      dot.style.fill = sev === undefined ? '' : SEV_COLOR[sev];
      dot.style.stroke = sev === undefined ? '' : SEV_COLOR[sev];
    });
  };

  const moveTo = (stopIndex: number) =>
    new Promise<void>((resolve) => {
      const from = lenAt(at);
      const to = stopIndex >= points ? total : lenAt(stopIndex);
      at = stopIndex;
      const t0 = performance.now();
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        place(to);
        resolve();
      };
      const step = (now: number) => {
        if (finished) return;
        const t = Math.min(1, (now - t0) / 750);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        place(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(step);
        else finish();
      };
      requestAnimationFrame(step);
      // rAF doesn't run in background tabs; never leave the player stuck mid-drive.
      setTimeout(finish, 850);
    });

  return { root, moveTo, refresh };
}

function renderJourney() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const map = buildMap();
  const panel = el('div', 'stop-panel');
  screen.append(map.root, panel);
  stage.appendChild(screen);

  const showStop = () => {
    map.refresh();
    const stop = current();
    panel.innerHTML = '';
    panel.classList.remove('enter');
    void panel.offsetWidth; // restart the entrance animation
    panel.classList.add('enter');
    panel.append(
      el('div', 'area-tag', `Stop ${run.index + 1} of ${STOPS.length} · ${stop.name}`),
      el('div', 'prompt', stop.prompt),
    );
    const answers = el('div', 'answers');
    stop.answers.forEach((a, idx) => {
      const btn = el('button', 'answer-btn', a.label);
      btn.onclick = async () => {
        if (answers.dataset.locked) return;
        answers.dataset.locked = '1';
        answers.querySelectorAll('button').forEach((b) => b !== btn && b.classList.add('dim'));
        btn.classList.add('picked', `sev-${a.severity}`);
        answer(idx);
        map.refresh();

        const note = el('p', `stop-finding sev-${a.severity}`, a.finding);
        panel.appendChild(note);
        const next = el('button', 'btn-primary', run.index === STOPS.length - 1 ? 'Arrive home' : 'Drive to the next stop');
        next.onclick = async () => {
          next.disabled = true;
          advance();
          await map.moveTo(run.index);
          if (done()) renderLead();
          else showStop();
        };
        panel.appendChild(next);
        next.focus();
      };
      answers.appendChild(btn);
    });
    panel.appendChild(answers);
  };

  showStop();
}

function renderLead() {
  renderLeadForm(stage, {
    title: "You've arrived",
    sub: 'Where should we send your readiness score and next steps?',
    note: 'No spam — just your results and, if you want it, a note from a local agent.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);
      renderResult(stage, result, {
        eyebrow: 'Your Home Readiness',
        titles: ["You're ready to tour", 'Almost there — a couple of stops to revisit', "Let's build your game plan first"],
        recLabel: 'Fastest way forward',
        ctaLabel: 'Talk to an agent',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

renderIntro();
