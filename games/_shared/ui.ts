// The screens every game ends on, whatever its mechanic: lead capture, then a
// scored result. Pair with _shared/base.css.
import type { Contact, GameResult } from './types';

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export interface LeadFormOptions {
  title?: string;
  sub: string;
  note: string;
  submitLabel?: string;
  onSubmit: (contact: Contact) => Promise<void>;
}

export function renderLeadForm(stage: HTMLElement, opts: LeadFormOptions) {
  stage.innerHTML = '';
  const screen = el('div', 'screen');

  const title = el('h1', 'title', opts.title ?? 'Almost there');
  const sub = el('p', 'sub', opts.sub);

  const form = el('form', 'lead-form');
  const firstName = el('input'); firstName.placeholder = 'First name'; firstName.required = true; firstName.name = 'firstName'; firstName.autocomplete = 'given-name';
  const email = el('input'); email.placeholder = 'Email'; email.type = 'email'; email.required = true; email.name = 'email'; email.autocomplete = 'email';
  const phone = el('input'); phone.placeholder = 'Phone (optional)'; phone.type = 'tel'; phone.name = 'phone'; phone.autocomplete = 'tel';
  const submit = el('button', 'btn-primary', opts.submitLabel ?? 'Show my results');
  submit.type = 'submit';

  form.append(firstName, email, phone, submit);
  form.onsubmit = async (e) => {
    e.preventDefault();
    submit.textContent = 'Scoring...';
    submit.setAttribute('disabled', 'true');
    await opts.onSubmit({
      firstName: firstName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || undefined,
    });
  };

  screen.append(title, sub, form, el('p', 'skip-note', opts.note));
  stage.appendChild(screen);
  firstName.focus();
}

export function gaugeColor(score: number) {
  if (score >= 75) return '#2ecc71';
  if (score >= 45) return '#f2b705';
  return '#ff5c5c';
}

export function renderGauge(score: number): HTMLElement {
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

export interface ResultOptions {
  eyebrow: string;
  /** Headline per score band: [>=75, >=45, below]. */
  titles: [string, string, string];
  recLabel?: string;
  /** Extra mechanic-specific block shown under the headline (estimate, tier, etc.). */
  extra?: HTMLElement;
  ctaLabel: string;
  ctaSubject: string;
}

export function renderResult(stage: HTMLElement, result: GameResult, opts: ResultOptions) {
  stage.innerHTML = '';
  const screen = el('div', 'screen');

  screen.appendChild(el('div', 'eyebrow', opts.eyebrow));
  screen.appendChild(renderGauge(result.score));

  const band = result.score >= 75 ? 0 : result.score >= 45 ? 1 : 2;
  screen.appendChild(el('h1', 'title', opts.titles[band]));
  if (opts.extra) screen.appendChild(opts.extra);

  if (result.topRecommendation) {
    const rec = el('div', 'recommendation');
    rec.appendChild(el('div', 'label', opts.recLabel ?? 'Your biggest opportunity'));
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

  const cta = el('a', 'btn-primary', opts.ctaLabel);
  cta.href = `mailto:jentzen@localsundigital.com?subject=${encodeURIComponent(opts.ctaSubject)}`;
  screen.appendChild(cta);

  stage.appendChild(screen);
  window.scrollTo(0, 0);
}
