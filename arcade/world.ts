// A playable world (1 = night "Get Found", 2 = day "Speed to Lead"): gameplay
// logic + its 3D objects. Also runs the attract-mode demo (a bot plays behind
// the title screen) when opts.demo is true.
import * as THREE from 'three';
import { MAX_HEARTS, PHYS } from './config';
import { getIndustry, getWorld, type EnemyType, type Industry, type WorldDef } from './content';
import { buildLevel1, buildLevel2, ROWS, STREET_ROW, T, type LevelData, type SunReward } from './levels';
import { makeBody, overlaps, TileGrid, type Body } from './engine/physics';
import { ease, Tweens } from './engine/tween';
import type { Input, Pad } from './engine/input';
import { Boss } from './boss';
import {
  makeAura,
  makeBlobShadow,
  makeBlock,
  makeBolt,
  makeCloud,
  makeCricket,
  makeGrump,
  makeHero,
  makeLamp,
  makeLead,
  makePhone,
  makeSnail,
  makeStar,
  makeSunOrb,
  makeTree,
  type CreatureModel,
  type HeroModel,
} from './render/models';
import { Town, type Stage } from './render/stage';
import { tex } from './render/textures';
import type { UI } from './ui';
import { finishWorld, run } from './state';
import * as sfx from './sfx';

const STAR_BLOCK_VALUE = 3;
const DEMO_MS = 32000;
const STEP = 1 / 120;
const LEAD_LIFETIME = 6; // seconds before a hot lead goes cold
const AUTOPILOT_MS = 7000;
const BIG_SCALE = 1.35;

interface Enemy {
  type: EnemyType;
  role: 'walker' | 'hopper';
  body: Body;
  model: CreatureModel;
  shadow: THREE.Mesh;
  awake: boolean;
  dead: boolean;
  dir: 1 | -1;
  nextHop: number;
}

interface Block {
  c: number;
  r: number;
  mesh: THREE.Mesh;
  bump: { y: number };
}

interface Pickup {
  c: number;
  r: number;
  obj: THREE.Object3D;
  state: 'waiting' | 'hot' | 'taken' | 'cold';
  age: number;
  setHeat?: (h: number) => void;
}

interface PowerItem {
  kind: 'sun' | 'bolt';
  body: Body;
  root: THREE.Object3D;
  animate: (t: number) => void;
  emerging: number; // seconds left rising out of the block
  dir: 1 | -1;
  active: boolean;
}

interface Particle {
  obj: THREE.Object3D;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  gravity: number;
  spin: number;
}

export interface WorldOptions {
  demo: boolean;
  industry: Industry;
  number: 1 | 2;
  stage: Stage;
  ui: UI;
  input: Input;
  onDemoEnd?: () => void;
  onVictory?: () => void;
}

export class World {
  readonly group = new THREE.Group();
  readonly tweens = new Tweens();
  readonly grid: TileGrid;
  readonly level: LevelData;
  readonly def: WorldDef;
  private demo: boolean;
  private town: Town;

  /** Game clock in ms (stops while the tab is hidden; keeps running during dialogs). */
  now = 0;
  private acc = 0;
  frozen = false;

  // Player
  readonly player: Body;
  private hero: HeroModel;
  private heroShadow: THREE.Mesh;
  private facing: 1 | -1 = 1;
  hearts = MAX_HEARTS;
  private invulnUntil = 0;
  private lastGroundAt = -1e9;
  private jumpBufferedAt = -1e9;
  private prevJump = false;
  private checkpointCol: number;

  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private items: PowerItem[] = [];
  private clouds: THREE.Object3D[] = [];
  private big = false;
  private autopilotUntil = 0;
  private aura: THREE.Sprite;
  private tipsShown = new Set<string>();
  private blocks = new Map<string, Block>();
  private lamps: { col: number; lamp: ReturnType<typeof makeLamp>; threshold: number; checkpoint: boolean; lit: boolean }[] = [];
  private particles: Particle[] = [];
  private lit = 0;
  private demoLit = 0;

  private inArena = false;
  boss?: Boss;
  private botJumpUntil = 0;
  private botLastX = 0;
  private botStuckSince = 0;
  private demoEnding = false;
  private disposed = false;

  constructor(private opts: WorldOptions) {
    this.demo = opts.demo;
    this.def = getWorld(opts.industry, opts.number);
    this.level = opts.number === 1 ? buildLevel1() : buildLevel2();
    opts.stage.setTheme(this.def.theme);
    this.grid = new TileGrid(this.level.tiles, this.level.cols, this.level.rows);
    this.checkpointCol = this.level.start.col;
    opts.stage.scene.add(this.group);

    this.town = new Town(this.level.cols, STREET_ROW, this.def.theme);
    this.group.add(this.town.group);
    this.buildTerrain();
    this.buildPickups();
    this.buildLamps();
    if (this.def.theme === 'day') this.buildDayDecor();

    this.player = makeBody(this.level.start.col + 0.2, STREET_ROW - 0.94, 0.62, 0.94);
    this.hero = makeHero();
    this.group.add(this.hero.root);
    this.heroShadow = makeBlobShadow();
    this.group.add(this.heroShadow);
    this.aura = makeAura();
    this.aura.visible = false;
    this.hero.root.add(this.aura);

    for (const e of this.level.enemies) this.spawnEnemy(e.col, e.role);

    let starBlocks = 0;
    this.level.sunBlocks.forEach((r) => r.kind === 'star' && starBlocks++);
    if (!this.demo) {
      run.stars = 0;
      run.starsTotal = this.level.pickups.length + starBlocks * STAR_BLOCK_VALUE;
    }
    this.botLastX = this.player.x;
    this.updateLit();
    this.refreshHud();
    opts.ui.setBoss(null);
    const half = opts.stage.halfWidth(22);
    opts.stage.cam = { x: half, y: 9.6, dist: 22 };
  }

  // ---------------------------------------------------------------- building

  private buildTerrain() {
    const { cols } = this.level;
    // Ground: one chunky slab per continuous stretch of street
    const day = this.def.theme === 'day';
    const dirtTex = day ? tex.dirtDay : tex.dirt;
    const walkTex = day ? tex.sidewalkDay : tex.sidewalk;
    const sideMat = new THREE.MeshStandardMaterial({ map: dirtTex(), roughness: 1 });
    for (let c = 0; c < cols; ) {
      if (this.grid.get(c, STREET_ROW) !== T.STREET) {
        c++;
        continue;
      }
      let end = c;
      while (end + 1 < cols && this.grid.get(end + 1, STREET_ROW) === T.STREET) end++;
      const len = end - c + 1;
      const depth = 3.2;
      const height = ROWS - STREET_ROW + 2;
      const top = walkTex().clone();
      top.repeat.set(len, depth);
      top.needsUpdate = true;
      const front = dirtTex().clone();
      front.repeat.set(len / 2, height / 2);
      front.needsUpdate = true;
      const topMat = new THREE.MeshStandardMaterial({ map: top, roughness: 0.9 });
      const frontMat = new THREE.MeshStandardMaterial({ map: front, roughness: 1 });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(len, height, depth), [sideMat, sideMat, topMat, sideMat, frontMat, frontMat]);
      slab.position.set(c + len / 2, -STREET_ROW - height / 2, -0.6);
      this.group.add(slab);
      // Curb strip along the front edge
      const curb = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.25), new THREE.MeshStandardMaterial({ color: day ? 0x6fbf5f : 0xb8b4d4, roughness: 0.8 }));
      curb.position.set(c + len / 2, -STREET_ROW + 0.02, 0.95);
      this.group.add(curb);
      c = end + 1;
    }

    // Individual blocks (bricks, crates, sun blocks, walls)
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < cols; c++) {
        const t = this.grid.get(c, r);
        if (t === T.EMPTY || t === T.STREET || t === T.DIRT) continue;
        this.addBlock(c, r, t);
      }
  }

  private addBlock(c: number, r: number, t: number) {
    const kind = t === T.BRICK ? 'brick' : t === T.SUN ? 'sun' : t === T.USED ? 'used' : t === T.CRATE ? 'crate' : 'wall';
    const mesh = makeBlock(kind === 'wall' && this.def.theme === 'day' ? 'brick' : kind);
    if (kind === 'wall') mesh.scale.z = 2.4;
    mesh.position.set(c + 0.5, -(r + 0.5), 0);
    this.group.add(mesh);
    const block = { c, r, mesh, bump: { y: 0 } };
    this.blocks.set(`${c},${r}`, block);
    return block;
  }

  private buildPickups() {
    for (const p of this.level.pickups) {
      if (this.def.pickup === 'star') {
        const mesh = makeStar();
        mesh.position.set(p.col + 0.5, -(p.row + 0.5), 0);
        this.group.add(mesh);
        this.pickups.push({ c: p.col, r: p.row, obj: mesh, state: 'waiting', age: 0 });
      } else {
        const lead = makeLead();
        lead.root.position.set(p.col + 0.5, -(p.row + 0.5), 0);
        lead.setHeat(1);
        this.group.add(lead.root);
        this.pickups.push({ c: p.col, r: p.row, obj: lead.root, state: 'waiting', age: 0, setHeat: lead.setHeat });
      }
    }
  }

  private buildDayDecor() {
    for (let col = 4; col < this.level.arena.left - 2; col += 9) {
      if (this.grid.get(col, STREET_ROW) !== T.STREET || this.grid.get(col, STREET_ROW - 1) !== T.EMPTY) continue;
      const tree = makeTree(col);
      tree.position.set(col + 0.5, -STREET_ROW, -1.5);
      tree.scale.setScalar(0.9 + (col % 3) * 0.12);
      this.group.add(tree);
    }
    for (let i = 0; i < 16; i++) {
      const cloud = makeCloud(i);
      cloud.position.set(i * 16 - 10 + (i % 3) * 5, -STREET_ROW + 15 + (i % 4) * 2.5, -45 - (i % 3) * 8);
      this.group.add(cloud);
      this.clouds.push(cloud);
    }
  }

  private buildLamps() {
    const { arena } = this.level;
    for (let col = 6; col < arena.left - 2 && this.def.theme === 'night'; col += 14) {
      if (this.grid.get(col, STREET_ROW) !== T.STREET) continue;
      const lamp = makeLamp();
      lamp.root.position.set(col + 0.5, -STREET_ROW, -1.2);
      this.group.add(lamp.root);
      this.lamps.push({ col, lamp, threshold: Math.min(0.95, (col / arena.left) * 0.9 + 0.05), checkpoint: false, lit: false });
    }
    for (const col of this.level.checkpoints) {
      const lamp = makeLamp();
      lamp.root.position.set(col + 0.5, -STREET_ROW, -0.3);
      lamp.root.scale.setScalar(1.15);
      this.group.add(lamp.root);
      this.lamps.push({ col, lamp, threshold: 2, checkpoint: true, lit: false });
    }
  }

  private spawnEnemy(col: number, role: 'walker' | 'hopper') {
    const type = this.def.enemies[role === 'walker' ? 0 : 1];
    const model = { grump: makeGrump, cricket: makeCricket, snail: makeSnail, phone: makePhone }[type]();
    const h = { grump: 0.75, cricket: 0.56, snail: 0.6, phone: 0.62 }[type];
    const body = makeBody(col + 0.12, STREET_ROW - h, 0.75, h);
    const shadow = makeBlobShadow();
    this.group.add(model.root, shadow);
    this.enemies.push({ type, role, body, model, shadow, awake: false, dead: false, dir: -1, nextHop: 0 });
  }

  // ---------------------------------------------------------------- HUD

  refreshHud() {
    const { ui } = this.opts;
    if (this.demo) {
      ui.setHud({ hearts: this.hearts, count: '', meterLabel: this.def.meter, meter: this.lit, score: 'DEMO' });
      return;
    }
    ui.setHud({
      hearts: this.hearts,
      count: `${run.stars}/${run.starsTotal} ${this.def.collectible}`,
      meterLabel: this.def.meter,
      meter: this.lit,
      score: String(run.score).padStart(6, '0'),
    });
  }

  private label(text: string, x: number, y: number, kind: 'score' | 'gold' | 'red' = 'score') {
    this.opts.ui.floatLabel(text, this.opts.stage.toScreen(x, y), kind);
  }

  private addScore(points: number, x?: number, y?: number) {
    if (this.demo) return;
    run.score += points;
    this.refreshHud();
    if (x !== undefined && y !== undefined) this.label(`+${points}`, x, y);
  }

  private updateLit(force?: number) {
    this.lit = force ?? (this.demo ? this.demoLit : run.starsTotal ? Math.min(1, run.stars / run.starsTotal) : 0);
    if (this.def.theme === 'day') {
      this.refreshHud();
      return;
    }
    this.opts.stage.setLit(this.lit);
    this.town.setLit(this.lit);
    for (const l of this.lamps) {
      if (!l.checkpoint && !l.lit && this.lit >= l.threshold) {
        l.lit = true;
        l.lamp.setLit(true);
      }
    }
    this.refreshHud();
  }

  // ---------------------------------------------------------------- main loop

  update(dt: number) {
    if (this.disposed) return;
    this.now += dt * 1000;
    this.tweens.update(dt * 1000);

    if (!this.frozen) {
      this.acc += dt;
      while (this.acc >= STEP) {
        this.step(STEP);
        this.acc -= STEP;
      }
    } else {
      this.acc = 0;
      this.player.vx = 0;
    }

    this.boss?.update(dt, this.player, this.frozen);
    this.updateVisuals(dt);
    this.updateCamera(dt);
  }

  private step(dt: number) {
    const pad = this.readPad();
    this.movePlayer(pad, dt);
    this.updateEnemies(dt);
    this.updateItems(dt);
    this.checkPickups(dt);
    this.updateCheckpoints();

    if (this.player.y > ROWS + 1.5) {
      if (this.demo) this.endDemo();
      else this.fellInPit();
    }
    if (this.demo) {
      if (this.now > DEMO_MS || this.player.x > this.level.arena.left - 1) this.endDemo();
    } else if (!this.inArena && this.player.x > this.level.arena.left + 2) {
      void this.enterArena();
    }
  }

  private readPad(): Pad {
    if (this.demo) return this.botPad();
    return this.opts.input.read();
  }

  private movePlayer(pad: Pad, dt: number) {
    const b = this.player;
    const accel = b.onGround ? PHYS.accel : PHYS.airAccel;
    if (pad.left && !pad.right) {
      b.vx -= (b.vx > 0 ? accel * 2 : accel) * dt;
      this.facing = -1;
    } else if (pad.right && !pad.left) {
      b.vx += (b.vx < 0 ? accel * 2 : accel) * dt;
      this.facing = 1;
    } else {
      const d = PHYS.drag * dt;
      b.vx = Math.abs(b.vx) <= d ? 0 : b.vx - Math.sign(b.vx) * d;
    }
    const max = PHYS.runSpeed * (this.autopilot ? 1.45 : 1);
    b.vx = THREE.MathUtils.clamp(b.vx, -max, max);

    // Jump with coyote time, input buffering and variable height
    if (b.onGround) this.lastGroundAt = this.now;
    if (pad.jump && !this.prevJump) this.jumpBufferedAt = this.now;
    if (this.now - this.jumpBufferedAt < PHYS.jumpBufferMs && this.now - this.lastGroundAt < PHYS.coyoteMs) {
      b.vy = -PHYS.jumpVelocity;
      this.jumpBufferedAt = this.lastGroundAt = -1e9;
      sfx.play('jump');
    }
    if (!pad.jump && b.vy < -PHYS.jumpCutVelocity) b.vy = -PHYS.jumpCutVelocity;
    this.prevJump = pad.jump;

    b.vy = Math.min(PHYS.maxFall, b.vy + PHYS.gravity * dt);
    this.grid.move(b, dt);

    if (b.hitUp.length) {
      const cx = b.x + b.w / 2;
      const tile = b.hitUp.reduce((best, t) => (Math.abs(t.c + 0.5 - cx) < Math.abs(best.c + 0.5 - cx) ? t : best));
      this.bumpBlock(tile.c, tile.r);
    }
  }

  // ---------------------------------------------------------------- bot

  /** Attract-mode bot: run right, jump at walls, gaps and enemies. */
  private botPad(): Pad {
    const b = this.player;
    if (Math.abs(b.x - this.botLastX) > 0.12) {
      this.botLastX = b.x;
      this.botStuckSince = this.now;
    }
    if (b.onGround && this.now > this.botJumpUntil) {
      const right = b.x + b.w;
      const wall = this.grid.solidAtPoint(right + 0.5, b.y + b.h - 0.25) || this.grid.solidAtPoint(right + 0.5, b.y + 0.1);
      const gap = !this.grid.solidAtPoint(right + 0.6, b.y + b.h + 0.25);
      const enemy = this.enemies.some((e) => !e.dead && e.body.x - b.x > 0 && e.body.x - b.x < 3.2 && Math.abs(e.body.y - b.y) < 1.5);
      const stuck = this.now - this.botStuckSince > 500;
      if (wall || gap || enemy || stuck) this.botJumpUntil = this.now + 320;
    }
    return { left: false, right: true, jump: this.now < this.botJumpUntil };
  }

  private endDemo() {
    if (this.demoEnding) return;
    this.demoEnding = true;
    this.opts.onDemoEnd?.();
  }

  // ---------------------------------------------------------------- blocks & pickups

  private bumpBlock(c: number, r: number) {
    const block = this.blocks.get(`${c},${r}`);
    const t = this.grid.get(c, r);
    if (!block || (t !== T.SUN && t !== T.BRICK)) return;
    if (t === T.BRICK && this.big && !this.demo) {
      this.smashBrick(block);
      return;
    }
    const reward = t === T.SUN ? this.level.sunBlocks.get(`${c},${r}`) : undefined;
    if (t === T.SUN) {
      this.grid.set(c, r, T.USED);
      const m = block.mesh.material as THREE.MeshStandardMaterial;
      m.map = tex.used();
      m.emissiveIntensity = 0;
      m.needsUpdate = true;
    }
    this.tweens.add(block.bump, { y: 0.32 }, 140, { yoyo: true });
    sfx.play('bump');

    // Knock out enemies standing on the block
    for (const e of this.enemies)
      if (!e.dead && Math.abs(e.body.x + e.body.w / 2 - (c + 0.5)) < 0.9 && Math.abs(e.body.y + e.body.h - r) < 0.5) this.killEnemy(e, true);

    if (reward) this.giveReward(reward, c, r);
  }

  private smashBrick(block: Block) {
    this.grid.set(block.c, block.r, T.EMPTY);
    this.blocks.delete(`${block.c},${block.r}`);
    block.mesh.visible = false;
    sfx.play('stomp');
    this.shake(0.15, 100);
    for (let i = 0; i < 6; i++) {
      const chunk = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), block.mesh.material as THREE.Material);
      chunk.position.set(block.c + 0.5, -(block.r + 0.5), 0);
      this.group.add(chunk);
      this.particles.push({ obj: chunk, vx: (i % 3 - 1) * 3, vy: 8 + (i % 2) * 4, vz: (i % 2 ? 1 : -1) * 2, life: 0.9, gravity: -40, spin: 10 });
    }
    // Knock out enemies standing on it
    for (const e of this.enemies)
      if (!e.dead && Math.abs(e.body.x + e.body.w / 2 - (block.c + 0.5)) < 0.9 && Math.abs(e.body.y + e.body.h - block.r) < 0.5) this.killEnemy(e, true);
    this.addScore(50, block.c + 0.5, block.r - 1);
  }

  private giveReward(reward: SunReward, c: number, r: number) {
    const x = c + 0.5;
    if (reward.kind === 'power' || reward.kind === 'bolt') {
      this.spawnItem(reward.kind === 'power' ? 'sun' : 'bolt', c, r);
      return;
    }
    if (reward.kind === 'star' || (reward.kind === 'question' && this.demo)) {
      const s = this.def.pickup === 'star' ? makeStar() : makeLead().root;
      s.position.set(x, -r, 0.2);
      this.group.add(s);
      this.particles.push({ obj: s, vx: 0, vy: 9, vz: 0, life: 0.55, gravity: -26, spin: 14 });
      sfx.play('star');
      if (!this.demo) {
        run.stars += STAR_BLOCK_VALUE;
        this.addScore(100 * STAR_BLOCK_VALUE);
        this.label(`+${STAR_BLOCK_VALUE} ${this.def.collectible}`, x, r - 2, 'gold');
      } else {
        this.demoLit = Math.min(1, this.demoLit + 0.06);
      }
      this.updateLit();
    } else if (reward.kind === 'question') {
      void this.askQuestion(reward.index, `Sun block check-up ${reward.index + 1}/${this.def.questions.length}`);
    }
  }

  // ---------------------------------------------------------------- power-ups

  private get autopilot() {
    return this.now < this.autopilotUntil;
  }

  private spawnItem(kind: 'sun' | 'bolt', c: number, r: number) {
    const model = kind === 'sun' ? makeSunOrb() : makeBolt();
    const body = makeBody(c + 0.15, r - 0.05, 0.7, 0.7);
    this.group.add(model.root);
    sfx.play('power');
    const dir: 1 | -1 = 1; // like the mushroom: always heads forward
    this.items.push({ kind, body, root: model.root, animate: model.animate, emerging: 0.45, dir, active: true });
  }

  private updateItems(dt: number) {
    for (const it of this.items) {
      if (!it.active) continue;
      const b = it.body;
      if (it.emerging > 0) {
        it.emerging -= dt;
        b.y -= (0.75 / 0.45) * dt;
      } else {
        const speed = it.kind === 'sun' ? 2.6 : 3.6;
        if (b.blockedLeft) it.dir = 1;
        if (b.blockedRight) it.dir = -1;
        b.vx = it.dir * speed;
        if (it.kind === 'bolt' && b.onGround) b.vy = -13;
        b.vy = Math.min(PHYS.maxFall, b.vy + PHYS.gravity * dt);
        this.grid.move(b, dt);
        if (b.y > ROWS + 2) it.active = false;
      }
      if (it.emerging <= 0.2 && overlaps(this.player, b)) this.collectItem(it);
    }
    this.items = this.items.filter((it) => {
      if (!it.active) it.root.visible = false;
      return it.active;
    });
  }

  private collectItem(it: PowerItem) {
    it.active = false;
    sfx.play('checkpoint');
    const x = this.player.x;
    const y = this.player.y - 1.5;
    if (it.kind === 'sun') {
      if (this.big) {
        this.addScore(1000, x, y);
      } else {
        this.big = true;
        this.label('Sunshine power!', x, y, 'gold');
        this.tip('sun', 'Sunshine power! You can take an extra hit, and smash bricks from below.');
      }
    } else {
      this.autopilotUntil = this.now + AUTOPILOT_MS;
      this.label('AUTOPILOT!', x, y, 'gold');
      this.tip('bolt', 'Autopilot! Like a good automation: faster, and nothing can stop you for a few seconds.');
    }
    this.addScore(500);
  }

  /** One-time explainer the first time something happens (not in the demo). */
  private tip(key: string, text: string) {
    if (this.demo || this.tipsShown.has(key)) return;
    this.tipsShown.add(key);
    this.opts.ui.toast(text);
  }

  private async askQuestion(index: number, header: string) {
    const q = this.def.questions[index];
    if (!q || q.id in run.answers) return;
    this.frozen = true;
    const choice = await this.opts.ui.ask(header, q.prompt(getIndustry(this.opts.industry).noun), q.answers.map((a) => a.label));
    if (this.disposed) return;
    run.answers[q.id] = choice;
    this.frozen = false;
    this.prevJump = true; // require a fresh press after closing
    this.addScore(500, this.player.x, this.player.y - 1);
    if (this.hearts < MAX_HEARTS) {
      this.hearts += 1;
      this.refreshHud();
    }
  }

  private checkPickups(dt: number) {
    const p = this.player;
    const leads = this.def.pickup === 'lead';
    const screenRight = this.opts.stage.cam.x + this.opts.stage.halfWidth() - 0.5;
    for (const s of this.pickups) {
      if (s.state === 'taken' || s.state === 'cold') continue;
      // Hot leads start cooling as soon as they're on screen
      if (leads) {
        if (s.state === 'waiting' && s.c < screenRight) s.state = 'hot';
        if (s.state === 'hot') {
          s.age += dt;
          s.setHeat?.(Math.max(0, 1 - s.age / LEAD_LIFETIME));
          if (s.age >= LEAD_LIFETIME) {
            s.state = 'cold';
            this.particles.push({ obj: s.obj, vx: 0, vy: -1, vz: -3, life: 0.5, gravity: 0, spin: 3 });
            this.puff(s.c + 0.5, s.r + 0.8, 4);
            if (!this.demo) this.label('Went cold', s.c + 0.5, s.r - 0.3, 'red');
            continue;
          }
        }
      }
      if (!overlaps(p, { x: s.c + 0.15, y: s.r + 0.15, w: 0.7, h: 0.7 })) continue;
      s.state = 'taken';
      this.particles.push({ obj: s.obj, vx: 0, vy: 5, vz: 2, life: 0.35, gravity: 0, spin: 25 });
      sfx.play('star');
      if (this.demo) this.demoLit = Math.min(1, this.demoLit + 0.03);
      else {
        run.stars += 1;
        if (leads) {
          const heat = Math.max(0, 1 - s.age / LEAD_LIFETIME);
          const pts = 100 + Math.round(heat * 200);
          this.addScore(pts);
          if (heat > 0.66) this.label(`Hot lead! +${pts}`, s.c + 0.5, s.r - 0.3, 'gold');
        } else this.addScore(100);
      }
      this.updateLit();
    }
  }

  private updateCheckpoints() {
    for (const l of this.lamps) {
      if (!l.checkpoint || l.lit || this.player.x < l.col) continue;
      l.lit = true;
      l.lamp.setLit(true);
      this.checkpointCol = l.col;
      if (!this.demo) {
        sfx.play('checkpoint');
        this.label('Checkpoint!', l.col + 0.5, STREET_ROW - 4, 'gold');
      }
    }
  }

  // ---------------------------------------------------------------- enemies

  private updateEnemies(dt: number) {
    const camRight = this.opts.stage.cam.x + this.opts.stage.halfWidth() + 2;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const b = e.body;
      if (!e.awake) {
        if (b.x < camRight) e.awake = true;
        else continue;
      }
      if (b.y > ROWS + 2) {
        this.removeEnemy(e);
        continue;
      }
      if (e.role === 'walker') {
        const speed = e.type === 'snail' ? 1.1 : 1.75;
        if (b.blockedLeft) e.dir = 1;
        else if (b.blockedRight) e.dir = -1;
        else if (b.onGround) {
          const ahead = e.dir < 0 ? b.x - 0.1 : b.x + b.w + 0.1;
          if (!this.grid.solidAtPoint(ahead, b.y + b.h + 0.25)) e.dir = e.dir === 1 ? -1 : 1;
        }
        b.vx = e.dir * speed;
      } else if (b.onGround) {
        b.vx = 0;
        const dx = this.player.x - b.x;
        if (Math.abs(dx) < 10.5 && this.now > e.nextHop) {
          b.vx = Math.sign(dx) * (e.type === 'phone' ? 5 : 4.4);
          b.vy = e.type === 'phone' ? -13 : -15;
          e.dir = dx > 0 ? 1 : -1;
          e.nextHop = this.now + 1400;
        }
      }
      b.vy = Math.min(PHYS.maxFall, b.vy + PHYS.gravity * dt);
      this.grid.move(b, dt);

      if (overlaps(this.player, b)) this.onEnemyContact(e);
    }
  }

  private onEnemyContact(e: Enemy) {
    const p = this.player;
    if (this.autopilot && !this.demo) {
      this.killEnemy(e, true);
      sfx.play('stomp');
      this.addScore(200, e.body.x + 0.4, e.body.y - 0.8);
      return;
    }
    if (p.vy > 0 && p.y + p.h - e.body.y < 0.62) {
      this.killEnemy(e);
      p.vy = -(this.prevJump ? PHYS.stompBounce * 1.35 : PHYS.stompBounce);
      sfx.play('stomp');
      this.addScore(200, e.body.x + 0.4, e.body.y - 0.8);
    } else if (!this.demo) {
      this.hurt(e.body.x + e.body.w / 2);
    }
  }

  private killEnemy(e: Enemy, flipped = false) {
    e.dead = true;
    e.shadow.visible = false;
    if (flipped || e.role === 'hopper') {
      e.model.root.rotation.z = Math.PI;
      e.model.root.position.y += 0.8;
      this.particles.push({ obj: e.model.root, vx: 1.5, vy: 6, vz: 3, life: 1.1, gravity: -30, spin: 0 });
    } else {
      e.model.root.scale.set(1.3, 0.3, 1.3);
      this.particles.push({ obj: e.model.root, vx: 0, vy: 0, vz: 0, life: 0.45, gravity: 0, spin: 0 });
    }
    this.puff(e.body.x + e.body.w / 2, e.body.y + e.body.h, 6);
  }

  private removeEnemy(e: Enemy) {
    e.dead = true;
    e.model.root.visible = false;
    e.shadow.visible = false;
  }

  // ---------------------------------------------------------------- damage

  hurt(fromX: number) {
    if (this.now < this.invulnUntil || this.frozen || this.demo || this.autopilot) return;
    if (this.big) {
      // Sunshine absorbs the hit
      this.big = false;
      sfx.play('hurt');
      this.invulnUntil = this.now + PHYS.invulnMs;
      this.player.vx = this.player.x + this.player.w / 2 < fromX ? -7 : 7;
      this.player.vy = -9;
      this.label('Sunshine lost', this.player.x, this.player.y - 1.5, 'red');
      return;
    }
    this.hearts -= 1;
    sfx.play('hurt');
    this.shake(0.25, 160);
    this.invulnUntil = this.now + PHYS.invulnMs;
    this.player.vx = this.player.x + this.player.w / 2 < fromX ? -9 : 9;
    this.player.vy = -12;
    if (this.hearts <= 0) {
      run.deaths += 1;
      this.respawn();
    }
    this.refreshHud();
  }

  private fellInPit() {
    this.hearts -= 1;
    if (this.hearts <= 0) run.deaths += 1;
    sfx.play('hurt');
    this.respawn();
  }

  private respawn() {
    this.big = false;
    this.autopilotUntil = 0;
    if (this.hearts <= 0) {
      this.hearts = MAX_HEARTS;
      this.label('Hearts restored', this.player.x, this.player.y - 2, 'red');
    }
    const x = this.inArena ? this.level.arena.left + 3 : this.checkpointCol + 0.2;
    Object.assign(this.player, { x, y: STREET_ROW - 3, vx: 0, vy: 0 });
    this.invulnUntil = this.now + PHYS.invulnMs;
    this.refreshHud();
  }

  // ---------------------------------------------------------------- boss

  private async enterArena() {
    this.inArena = true;
    this.frozen = true;
    const { left, right } = this.level.arena;
    for (let r = 0; r < STREET_ROW; r++) {
      this.grid.set(left, r, T.WALL);
      const w = this.addBlock(left, r, T.WALL);
      w.mesh.position.y += 14;
      this.tweens.add(w.mesh.position, { y: w.mesh.position.y - 14 }, 500, { delay: r * 25, ease: ease.outQuad });
    }
    sfx.stopMusic();

    const def = this.def.boss;
    this.autopilotUntil = 0;
    this.boss = new Boss(this, def, left + 1, right, STREET_ROW);
    this.group.add(this.boss.model.root);
    await this.tweens.wait(900);
    await this.opts.ui.say(def.name, def.intro);
    if (this.disposed) return;

    // The boss asks anything the player skipped, plus its own question.
    const noun = getIndustry(this.opts.industry).noun;
    for (const q of this.def.questions) {
      if (q.id in run.answers) continue;
      run.answers[q.id] = await this.opts.ui.ask(`${def.name} asks...`, q.prompt(noun), q.answers.map((a) => a.label));
      if (this.disposed) return;
    }

    const severity = this.def.questions.reduce((sum, q) => sum + q.answers[run.answers[q.id] ?? 0].severity, 0);
    const max = this.def.questions.length * 2;
    const hp = 3 + Math.round((severity / max) * 3);
    run.bossHp = hp;
    const taunt =
      severity / max >= 0.5
        ? 'Your answers made me STRONG.'
        : severity / max >= 0.25
          ? "I'm hiding in the gaps you just told me about."
          : "You've barely left me anywhere to hide. Hmph.";
    await this.opts.ui.say(`${def.name}  (HP ${hp})`, `${taunt}\n\n${def.projectileHint} Stomp me when I land!`);
    if (this.disposed) return;

    this.opts.ui.setBoss(def.name, hp, hp);
    this.frozen = false;
    this.prevJump = true;
    sfx.startMusic();
    this.boss.start(hp);
  }

  /** Called by the boss when the player stomps it. */
  onBossHit() {
    if (!this.boss) return;
    this.player.vy = -PHYS.stompBounce * 1.3;
    this.invulnUntil = Math.max(this.invulnUntil, this.now + 700);
    this.addScore(1000, this.boss.x, this.boss.y - 2);
    this.opts.ui.setBoss(this.def.boss.name, this.boss.hp, this.boss.maxHp);
  }

  onBossDefeated() {
    this.frozen = true;
    finishWorld();
    const seconds = run.results[run.world]?.seconds ?? 300;
    run.score += 5000 + Math.max(0, 300 - seconds) * 10;
    this.refreshHud();
    sfx.stopMusic();
    sfx.play('win');
    const from = { v: this.lit };
    this.tweens.add(from, { v: 1 }, 1500, { onUpdate: () => this.updateLit(from.v) });
    for (const l of this.lamps) if (!l.lit) l.lamp.setLit((l.lit = true));
    const b = this.boss!;
    for (let i = 0; i < 28; i++) {
      const s = makeStar();
      s.scale.setScalar(0.6);
      s.position.set(b.x, -b.y, 0.5);
      this.group.add(s);
      const a = Math.random() * Math.PI;
      this.particles.push({ obj: s, vx: Math.cos(a) * 8, vy: Math.sin(a) * 12 + 4, vz: Math.random() * 4, life: 1.8, gravity: -18, spin: 8 });
    }
    setTimeout(() => this.opts.ui.banner(this.def.boss.winWord, 1600), 300);
    setTimeout(() => this.opts.ui.banner(`World ${this.def.number} clear!`, 2400), 2000);
    setTimeout(() => this.opts.onVictory?.(), 4300);
  }

  // ---------------------------------------------------------------- effects

  private shakeAmt = 0;
  private shakeUntil = 0;
  shake(amount: number, ms: number) {
    this.shakeAmt = amount;
    this.shakeUntil = this.now + ms;
  }

  puff(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: 0xd8d4ee, transparent: true, opacity: 0.8 }));
      m.position.set(x, -y + 0.1, 0.3);
      this.group.add(m);
      const a = (i / n) * Math.PI;
      this.particles.push({ obj: m, vx: Math.cos(a) * 3, vy: Math.sin(a) * 2, vz: Math.random() * 2, life: 0.4, gravity: 0, spin: 4 });
    }
  }

  addToScene(o: THREE.Object3D) {
    this.group.add(o);
  }

  // ---------------------------------------------------------------- visuals

  private placeShadow(shadow: THREE.Mesh, b: Body) {
    const col = Math.floor(b.x + b.w / 2);
    const ground = this.grid.groundBelow(col, b.y + b.h - 0.01);
    if (ground < 0) {
      shadow.visible = false;
      return;
    }
    const height = ground - (b.y + b.h);
    shadow.visible = true;
    shadow.position.set(b.x + b.w / 2, -ground + 0.02, 0);
    const s = Math.max(0.35, 1 - height * 0.12);
    shadow.scale.set(s, s, s);
  }

  private updateVisuals(dt: number) {
    const t = this.now / 1000;
    const p = this.player;
    const state = !p.onGround ? 'jump' : Math.abs(p.vx) > 0.6 ? 'run' : 'idle';
    this.hero.animate(t, state, this.facing);
    this.hero.root.position.set(p.x + p.w / 2, -(p.y + p.h), 0);
    const targetScale = this.big ? BIG_SCALE : 1;
    const sc = this.hero.root.scale.x + (targetScale - this.hero.root.scale.x) * Math.min(1, dt * 10);
    this.hero.root.scale.setScalar(sc);
    const auto = this.autopilot;
    this.aura.visible = auto;
    if (auto) {
      const left = this.autopilotUntil - this.now;
      this.aura.material.color.setHSL((t * 1.5) % 1, 0.8, 0.65);
      this.aura.material.opacity = left < 1500 && Math.floor(this.now / 120) % 2 ? 0.2 : 0.9;
    }
    this.hero.root.visible = !(this.now < this.invulnUntil && !this.demo && Math.floor(this.now / 80) % 2 === 0);
    this.placeShadow(this.heroShadow, p);

    for (const s of this.pickups) {
      if (s.state === 'taken' || s.state === 'cold') continue;
      if (this.def.pickup === 'star') s.obj.rotation.y = t * 2.5 + s.c * 0.3;
      else {
        s.obj.position.y = -(s.r + 0.5) + Math.sin(t * 4 + s.c) * 0.08;
        s.obj.rotation.y = Math.sin(t * 2 + s.c) * 0.4;
      }
    }
    for (const it of this.items) {
      it.root.position.set(it.body.x + it.body.w / 2, -(it.body.y + it.body.h / 2), 0.1);
      it.animate(t);
    }
    for (const c of this.clouds) c.position.x += dt * 0.4;

    for (const e of this.enemies) {
      if (e.dead) continue;
      e.model.root.position.set(e.body.x + e.body.w / 2, -(e.body.y + e.body.h), 0);
      e.model.animate(t, e.awake && Math.abs(e.body.vx) > 0.1, e.dir, !e.body.onGround);
      this.placeShadow(e.shadow, e.body);
    }

    for (const b of this.blocks.values()) if (b.bump.y) b.mesh.position.y = -(b.r + 0.5) + b.bump.y;

    for (const pt of this.particles) {
      pt.life -= dt;
      pt.vy += pt.gravity * dt;
      pt.obj.position.x += pt.vx * dt;
      pt.obj.position.y += pt.vy * dt;
      pt.obj.position.z += pt.vz * dt;
      pt.obj.rotation.y += pt.spin * dt;
      if (pt.life <= 0) pt.obj.visible = false;
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
  }

  private updateCamera(dt: number) {
    const { stage } = this.opts;
    const cam = stage.cam;
    let tx: number;
    let tdist: number;
    if (this.inArena) {
      const { left, right } = this.level.arena;
      tx = (left + right + 1) / 2;
      tdist = stage.distForWidth(right - left + 1.5);
    } else {
      tdist = 22;
      const half = stage.halfWidth(tdist);
      tx = THREE.MathUtils.clamp(this.player.x + this.facing * 1.5, half, this.level.cols - half);
    }
    const k = 1 - Math.exp(-dt * (this.inArena ? 2.5 : 6));
    cam.x += (tx - cam.x) * k;
    cam.dist += (tdist - cam.dist) * k;
    cam.y += ((this.inArena ? 7.8 : 9.6) - cam.y) * k;
    if (this.now < this.shakeUntil) {
      cam.x += (Math.random() - 0.5) * this.shakeAmt;
      cam.y += (Math.random() - 0.5) * this.shakeAmt;
    }
  }

  dispose() {
    this.disposed = true;
    this.tweens.clear();
    this.opts.stage.scene.remove(this.group);
    this.town.dispose();
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
  }
}
