// Fitness Fit Check: an endless runner. Sprint through the gym, jump the hurdles and
// grab the water bottles. Every checkpoint flag pauses for one "That's me / Not me"
// card, and the answers pick the program that fits.
import { GAME_NAME, STATEMENTS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, swipe, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask,
  drawHud, drawFloaters, banner, roundRect, renderIntro, arcadeExtra, rand, type Floater,
} from '../_shared/arcade';

const stage = document.getElementById('stage')!;
const GROUND = 410;
const PX = 84; // runner's fixed screen x
const GRAVITY = 1900;
const JUMP_V = 640;
const DOUBLE_V = 560;
/** Distance between checkpoint flags, in px of running. */
const FLAG_EVERY = 1350;

type Kind = 'hurdle' | 'kettlebell' | 'boxes' | 'bottle';
interface Thing { kind: Kind; x: number; y: number; w: number; h: number; taken?: boolean }

function intro() {
  renderIntro(stage, {
    eyebrow: `Fitness · Endless Runner`,
    title: GAME_NAME,
    sub: `Sprint through the gym, clear the hurdles, and grab the water. ${STATEMENTS.length} checkpoint flags each flash one quick card: is that you or not? Your answers pick the program that fits.`,
    howTo: [
      'Tap, press Space, or the up arrow to jump. Jump again in the air for a double jump.',
      'Grab water bottles for bonus points.',
      'Clipping a hurdle costs points and slows you down, but you keep running.',
    ],
    startLabel: 'Start running',
    onStart: play,
  });
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const floaters: Floater[] = [];
  const things: Thing[] = [];

  let t = 0;
  let dist = 0;
  let speed = 230;
  let points = 0;
  let y = GROUND;
  let vy = 0;
  let jumps = 0;
  let paused = false;
  let invuln = 0;
  let stumbles = 0;
  let nextSpawn = 1.2;
  let flagsHit = 0;
  let flagX: number | null = null; // screen x of the next flag
  let nextFlagAt = FLAG_EVERY * 0.6;
  let finishing = 0;

  const jump = () => {
    if (paused || finishing) return;
    if (y >= GROUND - 0.5) { vy = -JUMP_V; jumps = 1; }
    else if (jumps < 2) { vy = -DOUBLE_V; jumps = 2; }
  };
  const input = controls(arena, {
    onAction: jump,
    onDir: (d) => { if (d === 'up') jump(); },
  });
  exposeDebug(() => ({ points, flagsHit, stumbles, speed: Math.round(speed), paused }));

  async function checkpoint() {
    paused = true;
    const s = current();
    const { idx } = await ask(arena, {
      tag: `Checkpoint ${flagsHit + 1} of ${STATEMENTS.length} · ${s.area}`,
      prompt: `“${s.text}”`,
      answers: ["That's me", 'Not me'],
      finding: (i) => {
        const o = i === 0 ? s.yes : s.no;
        return { text: o.finding, severity: o.severity };
      },
      continueLabel: flagsHit === STATEMENTS.length - 1 ? 'Sprint to the finish' : 'Keep running',
    });
    swipe(idx === 0);
    flagsHit += 1;
    points += 50;
    floaters.push({ x: PX, y: GROUND - 70, text: '+50', color: GOLD_LIGHT, t: 0 });
    flagX = null;
    if (flagsHit >= STATEMENTS.length) finishing = 0.001;
    paused = false;
  }

  function spawn() {
    // Keep the area around a flag clear so a checkpoint never lands mid-jump.
    if (flagX !== null && flagX > W - 120) return;
    if (dist + (W + 40 - PX) > nextFlagAt - 160 && dist + (W + 40 - PX) < nextFlagAt + 160) return;
    const r = Math.random();
    if (r < 0.28) {
      const high = Math.random() < 0.5;
      things.push({ kind: 'bottle', x: W + 20, y: GROUND - (high ? 120 : 60), w: 16, h: 26 });
    } else if (r < 0.6) things.push({ kind: 'hurdle', x: W + 20, y: GROUND - 30, w: 22, h: 30 });
    else if (r < 0.85) things.push({ kind: 'kettlebell', x: W + 20, y: GROUND - 28, w: 26, h: 28 });
    else things.push({ kind: 'boxes', x: W + 20, y: GROUND - 50, w: 30, h: 50 });
  }

  function step(dt: number) {
    t += dt;
    if (!finishing) speed = Math.min(340, speed + dt * 3);
    const dx = speed * dt;
    dist += dx;

    // Runner physics
    vy += GRAVITY * dt;
    y += vy * dt;
    if (y >= GROUND) { y = GROUND; vy = 0; jumps = 0; }
    invuln = Math.max(0, invuln - dt);

    if (finishing) return;

    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      spawn();
      nextSpawn = rand(0.85, 1.5) * (260 / speed);
    }

    // Flags arrive on a distance schedule.
    if (flagX === null && flagsHit < STATEMENTS.length && dist >= nextFlagAt - (W + 30 - PX)) {
      flagX = W + 30;
      nextFlagAt += FLAG_EVERY;
    }
    if (flagX !== null) {
      flagX -= dx;
      if (flagX <= PX) { flagX = PX; void checkpoint(); }
    }

    for (let i = things.length - 1; i >= 0; i--) {
      const o = things[i];
      o.x -= dx;
      if (o.x < -50) { things.splice(i, 1); continue; }
      const hit = PX + 12 > o.x && PX - 12 < o.x + o.w && y > o.y && y - 46 < o.y + o.h;
      if (!hit) continue;
      if (o.kind === 'bottle') {
        if (!o.taken) {
          o.taken = true;
          points += 15;
          floaters.push({ x: o.x, y: o.y, text: '+15', color: '#7fd0ff', t: 0 });
        }
      } else if (invuln <= 0) {
        stumbles += 1;
        invuln = 1.1;
        speed = Math.max(200, speed - 50);
        const lost = Math.min(points, 20);
        points -= lost;
        floaters.push({ x: PX, y: y - 60, text: lost ? `-${lost}` : 'Ouch!', color: '#ff5c5c', t: 0 });
      }
    }
    // A point for every 4 m run.
    if (Math.floor(dist / 40) > Math.floor((dist - dx) / 40)) points += 1;

    if (AUTO) {
      const ahead = things.find((o) => o.kind !== 'bottle' && o.x > PX && o.x - PX < 70 + speed * 0.05);
      if (ahead && y >= GROUND - 0.5) jump();
    }
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, '#0B0D17');
    g.addColorStop(1, '#1f1a33');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Moon, stars and drifting clouds fill the night sky.
    ctx.fillStyle = 'rgba(255,240,200,0.9)';
    ctx.shadowColor = 'rgba(255,230,160,0.6)'; ctx.shadowBlur = 30;
    ctx.beginPath(); ctx.arc(282, 110, 26, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#111221'; // matches the sky gradient at the moon's height
    ctx.beginPath(); ctx.arc(293, 102, 22, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + ((i * 7) % 5) * 0.1})`;
      ctx.fillRect((i * 97) % W, 50 + ((i * 53) % 200), 1.6, 1.6);
    }
    const cloudOff = (dist * 0.05) % (W + 140);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (const [cx, cy, s] of [[60, 160, 1], [250, 210, 0.8], [420, 140, 1.2]]) {
      const x = ((cx - cloudOff) % (W + 140) + W + 140) % (W + 140) - 70;
      ctx.beginPath();
      ctx.ellipse(x, cy, 38 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 18 * s, cy - 8 * s, 22 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Neon gym sign
    ctx.save();
    ctx.shadowColor = GOLD; ctx.shadowBlur = 16;
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    roundRect(ctx, 34, 70, 150, 42, 10); ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = '900 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GYM · 24/7', 109, 98);
    ctx.restore();
    // Far skyline (slow parallax)
    const off1 = (dist * 0.15) % 90;
    ctx.fillStyle = '#191b2c';
    for (let i = -1; i < 6; i++) {
      const bx = i * 90 - off1;
      const bh = 90 + ((i * 37 + Math.floor(dist * 0.15 / 90) * 17) % 5) * 22;
      ctx.fillRect(bx, GROUND - 60 - bh, 64, bh + 60);
      ctx.fillStyle = 'rgba(242,183,5,0.18)';
      for (let wy = GROUND - 50 - bh; wy < GROUND - 70; wy += 18) {
        for (let wx = bx + 8; wx < bx + 56; wx += 16) if ((wx + wy) % 3 < 2) ctx.fillRect(wx, wy, 6, 8);
      }
      ctx.fillStyle = '#191b2c';
    }
    // Gym wall with mirrors (mid parallax)
    const off2 = (dist * 0.5) % 120;
    ctx.fillStyle = '#23263a';
    ctx.fillRect(0, GROUND - 120, W, 120);
    for (let i = -1; i < 5; i++) {
      const mx = i * 120 - off2;
      ctx.fillStyle = 'rgba(127,182,255,0.10)';
      ctx.fillRect(mx + 14, GROUND - 106, 84, 70);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(mx + 20, GROUND - 100, 10, 58);
    }
    // Floor
    ctx.fillStyle = '#2c2440';
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, GROUND, W, 3);
    const off3 = dist % 40;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let x = -off3; x < W; x += 40) ctx.fillRect(x, GROUND + 22, 20, 3);
  }

  function drawThing(o: Thing) {
    if (o.kind === 'bottle') {
      if (o.taken) return;
      const bob = Math.sin(t * 5 + o.x * 0.05) * 3;
      ctx.fillStyle = '#7fd0ff';
      roundRect(ctx, o.x, o.y + bob, o.w, o.h, 5); ctx.fill();
      ctx.fillStyle = '#e8f6ff';
      ctx.fillRect(o.x + 4, o.y + bob - 5, 8, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(o.x + 3, o.y + bob + 6, 3, 14);
    } else if (o.kind === 'hurdle') {
      ctx.fillStyle = '#e8e8f0';
      ctx.fillRect(o.x, o.y + 6, 3, o.h - 6);
      ctx.fillRect(o.x + o.w - 3, o.y + 6, 3, o.h - 6);
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(o.x - 2, o.y, o.w + 4, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(o.x + 6, o.y, 5, 8);
    } else if (o.kind === 'kettlebell') {
      ctx.fillStyle = '#3d4256';
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + 17, 12, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3d4256'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(o.x + o.w / 2, o.y + 6, 7, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = GOLD;
      ctx.font = '800 8px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('24', o.x + o.w / 2, o.y + 20);
    } else {
      ctx.fillStyle = '#9c6f3e';
      ctx.fillRect(o.x, o.y + 25, o.w, 25);
      ctx.fillRect(o.x + 3, o.y, o.w - 6, 25);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(o.x, o.y + 25, o.w, 25);
      ctx.strokeRect(o.x + 3, o.y, o.w - 6, 25);
    }
  }

  function drawFlag(x: number) {
    ctx.fillStyle = 'rgba(242,183,5,0.12)';
    ctx.fillRect(x - 2, GROUND - 150, 4, 150);
    ctx.fillStyle = '#e8e8f0';
    ctx.fillRect(x - 1.5, GROUND - 120, 3, 120);
    ctx.fillStyle = GOLD;
    const wave = Math.sin(t * 8) * 3;
    ctx.beginPath();
    ctx.moveTo(x + 1.5, GROUND - 120); ctx.lineTo(x + 34, GROUND - 111 + wave); ctx.lineTo(x + 1.5, GROUND - 100);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1a1205';
    ctx.font = '900 9px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(String(flagsHit + 1), x + 13, GROUND - 107);
  }

  function drawRunner() {
    if (invuln > 0 && Math.floor(invuln * 12) % 2 === 0) return;
    const air = y < GROUND - 0.5;
    const phase = air ? 0.6 : Math.sin(t * speed * 0.06);
    ctx.save();
    ctx.translate(PX, y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, GROUND - y + 2, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f0d6b8'; ctx.lineCap = 'round'; ctx.lineWidth = 5;
    // Legs
    ctx.beginPath();
    ctx.moveTo(0, -18); ctx.lineTo(-phase * 10, -2);
    ctx.moveTo(0, -18); ctx.lineTo(phase * 10, -2);
    ctx.stroke();
    // Body (gold shirt)
    ctx.fillStyle = GOLD;
    roundRect(ctx, -8, -42, 16, 26, 6); ctx.fill();
    // Arms
    ctx.beginPath();
    ctx.moveTo(-2, -36); ctx.lineTo(-2 + phase * 11, -24);
    ctx.moveTo(2, -36); ctx.lineTo(2 - phase * 11, -24);
    ctx.stroke();
    // Head + headband
    ctx.fillStyle = '#f0d6b8';
    ctx.beginPath(); ctx.arc(0, -50, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-8, -54, 16, 3);
    ctx.restore();
  }

  function draw(dt: number) {
    drawBackground();
    if (flagX !== null) drawFlag(flagX);
    things.forEach(drawThing);
    drawRunner();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(dist / 10)} m`, W - 12, 52);
    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, flagsHit, STATEMENTS.length, 'PTS · CHECKPOINTS');
    if (finishing) banner(ctx, 'FINISH LINE!', 'Your program match is ready');
    else if (t < 2.2 && !THUMB) banner(ctx, 'GO!', 'Tap or press Space to jump', Math.min(1, 2.2 - t));
  }

  if (THUMB) {
    dist = 2600; t = 4.2; points = 410; flagsHit = 3; y = GROUND - 70;
    things.push({ kind: 'hurdle', x: 70, y: GROUND - 30, w: 22, h: 30 });
    things.push({ kind: 'bottle', x: 190, y: GROUND - 120, w: 16, h: 26 });
    things.push({ kind: 'kettlebell', x: 300, y: GROUND - 28, w: 26, h: 28 });
    flagX = 250;
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
          lead(points, stumbles, Math.round(dist / 10));
          return;
        }
      }
      step(dt);
    }
    draw(paused ? 0 : dt);
  });
}

function lead(points: number, stumbles: number, meters: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: 'You crossed the line',
    sub: 'Where should we send your fit score and program match?',
    note: 'No spam — just your results and, if you want it, a free intro session.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.unshift({ area: 'Arcade score', detail: `${points} pts · ${meters} m · ${stumbles} stumbles`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);
      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
        eyebrow: 'Your Fit Readiness',
        titles: ['You\'re set up to win', 'A couple of things to plan around', 'Structure is your missing piece'],
        recLabel: 'Your best-fit program',
        extra: arcadeExtra(points, `${meters} m run. Arcade points are just for fun; the gauge is your real fit readiness.`),
        ctaLabel: 'Claim a free intro session',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

if (THUMB) play();
else intro();
