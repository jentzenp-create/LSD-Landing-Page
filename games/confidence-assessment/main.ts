// Confidence Assessment: a catcher. Slide your compact to catch glow drops and dodge
// the UV rays. Every so often a big area orb floats down (Texture, Fine lines...);
// catch it to answer one question about that area. Five orbs and you're done.
import { GAME_NAME, SPINS, OFFER, type Area } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, remaining, land, answer, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask,
  drawHud, drawFloaters, banner, roundRect, renderIntro, arcadeExtra, clamp, rand, seeded, type Floater,
} from '../_shared/arcade';

const stage = document.getElementById('stage')!;
const TRAY_Y = 478;
const ORB_COLORS = ['#ffb3c7', '#c7b3ff', '#b3e5ff', '#ffe0a3', '#b3ffd9', '#ffc9a3'];

type Kind = 'drop' | 'ray' | 'orb';
interface Faller { kind: Kind; x: number; y: number; vy: number; r: number; area?: Area; color?: string; spin: number }

function intro() {
  renderIntro(stage, {
    eyebrow: 'Med Spa · Catcher',
    title: GAME_NAME,
    sub: `Catch the glow, dodge the sun. ${SPINS} area orbs float down along the way. Catch each one to answer a quick question about how you feel about that area, and get your confidence score and treatment match.`,
    howTo: [
      'Slide your compact with the mouse, your finger, or the arrow keys.',
      'Gold drops are glow points. Catch several in a row for a combo.',
      'Orange UV rays break your combo. Missed orbs come back around.',
    ],
    startLabel: 'Start glowing',
    onStart: play,
  });
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const floaters: Floater[] = [];
  const fallers: Faller[] = [];
  const sparkles = Array.from({ length: 30 }, (_, i) => {
    const r = seeded(i + 3);
    return { x: r() * W, y: r() * H, p: r() * 6 };
  });

  let t = 0;
  let points = 0;
  let combo = 0;
  let best = 0;
  let trayX = W / 2;
  const trayW = 64;
  let target: number | null = null;
  let paused = false;
  let caught = 0;
  let nextDrop = 0.6;
  let nextOrb = 3.5;
  let burn = 0;
  let rays = 0;
  let finishing = 0;

  const input = controls(arena, {
    onPointer: (p) => (target = p.x),
  });
  exposeDebug(() => ({ points, caught, combo, best, rays, paused, fallers: fallers.length }));

  function orbOnScreen() {
    return fallers.some((f) => f.kind === 'orb');
  }

  function spawnOrb() {
    const pool = remaining().filter((a) => !fallers.some((f) => f.area?.id === a.id));
    if (!pool.length) return;
    const area = pool[Math.floor(Math.random() * pool.length)];
    fallers.push({ kind: 'orb', x: rand(50, W - 50), y: -30, vy: 70, r: 26, area, color: ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)], spin: 0 });
  }

  async function catchOrb(f: Faller) {
    paused = true;
    const area = f.area!;
    land(area);
    const { idx } = await ask(arena, {
      tag: `Orb ${caught + 1} of ${SPINS} · ${area.name}`,
      prompt: area.prompt,
      answers: area.answers.map((a) => a.label),
      finding: (i) => ({ text: area.answers[i].finding, severity: area.answers[i].severity }),
      continueLabel: caught === SPINS - 1 ? 'See my glow' : 'Keep catching',
    });
    answer(area, idx);
    caught += 1;
    points += 60;
    floaters.push({ x: trayX, y: TRAY_Y - 40, text: '+60', color: GOLD_LIGHT, t: 0 });
    nextOrb = rand(4, 6);
    if (caught >= SPINS) finishing = 0.001;
    paused = false;
  }

  function step(dt: number) {
    t += dt;
    const keySpeed = 420;
    if (input.isHeld('left')) { trayX -= keySpeed * dt; target = null; }
    if (input.isHeld('right')) { trayX += keySpeed * dt; target = null; }
    if (AUTO) {
      const orb = fallers.find((f) => f.kind === 'orb');
      const drop = fallers.filter((f) => f.kind === 'drop' && f.y < TRAY_Y).sort((a, b) => b.y - a.y)[0];
      const goal = orb ?? drop;
      if (goal) target = goal.x;
    }
    if (target !== null) trayX += (target - trayX) * Math.min(1, dt * 14);
    trayX = clamp(trayX, trayW / 2 + 4, W - trayW / 2 - 4);
    burn = Math.max(0, burn - dt);
    if (finishing) return;

    const pace = 1 + caught * 0.12;
    nextDrop -= dt;
    if (nextDrop <= 0) {
      const ray = Math.random() < 0.28 + caught * 0.03;
      fallers.push(ray
        ? { kind: 'ray', x: rand(20, W - 20), y: -20, vy: rand(170, 220) * pace, r: 12, spin: 0 }
        : { kind: 'drop', x: rand(20, W - 20), y: -20, vy: rand(130, 180) * pace, r: 9, spin: rand(0, 6) });
      nextDrop = rand(0.35, 0.7) / pace;
    }
    if (!orbOnScreen() && caught < SPINS) {
      nextOrb -= dt;
      if (nextOrb <= 0) spawnOrb();
    }

    for (let i = fallers.length - 1; i >= 0; i--) {
      const f = fallers[i];
      f.y += f.vy * dt;
      f.spin += dt * 3;
      if (f.kind === 'orb') f.x += Math.sin(t * 1.6) * 30 * dt;
      const inTray = f.y + f.r >= TRAY_Y - 6 && f.y - f.r <= TRAY_Y + 8 && Math.abs(f.x - trayX) <= trayW / 2 + f.r * 0.6;
      if (inTray) {
        fallers.splice(i, 1);
        if (f.kind === 'drop') {
          combo += 1;
          best = Math.max(best, combo);
          const gain = 10 + Math.min(combo - 1, 9) * 2;
          points += gain;
          floaters.push({ x: f.x, y: TRAY_Y - 20, text: combo > 2 ? `+${gain} x${combo}` : `+${gain}`, color: GOLD_LIGHT, t: 0 });
        } else if (f.kind === 'ray') {
          rays += 1;
          combo = 0;
          burn = 0.35;
          const lost = Math.min(points, 15);
          points -= lost;
          floaters.push({ x: f.x, y: TRAY_Y - 20, text: lost ? `-${lost}` : 'Ouch!', color: '#ff9f43', t: 0 });
        } else {
          void catchOrb(f);
          return;
        }
        continue;
      }
      if (f.y - f.r > H) {
        fallers.splice(i, 1);
        if (f.kind === 'drop') combo = 0;
        if (f.kind === 'orb') {
          floaters.push({ x: f.x, y: H - 30, text: 'It’ll be back', color: '#fff', t: 0 });
          nextOrb = 1.5;
        }
      }
    }
  }

  function drawFaller(f: Faller) {
    if (f.kind === 'drop') {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.shadowColor = GOLD; ctx.shadowBlur = 10;
      ctx.fillStyle = GOLD_LIGHT;
      ctx.beginPath();
      ctx.moveTo(0, -f.r * 1.4);
      ctx.bezierCurveTo(f.r, -f.r * 0.2, f.r, f.r, 0, f.r);
      ctx.bezierCurveTo(-f.r, f.r, -f.r, -f.r * 0.2, 0, -f.r * 1.4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath(); ctx.arc(-3, 0, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (f.kind === 'ray') {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.spin);
      ctx.fillStyle = '#ff9f43';
      ctx.shadowColor = '#ff6b2b'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ff9f43'; ctx.lineWidth = 2.5;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.stroke();
      }
      ctx.restore();
    } else {
      const pulse = 1 + Math.sin(t * 4) * 0.05;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(pulse, pulse);
      const g = ctx.createRadialGradient(-8, -8, 4, 0, 0, f.r);
      g.addColorStop(0, '#fff');
      g.addColorStop(1, f.color!);
      ctx.shadowColor = f.color!; ctx.shadowBlur = 22;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#2a1830';
      ctx.font = '800 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      const words = f.area!.name.toUpperCase().split(' ');
      words.forEach((w, k) => ctx.fillText(w, 0, 3 + (k - (words.length - 1) / 2) * 10));
      ctx.restore();
    }
  }

  function drawTray() {
    ctx.save();
    ctx.translate(trayX, TRAY_Y);
    // Open compact: mirror lid behind, pan in front.
    ctx.fillStyle = '#d9b8ff';
    ctx.beginPath(); ctx.ellipse(0, -8, trayW / 2 - 6, 14, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(0, -10, trayW / 2 - 12, 9, 0, Math.PI, 0); ctx.fill();
    ctx.shadowColor = GOLD; ctx.shadowBlur = 14;
    ctx.fillStyle = GOLD;
    roundRect(ctx, -trayW / 2, -4, trayW, 14, 7); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd1dc';
    roundRect(ctx, -trayW / 2 + 6, -2, trayW - 12, 6, 3); ctx.fill();
    ctx.restore();
  }

  function draw(dt: number) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#1a0f24');
    g.addColorStop(1, '#2a1638');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (const s of sparkles) {
      const a = 0.15 + (Math.sin(t * 2 + s.p) + 1) * 0.15;
      ctx.fillStyle = `rgba(255,214,235,${a})`;
      ctx.fillRect(s.x, s.y, 2, 2);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, TRAY_Y + 18, W, H - TRAY_Y - 18);
    fallers.forEach(drawFaller);
    drawTray();
    if (burn > 0) {
      ctx.fillStyle = `rgba(255,140,60,${burn * 0.6})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (combo >= 3) {
      ctx.fillStyle = GOLD_LIGHT;
      ctx.font = '900 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`COMBO x${combo}`, 12, 54);
    }
    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, caught, SPINS, 'GLOW · ORBS');
    if (finishing) banner(ctx, 'GLOWING!', 'Your confidence score is ready');
    else if (t < 2.2 && !THUMB) banner(ctx, 'CATCH THE GLOW', 'Dodge the orange UV rays', Math.min(1, 2.2 - t));
  }

  if (THUMB) {
    t = 3; points = 286; caught = 2; combo = 5; trayX = 150;
    const r = seeded(8);
    for (let k = 0; k < 7; k++) fallers.push({ kind: 'drop', x: 30 + r() * 300, y: 70 + r() * 340, vy: 0, r: 9, spin: 0 });
    fallers.push({ kind: 'ray', x: 280, y: 300, vy: 0, r: 12, spin: 0.4 });
    fallers.push({ kind: 'ray', x: 70, y: 180, vy: 0, r: 12, spin: 1 });
    fallers.push({ kind: 'orb', x: 205, y: 220, vy: 0, r: 26, area: remaining()[1], color: ORB_COLORS[0], spin: 0 });
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
          lead(points, best);
          return;
        }
      }
      step(dt);
    }
    draw(paused ? 0 : dt);
  });
}

function lead(points: number, best: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: 'Glow complete',
    sub: 'Where should we send your confidence score and treatment match?',
    note: 'No spam — just your results and, if you want one, a note to book a consultation.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.unshift({ area: 'Arcade score', detail: `${points} glow · best combo x${best}`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const extra = el('div');
      if (OFFER) {
        const offer = el('div', 'result-extra offer');
        offer.append(el('div', 'label', 'You unlocked'), el('div', 'value', OFFER));
        extra.appendChild(offer);
      }
      extra.appendChild(arcadeExtra(points, `Best combo x${best}. Glow points are just for fun; the gauge is your confidence score.`));
      renderResult(stage, { ...result, findings: result.findings.slice(1) }, {
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

if (THUMB) play();
else intro();
