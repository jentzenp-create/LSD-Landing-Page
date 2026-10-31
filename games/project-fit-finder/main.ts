// Project Fit Finder: a match-3 builder. Swap tools to line up three or more; every
// match adds to the house being built above the board. Each finished section of the
// house asks one question about the project, and the answers become a ballpark
// estimate and a project-fit score.
import {
  GAME_NAME, PROJECTS, SIZES, BUDGETS, TIMELINE, FINANCING, DECISION, ageBucketsFor, type ChoiceGroup,
} from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, project, currentEstimate, verdicts, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask,
  drawHud, drawFloaters, banner, roundRect, renderIntro, arcadeExtra, seeded, type Floater, type Dir,
} from '../_shared/arcade';
import type { Severity } from '../_shared/types';

const stage = document.getElementById('stage')!;
const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

const COLS = 7;
const ROWS = 8;
const TILE = 46;
const BX = (W - COLS * TILE) / 2;
const BY = 140;
const TOOLS = [
  { icon: '🔨', color: '#ff6b6b' },
  { icon: '🔧', color: '#4f86e8' },
  { icon: '🖌️', color: '#9b6bff' },
  { icon: '🧱', color: '#ff9f43' },
  { icon: '📏', color: '#36b5b0' },
  { icon: '🪚', color: '#43c08a' },
];
/** Tiles to clear for each section of the house. */
const PER_SECTION = 14;
const SECTIONS = ['Foundation', 'Walls', 'Windows', 'Roof', 'Finishes', 'Move-in'];

interface Tile { type: number; y: number; pop: number }
type Grid = (Tile | null)[][];

function intro() {
  renderIntro(stage, {
    eyebrow: 'Home Projects · Match-3',
    title: GAME_NAME,
    sub: 'Match tools to build the house, one section at a time. Each finished section asks one quick question, and by move-in day you have a ballpark price and a project-fit score.',
    howTo: [
      'Tap a tool, then tap a neighbor to swap them. Or swipe a tool in any direction.',
      'Line up 3 or more of the same tool to clear them. Chains score extra.',
      'Keyboard: arrows move, Space picks up and swaps.',
    ],
    startLabel: 'Start building',
    onStart: play,
  });
}

function makeGrid(rng: () => number): Grid {
  const g: Grid = [];
  for (let r = 0; r < ROWS; r++) {
    g.push([]);
    for (let c = 0; c < COLS; c++) {
      let type: number;
      do {
        type = Math.floor(rng() * TOOLS.length);
      } while (
        (c >= 2 && g[r][c - 1]?.type === type && g[r][c - 2]?.type === type) ||
        (r >= 2 && g[r - 1][c]?.type === type && g[r - 2][c]?.type === type)
      );
      g[r].push({ type, y: r, pop: 0 });
    }
  }
  return g;
}

/** Every cell that's part of a run of 3+. */
function findMatches(g: Grid): Set<string> {
  const hit = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = g[r][c]?.type;
      if (t === undefined) continue;
      if (c <= COLS - 3 && g[r][c + 1]?.type === t && g[r][c + 2]?.type === t) {
        for (let k = c; k < COLS && g[r][k]?.type === t; k++) hit.add(`${r},${k}`);
      }
      if (r <= ROWS - 3 && g[r + 1][c]?.type === t && g[r + 2][c]?.type === t) {
        for (let k = r; k < ROWS && g[k][c]?.type === t; k++) hit.add(`${k},${c}`);
      }
    }
  }
  return hit;
}

function swapCells(g: Grid, a: [number, number], b: [number, number]) {
  const tmp = g[a[0]][a[1]];
  g[a[0]][a[1]] = g[b[0]][b[1]];
  g[b[0]][b[1]] = tmp;
  // Keep each tile's visual row in step with where it now lives.
  if (g[a[0]][a[1]]) g[a[0]][a[1]]!.y = a[0];
  if (g[b[0]][b[1]]) g[b[0]][b[1]]!.y = b[0];
}

/** A swap that makes a match, or null if the board is stuck. */
function findMove(g: Grid): [[number, number], [number, number]] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (r2 >= ROWS || c2 >= COLS) continue;
        swapCells(g, [r, c], [r2, c2]);
        const ok = findMatches(g).size > 0;
        swapCells(g, [r, c], [r2, c2]);
        if (ok) return [[r, c], [r2, c2]];
      }
    }
  }
  return null;
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const rng = THUMB ? seeded(11) : Math.random;
  let grid = makeGrid(rng);
  const floaters: Floater[] = [];

  let points = 0;
  let sections = 0; // finished house sections
  let meter = 0; // tiles cleared toward the next section
  let pendingSections = 0;
  let selected: [number, number] | null = null;
  let cursor: [number, number] = [3, 3];
  let showCursor = false;
  let phase: 'idle' | 'swap' | 'unswap' | 'pop' | 'fall' | 'ask' | 'done' = 'ask';
  let swapT = 0;
  let swapPair: [[number, number], [number, number]] | null = null;
  let chain = 0;
  let botWait = 0;
  let finishing = 0;
  let t = 0;
  let moves = 0;

  const cellAt = (x: number, y: number): [number, number] | null => {
    const c = Math.floor((x - BX) / TILE);
    const r = Math.floor((y - BY) / TILE);
    return r >= 0 && r < ROWS && c >= 0 && c < COLS ? [r, c] : null;
  };
  const adjacent = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

  function trySwap(a: [number, number], b: [number, number]) {
    if (phase !== 'idle' || !adjacent(a, b)) return;
    selected = null;
    swapPair = [a, b];
    swapT = 0;
    phase = 'swap';
  }

  let pressCell: [number, number] | null = null;
  const input = controls(arena, {
    onPointer: (p, down) => {
      if (down && !pressCell) pressCell = cellAt(p.x, p.y);
    },
    onDir: (d) => {
      const delta: Record<Dir, [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
      const [dr, dc] = delta[d];
      if (pressCell) {
        // A swipe that started on a tile swaps it that way.
        const from = pressCell;
        pressCell = null;
        const to: [number, number] = [from[0] + dr, from[1] + dc];
        if (to[0] >= 0 && to[0] < ROWS && to[1] >= 0 && to[1] < COLS) trySwap(from, to);
        return;
      }
      showCursor = true;
      const next: [number, number] = [
        Math.max(0, Math.min(ROWS - 1, cursor[0] + dr)),
        Math.max(0, Math.min(COLS - 1, cursor[1] + dc)),
      ];
      if (selected && adjacent(selected, next)) trySwap(selected, next);
      else cursor = next;
    },
    onAction: (p) => {
      const fromKey = p.x === W / 2 && p.y === H / 2 && showCursor;
      const cell = fromKey ? cursor : cellAt(p.x, p.y);
      pressCell = null;
      if (!cell || phase !== 'idle') return;
      if (!fromKey) showCursor = false;
      if (selected && adjacent(selected, cell)) trySwap(selected, cell);
      else if (selected && selected[0] === cell[0] && selected[1] === cell[1]) selected = null;
      else selected = cell;
    },
  });
  exposeDebug(() => ({ points, sections, meter, phase, moves }));

  // --- The questions, one per finished section (the project is picked first) ---
  type Step = () => Promise<void>;
  const severityText = (s: Severity, text: string) => ({ text, severity: s });

  const askProject: Step = async () => {
    const { idx } = await ask(arena, {
      tag: 'Before you build',
      prompt: 'What project are you planning?',
      answers: PROJECTS.map((p) => p.label),
      continueLabel: 'Start matching',
    });
    run.projectId = PROJECTS[Math.max(0, idx)].id;
  };

  const askGroup = (g: ChoiceGroup): Step => async () => {
    const { idx } = await ask(arena, {
      tag: tagFor(g.area),
      prompt: g.prompt,
      answers: g.choices.map((c) => c.label),
      finding: (i) => severityText(g.choices[i].severity, g.choices[i].finding),
    });
    run.picks[g.id] = g.choices[Math.max(0, idx)].id;
  };

  const tagFor = (area: string) => `${SECTIONS[sections - 1]} done · ${area}`;

  const steps: Step[] = [
    async () => {
      const { idx } = await ask(arena, {
        tag: tagFor('Home size'),
        prompt: 'How big is the home?',
        answers: SIZES.map((s) => s.label),
      });
      run.sqft = SIZES[Math.max(0, idx)].sqft;
    },
    async () => {
      const p = project()!;
      const buckets = ageBucketsFor(p);
      const { idx } = await ask(arena, {
        tag: tagFor(p.ageLabel),
        prompt: `How old is the ${p.ageLabel.replace(' age', '').toLowerCase()}?`,
        answers: buckets.map((b) => b.label),
        finding: (i) => {
          const v = p.condition(buckets[i].age);
          return severityText(v.severity, v.finding);
        },
      });
      run.age = buckets[Math.max(0, idx)].age;
    },
    async () => {
      const [lo, hi] = currentEstimate()!;
      const { idx } = await ask(arena, {
        tag: tagFor('Budget'),
        prompt: `Your ballpark so far is ${fmt(lo)} – ${fmt(hi)}. What budget do you have in mind?`,
        answers: BUDGETS.map((b) => b.label),
        finding: (i) => {
          run.budgetId = BUDGETS[i].id;
          const v = verdicts().find((x) => x.area === 'Budget fit')!;
          return severityText(v.severity, v.finding);
        },
      });
      run.budgetId = BUDGETS[Math.max(0, idx)].id;
    },
    askGroup(TIMELINE),
    askGroup(FINANCING),
    askGroup(DECISION),
  ];

  async function runSection() {
    phase = 'ask';
    await steps[sections - 1]();
    pendingSections -= 1;
    if (sections >= SECTIONS.length) {
      phase = 'done';
      finishing = 0.001;
      return;
    }
    if (pendingSections > 0) {
      sections += 1;
      void runSection();
      return;
    }
    ensureMoves();
    phase = 'idle';
  }

  function ensureMoves() {
    if (findMove(grid)) return;
    grid = makeGrid(Math.random);
    floaters.push({ x: W / 2, y: BY + 140, text: 'Reshuffle!', color: GOLD_LIGHT, t: 0 });
  }

  function resolveMatches(): boolean {
    const hit = findMatches(grid);
    if (!hit.size) return false;
    chain += 1;
    const gained = hit.size * 10 * chain;
    points += gained;
    meter += hit.size;
    let sx = 0;
    let sy = 0;
    hit.forEach((k) => {
      const [r, c] = k.split(',').map(Number);
      grid[r][c]!.pop = 0.0001;
      sx += BX + c * TILE + TILE / 2;
      sy += BY + r * TILE + TILE / 2;
    });
    floaters.push({ x: sx / hit.size, y: sy / hit.size, text: chain > 1 ? `+${gained} x${chain}` : `+${gained}`, color: chain > 1 ? GOLD_LIGHT : '#fff', t: 0 });
    phase = 'pop';
    return true;
  }

  function settle() {
    // Gravity: drop tiles down each column and spawn new ones above the board.
    for (let c = 0; c < COLS; c++) {
      const col: Tile[] = [];
      for (let r = ROWS - 1; r >= 0; r--) {
        const tile = grid[r][c];
        if (tile && tile.pop === 0) col.push(tile);
      }
      let spawn = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        const tile = col.shift();
        grid[r][c] = tile ?? { type: Math.floor(Math.random() * TOOLS.length), y: spawn--, pop: 0 };
      }
    }
    phase = 'fall';
  }

  function afterCascade() {
    chain = 0;
    while (meter >= PER_SECTION && sections + pendingSections < SECTIONS.length) {
      meter -= PER_SECTION;
      pendingSections += 1;
    }
    if (pendingSections > 0) {
      sections += 1;
      void runSection();
    } else {
      ensureMoves();
      phase = 'idle';
    }
  }

  function step(dt: number) {
    t += dt;
    if (phase === 'swap' || phase === 'unswap') {
      swapT += dt / 0.16;
      if (swapT >= 1) {
        const [a, b] = swapPair!;
        swapCells(grid, a, b);
        swapT = 0;
        if (phase === 'swap') {
          moves += 1;
          // No match: animate back; finishing the unswap swaps the cells home again.
          if (!resolveMatches()) phase = 'unswap';
          else swapPair = null;
        } else {
          swapPair = null;
          phase = 'idle';
        }
      }
    } else if (phase === 'pop') {
      let done = true;
      grid.forEach((row) => row.forEach((tile) => {
        if (tile && tile.pop > 0) {
          tile.pop += dt / 0.2;
          if (tile.pop < 1) done = false;
        }
      }));
      if (done) {
        grid.forEach((row, r) => row.forEach((tile, c) => { if (tile && tile.pop >= 1) grid[r][c] = null; }));
        settle();
      }
    } else if (phase === 'fall') {
      let done = true;
      grid.forEach((row, r) => row.forEach((tile) => {
        if (!tile) return;
        if (tile.y < r) {
          tile.y = Math.min(r, tile.y + dt * 14);
          if (tile.y < r) done = false;
        }
      }));
      if (done && !resolveMatches()) afterCascade();
    } else if (phase === 'idle' && AUTO) {
      botWait += dt;
      if (botWait > 0.35) {
        botWait = 0;
        const m = findMove(grid);
        if (m) trySwap(m[0], m[1]);
      }
    }
  }

  function drawHouse() {
    const cx = W / 2;
    const base = 124;
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, 12, 42, W - 24, 90, 12);
    ctx.fill();
    // Ghost outline of the finished house.
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(cx - 50, base - 46, 100, 46);
    ctx.beginPath(); ctx.moveTo(cx - 60, base - 46); ctx.lineTo(cx, base - 76); ctx.lineTo(cx + 60, base - 46); ctx.stroke();
    ctx.setLineDash([]);
    const s = sections;
    if (s >= 1) { ctx.fillStyle = '#5b5f6e'; ctx.fillRect(cx - 56, base - 6, 112, 8); }
    if (s >= 2) { ctx.fillStyle = '#d9c7a3'; ctx.fillRect(cx - 50, base - 46, 100, 40); }
    if (s >= 3) {
      ctx.fillStyle = '#7fc8ff';
      ctx.fillRect(cx - 40, base - 38, 18, 14);
      ctx.fillRect(cx + 22, base - 38, 18, 14);
      ctx.fillStyle = '#8a5a35';
      ctx.fillRect(cx - 8, base - 28, 16, 22);
    }
    if (s >= 4) {
      ctx.fillStyle = '#b8483b';
      ctx.beginPath(); ctx.moveTo(cx - 60, base - 44); ctx.lineTo(cx, base - 78); ctx.lineTo(cx + 60, base - 44); ctx.closePath(); ctx.fill();
    }
    if (s >= 5) {
      ctx.fillStyle = '#2f3a52';
      ctx.fillRect(cx + 20, base - 74, 22, 14);
      ctx.fillStyle = '#7fb6ff';
      ctx.fillRect(cx + 22, base - 72, 8, 4); ctx.fillRect(cx + 32, base - 72, 8, 4);
    }
    if (s >= 6) {
      ctx.font = '18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌳', cx - 78, base);
      ctx.fillText('🌷', cx + 74, base);
    }
    // Section meter
    const label = sections >= SECTIONS.length ? 'Move-in ready!' : `Next: ${SECTIONS[sections]}`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(label.toUpperCase(), 22, 58);
    const frac = sections >= SECTIONS.length ? 1 : Math.min(1, meter / PER_SECTION);
    roundRect(ctx, 22, 64, 70, 6, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    roundRect(ctx, 22, 64, 70 * frac, 6, 3);
    ctx.fillStyle = GOLD; ctx.fill();
  }

  function tilePos(r: number, c: number, tile: Tile) {
    let x = BX + c * TILE;
    let y = BY + tile.y * TILE;
    if (swapPair && (phase === 'swap' || phase === 'unswap')) {
      const [a, b] = swapPair;
      const e = swapT < 0.5 ? 2 * swapT * swapT : 1 - Math.pow(-2 * swapT + 2, 2) / 2;
      if (r === a[0] && c === a[1]) { x += (b[1] - a[1]) * TILE * e; y += (b[0] - a[0]) * TILE * e; }
      if (r === b[0] && c === b[1]) { x += (a[1] - b[1]) * TILE * e; y += (a[0] - b[0]) * TILE * e; }
    }
    return { x, y };
  }

  function draw(dt: number) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0B0D17');
    g.addColorStop(1, '#16182a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    drawHouse();

    roundRect(ctx, BX - 6, BY - 6, COLS * TILE + 12, ROWS * TILE + 12, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(BX - 6, BY - 6, COLS * TILE + 12, ROWS * TILE + 12);
    ctx.clip();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = grid[r][c];
        if (!tile) continue;
        const { x, y } = tilePos(r, c, tile);
        const scale = tile.pop > 0 ? Math.max(0, 1 - tile.pop) * (1 + tile.pop * 0.4) : 1;
        const isSel = selected && selected[0] === r && selected[1] === c;
        ctx.save();
        ctx.translate(x + TILE / 2, y + TILE / 2);
        ctx.scale(scale, scale);
        if (isSel) { ctx.shadowColor = GOLD; ctx.shadowBlur = 14; }
        roundRect(ctx, -TILE / 2 + 3, -TILE / 2 + 3, TILE - 6, TILE - 6, 10);
        ctx.fillStyle = TOOLS[tile.type].color + (isSel ? 'ff' : '55');
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isSel ? GOLD : TOOLS[tile.type].color;
        ctx.lineWidth = isSel ? 2.5 : 1.2;
        ctx.stroke();
        ctx.font = '22px serif';
        ctx.fillStyle = '#fff'; // emoji inherit fill alpha, so reset it
        ctx.fillText(TOOLS[tile.type].icon, 0, 1);
        ctx.restore();
      }
    }
    ctx.restore();
    ctx.textBaseline = 'alphabetic';

    if (showCursor && phase === 'idle') {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      roundRect(ctx, BX + cursor[1] * TILE + 1, BY + cursor[0] * TILE + 1, TILE - 2, TILE - 2, 11);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(project() ? `Building: ${project()!.label}` : 'Pick your project to start', W / 2, BY + ROWS * TILE + 26);

    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, sections, SECTIONS.length, 'PTS · SECTIONS');
    if (finishing) banner(ctx, 'MOVE-IN READY!', 'Your project report is ready');
  }

  if (THUMB) {
    run.projectId = 'roof';
    sections = 3; meter = 9; points = 1260; selected = [4, 3];
    draw(0);
    return;
  }

  const loop = startLoop((dt) => {
    if (finishing) {
      finishing += dt;
      if (finishing > 1.6) {
        loop.stop();
        input.dispose();
        lead(points, moves);
        return;
      }
    }
    if (phase !== 'ask') step(dt);
    draw(phase === 'ask' ? 0 : dt);
  });

  void (async () => {
    await askProject();
    phase = 'idle';
  })();
}

function lead(points: number, moves: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: 'Move-in ready',
    sub: 'Where should we send your estimate and project report?',
    note: 'No spam — just your numbers and, if it\'s a fit, a note from a local pro.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.splice(1, 0, { area: 'Arcade score', detail: `${points} pts in ${moves} moves`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const est = currentEstimate()!;
      const extra = el('div');
      const box = el('div', 'result-extra');
      box.append(
        el('div', 'label', `${project()!.label} · ${run.sqft.toLocaleString('en-US')} sq ft`),
        el('div', 'value', `${fmt(est[0])} – ${fmt(est[1])}`),
        el('div', 'note', 'Ballpark from national averages for a home your size. Your real quote depends on materials, access, and local pricing.'),
      );
      extra.append(box, arcadeExtra(points, 'Arcade points are just for fun. The gauge is your real project-fit score.'));

      renderResult(stage, { ...result, findings: result.findings.slice(2) }, {
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

if (THUMB) play();
else intro();
