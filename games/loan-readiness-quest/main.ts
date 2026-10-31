// Loan Readiness Quest: a maze chase. Collect credit coins and the six keys while the
// debt monsters roam the halls. Each key asks one readiness challenge and pushes your
// buyer tier up. With all six keys the vault in the middle opens: walk in to finish.
import { GAME_NAME, CHALLENGES, tierFor, TIERS } from './content';
import { GHL_WEBHOOK_URL } from './config';
import { run, current, answer, advance, progressScore, buildResult } from './state';
import { sendLead } from '../_shared/leads';
import { el, renderLeadForm, renderResult } from '../_shared/ui';
import {
  W, H, GOLD, GOLD_LIGHT, THUMB, AUTO, exposeDebug, createArena, leaveArena, startLoop, controls, ask,
  drawHud, drawFloaters, banner, roundRect, renderIntro, arcadeExtra, type Floater, type Dir,
} from '../_shared/arcade';

const stage = document.getElementById('stage')!;

// # wall · . coin · K key · V vault (closed until every key is found) · E monster home · P start
const MAZE = [
  '###############',
  '#K.....E.....K#',
  '#.###.#.#.###.#',
  '#.............#',
  '#.#.###.###.#.#',
  '#.#K..#.#..K#.#',
  '#.###.#.#.###.#',
  '#......V......#',
  '###.#.###.#.###',
  '#...#.....#...#',
  '#.#.#.###.#.#.#',
  '#K#.........#K#',
  '#.#.##.#.##.#.#',
  '#......#......#',
  '#.####.#.####.#',
  '#......P......#',
  '###############',
];
const COLS = MAZE[0].length;
const ROWS = MAZE.length;
const T = 24;
const OX = (W - COLS * T) / 2;
const OY = 92;
const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const MONSTERS = [
  { name: 'Card debt', color: '#ff5c5c', delay: 2 },
  { name: 'Car note', color: '#9b6bff', delay: 5 },
  { name: 'Late fee', color: '#36b5b0', delay: 8 },
];

const find = (ch: string): [number, number] => {
  for (let r = 0; r < ROWS; r++) { const c = MAZE[r].indexOf(ch); if (c >= 0) return [c, r]; }
  return [0, 0];
};

interface Mover { c: number; r: number; dir: Dir | null; prog: number }

function intro() {
  renderIntro(stage, {
    eyebrow: 'Mortgage · Maze Chase',
    title: GAME_NAME,
    sub: 'Six keys are hidden in the maze, and debt monsters are on patrol. Each key you grab asks one readiness challenge and raises your buyer tier. Find all six and the vault opens.',
    howTo: [
      'Move with the arrow keys or WASD, or swipe in the direction you want to go.',
      'Coins are bonus points. Keys are the real goal.',
      'Get caught and you lose a few points and start back at the door.',
    ],
    startLabel: 'Enter the maze',
    onStart: play,
  });
}

function play() {
  const arena = createArena(stage);
  const { ctx } = arena;
  const floaters: Floater[] = [];
  const [pc, pr] = find('P');
  const [ec, er] = find('E');
  const [vc, vr] = find('V');

  const coins = new Set<string>();
  const keys = new Set<string>();
  MAZE.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '.') coins.add(`${c},${r}`);
    if (ch === 'K') keys.add(`${c},${r}`);
  }));

  let t = 0;
  let points = 0;
  let found = 0;
  let paused = false;
  let invuln = 1.5;
  let caughtCount = 0;
  let finishing = 0;
  let wanted: Dir | null = null;
  const player: Mover = { c: pc, r: pr, dir: null, prog: 0 };
  const monsters = MONSTERS.map((m) => ({ ...m, mv: { c: ec, r: er, dir: null as Dir | null, prog: 0 }, wait: m.delay }));
  let shownTier = tierFor(0).name;
  let tierFlash = 0;

  const vaultOpen = () => found >= CHALLENGES.length;
  const open = (c: number, r: number) => {
    const ch = MAZE[r]?.[c];
    if (!ch || ch === '#') return false;
    if (ch === 'V') return vaultOpen();
    return true;
  };
  const canGo = (m: Mover, d: Dir) => open(m.c + DIRS[d][0], m.r + DIRS[d][1]);

  const input = controls(arena, { onDir: (d) => (wanted = d) });
  exposeDebug(() => ({
    points, found, caughtCount, paused, tier: shownTier, coins: coins.size,
    player: `${player.c},${player.r} ${player.dir} ${wanted}`,
    keys: [...keys],
    monsters: monsters.map((m) => `${m.mv.c},${m.mv.r} ${m.mv.dir} w${m.wait.toFixed(1)}`),
  }));

  async function grabKey() {
    paused = true;
    const ch = current();
    const { idx } = await ask(arena, {
      tag: `Key ${found + 1} of ${CHALLENGES.length} · ${ch.area}`,
      prompt: ch.prompt,
      answers: ch.answers.map((a) => a.label),
      finding: (i) => ({ text: ch.answers[i].finding, severity: ch.answers[i].severity }),
      continueLabel: found === CHALLENGES.length - 1 ? 'Open the vault' : 'Back to the maze',
    });
    answer(idx);
    advance();
    found += 1;
    points += 100;
    invuln = Math.max(invuln, 1.5);
    const tier = tierFor(progressScore()).name;
    if (tier !== shownTier) { shownTier = tier; tierFlash = 2; }
    paused = false;
  }

  /** Moves an entity along the grid; `choose` picks a direction at each tile center. */
  function move(m: Mover, speed: number, dt: number, choose: (m: Mover) => Dir | null) {
    if (!m.dir) {
      m.dir = choose(m);
      if (!m.dir) return;
    }
    m.prog += speed * dt;
    while (m.prog >= 1) {
      m.c += DIRS[m.dir!][0];
      m.r += DIRS[m.dir!][1];
      m.prog -= 1;
      const next = choose(m);
      if (!next) { m.dir = null; m.prog = 0; return; }
      m.dir = next;
    }
  }

  const playerChoose = (m: Mover): Dir | null => {
    if (AUTO) wanted = botDir();
    if (wanted && canGo(m, wanted)) return wanted;
    if (m.dir && canGo(m, m.dir)) return m.dir;
    return null;
  };

  /** Monsters chase at junctions with some randomness, and never reverse unless stuck. */
  const monsterChoose = (idx: number) => (m: Mover): Dir | null => {
    const options = (Object.keys(DIRS) as Dir[]).filter((d) => canGo(m, d) && d !== (m.dir ? OPP[m.dir] : null));
    if (!options.length) return m.dir ? OPP[m.dir] : null;
    if (Math.random() < 0.35 + idx * 0.15) return options[Math.floor(Math.random() * options.length)];
    const tc = player.c + (idx === 1 && player.dir ? DIRS[player.dir][0] * 3 : 0);
    const tr = player.r + (idx === 1 && player.dir ? DIRS[player.dir][1] * 3 : 0);
    return options.sort((a, b) => {
      const da = Math.hypot(m.c + DIRS[a][0] - tc, m.r + DIRS[a][1] - tr);
      const db = Math.hypot(m.c + DIRS[b][0] - tc, m.r + DIRS[b][1] - tr);
      return da - db;
    })[0];
  };

  /** AUTO: walk the shortest path to the nearest key (or the open vault), around monsters. */
  function botDir(): Dir | null {
    const danger = new Set<string>();
    monsters.forEach((m) => {
      if (m.wait > 0) return;
      danger.add(`${m.mv.c},${m.mv.r}`);
      if (m.mv.dir) danger.add(`${m.mv.c + DIRS[m.mv.dir][0]},${m.mv.r + DIRS[m.mv.dir][1]}`);
    });
    return botPath(danger) ?? botPath(new Set());
  }

  function botPath(danger: Set<string>): Dir | null {
    const goals = vaultOpen() ? new Set([`${vc},${vr}`]) : keys;
    const startK = `${player.c},${player.r}`;
    const prev = new Map<string, [string, Dir]>();
    const q = [[player.c, player.r]];
    const seen = new Set([startK]);
    while (q.length) {
      const [c, r] = q.shift()!;
      const k = `${c},${r}`;
      if (goals.has(k) && k !== startK) {
        let cur = k;
        let dir: Dir | null = null;
        while (cur !== startK) { const [p, d] = prev.get(cur)!; dir = d; cur = p; }
        return dir;
      }
      for (const d of Object.keys(DIRS) as Dir[]) {
        const nc = c + DIRS[d][0];
        const nr = r + DIRS[d][1];
        const nk = `${nc},${nr}`;
        if (!open(nc, nr) || seen.has(nk) || danger.has(nk)) continue;
        seen.add(nk);
        prev.set(nk, [k, d]);
        q.push([nc, nr]);
      }
    }
    return null;
  }

  const posOf = (m: Mover) => ({
    x: m.c + (m.dir ? DIRS[m.dir][0] * m.prog : 0),
    y: m.r + (m.dir ? DIRS[m.dir][1] * m.prog : 0),
  });

  function step(dt: number) {
    t += dt;
    invuln = Math.max(0, invuln - dt);
    tierFlash = Math.max(0, tierFlash - dt);

    // Let the player turn around instantly mid-corridor.
    if (wanted && player.dir && wanted === OPP[player.dir] && player.prog > 0) {
      player.c += DIRS[player.dir][0];
      player.r += DIRS[player.dir][1];
      player.prog = 1 - player.prog;
      player.dir = wanted;
    }
    move(player, 6, dt, playerChoose);

    const pk = `${player.c},${player.r}`;
    if (coins.delete(pk)) points += 5;
    if (keys.delete(pk)) {
      floaters.push({ x: OX + player.c * T + T / 2, y: OY + player.r * T, text: '+100', color: GOLD_LIGHT, t: 0 });
      void grabKey();
      return;
    }
    if (vaultOpen() && player.c === vc && player.r === vr && !finishing) {
      points += 250;
      finishing = 0.001;
      return;
    }

    const mSpeed = 3.6 + found * 0.25;
    monsters.forEach((m, i) => {
      if (m.wait > 0) { m.wait -= dt; return; }
      move(m.mv, mSpeed, dt, monsterChoose(i));
    });

    if (invuln <= 0) {
      const pp = posOf(player);
      const hit = monsters.some((m) => {
        if (m.wait > 0) return false;
        const mp = posOf(m.mv);
        return Math.hypot(mp.x - pp.x, mp.y - pp.y) < 0.65;
      });
      if (hit) {
        caughtCount += 1;
        const lost = Math.min(points, 40);
        points -= lost;
        floaters.push({ x: OX + pp.x * T + T / 2, y: OY + pp.y * T, text: lost ? `-${lost}` : 'Caught!', color: '#ff5c5c', t: 0 });
        // Only the player goes back to the door; the monsters keep roaming so no
        // corner of the maze gets camped by their home.
        Object.assign(player, { c: pc, r: pr, dir: null, prog: 0 });
        wanted = null;
        // The play-test bot can't dodge well; after two catches let it finish the run.
        invuln = AUTO && caughtCount >= 2 ? 999 : 2;
      }
    }
  }

  function drawMaze() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = MAZE[r][c];
        const x = OX + c * T;
        const y = OY + r * T;
        if (ch === '#') {
          ctx.fillStyle = '#2a2140';
          ctx.fillRect(x, y, T, T);
          ctx.strokeStyle = 'rgba(242,183,5,0.45)';
          ctx.lineWidth = 1.5;
          if (MAZE[r - 1]?.[c] !== '#') { ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x + T, y + 1); ctx.stroke(); }
          if (MAZE[r + 1]?.[c] !== '#' && r < ROWS - 1) { ctx.beginPath(); ctx.moveTo(x, y + T - 1); ctx.lineTo(x + T, y + T - 1); ctx.stroke(); }
          if (MAZE[r][c - 1] !== '#' && c > 0) { ctx.beginPath(); ctx.moveTo(x + 1, y); ctx.lineTo(x + 1, y + T); ctx.stroke(); }
          if (MAZE[r][c + 1] !== '#' && c < COLS - 1) { ctx.beginPath(); ctx.moveTo(x + T - 1, y); ctx.lineTo(x + T - 1, y + T); ctx.stroke(); }
        }
      }
    }
    // Credit coins: small gold coins with a $ stamp.
    ctx.font = '800 5px Inter, sans-serif';
    ctx.textAlign = 'center';
    coins.forEach((k) => {
      const [c, r] = k.split(',').map(Number);
      const cx = OX + c * T + T / 2;
      const cy = OY + r * T + T / 2;
      ctx.fillStyle = '#c99600';
      ctx.beginPath(); ctx.arc(cx, cy, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = GOLD_LIGHT;
      ctx.beginPath(); ctx.arc(cx, cy, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8a6400';
      ctx.fillText('$', cx, cy + 1.8);
    });
    ctx.font = '15px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    keys.forEach((k) => {
      const [c, r] = k.split(',').map(Number);
      const bob = Math.sin(t * 4 + c) * 1.5;
      ctx.shadowColor = GOLD; ctx.shadowBlur = 10;
      ctx.fillText('🔑', OX + c * T + T / 2, OY + r * T + T / 2 + bob);
      ctx.shadowBlur = 0;
    });
    // Vault door
    const x = OX + vc * T;
    const y = OY + vr * T;
    roundRect(ctx, x + 2, y + 2, T - 4, T - 4, 5);
    ctx.fillStyle = vaultOpen() ? GOLD : '#3a3f5c';
    if (vaultOpen()) { ctx.shadowColor = GOLD; ctx.shadowBlur = 16 + Math.sin(t * 6) * 6; }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillText(vaultOpen() ? '🏠' : '🔒', x + T / 2, y + T / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }

  function drawPlayer() {
    if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return;
    const p = posOf(player);
    const x = OX + p.x * T + T / 2;
    const y = OY + p.y * T + T / 2;
    ctx.shadowColor = GOLD; ctx.shadowBlur = 12;
    ctx.fillStyle = GOLD;
    roundRect(ctx, x - 8, y - 8, 16, 16, 5); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a1205';
    ctx.beginPath(); ctx.arc(x - 3.5, y - 1.5, 1.8, 0, Math.PI * 2); ctx.arc(x + 3.5, y - 1.5, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 3, y + 3, 6, 1.6);
  }

  /** A debt monster: an angry walking credit card. */
  function drawMonster(m: typeof monsters[number]) {
    const p = posOf(m.mv);
    const x = OX + p.x * T + T / 2;
    const y = OY + p.y * T + T / 2;
    const step = Math.sin(t * 14 + x) * 2;
    // Legs
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 5); ctx.lineTo(x - 5 + step, y + 10);
    ctx.moveTo(x + 4, y + 5); ctx.lineTo(x + 5 - step, y + 10);
    ctx.stroke();
    // Card body, magnetic stripe and chip
    roundRect(ctx, x - 10, y - 8, 20, 14, 3);
    ctx.fillStyle = m.color;
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(x - 10, y + 1, 20, 2.5);
    ctx.fillStyle = '#ffd84d';
    ctx.fillRect(x + 3, y - 5, 5, 4);
    // Angry eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(x - 5, y - 3, 2.3, 0, Math.PI * 2); ctx.arc(x, y - 3, 2.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(x - 4.6, y - 2.6, 1.1, 0, Math.PI * 2); ctx.arc(x + 0.4, y - 2.6, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 7.5, y - 6.5); ctx.lineTo(x - 3.5, y - 5);
    ctx.moveTo(x + 2.5, y - 6.5); ctx.lineTo(x - 1.5, y - 5);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }

  function drawTierBar() {
    const score = progressScore();
    const x = 14;
    const y = 54;
    const w = W - 28;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('BUYER TIER', x, 48);
    ctx.textAlign = 'right';
    ctx.fillStyle = tierFlash > 0 ? GOLD_LIGHT : '#fff';
    ctx.font = '800 11px Inter, sans-serif';
    ctx.fillText(shownTier.toUpperCase(), W - 14, 48);
    roundRect(ctx, x, y, w, 8, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
    roundRect(ctx, x, y, (w * score) / 100, 8, 4);
    ctx.fillStyle = GOLD; ctx.fill();
    TIERS.slice(1).forEach((tier) => {
      ctx.fillStyle = score >= tier.at ? '#1a1205' : 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + (w * tier.at) / 100 - 1, y, 2, 8);
    });
  }

  function draw(dt: number) {
    ctx.fillStyle = '#0B0D17';
    ctx.fillRect(0, 0, W, H);
    drawTierBar();
    drawMaze();
    monsters.forEach(drawMonster);
    drawPlayer();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(vaultOpen() ? 'The vault is open. Head to the middle!' : 'Find the keys. Dodge the debt.', W / 2, OY + ROWS * T + 22);
    drawFloaters(ctx, floaters, dt);
    drawHud(ctx, points, found, CHALLENGES.length, 'PTS · KEYS');
    if (finishing) banner(ctx, 'VAULT OPENED!', `Tier reached: ${tierFor(progressScore()).name}`);
    else if (tierFlash > 1) banner(ctx, 'TIER UP!', shownTier, Math.min(1, tierFlash - 1));
  }

  if (THUMB) {
    t = 2;
    points = 455; found = 2;
    run.answers[CHALLENGES[0].id] = 0; run.answers[CHALLENGES[1].id] = 2;
    shownTier = tierFor(progressScore()).name;
    keys.delete('1,1'); keys.delete('13,11');
    [...coins].slice(0, 46).forEach((k) => coins.delete(k));
    Object.assign(player, { c: 5, r: 3, dir: 'right', prog: 0.4 });
    Object.assign(monsters[0].mv, { c: 9, r: 3, dir: 'left', prog: 0.2 });
    Object.assign(monsters[1].mv, { c: 3, r: 9, dir: 'up', prog: 0.5 });
    Object.assign(monsters[2].mv, { c: 11, r: 13, dir: 'left', prog: 0 });
    draw(0);
    return;
  }

  const loop = startLoop((dt) => {
    if (!paused) {
      if (finishing) {
        finishing += dt;
        if (finishing > 1.8) {
          loop.stop();
          input.dispose();
          lead(points, caughtCount);
          return;
        }
      } else step(dt);
    }
    draw(paused ? 0 : dt);
  });
}

function ladder(score: number) {
  const wrap = el('div', 'tier-ladder');
  TIERS.forEach((tier) => wrap.appendChild(el('span', score >= tier.at ? 'on' : '', tier.name)));
  return wrap;
}

function lead(points: number, caught: number) {
  leaveArena(stage);
  renderLeadForm(stage, {
    title: 'Vault opened',
    sub: 'Where should we send your readiness report and next steps?',
    note: 'No credit pull, no obligation — just your results and a note from a loan officer if you want one.',
    onSubmit: async (contact) => {
      run.contact = contact;
      const result = buildResult();
      result.findings.splice(1, 0, { area: 'Arcade score', detail: `${points} pts · caught ${caught} times`, severity: 0 });
      await sendLead(GHL_WEBHOOK_URL, contact, result);

      const tier = tierFor(result.score);
      const extra = el('div');
      const box = el('div', 'result-extra');
      box.append(el('div', 'label', 'Tier reached'), el('div', 'value', tier.name), el('div', 'note', tier.blurb), ladder(result.score));
      extra.append(box, arcadeExtra(points, 'Arcade points are just for fun. Your tier comes from your answers.'));

      renderResult(stage, { ...result, findings: result.findings.slice(2) }, {
        eyebrow: 'Your Loan Readiness',
        titles: ['You\'re ready to shop', 'Close — a few things to tighten up', 'Let\'s build your plan first'],
        recLabel: 'Your next unlock',
        extra,
        ctaLabel: 'Talk to a loan officer',
        ctaSubject: `${GAME_NAME} - My Results`,
      });
    },
  });
}

if (THUMB) play();
else intro();
