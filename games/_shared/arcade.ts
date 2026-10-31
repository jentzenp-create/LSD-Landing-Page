// The arcade kit every canvas game is built on: a fixed-size logical canvas that
// scales to fit, a frame loop, keyboard/touch input, the question pop-up that pauses
// play, and the end-of-run screen. Mechanic code (bricks, mazes, lanes) stays in each
// game's own folder. Pair with _shared/arcade.css.
import { el } from './ui';
import type { Severity } from './types';

/** Logical canvas size. Every game draws in this space; CSS scales it to fit. */
export const W = 360;
export const H = 540;

/** ?thumb renders a single still frame for the /arcade hub's screenshot. */
export const THUMB = new URLSearchParams(window.location.search).has('thumb');
if (THUMB) document.documentElement.classList.add('thumb');

/** Dev-only ?auto: a bot plays and answers at random, for end-to-end play-testing. */
export const AUTO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('auto');

/** Dev-only: exposes a game's live state as window.__arcade() for play-testing. */
export function exposeDebug(read: () => Record<string, unknown>) {
  if (import.meta.env.DEV) (window as unknown as { __arcade: typeof read }).__arcade = read;
}

export const GOLD = '#F2B705';
export const GOLD_LIGHT = '#FFD84D';
export const INK = '#0B0D17';
export const SEV_COLOR = ['#2ecc71', '#f2b705', '#ff5c5c'];

export interface Arena {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Converts a pointer event to logical canvas coordinates. */
  toLocal: (e: { clientX: number; clientY: number }) => { x: number; y: number };
}

/** Clears the stage and mounts a scaled canvas with room for a question overlay. */
export function createArena(stage: HTMLElement): Arena {
  stage.innerHTML = '';
  stage.classList.add('playing');
  const root = el('div', 'arena');
  const canvas = el('canvas', 'arena-canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  root.appendChild(canvas);
  stage.appendChild(root);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const toLocal = (e: { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  return { root, canvas, ctx, toLocal };
}

/** Leaves canvas mode so the shared DOM screens (lead form, result) lay out normally. */
export function leaveArena(stage: HTMLElement) {
  stage.classList.remove('playing');
}

/**
 * Runs `frame(dt)` every animation frame, dt in seconds (clamped so a tab switch
 * doesn't teleport anything). Pausing is the game's job: skip updates while a
 * question is open. rAF stopping in background tabs is fine here — nothing waits on it.
 */
export function startLoop(frame: (dt: number) => void) {
  let last = performance.now();
  let id = 0;
  let running = true;
  if (AUTO) {
    // Bot play-tests run in hidden panes too, where rAF stops: catch up on real time with timers.
    const timer = window.setInterval(() => {
      const now = performance.now();
      let left = Math.min(1, (now - last) / 1000);
      last = now;
      while (running && left > 0) {
        const dt = Math.min(1 / 60, left);
        frame(dt);
        left -= dt;
      }
    }, 16);
    return { stop() { running = false; clearInterval(timer); } };
  }
  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frame(dt);
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return {
    stop() {
      running = false;
      cancelAnimationFrame(id);
    },
  };
}

export type Dir = 'up' | 'down' | 'left' | 'right';

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export interface Controls {
  /** Keys currently held, by KeyboardEvent.code. */
  held: Set<string>;
  isHeld: (dir: Dir) => boolean;
  dispose: () => void;
}

/**
 * Keyboard + touch input. `onDir` fires on arrow/WASD presses and on swipes;
 * `onAction` on Space/Enter and on taps (a touch that didn't move far).
 * Input is ignored while a question overlay is open.
 */
export function controls(arena: Arena, handlers: {
  onDir?: (d: Dir) => void;
  onAction?: (pos: { x: number; y: number }) => void;
  onPointer?: (pos: { x: number; y: number }, down: boolean) => void;
}): Controls {
  const held = new Set<string>();
  const blocked = () => !!arena.root.querySelector('.ask');

  const onKey = (e: KeyboardEvent) => {
    if (blocked()) return;
    const dir = KEY_DIR[e.code];
    if (dir || e.code === 'Space') e.preventDefault();
    if (!held.has(e.code)) {
      if (dir) handlers.onDir?.(dir);
      if (e.code === 'Space' || e.code === 'Enter') handlers.onAction?.({ x: W / 2, y: H / 2 });
    }
    held.add(e.code);
  };
  const onKeyUp = (e: KeyboardEvent) => held.delete(e.code);

  let start: { x: number; y: number; t: number } | null = null;
  const c = arena.canvas;
  const down = (e: PointerEvent) => {
    if (blocked()) return;
    const p = arena.toLocal(e);
    start = { ...p, t: performance.now() };
    c.setPointerCapture?.(e.pointerId);
    handlers.onPointer?.(p, true);
  };
  const move = (e: PointerEvent) => {
    if (blocked()) return;
    if (start || e.pointerType === 'mouse') handlers.onPointer?.(arena.toLocal(e), !!start);
  };
  const up = (e: PointerEvent) => {
    if (!start || blocked()) { start = null; return; }
    const p = arena.toLocal(e);
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 24) {
      handlers.onDir?.(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    } else {
      handlers.onAction?.(p);
    }
    start = null;
  };

  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKeyUp);
  c.addEventListener('pointerdown', down);
  c.addEventListener('pointermove', move);
  c.addEventListener('pointerup', up);
  c.addEventListener('pointercancel', () => (start = null));

  return {
    held,
    isHeld: (dir) => [...held].some((k) => KEY_DIR[k] === dir),
    dispose() {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}

export interface AskOptions {
  /** Small label above the question, e.g. "Stop 2 of 6 · Budget". */
  tag: string;
  prompt: string;
  answers: string[];
  /** What to show once they pick; omit to close straight away. */
  finding?: (idx: number) => { text: string; severity: Severity };
  continueLabel?: string;
  /** Optional countdown (trivia). Resolves with -1 if it runs out. */
  seconds?: number;
}

/**
 * Pauses play with a question card over the canvas. Resolves with the picked
 * answer index (or -1 on timeout) after the player reads the finding.
 * Keys 1-9 pick an answer; Enter continues.
 */
export function ask(arena: Arena, opts: AskOptions): Promise<{ idx: number; secondsLeft: number }> {
  return new Promise((resolve) => {
    const wrap = el('div', 'ask');
    const card = el('div', 'ask-card');
    card.append(el('div', 'ask-tag', opts.tag), el('div', 'ask-prompt', opts.prompt));
    const list = el('div', 'ask-answers');
    const buttons = opts.answers.map((label, i) => {
      const b = el('button', 'ask-answer');
      b.append(el('span', 'ask-key', String(i + 1)), document.createTextNode(label));
      b.onclick = () => pick(i);
      list.appendChild(b);
      return b;
    });
    card.appendChild(list);

    let picked = false;
    let secondsLeft = 0;
    let timerBar: HTMLElement | undefined;
    let deadline = 0;
    let raf = 0;
    let timeout = 0;
    if (opts.seconds) {
      const track = el('div', 'ask-timer');
      timerBar = el('div', 'ask-timer-fill');
      track.appendChild(timerBar);
      card.insertBefore(track, list);
      deadline = performance.now() + opts.seconds * 1000;
      const tick = () => {
        const left = Math.max(0, deadline - performance.now());
        timerBar!.style.width = `${(left / (opts.seconds! * 1000)) * 100}%`;
        if (left > 0 && !picked) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      // rAF pauses in background tabs; the deadline must still fire.
      timeout = window.setTimeout(() => pick(-1), opts.seconds * 1000);
    }

    wrap.appendChild(card);
    arena.root.appendChild(wrap);
    buttons[0]?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!picked && n >= 1 && n <= buttons.length) { e.preventDefault(); pick(n - 1); }
    };
    window.addEventListener('keydown', onKey);

    function close(idx: number) {
      window.removeEventListener('keydown', onKey);
      wrap.remove();
      resolve({ idx, secondsLeft });
    }

    function pick(idx: number) {
      if (picked) return;
      picked = true;
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      secondsLeft = opts.seconds ? Math.max(0, (deadline - performance.now()) / 1000) : 0;
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (i !== idx) b.classList.add('dim');
      });
      if (idx >= 0) buttons[idx].classList.add('picked');
      if (!opts.finding) return close(idx);
      const f = opts.finding(idx);
      const note = el('p', `ask-finding sev-${f.severity}`, f.text);
      const next = el('button', 'btn-primary ask-next', opts.continueLabel ?? 'Keep playing');
      next.onclick = () => close(idx);
      card.append(note, next);
      next.focus({ preventScroll: true });
      if (AUTO) setTimeout(() => next.click(), 250);
    }
    if (AUTO) setTimeout(() => pick(Math.floor(Math.random() * buttons.length)), 250);
  });
}

/** A short "+50" style floater: push into a list, draw with drawFloaters each frame. */
export interface Floater { x: number; y: number; text: string; color: string; t: number }

export function drawFloaters(ctx: CanvasRenderingContext2D, list: Floater[], dt: number) {
  for (let i = list.length - 1; i >= 0; i--) {
    const f = list[i];
    f.t += dt;
    if (f.t > 0.9) { list.splice(i, 1); continue; }
    ctx.globalAlpha = 1 - f.t / 0.9;
    ctx.fillStyle = f.color;
    ctx.font = '800 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y - f.t * 40);
  }
  ctx.globalAlpha = 1;
}

/** Top bar every game shares: points on the left, progress pips on the right. */
export function drawHud(ctx: CanvasRenderingContext2D, points: number, done: number, total: number, label = 'PTS') {
  ctx.fillStyle = 'rgba(11,13,23,0.78)';
  ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = GOLD;
  ctx.font = '900 16px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const num = String(points).padStart(5, '0');
  ctx.fillText(num, 12, 17);
  const numW = ctx.measureText(num).width;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '700 10px Inter, sans-serif';
  ctx.fillText(label, 12 + numW + 6, 18);
  const r = 5;
  for (let i = 0; i < total; i++) {
    const x = W - 14 - (total - 1 - i) * 15;
    ctx.beginPath();
    ctx.arc(x, 17, r, 0, Math.PI * 2);
    ctx.fillStyle = i < done ? GOLD : 'rgba(255,255,255,0.15)';
    ctx.fill();
  }
  ctx.textBaseline = 'alphabetic';
}

/** Big centered text with a soft shadow, for "GO!", "STAGE CLEAR", etc. */
export function banner(ctx: CanvasRenderingContext2D, text: string, sub?: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, H / 2 - 46, W, sub ? 92 : 70);
  ctx.fillStyle = GOLD;
  ctx.font = '900 30px Inter, sans-serif';
  ctx.fillText(text, W / 2, H / 2 + (sub ? -4 : 10));
  if (sub) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 13px Inter, sans-serif';
    ctx.fillText(sub, W / 2, H / 2 + 24);
  }
  ctx.globalAlpha = 1;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Intro screen: title, how to play, start button. Any key also starts. */
export function renderIntro(stage: HTMLElement, opts: {
  eyebrow: string;
  title: string;
  sub: string;
  howTo: string[];
  startLabel?: string;
  onStart: () => void;
}) {
  leaveArena(stage);
  stage.innerHTML = '';
  const screen = el('div', 'screen');
  const how = el('ul', 'how-to');
  opts.howTo.forEach((line) => how.appendChild(el('li', undefined, line)));
  const btn = el('button', 'btn-primary', opts.startLabel ?? 'Play');
  btn.onclick = () => opts.onStart();
  screen.append(el('div', 'eyebrow', opts.eyebrow), el('h1', 'title', opts.title), el('p', 'sub', opts.sub), how, btn);
  stage.appendChild(screen);
  btn.focus({ preventScroll: true });
  if (AUTO) setTimeout(() => btn.click(), 200);
}

/** The arcade score block shown on the result screen. */
export function arcadeExtra(points: number, note: string): HTMLElement {
  const box = el('div', 'result-extra');
  box.append(el('div', 'label', 'Arcade score'), el('div', 'value', `${points.toLocaleString('en-US')} pts`), el('div', 'note', note));
  return box;
}

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Seeded PRNG so ?thumb frames look the same every capture. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
