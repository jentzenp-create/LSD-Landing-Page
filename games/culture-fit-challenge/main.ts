// Culture Fit Challenge: a team-builder snake. Steer your growing team around the
// board, hire good-fit candidates, and steer clear of red flags. Every few hires an
// interview token appears; grab it for a timed hiring-trivia round plus one question
// about your own team.
import { GAME_NAME, ROUNDS, ROUND_SECONDS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, answerTrivia, answerFollowUp, advance, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask,
  drawHud, drawFloaters, banner, roundRect, renderIntro, arcadeExtra, seeded, type Floater, type Dir,
} from '../_shared/arcade';

const stage = document.getElementById('stage')!;
const C = 20;
const COLS = W / C; // 18
const ROWS = 21;
const OY = 84;
const HIRES_PER_ROUND = 4;
const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const TEAM_COLORS = ['#4f86e8', '#9b6bff', '#36b5b0', '#ff9f43', '#ff6b9b', '#43c08a'];

interface Cell { x: number; y: number }
const key = (p: Cell) => `${p.x},${p.y}`;
const wrap = (p: Cell): Cell => ({ x: (p.x + COLS) % COLS, y: (p.y + ROWS) % ROWS });

function intro() {
  renderIntro(stage, {
    eyebrow: 'HR & Hiring · Team Builder',
    title: GAME_NAME,
    sub: `Grow your team one hire at a time. Every ${HIRES_PER_ROUND} hires an interview token appears: grab it for a ${ROUND_SECONDS}-second hiring-trivia round and one quick question about your own team.`,
    howTo: [
      'Steer with the arrow keys or WASD, or swipe. The edges wrap around.',
      'Hire the ⭐ candidates to grow your team. Dodge the 🚩 red flags.',
      'Run into your own team and you lose the people behind you, never the game.',
    ],
    startLabel: 'Start hiring',
    onStart: play,
  });
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const floaters: Floater[] = [];

  let snake: Cell[] = [{ x: 8, y: 14 }, { x: 8, y: 15 }, { x: 8, y: 16 }];
  let colors = [GOLD, TEAM_COLORS[0], TEAM_COLORS[1]];
  let dir: Dir = 'up';
  const queue: Dir[] = [];
  let acc = 0;
  let t = 0;
  let points = 0;
  let hires = 0;
  let sinceRound = 0;
  let rounds = 0;
  let paused = false;
  let finishing = 0;
  let candidate: Cell | null = null;
  let token: Cell | null = null;
  let flags: Cell[] = [];
  let flagTimer = 0;
  let flash = 0;
  let longest = snake.length;

  const occupied = () => new Set([...snake, ...flags, ...(candidate ? [candidate] : []), ...(token ? [token] : [])].map(key));
  const freeCell = (): Cell => {
    const taken = occupied();
    const head = snake[0];
    for (let i = 0; i < 400; i++) {
      const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      if (!taken.has(key(p)) && Math.abs(p.x - head.x) + Math.abs(p.y - head.y) > 3) return p;
    }
    return { x: 0, y: 0 };
  };

  candidate = freeCell();

  const input = controls(arena, {
    onDir: (d) => {
      const last = queue[queue.length - 1] ?? dir;
      if (d !== last && d !== OPP[last] && queue.length < 2) queue.push(d);
    },
  });
  exposeDebug(() => ({ points, hires, rounds, len: snake.length, paused, trivia: run.points }));

  async function interview() {
    paused = true;
    const r = current();
    const trivia = await ask(arena, {
      tag: `Interview ${rounds + 1} of ${ROUNDS.length} · Hiring trivia`,
      prompt: r.trivia.question,
      answers: r.trivia.options,
      seconds: ROUND_SECONDS,
      finding: (i) => ({
        text: `${i === r.trivia.correct ? 'Correct!' : i < 0 ? 'Time’s up.' : 'Not quite.'} ${r.trivia.explain}`,
        severity: i === r.trivia.correct ? 0 : 2,
      }),
      continueLabel: 'Now, about your team',
    });
    const earned = answerTrivia(trivia.idx < 0 ? null : trivia.idx, trivia.secondsLeft);
    points += Math.round(earned / 5);
    const follow = await ask(arena, {
      tag: `Interview ${rounds + 1} of ${ROUNDS.length} · ${r.area}`,
      prompt: r.followUp.prompt,
      answers: r.followUp.answers.map((a) => a.label),
      finding: (i) => ({ text: r.followUp.answers[i].finding, severity: r.followUp.answers[i].severity }),
      continueLabel: rounds === ROUNDS.length - 1 ? 'Finish the team' : 'Back to hiring',
    });
    answerFollowUp(follow.idx);
    advance();
    rounds += 1;
    if (earned) floaters.push({ x: W / 2, y: OY + 40, text: `Trivia +${earned}`, color: GOLD_LIGHT, t: 0 });
    // Red flags start showing up after the first interview, and there are more each round.
    flags = Array.from({ length: Math.min(6, rounds + 1) }, freeCell);
    flagTimer = 9;
    if (rounds >= ROUNDS.length) finishing = 0.001;
    paused = false;
  }

  function cutAt(i: number, why: string) {
    const lost = snake.length - i;
    snake = snake.slice(0, Math.max(2, i));
    colors = colors.slice(0, snake.length);
    const pen = Math.min(points, lost * 5);
    points -= pen;
    flash = 0.3;
    floaters.push({ x: snake[0].x * C + C / 2, y: OY + snake[0].y * C, text: `${why} -${pen}`, color: '#ff5c5c', t: 0 });
  }

  /** AUTO: head for the token (or candidate) by the shortest wrapped distance, avoiding hazards. */
  function bot() {
    const goal = token ?? candidate;
    if (!goal) return;
    const head = snake[0];
    const blocked = new Set([...snake.slice(0, -1), ...flags].map(key));
    const options = (Object.keys(DIRS) as Dir[]).filter((d) => d !== OPP[dir]);
    const dist = (p: Cell) => {
      const dx = Math.abs(p.x - goal.x);
      const dy = Math.abs(p.y - goal.y);
      return Math.min(dx, COLS - dx) + Math.min(dy, ROWS - dy);
    };
    const ranked = options
      .map((d) => ({ d, p: wrap({ x: head.x + DIRS[d][0], y: head.y + DIRS[d][1] }) }))
      .filter((o) => !blocked.has(key(o.p)))
      .sort((a, b) => dist(a.p) - dist(b.p));
    if (ranked[0]) { queue.length = 0; queue.push(ranked[0].d); }
  }

  function tick() {
    if (AUTO) bot();
    const next = queue.shift();
    if (next && next !== OPP[dir]) dir = next;
    const head = wrap({ x: snake[0].x + DIRS[dir][0], y: snake[0].y + DIRS[dir][1] });
    const hk = key(head);
    const grow = candidate && key(candidate) === hk;
    snake.unshift(head);
    if (!grow) snake.pop();

    if (grow) {
      hires += 1;
      sinceRound += 1;
      points += 10;
      // The new hire joins right behind you; everyone else keeps their color.
      colors.splice(1, 0, TEAM_COLORS[hires % TEAM_COLORS.length]);
      longest = Math.max(longest, snake.length);
      floaters.push({ x: head.x * C + C / 2, y: OY + head.y * C, text: '+10', color: '#fff', t: 0 });
      candidate = freeCell();
      if (sinceRound >= HIRES_PER_ROUND && !token && rounds < ROUNDS.length) {
        token = freeCell();
        sinceRound = 0;
      }
    }
    if (token && key(token) === hk) {
      token = null;
      points += 50;
      void interview();
      return;
    }
    const selfHit = snake.findIndex((p, i) => i > 0 && key(p) === hk);
    if (selfHit > 0) cutAt(selfHit, 'Ouch!');
    const flagHit = flags.findIndex((f) => key(f) === hk);
    if (flagHit >= 0) {
      flags.splice(flagHit, 1);
      cutAt(Math.max(2, snake.length - 2), 'Red flag!');
    }
  }

  function step(dt: number) {
    t += dt;
    flash = Math.max(0, flash - dt);
    if (flags.length) {
      flagTimer -= dt;
      if (flagTimer <= 0) { flags = flags.map(freeCell); flagTimer = 9; }
    }
    const rate = 7 + rounds * 0.7;
    acc += dt * rate;
    while (acc >= 1 && !paused) {
      acc -= 1;
      tick();
    }
  }

  function drawPerson(p: Cell, color: string, head: boolean) {
    const x = p.x * C + C / 2;
    const y = OY + p.y * C + C / 2;
    if (head) { ctx.shadowColor = GOLD; ctx.shadowBlur = 12; }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, head ? 9 : 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(10,10,20,0.75)';
    ctx.beginPath(); ctx.arc(x - 3, y - 1.5, 1.4, 0, Math.PI * 2); ctx.arc(x + 3, y - 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(10,10,20,0.75)'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(x, y + 1.5, 3, 0.2, Math.PI - 0.2); ctx.stroke();
  }

  function draw(dt: number) {
    ctx.fillStyle = '#0B0D17';
    ctx.fillRect(0, 0, W, H);
    // Office floor grid
    roundRect(ctx, 0, OY, W, ROWS * C, 0);
    ctx.fillStyle = '#141729';
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if ((r + c) % 2 === 0) ctx.fillRect(c * C, OY + r * C, C, C);

    // Top panel: team size and hires to the next interview
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TEAM SIZE', 14, 52);
    ctx.fillStyle = '#fff';
    ctx.font = '900 18px Inter, sans-serif';
    ctx.fillText(String(snake.length), 14, 72);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.fillText(token ? 'INTERVIEW READY' : 'NEXT INTERVIEW', W - 14, 52);
    for (let i = 0; i < HIRES_PER_ROUND; i++) {
      ctx.fillStyle = token || i < sinceRound ? GOLD : 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(W - 20 - (HIRES_PER_ROUND - 1 - i) * 16, 67, 5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.font = '15px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff'; // emoji inherit fill alpha, so reset it
    flags.forEach((f) => ctx.fillText('🚩', f.x * C + C / 2, OY + f.y * C + C / 2 + 1));
    if (candidate) {
      const bob = Math.sin(t * 5) * 1.2;
      ctx.fillText('⭐', candidate.x * C + C / 2, OY + candidate.y * C + C / 2 + bob);
    }
    if (token) {
      const x = token.x * C + C / 2;
      const y = OY + token.y * C + C / 2;
      ctx.shadowColor = GOLD; ctx.shadowBlur = 14 + Math.sin(t * 6) * 6;
      ctx.fillStyle = GOLD;
      roundRect(ctx, x - 9, y - 9, 18, 18, 5); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillText('📋', x, y + 1);
    }
    ctx.textBaseline = 'alphabetic';
    for (let i = snake.length - 1; i >= 0; i--) drawPerson(snake[i], colors[i] ?? TEAM_COLORS[0], i === 0);

    if (flash > 0) {
      ctx.fillStyle = `rgba(255,92,92,${flash})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(token ? 'Grab the 📋 for your interview round!' : 'Hire the ⭐ candidates. Avoid the 🚩.', W / 2, OY + ROWS * C + 24);
    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, rounds, ROUNDS.length, 'PTS · INTERVIEWS');
    if (finishing) banner(ctx, 'DREAM TEAM!', `${run.correct}/${ROUNDS.length} trivia correct`);
    else if (t < 2 && !THUMB) banner(ctx, 'GO!', 'Steer toward the ⭐', Math.min(1, 2 - t));
  }

  if (THUMB) {
    const r = seeded(4);
    snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 7, y: 11 }, { x: 8, y: 11 }, { x: 9, y: 11 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    colors = [GOLD, ...snake.slice(1).map((_, i) => TEAM_COLORS[i % TEAM_COLORS.length])];
    candidate = { x: 13, y: 6 };
    token = { x: 4, y: 15 };
    flags = [{ x: 14, y: 14 }, { x: 3, y: 5 }, { x: 11, y: 17 }];
    points = 320; rounds = 2; sinceRound = 4; t = 3 + r();
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
          lead(points, longest);
          return;
        }
      } else step(dt);
    }
    draw(paused ? 0 : dt);
  });
}

function lead(points: number, longest: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: 'Team assembled',
    sub: 'Where should we send your hiring health score and trivia results?',
    note: 'No spam — just your results and, if there’s a real gap, a note from our team.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.splice(1, 0, { area: 'Arcade score', detail: `${points} pts · team of ${longest}`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const extra = el('div');
      const trivia = el('div', 'result-extra');
      trivia.append(
        el('div', 'label', 'Trivia'),
        el('div', 'value', `${run.correct} / ${ROUNDS.length} correct · ${run.points} pts`),
        el('div', 'note', 'The gauge scores your team’s hiring health — your trivia points are just bragging rights.'),
      );
      extra.append(trivia, arcadeExtra(points, `Biggest team: ${longest}.`));

      renderResult(stage, { ...result, findings: result.findings.slice(2) }, {
        eyebrow: 'Your Hiring Health',
        titles: ['Your team is in great shape', 'Solid, with a couple of leaks to plug', 'Hiring is costing you more than it should'],
        recLabel: 'Highest-impact fix',
        extra,
        ctaLabel: 'Talk to an HR advisor',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

if (THUMB) play();
else intro();
