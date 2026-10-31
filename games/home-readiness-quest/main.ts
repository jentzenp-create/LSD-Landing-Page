// Home Readiness Quest: a lane-crossing game. Hop your buyer across busier and busier
// streets toward home. Each safe strip between the streets is a stop on the buying
// journey and asks one question. Getting hit sends you back to your last stop.
import { GAME_NAME, STOPS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, answer, advance, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask, drawHud,
  drawFloaters, banner, roundRect, renderIntro, arcadeExtra, seeded, type Floater, type Dir,
} from '../_shared/arcade';

const stage = document.getElementById('stage')!;
const CELL = 40;
const COLS = W / CELL; // 9
const CAR_COLORS = ['#ff6b6b', '#4f86e8', '#9b6bff', '#36b5b0', '#ff9f43', '#e8e8f0'];

type RowKind = 'start' | 'road' | 'stop' | 'home';
interface Vehicle { x0: number; len: number; color: string; truck: boolean }
interface Row { kind: RowKind; stop?: number; dir?: 1 | -1; speed?: number; cars?: Vehicle[]; coin?: number }

/** Start sidewalk, then for each stop a few lanes of traffic and the stop strip, then home. */
function buildWorld(rng: () => number): Row[] {
  const rows: Row[] = [{ kind: 'start' }];
  STOPS.forEach((_, i) => {
    const lanes = 2 + Math.floor(i / 2);
    for (let l = 0; l < lanes; l++) {
      const dir = (rows.length % 2 === 0 ? 1 : -1) as 1 | -1;
      const speed = 55 + i * 14 + rng() * 30;
      const count = 2 + (rng() < 0.4 ? 1 : 0);
      const span = W + 160;
      const cars: Vehicle[] = [];
      for (let c = 0; c < count; c++) {
        const truck = rng() < 0.3;
        cars.push({
          x0: (span / count) * c + rng() * 30,
          len: truck ? 78 : 46 + rng() * 10,
          color: CAR_COLORS[Math.floor(rng() * CAR_COLORS.length)],
          truck,
        });
      }
      rows.push({ kind: 'road', dir, speed, cars, coin: rng() < 0.45 ? Math.floor(rng() * COLS) : undefined });
    }
    rows.push({ kind: 'stop', stop: i });
  });
  rows.push({ kind: 'home' });
  return rows;
}

/** Where a vehicle's left edge is at time t (lanes wrap around off-screen). */
function carX(row: Row, car: Vehicle, t: number) {
  const span = W + 160;
  const raw = car.x0 + row.dir! * row.speed! * t;
  return (((raw % span) + span) % span) - 80;
}

function intro() {
  renderIntro(stage, {
    eyebrow: `Home Buying · Lane Crossing`,
    title: GAME_NAME,
    sub: 'Get your buyer across town to their new front door. The streets get busier as you go, and every safe strip is a stop on the road to keys-in-hand with one quick question.',
    howTo: [
      'Hop with the arrow keys or WASD, or swipe. Tap to hop forward.',
      'Grab keys on the road for bonus points.',
      'Get hit and you go back to your last stop. You never lose your answers.',
    ],
    startLabel: 'Start the journey',
    onStart: play,
  });
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const rows = buildWorld(seeded(42));
  const floaters: Floater[] = [];

  let t = 0;
  let points = 0;
  let col = Math.floor(COLS / 2);
  let row = 0;
  let maxRow = 0;
  let checkpoint = 0;
  let stopsDone = 0;
  let hop = 1; // 0..1 hop animation progress
  let from = { col, row };
  let cam = 0;
  let paused = false;
  let invuln = 0;
  let hitFlash = 0;
  let hits = 0;
  let finishing = 0;
  const coinsTaken = new Set<number>();

  const tryMove = (d: Dir) => {
    if (paused || finishing || hop < 1) return;
    const nc = col + (d === 'left' ? -1 : d === 'right' ? 1 : 0);
    const nr = row + (d === 'up' ? 1 : d === 'down' ? -1 : 0);
    if (nc < 0 || nc >= COLS || nr < 0 || nr >= rows.length) return;
    from = { col, row };
    col = nc;
    row = nr;
    hop = 0;
  };

  const input = controls(arena, {
    onDir: tryMove,
    onAction: () => tryMove('up'),
  });
  exposeDebug(() => ({ points, row, maxRow, stopsDone, hits, paused, rows: rows.length }));

  async function reachStop(i: number) {
    paused = true;
    const s = STOPS[i];
    const { idx } = await ask(arena, {
      tag: `Stop ${i + 1} of ${STOPS.length} · ${s.name}`,
      prompt: s.prompt,
      answers: s.answers.map((a) => a.label),
      finding: (k) => ({ text: s.answers[k].finding, severity: s.answers[k].severity }),
      continueLabel: i === STOPS.length - 1 ? 'Head for home' : 'Keep going',
    });
    answer(idx);
    advance();
    stopsDone += 1;
    points += 50;
    floaters.push({ x: col * CELL + CELL / 2, y: screenY(row) - 10, text: '+50', color: GOLD_LIGHT, t: 0 });
    paused = false;
  }

  function landed() {
    const r = rows[row];
    if (row > maxRow) {
      points += 10 * (row - maxRow);
      maxRow = row;
    }
    if (r.kind === 'road' && r.coin === col && !coinsTaken.has(row)) {
      coinsTaken.add(row);
      points += 25;
      floaters.push({ x: col * CELL + CELL / 2, y: screenY(row), text: '+25', color: GOLD_LIGHT, t: 0 });
    }
    if (r.kind === 'stop' && r.stop === stopsDone) {
      checkpoint = row;
      void reachStop(r.stop);
    }
    if (r.kind === 'home' && stopsDone >= STOPS.length) {
      points += 200;
      finishing = 0.001;
    }
  }

  // AUTO: hop forward when the lane ahead is clear for a moment.
  function bot() {
    if (paused || finishing || hop < 1) return;
    const next = rows[row + 1];
    if (!next) return;
    if (next.kind !== 'road') return tryMove('up');
    const px = col * CELL + CELL / 2;
    const safe = (rr: Row, tt: number) => !rr.cars!.some((c) => {
      const x = carX(rr, c, tt);
      return px + 16 > x - 6 && px - 16 < x + c.len + 6;
    });
    if (safe(next, t) && safe(next, t + 0.25)) tryMove('up');
  }

  function step(dt: number) {
    t += dt;
    if (AUTO) bot();
    if (hop < 1) {
      hop = Math.min(1, hop + dt / 0.12);
      if (hop >= 1) landed();
    }
    invuln = Math.max(0, invuln - dt);
    hitFlash = Math.max(0, hitFlash - dt);

    const r = rows[row];
    if (r.kind === 'road' && invuln <= 0 && hop > 0.5) {
      const px = col * CELL + CELL / 2;
      const hit = r.cars!.some((c) => {
        const x = carX(r, c, t);
        return px + 13 > x && px - 13 < x + c.len;
      });
      if (hit) {
        hits += 1;
        const lost = Math.min(points, 30);
        points -= lost;
        floaters.push({ x: px, y: screenY(row) - 10, text: lost ? `-${lost}` : 'Oops!', color: '#ff5c5c', t: 0 });
        row = checkpoint;
        col = Math.floor(COLS / 2);
        from = { col, row };
        hop = 1;
        invuln = 1;
        hitFlash = 0.3;
      }
    }

    // Camera follows the buyer, keeping a few rows of road ahead visible.
    const visual = from.row + (row - from.row) * hop;
    const targetCam = Math.max(0, (visual - 2.5) * CELL);
    cam += (targetCam - cam) * Math.min(1, dt * 8);
  }

  const screenY = (r: number) => H - (r + 1) * CELL + cam;

  function drawRow(r: Row, i: number) {
    const y = screenY(i);
    if (y > H || y < -CELL) return;
    if (r.kind === 'road') {
      ctx.fillStyle = '#1b1e2b';
      ctx.fillRect(0, y, W, CELL);
      const prev = rows[i - 1];
      if (prev?.kind === 'road') {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        for (let x = 6; x < W; x += 30) ctx.fillRect(x, y + CELL - 1.5, 16, 3);
      }
      if (r.coin !== undefined && !coinsTaken.has(i)) {
        const cx = r.coin * CELL + CELL / 2;
        const bob = Math.sin(t * 4 + i) * 2;
        ctx.fillStyle = GOLD;
        ctx.font = '18px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔑', cx, y + 27 + bob);
      }
      for (const c of r.cars!) drawCar(carX(r, c, t), y, c, r.dir!);
    } else if (r.kind === 'stop') {
      const done = r.stop! < stopsDone;
      ctx.fillStyle = done ? '#1f3b2c' : '#243424';
      ctx.fillRect(0, y, W, CELL);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let x = 0; x < W; x += 12) ctx.fillRect(x, y + ((x / 12) % 2) * 6 + 6, 3, 3);
      ctx.fillStyle = done ? '#2ecc71' : GOLD;
      ctx.font = '800 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${done ? '✓' : '●'}  STOP ${r.stop! + 1} · ${STOPS[r.stop!].name.toUpperCase()}`, 10, y + 24);
    } else if (r.kind === 'start') {
      ctx.fillStyle = '#2a2d3a';
      ctx.fillRect(0, y, W, CELL);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '700 10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('START', W - 10, y + 24);
    } else {
      ctx.fillStyle = '#3a2f12';
      ctx.fillRect(0, y - CELL * 3, W, CELL * 4);
      ctx.font = '64px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏡', W / 2, y + 22);
      ctx.fillStyle = GOLD;
      ctx.font = '900 14px Inter, sans-serif';
      ctx.fillText('HOME', W / 2, y - 52);
    }
  }

  function drawCar(x: number, y: number, c: Vehicle, dir: number) {
    const top = y + 7;
    const h = CELL - 14;
    roundRect(ctx, x, top, c.len, h, 7);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.fillStyle = 'rgba(10,12,20,0.55)';
    if (c.truck) {
      const cabX = dir > 0 ? x + c.len - 22 : x + 4;
      ctx.fillRect(cabX + 3, top + 4, 15, h - 8);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '800 8px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MOVING', dir > 0 ? x + (c.len - 22) / 2 : x + 22 + (c.len - 22) / 2, top + h / 2 + 3);
    } else {
      ctx.fillRect(x + c.len * 0.3, top + 4, c.len * 0.4, h - 8);
    }
    ctx.fillStyle = '#fff6c2';
    const lx = dir > 0 ? x + c.len - 3 : x;
    ctx.fillRect(lx, top + 4, 3, 4);
    ctx.fillRect(lx, top + h - 8, 3, 4);
  }

  function drawBuyer() {
    const vc = from.col + (col - from.col) * hop;
    const vr = from.row + (row - from.row) * hop;
    const x = vc * CELL + CELL / 2;
    const y = screenY(vr) + CELL / 2 - Math.sin(hop * Math.PI) * 8;
    if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(x, screenY(vr) + CELL - 8, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = GOLD; ctx.shadowBlur = 12;
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a1205';
    ctx.beginPath(); ctx.arc(x - 4, y - 2, 2, 0, Math.PI * 2); ctx.arc(x + 4, y - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1a1205'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y + 2, 4, 0.2, Math.PI - 0.2); ctx.stroke();
    // Moving box under one arm.
    ctx.fillStyle = '#c8955a';
    ctx.fillRect(x + 7, y + 2, 10, 9);
    ctx.fillStyle = '#9c6f3e';
    ctx.fillRect(x + 7, y + 5, 10, 1.5);
  }

  function draw(dt: number) {
    ctx.fillStyle = '#12141f';
    ctx.fillRect(0, 0, W, H);
    rows.forEach(drawRow);
    drawBuyer();
    if (hitFlash > 0) {
      ctx.fillStyle = `rgba(255,92,92,${hitFlash})`;
      ctx.fillRect(0, 0, W, H);
    }
    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, stopsDone, STOPS.length, 'PTS · STOPS');
    if (finishing) banner(ctx, 'WELCOME HOME!', 'Keys in hand');
    else if (t < 2.5 && !THUMB) banner(ctx, 'GO!', 'Hop forward to the first stop', Math.min(1, 2.5 - t));
  }

  if (THUMB) {
    t = 3.2; row = 4; col = 4; from = { col, row }; maxRow = 4; stopsDone = 1; points = 230; checkpoint = 3;
    cam = (row - 2.5) * CELL;
    draw(0);
    return;
  }

  const loop = startLoop((dt) => {
    if (!paused) {
      if (finishing) {
        finishing += dt;
        if (finishing > 1.6) {
          loop.stop();
          input.dispose();
          lead(points, hits);
          return;
        }
      }
      step(dt);
    }
    draw(paused ? 0 : dt);
  });
}

function lead(points: number, hits: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: "You've arrived",
    sub: 'Where should we send your readiness score and next steps?',
    note: 'No spam — just your results and, if you want it, a note from a local agent.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.unshift({ area: 'Arcade score', detail: `${points} pts · ${hits} bumps`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);
      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
        eyebrow: 'Your Home Readiness',
        titles: ["You're ready to tour", 'Almost there — a couple of stops to revisit', "Let's build your game plan first"],
        recLabel: 'Fastest way forward',
        extra: arcadeExtra(points, 'Arcade points are just for fun. The gauge is your real buyer readiness.'),
        ctaLabel: 'Talk to an agent',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

if (THUMB) play();
else intro();
