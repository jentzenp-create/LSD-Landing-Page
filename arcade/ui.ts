// HTML interface drawn over the 3D canvas: HUD, title, business picker,
// dialogs and touch buttons. Sizes use container units (cqw) so everything
// scales with the game frame, from a small Gatherly booth to a full screen.
import { INDUSTRIES, type Industry } from './content';
import { MAX_HEARTS } from './config';
import type { Input } from './engine/input';
import * as sfx from './sfx';

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export class UI {
  private root: HTMLElement;
  private hud: HTMLElement;
  private hearts: HTMLElement;
  private count: HTMLElement;
  private meterLabel: HTMLElement;
  private meterFill: HTMLElement;
  private score: HTMLElement;
  private boss: HTMLElement;
  private keyHandler?: (e: KeyboardEvent) => void;

  constructor(stage: HTMLElement) {
    this.root = el('div', 'ui');
    stage.appendChild(this.root);

    this.hud = el('div', 'hud');
    this.hearts = el('div', 'hearts');
    const countWrap = el('div', 'count');
    countWrap.innerHTML = '<span class="star-icon">&#9733;</span>';
    this.count = el('span');
    countWrap.appendChild(this.count);
    const meter = el('div', 'meter');
    this.meterLabel = el('span', 'meter-label');
    const bar = el('div', 'meter-bar');
    this.meterFill = el('div', 'meter-fill');
    bar.appendChild(this.meterFill);
    meter.append(this.meterLabel, bar);
    this.score = el('div', 'score');
    const sound = el('button', 'sound');
    sound.type = 'button';
    sound.tabIndex = -1;
    const renderSound = (m: boolean) => (sound.textContent = m ? 'Sound off' : 'Sound on');
    renderSound(sfx.isMuted());
    sfx.onMuteChange(renderSound);
    sound.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.toggleMute();
    });
    this.hud.append(this.hearts, countWrap, meter, this.score, sound);
    this.root.appendChild(this.hud);

    this.boss = el('div', 'boss-bar');
    this.boss.hidden = true;
    this.root.appendChild(this.boss);
  }

  // ---------------------------------------------------------------- HUD

  setHud(s: { hearts: number; count: string; meterLabel: string; meter: number; score: string }) {
    this.hearts.innerHTML = Array.from({ length: MAX_HEARTS }, (_, i) => `<span class="${i < s.hearts ? 'on' : 'off'}">&#10084;</span>`).join('');
    this.count.textContent = s.count;
    this.meterLabel.textContent = s.meterLabel;
    this.meterFill.style.width = `${Math.round(s.meter * 100)}%`;
    this.score.textContent = s.score;
  }

  showHud(on: boolean) {
    this.hud.hidden = !on;
  }

  setBoss(name: string | null, hp = 0, max = 0) {
    this.boss.hidden = !name;
    if (!name) return;
    this.boss.innerHTML = `<div class="boss-name">${esc(name)}</div><div class="boss-hp">${Array.from({ length: max }, (_, i) => `<span class="${i < hp ? 'on' : ''}"></span>`).join('')}</div>`;
  }

  // ---------------------------------------------------------------- screens

  showTitle(onStart: () => void) {
    const t = el(
      'div',
      'title-screen',
      `<div class="title-card">
        <div class="logo"><span class="l1">Bottleneck</span><span class="l2">Busters</span></div>
        <p class="tagline">Find what's slowing your business down</p>
        <p class="press">Click or press any key to play</p>
      </div>
      <div class="credit">A Local Sun Digital arcade</div>`,
    );
    this.root.appendChild(t);
    let done = false;
    const start = (e: Event) => {
      if (done) return;
      if (e instanceof KeyboardEvent && e.key.toLowerCase() === 'm') return;
      if (e.target instanceof HTMLElement && e.target.closest('.sound')) return;
      done = true;
      window.removeEventListener('keydown', start);
      this.root.removeEventListener('pointerdown', start);
      t.remove();
      onStart();
    };
    window.addEventListener('keydown', start);
    this.root.addEventListener('pointerdown', start);
    return () => {
      if (done) return;
      done = true;
      window.removeEventListener('keydown', start);
      this.root.removeEventListener('pointerdown', start);
      t.remove();
    };
  }

  /** "Choose your business" — also the first diagnostic question. */
  chooseIndustry(): Promise<Industry> {
    return new Promise((resolve) => {
      const s = el('div', 'screen select-screen');
      s.innerHTML = `<h1>What kind of business do you run?</h1><p class="sub">Your levels adapt to where your customers come from.</p>`;
      const grid = el('div', 'select-grid');
      const cards = INDUSTRIES.map((ind, i) => {
        const b = el('button', 'select-card', `<strong>${esc(ind.label)}</strong><span>${esc(ind.examples)}</span>`);
        b.type = 'button';
        b.tabIndex = -1;
        b.addEventListener('pointerenter', () => select(i));
        b.addEventListener('click', () => {
          select(i);
          confirm();
        });
        grid.appendChild(b);
        return b;
      });
      s.appendChild(grid);
      s.appendChild(el('p', 'hint', 'Arrow keys + Space, or tap'));
      this.root.appendChild(s);

      let selected = 0;
      let done = false;
      const render = () => cards.forEach((c, i) => c.classList.toggle('active', i === selected));
      const select = (i: number) => {
        if (done || i === selected) return;
        selected = i;
        sfx.play('select');
        render();
      };
      const confirm = () => {
        if (done) return;
        done = true;
        this.clearKeys();
        sfx.play('power');
        s.classList.add('leaving');
        setTimeout(() => s.remove(), 250);
        resolve(INDUSTRIES[selected].id);
      };
      render();
      setTimeout(
        () =>
          this.setKeys((e) => {
            const k = e.key.toLowerCase();
            if (k === 'arrowright' || k === 'd') select((selected + 1) % 4);
            else if (k === 'arrowleft' || k === 'a') select((selected + 3) % 4);
            else if (k === 'arrowdown' || k === 's') select((selected + 2) % 4);
            else if (k === 'arrowup' || k === 'w') select((selected + 2) % 4);
            else if (k === ' ' || k === 'enter') confirm();
          }),
        250,
      );
    });
  }

  introCard(kicker: string, title: string, text: string, ms = 2800): Promise<void> {
    const c = el('div', 'screen intro-card', `<div class="kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(text)}</p><p class="hint">Arrows / WASD to move &middot; Space to jump</p>`);
    this.root.appendChild(c);
    return new Promise((resolve) =>
      setTimeout(() => {
        c.classList.add('leaving');
        setTimeout(() => {
          c.remove();
          resolve();
        }, 300);
      }, ms),
    );
  }

  banner(text: string, ms = 0) {
    const b = el('div', 'banner', esc(text));
    this.root.appendChild(b);
    if (ms) setTimeout(() => b.remove(), ms);
    return b;
  }

  floatLabel(text: string, pos: { left: number; top: number }, kind: 'score' | 'gold' | 'red' = 'score') {
    const f = el('div', `float ${kind}`, esc(text));
    f.style.left = `${pos.left}%`;
    f.style.top = `${pos.top}%`;
    this.root.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }

  // ---------------------------------------------------------------- dialogs

  private setKeys(fn: (e: KeyboardEvent) => void) {
    this.clearKeys();
    this.keyHandler = fn;
    window.addEventListener('keydown', fn);
  }

  private clearKeys() {
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
    this.keyHandler = undefined;
  }

  ask(header: string, prompt: string, options: string[]): Promise<number> {
    return new Promise((resolve) => {
      const d = el('div', 'dialog-wrap');
      const box = el('div', 'dialog', `<div class="dialog-header">${esc(header)}</div><div class="dialog-text">${esc(prompt)}</div>`);
      const list = el('div', 'options');
      const buttons = options.map((label, i) => {
        const b = el('button', 'option', `<span class="num">${i + 1}</span>${esc(label)}`);
        b.type = 'button';
        b.tabIndex = -1;
        b.addEventListener('pointerenter', () => select(i));
        b.addEventListener('click', () => {
          select(i);
          confirm();
        });
        list.appendChild(b);
        return b;
      });
      box.appendChild(list);
      box.appendChild(el('div', 'hint', 'Arrows + Space, 1-3, or tap'));
      d.appendChild(box);
      this.root.appendChild(d);

      let selected = 0;
      let done = false;
      const render = () => buttons.forEach((b, i) => b.classList.toggle('active', i === selected));
      const select = (i: number) => {
        if (done || i === selected) return;
        selected = i;
        sfx.play('select');
        render();
      };
      const confirm = () => {
        if (done) return;
        done = true;
        this.clearKeys();
        sfx.play('power');
        buttons[selected].classList.add('chosen');
        setTimeout(() => {
          d.remove();
          resolve(selected);
        }, 350);
      };
      render();
      // Short delay so the jump press that bumped the block doesn't instantly confirm.
      setTimeout(
        () =>
          this.setKeys((e) => {
            const k = e.key.toLowerCase();
            if (k === 'arrowup' || k === 'w') select((selected + buttons.length - 1) % buttons.length);
            else if (k === 'arrowdown' || k === 's') select((selected + 1) % buttons.length);
            else if (k === ' ' || k === 'enter') confirm();
            else if (/^[1-9]$/.test(k) && Number(k) <= buttons.length) {
              select(Number(k) - 1);
              confirm();
            }
          }),
        300,
      );
    });
  }

  say(speaker: string, line: string, autoMs = 7000): Promise<void> {
    return new Promise((resolve) => {
      const d = el('div', 'dialog-wrap');
      d.innerHTML = `<div class="dialog speech"><div class="dialog-header">${esc(speaker)}</div><div class="dialog-text">${esc(line).replace(/\n/g, '<br>')}</div><div class="next">Next &#9654;</div></div>`;
      this.root.appendChild(d);
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.clearKeys();
        d.removeEventListener('pointerdown', finish);
        clearTimeout(timer);
        sfx.play('select');
        d.remove();
        resolve();
      };
      const timer = setTimeout(finish, autoMs);
      setTimeout(() => {
        if (done) return;
        this.setKeys((e) => {
          if ([' ', 'enter', 'arrowright', 'z'].includes(e.key.toLowerCase())) finish();
        });
        d.addEventListener('pointerdown', finish);
      }, 350);
    });
  }

  // ---------------------------------------------------------------- touch

  enableTouch(input: Input) {
    if (!window.matchMedia?.('(pointer: coarse)').matches) return;
    const pad = el('div', 'touch');
    const mk = (cls: string, label: string, key: keyof Input['touch']) => {
      const b = el('div', `tbtn ${cls}`, label);
      const on = (e: PointerEvent) => {
        e.preventDefault();
        b.setPointerCapture?.(e.pointerId);
        input.touch[key] = true;
        b.classList.add('down');
      };
      const off = () => {
        input.touch[key] = false;
        b.classList.remove('down');
      };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('lostpointercapture', off);
      return b;
    };
    pad.append(mk('left', '&#9664;', 'left'), mk('right', '&#9654;', 'right'), mk('jump', 'Jump', 'jump'));
    this.root.appendChild(pad);
  }
}
