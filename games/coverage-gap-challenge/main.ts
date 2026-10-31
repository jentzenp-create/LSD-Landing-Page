// Coverage Gap Challenge: a brick breaker. Bounce the coverage orb off your shield to
// break the risk wall. Six gold "gap" bricks are hidden in it; each one you break asks
// one coverage question. Break all six and you're covered.
import { GAME_NAME, QUESTIONS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, answerCurrent, advanceCard, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask, drawHud,
  drawFloaters, banner, roundRect, renderIntro, arcadeExtra, clamp, seeded, type Floater,
} from '../_shared/arcade';

const stage = document.getElementById('stage')!;

const COLS = 8;
const ROWS = 6;
const PAD = 14;
const GAP = 4;
const BW = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
const BH = 16;
const TOP = 70;
const PADDLE_Y = 492;
const BALL_R = 6;
// Where the six gold gap bricks sit: [row, col]. Spread out so every part of the wall matters.
const GOLD_AT: [number, number][] = [[1, 2], [1, 6], [2, 4], [3, 0], [4, 6], [5, 2]];
const ROW_COLORS = ['#7b5cff', '#6a6cf5', '#4f86e8', '#3fa0d8', '#36b5b0', '#43c08a'];
/** After this long without finding a gap, shield bounces lean toward the nearest one. */
const ASSIST_AFTER = 6;

interface Brick { x: number; y: number; row: number; gold: boolean; alive: boolean; hits: number }

function makeBricks(): Brick[] {
  const out: Brick[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const gold = GOLD_AT.some(([gr, gc]) => gr === r && gc === c);
      out.push({ x: PAD + c * (BW + GAP), y: TOP + r * (BH + GAP), row: r, gold, alive: true, hits: 0 });
    }
  }
  return out;
}

function intro() {
  renderIntro(stage, {
    eyebrow: `Insurance · Brick Breaker`,
    title: GAME_NAME,
    sub: 'Six coverage gaps are hidden in the risk wall. Bounce the orb off your shield, break the gold bricks, and answer one quick question at each to see how covered you really are.',
    howTo: [
      'Move your shield with the mouse, your finger, or the arrow keys.',
      'Tap or press Space to launch the orb.',
      'Break all 6 gold bricks to finish. Missing the orb costs points, never the game.',
    ],
    startLabel: 'Start breaking',
    onStart: play,
  });
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const bricks = makeBricks();
  const floaters: Floater[] = [];
  const stars = Array.from({ length: 40 }, (_, i) => {
    const r = seeded(i + 7);
    return { x: r() * W, y: r() * H, s: r() * 1.4 + 0.3 };
  });

  let points = 0;
  let found = 0;
  let paddleX = W / 2;
  let paddleW = 74;
  let target: number | null = null;
  let ball = { x: W / 2, y: PADDLE_Y - BALL_R - 2, vx: 0, vy: 0, stuck: true };
  let speed = 300;
  let paused = false;
  let finishing = 0;
  let flash = 0;
  let misses = 0;
  let sinceGold = 0;

  const launch = () => {
    if (!ball.stuck || paused || finishing) return;
    const a = (Math.random() * 0.6 - 0.3);
    ball.vx = Math.sin(a) * speed;
    ball.vy = -Math.cos(a) * speed;
    ball.stuck = false;
  };

  const input = controls(arena, {
    onAction: launch,
    onPointer: (p) => (target = p.x),
  });
  exposeDebug(() => ({ points, found, misses, paused, ball }));

  async function hitGold(b: Brick) {
    paused = true;
    const q = QUESTIONS[found];
    const { idx } = await ask(arena, {
      tag: `Gap ${found + 1} of ${QUESTIONS.length} · ${q.area}`,
      prompt: q.prompt,
      answers: q.answers.map((a) => a.label),
      finding: (i) => ({ text: q.answers[i].finding, severity: q.answers[i].severity }),
      continueLabel: found === QUESTIONS.length - 1 ? 'Finish the wall' : 'Keep breaking',
    });
    answerCurrent(idx);
    found += 1;
    if (found < QUESTIONS.length) advanceCard();
    floaters.push({ x: b.x + BW / 2, y: b.y, text: '+100', color: GOLD_LIGHT, t: 0 });
    speed = Math.min(380, speed + 12);
    if (found >= QUESTIONS.length) finishing = 0.001;
    paused = false;
  }

  function step(dt: number) {
    // Paddle
    const keySpeed = 440;
    if (input.isHeld('left')) { paddleX -= keySpeed * dt; target = null; }
    if (input.isHeld('right')) { paddleX += keySpeed * dt; target = null; }
    if (AUTO) { target = ball.x + Math.sin(performance.now() / 900) * 20; if (ball.stuck) launch(); }
    if (target !== null) paddleX += (target - paddleX) * Math.min(1, dt * 18);
    paddleX = clamp(paddleX, paddleW / 2 + 6, W - paddleW / 2 - 6);

    sinceGold += dt;
    if (ball.stuck) {
      ball.x = paddleX;
      ball.y = PADDLE_Y - BALL_R - 2;
      return;
    }

    // Substeps so a fast orb never skips through a brick.
    const n = 4;
    for (let s = 0; s < n; s++) {
      ball.x += (ball.vx * dt) / n;
      ball.y += (ball.vy * dt) / n;

      if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
      if (ball.x > W - BALL_R) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
      if (ball.y < 34 + BALL_R) { ball.y = 34 + BALL_R; ball.vy = Math.abs(ball.vy); }

      // Shield: the bounce angle depends on where the orb lands.
      if (ball.vy > 0 && ball.y + BALL_R >= PADDLE_Y && ball.y < PADDLE_Y + 10 && Math.abs(ball.x - paddleX) <= paddleW / 2 + BALL_R) {
        const off = clamp((ball.x - paddleX) / (paddleW / 2), -1, 1);
        let ang = off * (Math.PI / 3);
        const gold = bricks.filter((b) => b.alive && b.gold)
          .sort((a, b) => Math.abs(a.x - ball.x) - Math.abs(b.x - ball.x))[0];
        if (gold && sinceGold > ASSIST_AFTER) {
          const aim = Math.atan2(gold.x + BW / 2 - ball.x, ball.y - (gold.y + BH));
          ang = clamp(ang * 0.4 + aim * 0.6, -Math.PI / 3, Math.PI / 3);
        }
        ball.vx = Math.sin(ang) * speed;
        ball.vy = -Math.cos(ang) * speed;
        ball.y = PADDLE_Y - BALL_R;
      }

      for (const b of bricks) {
        if (!b.alive) continue;
        const nx = clamp(ball.x, b.x, b.x + BW);
        const ny = clamp(ball.y, b.y, b.y + BH);
        const dx = ball.x - nx;
        const dy = ball.y - ny;
        if (dx * dx + dy * dy > BALL_R * BALL_R) continue;
        // Bounce off the side we hit more squarely.
        if (Math.abs(dx) > Math.abs(dy)) ball.vx = Math.sign(dx || -ball.vx) * Math.abs(ball.vx);
        else ball.vy = Math.sign(dy || -ball.vy) * Math.abs(ball.vy);
        b.alive = false;
        if (b.gold) {
          sinceGold = 0;
          points += 100;
          flash = 0.35;
          void hitGold(b);
          return;
        }
        points += 10;
        floaters.push({ x: b.x + BW / 2, y: b.y, text: '+10', color: '#fff', t: 0 });
        break;
      }
    }

    if (ball.y > H + 20) {
      misses += 1;
      const lost = Math.min(points, 50);
      points -= lost;
      if (lost) floaters.push({ x: paddleX, y: PADDLE_Y - 20, text: `-${lost}`, color: '#ff5c5c', t: 0 });
      ball = { x: paddleX, y: PADDLE_Y - BALL_R - 2, vx: 0, vy: 0, stuck: true };
    }
  }

  function draw(dt: number) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0B0D17');
    g.addColorStop(1, '#1a1330');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + s.s * 0.2})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }

    // Family house the shield protects.
    ctx.fillStyle = 'rgba(242,183,5,0.08)';
    ctx.beginPath();
    ctx.moveTo(W / 2 - 46, H - 8); ctx.lineTo(W / 2 - 46, H - 34); ctx.lineTo(W / 2, H - 62);
    ctx.lineTo(W / 2 + 46, H - 34); ctx.lineTo(W / 2 + 46, H - 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(242,183,5,0.18)';
    ctx.fillRect(W / 2 - 8, H - 26, 16, 18);

    for (const b of bricks) {
      if (!b.alive) continue;
      roundRect(ctx, b.x, b.y, BW, BH, 4);
      if (b.gold) {
        const pulse = 0.75 + Math.sin(performance.now() / 260 + b.x) * 0.25;
        ctx.shadowColor = GOLD;
        ctx.shadowBlur = 12 * pulse;
        ctx.fillStyle = GOLD;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1a1205';
        ctx.font = '900 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', b.x + BW / 2, b.y + 12.5);
      } else {
        ctx.fillStyle = ROW_COLORS[b.row];
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(b.x + 3, b.y + 3, BW - 6, 3);
      }
    }

    // Shield paddle: a gold umbrella arc.
    ctx.save();
    ctx.translate(paddleX, PADDLE_Y);
    ctx.fillStyle = GOLD;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.ellipse(0, 4, paddleW / 2, 11, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c99600';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(i * (paddleW / 5), 4, paddleW / 10, 3, 0, 0, Math.PI);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(242,183,5,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, 22); ctx.arc(-4, 22, 4, 0, Math.PI); ctx.stroke();
    ctx.restore();

    // Orb
    ctx.shadowColor = '#bfe4ff';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (flash > 0) {
      ctx.fillStyle = `rgba(242,183,5,${flash * 0.4})`;
      ctx.fillRect(0, 0, W, H);
      flash = Math.max(0, flash - dt);
    }

    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, found, QUESTIONS.length, 'PTS · GAPS FOUND');

    if (ball.stuck && !finishing && !THUMB) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tap or press Space to launch', W / 2, PADDLE_Y - 40);
    }
    if (finishing) banner(ctx, 'FULLY COVERED!', 'All six gaps found');
  }

  if (THUMB) {
    // A mid-game still: some of the wall broken, two gaps found, orb in flight.
    const r = seeded(3);
    bricks.forEach((b) => { if ((b.row > 2 && r() < 0.55) || (b.gold && (b.row === 5 || b.row === 4))) b.alive = false; });
    found = 2; points = 340; paddleX = 150; ball = { x: 214, y: 330, vx: 0, vy: 0, stuck: false };
    floaters.push({ x: 230, y: 250, text: '+10', color: '#fff', t: 0.2 });
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
          lead(points, misses);
          return;
        }
      } else step(dt);
    }
    draw(paused ? 0 : dt);
  });
}

function lead(points: number, misses: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: 'Wall cleared',
    sub: 'Where should we send your coverage score and findings?',
    note: "No spam — just your results and, if there's a real gap, a note from an advisor.",
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.unshift({ area: 'Arcade score', detail: `${points} pts · ${misses} missed orbs`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);
      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
        eyebrow: 'Your Coverage Score',
        titles: ["You're in solid shape", 'A few real gaps to close', 'Your coverage needs attention'],
        extra: arcadeExtra(points, 'Your arcade points are just for fun. The gauge above is your real coverage score.'),
        ctaLabel: 'Talk to an advisor',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

if (THUMB) play();
else intro();
