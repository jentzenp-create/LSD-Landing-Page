import { GAME_NAME, PROJECTS, BUDGETS, TIMELINE, FINANCING, DECISION, type ChoiceGroup } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, project, currentEstimate, isComplete, liveScore, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, gaugeColor, renderLeadForm, renderResult } from '../_shared/ui';

const stage = document.getElementById('stage')!;
const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

function renderIntro() {
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const btn = el('button', 'btn-primary', 'Build my estimate');
  btn.onclick = () => renderCalculator();
  screen.append(
    el('div', 'eyebrow', 'Home Projects · 60 Seconds'),
    el('h1', 'title', GAME_NAME),
    el('p', 'sub', 'Pick your project, slide in a few details, and watch your ballpark price build in real time. Finish with a project-fit score and what to sort out before you call a contractor.'),
    btn,
  );
  stage.appendChild(screen);
}

/** Animates a number from its last shown value to `to`. */
function tween(node: HTMLElement, key: string, to: number, render: (n: number) => string) {
  const from = Number(node.dataset[key] ?? to);
  node.dataset[key] = String(to);
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 350);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = render(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderCalculator() {
  stage.innerHTML = '';
  const screen = el('div', 'screen calc');

  // Sticky live readout
  const panel = el('div', 'estimate-panel');
  const estLabel = el('div', 'est-label', 'Ballpark estimate');
  const estRange = el('div', 'est-range', 'Pick a project');
  const fitRow = el('div', 'fit-row');
  const fitLabel = el('span', 'fit-label', 'Project fit');
  const fitTrack = el('div', 'fit-track');
  const fitFill = el('div', 'fit-fill');
  fitTrack.appendChild(fitFill);
  const fitValue = el('span', 'fit-value', '—');
  fitRow.append(fitLabel, fitTrack, fitValue);
  panel.append(estLabel, estRange, fitRow);

  const submit = el('button', 'btn-primary', 'Get my project report');
  submit.disabled = true;
  submit.onclick = () => renderLead();

  const refresh = () => {
    const est = currentEstimate();
    if (est) {
      const lo = estRange.querySelector<HTMLElement>('.lo') ?? (() => {
        estRange.innerHTML = '<span class="lo"></span> – <span class="hi"></span>';
        return estRange.querySelector<HTMLElement>('.lo')!;
      })();
      tween(lo, 'v', est[0], fmt);
      tween(estRange.querySelector<HTMLElement>('.hi')!, 'v', est[1], fmt);
    }
    const score = liveScore();
    if (score === undefined) {
      fitFill.style.width = '0%';
      fitValue.textContent = '—';
    } else {
      fitFill.style.width = `${score}%`;
      fitFill.style.background = gaugeColor(score);
      tween(fitValue, 'v', score, (n) => String(Math.round(n)));
    }
    submit.disabled = !isComplete();
    ageLabel.textContent = project()?.ageLabel ?? 'Home age';
    ageSlider.querySelector('input')!.setAttribute('aria-label', ageLabel.textContent);
  };

  // Project type
  const projectGroup = chipGroup('What\'s the project?', PROJECTS.map((p) => ({ id: p.id, label: p.label })), run.projectId, (id) => {
    run.projectId = id;
    refresh();
  });

  // Sliders
  const sizeSlider = slider('Home size', 800, 5000, 100, run.sqft, (v) => `${v.toLocaleString('en-US')} sq ft`, (v) => { run.sqft = v; refresh(); });
  const ageSlider = slider('Home age', 0, 60, 1, run.age, (v) => (v >= 60 ? '60+ yrs' : `${v} yrs`), (v) => { run.age = v; refresh(); });
  const ageLabel = ageSlider.querySelector<HTMLElement>('.field-label')!;

  const budgetGroup = chipGroup('Budget you had in mind', BUDGETS.map((b) => ({ id: b.id, label: b.label })), run.budgetId, (id) => {
    run.budgetId = id;
    refresh();
  });

  const groups = [TIMELINE, FINANCING, DECISION].map((g: ChoiceGroup) =>
    chipGroup(g.prompt, g.choices.map((c) => ({ id: c.id, label: c.label })), run.picks[g.id], (id) => {
      run.picks[g.id] = id;
      refresh();
    }),
  );

  const form = el('div', 'calc-fields');
  form.append(projectGroup, sizeSlider, ageSlider, budgetGroup, ...groups);

  const hint = el('p', 'skip-note', 'Answer everything to unlock your fit score.');
  screen.append(panel, form, submit, hint);
  stage.appendChild(screen);
  refresh();
}

function chipGroup(label: string, options: { id: string; label: string }[], selected: string | undefined, onPick: (id: string) => void) {
  const wrap = el('div', 'field');
  wrap.appendChild(el('div', 'field-label', label));
  const row = el('div', 'chips');
  row.setAttribute('role', 'radiogroup');
  row.setAttribute('aria-label', label);
  options.forEach((o) => {
    const chip = el('button', 'chip', o.label);
    chip.type = 'button';
    chip.setAttribute('role', 'radio');
    chip.setAttribute('aria-checked', String(o.id === selected));
    if (o.id === selected) chip.classList.add('on');
    chip.onclick = () => {
      row.querySelectorAll('.chip').forEach((c) => { c.classList.remove('on'); c.setAttribute('aria-checked', 'false'); });
      chip.classList.add('on');
      chip.setAttribute('aria-checked', 'true');
      onPick(o.id);
    };
    row.appendChild(chip);
  });
  wrap.appendChild(row);
  return wrap;
}

function slider(label: string, min: number, max: number, step: number, value: number, show: (v: number) => string, onChange: (v: number) => void) {
  const wrap = el('div', 'field');
  const head = el('div', 'field-head');
  const lab = el('div', 'field-label', label);
  const val = el('div', 'field-value', show(value));
  head.append(lab, val);
  const input = el('input', 'range');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute('aria-label', label);
  const paint = () => {
    const pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--pct', `${pct}%`);
  };
  paint();
  input.oninput = () => {
    const v = Number(input.value);
    val.textContent = show(v);
    paint();
    onChange(v);
  };
  wrap.append(head, input);
  return wrap;
}

function renderLead() {
  renderLeadForm(stage, {
    sub: 'Where should we send your estimate and project report?',
    note: 'No spam — just your numbers and, if it\'s a fit, a note from a local pro.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const est = currentEstimate()!;
      const extra = el('div', 'result-extra');
      extra.append(
        el('div', 'label', `${project()!.label} · ${run.sqft.toLocaleString('en-US')} sq ft`),
        el('div', 'value', `${fmt(est[0])} – ${fmt(est[1])}`),
        el('div', 'note', 'Ballpark from national averages for a home your size. Your real quote depends on materials, access, and local pricing.'),
      );

      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
        eyebrow: 'Your Project Fit Score',
        titles: ['You\'re ready to get quotes', 'Close — a few things to line up', 'Sort these out before you call'],
        recLabel: 'Best next step',
        extra,
        ctaLabel: 'Book a free estimate',
        ctaSubject: `${GAME_NAME} - My Project`,
      });
    },
  });
}

renderIntro();
