// World 1-1 "Ghost Town": the visibility & reviews level, plus its boss.
// Also doubles as the attract-mode demo (data.demo = true): a bot plays the
// level behind the title screen until someone clicks or presses a key.
import Phaser from 'phaser';
import { COLORS, CSS, FONT, GAME_H, GAME_W, MAX_HEARTS, PHYS, TILE } from '../config';
import { SOLID_TILES, T } from '../art';
import { buildLevel1, LevelData, STREET_ROW } from '../level1';
import { InvisibleListing } from '../boss';
import { ask, say } from '../modal';
import { WORLD1_QUESTIONS } from '../questions';
import { industryNoun, run } from '../state';
import * as sfx from '../sfx';
import { createTouchControls, TouchControls } from '../touch';
import { showResults } from '../results';

interface Pad {
  left: boolean;
  right: boolean;
  jump: boolean;
}

type Enemy = Phaser.Physics.Arcade.Sprite;

const STAR_BLOCK_VALUE = 3;
const DEMO_MS = 32000;

export class World1Scene extends Phaser.Scene {
  private demo = false;
  private level!: LevelData;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private stars!: Phaser.Physics.Arcade.StaticGroup;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private touch?: TouchControls;

  private hearts = MAX_HEARTS;
  private heartIcons: Phaser.GameObjects.Image[] = [];
  private starText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private visBar!: Phaser.GameObjects.Rectangle;
  private bossBar?: Phaser.GameObjects.Container;
  private darkness!: Phaser.GameObjects.Rectangle;
  private windows: { rect: Phaser.GameObjects.Rectangle; threshold: number; color: number }[] = [];

  private lastGroundAt = -9999;
  private jumpBufferedAt = -9999;
  private prevJump = false;
  private invulnUntil = 0;
  private frozen = false; // dialogs, intro, victory
  private checkpointCol = 0;
  private lamps: { col: number; img: Phaser.GameObjects.Image; lit: boolean }[] = [];
  private pendingBump?: Phaser.Tilemaps.Tile;
  private inArena = false;
  private boss?: InvisibleListing;
  private botJumpUntil = 0;
  private botLastX = 0;
  private botStuckSince = 0;
  private demoEndsAt = 0;
  private demoEnding = false;

  constructor() {
    super('World1');
  }

  init(data: { demo?: boolean }) {
    this.demo = !!data.demo;
    this.hearts = MAX_HEARTS;
    this.heartIcons = [];
    this.windows = [];
    this.lamps = [];
    this.lastGroundAt = this.jumpBufferedAt = -9999;
    this.prevJump = false;
    this.invulnUntil = 0;
    this.frozen = false;
    this.pendingBump = undefined;
    this.inArena = false;
    this.boss = undefined;
    this.bossBar = undefined;
    this.botJumpUntil = 0;
    this.botStuckSince = 0;
    this.demoEnding = false;
    this.demoLit = 0;
  }

  create() {
    this.level = buildLevel1();
    const { cols, rows } = this.level;
    const mapW = cols * TILE;
    const mapH = rows * TILE;
    this.checkpointCol = this.level.start.col;

    this.buildBackground(mapW);

    // Tilemap
    const map = this.make.tilemap({ data: this.level.tiles, tileWidth: TILE, tileHeight: TILE });
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
    this.layer = map.createLayer(0, tileset, 0, 0)!.setDepth(10);
    this.layer.setCollision(SOLID_TILES);

    this.physics.world.setBounds(0, 0, mapW, mapH + 200);
    this.physics.world.setBoundsCollision(true, true, false, false);

    // Stars (reviews)
    this.stars = this.physics.add.staticGroup();
    for (const s of this.level.stars) {
      this.stars.create(s.col * TILE + TILE / 2, s.row * TILE + TILE / 2, 'star').setDepth(20);
    }
    let starBlocks = 0;
    this.level.sunBlocks.forEach((r) => r.kind === 'star' && starBlocks++);
    if (!this.demo) {
      run.stars = 0;
      run.starsTotal = this.level.stars.length + starBlocks * STAR_BLOCK_VALUE;
    }

    // Checkpoint lamp posts
    for (const col of this.level.checkpoints) {
      const img = this.add.image(col * TILE + 8, STREET_ROW * TILE, 'lamp-off').setOrigin(0.5, 1).setDepth(8);
      this.lamps.push({ col, img, lit: false });
    }

    // Player
    this.player = this.physics.add.sprite(this.level.start.col * TILE + 8, (STREET_ROW - 1) * TILE + 8, 'hero', 0).setDepth(30);
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    pb.setSize(10, 15).setOffset(3, 1);
    pb.setMaxVelocity(PHYS.runSpeed, PHYS.maxFall);
    pb.setDragX(PHYS.drag);
    this.player.setCollideWorldBounds(true);

    // Enemies
    this.enemies = this.physics.add.group();
    for (const e of this.level.enemies) {
      const sprite = this.enemies.create(e.col * TILE + 8, (STREET_ROW - 1) * TILE + 8, e.type, 0) as Enemy;
      sprite.setDepth(20).setData('type', e.type).setData('awake', false);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setSize(12, e.type === 'grump' ? 12 : 9).setOffset(2, e.type === 'grump' ? 4 : 7);
      body.enable = false;
      sprite.setVisible(true);
    }

    // Colliders
    this.physics.add.collider(this.player, this.layer, (_p, t) => this.onPlayerTile(t as Phaser.Tilemaps.Tile));
    this.physics.add.collider(this.enemies, this.layer);
    this.physics.add.overlap(this.player, this.stars, (_p, s) => this.collectStar(s as Phaser.Physics.Arcade.Image));
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.onEnemyContact(e as Enemy));

    // Camera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, mapW, GAME_H);
    cam.startFollow(this.player, true, 1, 1, 0, 0);
    cam.setDeadzone(40, GAME_H);
    cam.setRoundPixels(true);

    // Darkness over the town lifts as you collect reviews
    this.darkness = this.add.rectangle(0, 0, GAME_W, GAME_H, 0x02030a, 0.5).setOrigin(0).setScrollFactor(0).setDepth(50);

    this.keys = this.input.keyboard!.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,A,D,W,Z,X', true) as Record<string, Phaser.Input.Keyboard.Key>;

    this.buildHud();
    this.updateVisibility();

    if (this.demo) {
      this.setupAttract();
    } else {
      this.touch = createTouchControls(this);
      this.showIntro();
    }
  }

  // ---------------------------------------------------------------- background

  private buildBackground(mapW: number) {
    const sky = this.textures.exists('sky')
      ? this.textures.get('sky')
      : (() => {
          const t = this.textures.createCanvas('sky', 4, GAME_H)!;
          const ctx = t.getContext();
          const g = ctx.createLinearGradient(0, 0, 0, GAME_H);
          g.addColorStop(0, '#07080F');
          g.addColorStop(0.65, '#1D1B3A');
          g.addColorStop(1, '#2E2350');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 4, GAME_H);
          t.refresh();
          return t;
        })();
    this.add.image(0, 0, sky).setOrigin(0).setDisplaySize(GAME_W, GAME_H).setScrollFactor(0).setDepth(0);

    const rnd = new Phaser.Math.RandomDataGenerator(['ghost-town']);
    for (let i = 0; i < 70; i++) {
      const dot = this.add.image(rnd.between(0, GAME_W + 200), rnd.between(4, 150), 'dot').setScrollFactor(0.04).setDepth(1).setScale(rnd.pick([0.5, 0.5, 1])).setAlpha(rnd.realInRange(0.3, 0.9));
      if (i % 6 === 0) this.tweens.add({ targets: dot, alpha: 0.1, duration: rnd.between(600, 1600), yoyo: true, repeat: -1 });
    }
    this.add.image(400, 44, 'moon').setScrollFactor(0.04).setDepth(1);

    const streetTop = STREET_ROW * TILE;
    // Far skyline
    const far = this.add.graphics().setScrollFactor(0.2).setDepth(2);
    far.fillStyle(0x15142a);
    for (let x = 0; x < mapW * 0.2 + GAME_W; ) {
      const w = rnd.between(24, 56);
      const h = rnd.between(50, 120);
      far.fillRect(x, streetTop - h, w, h + 40);
      x += w + rnd.between(0, 6);
    }
    // Near skyline with windows that light up
    const near = this.add.graphics().setScrollFactor(0.45).setDepth(3);
    for (let x = 0; x < mapW * 0.45 + GAME_W; ) {
      const w = rnd.between(40, 80);
      const h = rnd.between(56, 140);
      near.fillStyle(0x221f3d);
      near.fillRect(x, streetTop - h, w, h + 40);
      near.fillStyle(0x2c2850);
      near.fillRect(x, streetTop - h, w, 3);
      for (let wy = streetTop - h + 10; wy < streetTop - 12; wy += 12) {
        for (let wx = x + 6; wx < x + w - 8; wx += 10) {
          const rect = this.add.rectangle(wx, wy, 4, 6, COLORS.windowDark).setOrigin(0).setScrollFactor(0.45).setDepth(4);
          this.windows.push({ rect, threshold: rnd.frac() * 0.97, color: rnd.pick([COLORS.windowLit, COLORS.windowLitWarm]) });
        }
      }
      x += w + rnd.between(6, 22);
    }
  }

  private updateVisibility(force?: number) {
    const lit = force ?? (run.starsTotal && !this.demo ? run.stars / run.starsTotal : this.demoLit);
    for (const w of this.windows) w.rect.setFillStyle(lit >= w.threshold ? w.color : COLORS.windowDark);
    this.darkness.setAlpha(0.5 * (1 - Math.min(1, lit * 1.4)));
    if (this.visBar) this.visBar.width = Math.round(58 * lit);
  }

  private demoLit = 0;

  // ---------------------------------------------------------------- HUD

  private buildHud() {
    const hud = (o: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth) => o.setScrollFactor(0).setDepth(100);
    hud(this.add.rectangle(0, 0, GAME_W, 20, 0x05060c, 0.65).setOrigin(0));
    for (let i = 0; i < MAX_HEARTS; i++) {
      const icon = this.add.image(8 + i * 10, 7, 'heart').setOrigin(0);
      hud(icon);
      this.heartIcons.push(icon);
    }
    hud(this.add.image(48, 4, 'star').setOrigin(0));
    this.starText = this.add.text(64, 7, '', { fontFamily: FONT, fontSize: '8px', color: CSS.white });
    hud(this.starText);
    hud(this.add.text(150, 7, 'VISIBILITY', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }));
    hud(this.add.rectangle(232, 6, 62, 9, 0x000000).setOrigin(0).setStrokeStyle(1, COLORS.gold));
    this.visBar = this.add.rectangle(234, 8, 0, 5, COLORS.gold).setOrigin(0);
    hud(this.visBar);
    this.scoreText = this.add.text(GAME_W - 8, 7, '', { fontFamily: FONT, fontSize: '8px', color: CSS.white }).setOrigin(1, 0);
    hud(this.scoreText);

    const sound = this.add.text(GAME_W - 8, 25, '', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(1, 0);
    hud(sound);
    sound.setInteractive({ useHandCursor: true }).on('pointerdown', (_p: unknown, _x: unknown, _y: unknown, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation();
      sfx.toggleMute();
    });
    const renderSound = (m: boolean) => sound.setText(m ? 'SOUND OFF' : 'SOUND ON');
    renderSound(sfx.isMuted());
    const off = sfx.onMuteChange(renderSound);
    this.events.once('shutdown', off);
    this.refreshHud();
  }

  private refreshHud() {
    this.heartIcons.forEach((icon, i) => icon.setTexture(i < this.hearts ? 'heart' : 'heart-empty'));
    this.starText.setText(this.demo ? '' : `${run.stars}/${run.starsTotal}`);
    this.scoreText.setText(this.demo ? 'DEMO' : String(run.score).padStart(6, '0'));
  }

  private addScore(points: number, x?: number, y?: number) {
    if (this.demo) return;
    run.score += points;
    this.refreshHud();
    if (x !== undefined && y !== undefined) this.floatText(`+${points}`, x, y);
  }

  private floatText(text: string, x: number, y: number, color: string = CSS.white) {
    const t = this.add.text(x, y, text, { fontFamily: FONT, fontSize: '8px', color, stroke: '#1A1423', strokeThickness: 2 }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: 700, ease: 'Sine.Out', onComplete: () => t.destroy() });
  }

  // ---------------------------------------------------------------- intro / attract

  private showIntro() {
    this.frozen = true;
    this.physics.pause();
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(150);
    c.add(this.add.rectangle(0, 0, GAME_W, GAME_H, 0x05060c, 0.85).setOrigin(0));
    c.add(this.add.text(GAME_W / 2, 92, 'WORLD 1-1', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(0.5));
    c.add(this.add.text(GAME_W / 2, 114, 'GHOST TOWN', { fontFamily: FONT, fontSize: '16px', color: CSS.gold }).setOrigin(0.5));
    c.add(
      this.add
        .text(GAME_W / 2, 150, 'Nobody can find this town.\nCollect reviews to light it up!', { fontFamily: FONT, fontSize: '8px', color: CSS.white, align: 'center', lineSpacing: 8 })
        .setOrigin(0.5),
    );
    c.add(this.add.text(GAME_W / 2, 196, 'ARROWS/WASD MOVE  -  SPACE JUMP', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(0.5));
    this.time.delayedCall(2600, () => {
      this.tweens.add({
        targets: c,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          c.destroy();
          this.physics.resume();
          this.frozen = false;
          run.startedAt = Date.now();
        },
      });
    });
  }

  private setupAttract() {
    this.demoEndsAt = this.time.now + DEMO_MS;
    this.botLastX = this.player.x;
    const c = this.add.container(0, 0).setScrollFactor(0).setDepth(150);
    c.add(this.add.rectangle(0, 50, GAME_W, 118, 0x05060c, 0.85).setOrigin(0));
    c.add(this.add.text(GAME_W / 2, 74, 'BOTTLENECK', { fontFamily: FONT, fontSize: '24px', color: CSS.gold, stroke: '#1A1423', strokeThickness: 6 }).setOrigin(0.5));
    c.add(this.add.text(GAME_W / 2, 104, 'BUSTERS', { fontFamily: FONT, fontSize: '24px', color: CSS.white, stroke: '#1A1423', strokeThickness: 6 }).setOrigin(0.5));
    c.add(this.add.text(GAME_W / 2, 130, 'FIND WHAT IS SLOWING YOUR BUSINESS DOWN', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(0.5));
    const start = this.add.text(GAME_W / 2, 152, 'CLICK OR PRESS ANY KEY TO PLAY', { fontFamily: FONT, fontSize: '8px', color: CSS.goldLight }).setOrigin(0.5);
    c.add(start);
    this.tweens.add({ targets: start, alpha: 0.2, duration: 450, yoyo: true, repeat: -1, hold: 300 });
    c.add(this.add.text(8, GAME_H - 14, 'A LOCAL SUN DIGITAL ARCADE', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }));

    const begin = () => {
      if (this.demoEnding) return;
      this.demoEnding = true;
      sfx.unlock();
      sfx.startMusic();
      try {
        window.focus();
      } catch {
        /* cross-origin parent */
      }
      this.cameras.main.fadeOut(200, 5, 6, 12);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Select'));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'm') begin();
    };
    const onPointer = (_p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
      if (over.length === 0) begin();
    };
    this.input.keyboard!.on('keydown', onKey);
    this.input.on('pointerdown', onPointer);
    this.events.once('shutdown', () => {
      this.input.keyboard?.off('keydown', onKey);
      this.input.off('pointerdown', onPointer);
    });
  }

  private endDemo() {
    if (this.demoEnding) return;
    this.demoEnding = true;
    this.cameras.main.fadeOut(400, 5, 6, 12);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ demo: true }));
  }

  // ---------------------------------------------------------------- input

  private readPad(time: number): Pad {
    if (this.frozen) return { left: false, right: false, jump: false };
    if (this.demo) return this.botPad(time);
    const k = this.keys;
    const t = this.touch?.read() ?? { left: false, right: false, jump: false };
    return {
      left: k.LEFT.isDown || k.A.isDown || t.left,
      right: k.RIGHT.isDown || k.D.isDown || t.right,
      jump: k.SPACE.isDown || k.UP.isDown || k.W.isDown || k.Z.isDown || k.X.isDown || t.jump,
    };
  }

  private solidAt(x: number, y: number) {
    const tile = this.layer.getTileAtWorldXY(x, y);
    return !!tile && tile.collides;
  }

  /** Simple attract-mode bot: run right, jump at walls, gaps and enemies. */
  private botPad(time: number): Pad {
    const b = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = b.blocked.down;
    if (Math.abs(this.player.x - this.botLastX) > 2) {
      this.botLastX = this.player.x;
      this.botStuckSince = time;
    }
    if (onGround && time > this.botJumpUntil) {
      const wall = this.solidAt(b.right + 8, b.bottom - 4) || this.solidAt(b.right + 8, b.top + 2);
      const gap = !this.solidAt(b.right + 10, b.bottom + 4);
      const enemy = this.enemies.getChildren().some((o) => {
        const e = o as Enemy;
        return e.active && !e.getData('dead') && e.x - this.player.x > 0 && e.x - this.player.x < 52 && Math.abs(e.y - this.player.y) < 24;
      });
      const stuck = time - this.botStuckSince > 500;
      if (wall || gap || enemy || stuck) this.botJumpUntil = time + 320;
    }
    return { left: false, right: true, jump: time < this.botJumpUntil };
  }

  // ---------------------------------------------------------------- main loop

  update(time: number, delta: number) {
    const pad = this.readPad(time);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    if (!this.frozen) {
      // Horizontal
      const accel = onGround ? PHYS.accel : PHYS.airAccel;
      if (pad.left && !pad.right) {
        body.setAccelerationX(body.velocity.x > 0 ? -accel * 2 : -accel);
        this.player.setFlipX(true);
      } else if (pad.right && !pad.left) {
        body.setAccelerationX(body.velocity.x < 0 ? accel * 2 : accel);
        this.player.setFlipX(false);
      } else {
        body.setAccelerationX(0);
      }

      // Jump with coyote time, input buffering and variable height
      if (onGround) this.lastGroundAt = time;
      if (pad.jump && !this.prevJump) this.jumpBufferedAt = time;
      if (time - this.jumpBufferedAt < PHYS.jumpBufferMs && time - this.lastGroundAt < PHYS.coyoteMs) {
        body.setVelocityY(-PHYS.jumpVelocity);
        this.jumpBufferedAt = this.lastGroundAt = -9999;
        sfx.play('jump');
      }
      if (!pad.jump && body.velocity.y < -PHYS.jumpCutVelocity) body.setVelocityY(-PHYS.jumpCutVelocity);
    } else {
      body.setAccelerationX(0);
    }
    this.prevJump = pad.jump;

    // Animation
    if (onGround && Math.abs(body.velocity.x) > 10) {
      this.player.anims.play('hero-run', true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(onGround ? 0 : 3);
    }
    this.player.setAlpha(time < this.invulnUntil && !this.demo ? (Math.floor(time / 80) % 2 ? 0.35 : 1) : 1);

    // Sun block bumps (resolved once per frame, nearest to the player's head)
    if (this.pendingBump) {
      this.bumpBlock(this.pendingBump);
      this.pendingBump = undefined;
    }

    // Stars wobble
    const sx = Math.cos(time / 220);
    this.stars.getChildren().forEach((s) => (s as Phaser.GameObjects.Image).setScale(Math.abs(sx) < 0.25 ? 0.25 * Math.sign(sx || 1) : sx, 1));

    this.updateEnemies(time);
    this.updateCheckpoints();

    // Fell in a pit
    if (this.player.y > this.level.rows * TILE + 24) {
      if (this.demo) this.endDemo();
      else this.fellInPit();
    }

    if (this.demo) {
      if (time > this.demoEndsAt || this.player.x > this.level.arena.left * TILE - 16) this.endDemo();
    } else if (!this.inArena && this.player.x > (this.level.arena.left + 2) * TILE) {
      void this.enterArena();
    }

    this.boss?.update(time, delta, this.player);
  }

  // ---------------------------------------------------------------- blocks & pickups

  private onPlayerTile(tile: Phaser.Tilemaps.Tile) {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.up || tile.bottom > body.top + 2) return;
    if (tile.index !== T.SUN && tile.index !== T.BRICK) return;
    const prev = this.pendingBump;
    if (!prev || Math.abs(tile.getCenterX() - body.center.x) < Math.abs(prev.getCenterX() - body.center.x)) this.pendingBump = tile;
  }

  private bumpBlock(tile: Phaser.Tilemaps.Tile) {
    const isSun = tile.index === T.SUN;
    const reward = isSun ? this.level.sunBlocks.get(`${tile.x},${tile.y}`) : undefined;
    if (isSun) this.layer.putTileAt(T.USED, tile.x, tile.y);
    const t = this.layer.getTileAt(tile.x, tile.y);
    t.setAlpha(0);
    const img = this.add.image(tile.pixelX, tile.pixelY, 'tiles', t.index).setOrigin(0).setDepth(11);
    this.tweens.add({
      targets: img,
      y: tile.pixelY - 5,
      duration: 70,
      yoyo: true,
      onComplete: () => {
        img.destroy();
        t.setAlpha(1);
      },
    });
    sfx.play('bump');

    // Knock out enemies standing on the block
    this.enemies.getChildren().forEach((o) => {
      const e = o as Enemy;
      if (!e.getData('dead') && Math.abs(e.x - tile.getCenterX()) < 14 && Math.abs(e.y + 8 - tile.pixelY) < 8) this.killEnemy(e, true);
    });

    if (!reward) return;
    const cx = tile.getCenterX();
    const cy = tile.pixelY;
    if (reward.kind === 'star' || (reward.kind === 'question' && this.demo)) {
      const s = this.add.image(cx, cy, 'star').setDepth(9);
      this.tweens.add({ targets: s, y: cy - 28, duration: 260, ease: 'Quad.Out', yoyo: true, hold: 60, onComplete: () => s.destroy() });
      sfx.play('star');
      if (!this.demo) {
        run.stars += STAR_BLOCK_VALUE;
        this.addScore(100 * STAR_BLOCK_VALUE);
        this.floatText(`+${STAR_BLOCK_VALUE} REVIEWS`, cx, cy - 34, CSS.goldLight);
      }
      this.updateVisibility();
      this.refreshHud();
    } else if (reward.kind === 'heart') {
      const h = this.add.image(cx, cy, 'heart-big').setDepth(9);
      this.tweens.add({ targets: h, y: cy - 22, duration: 300, ease: 'Quad.Out', onComplete: () => h.destroy() });
      this.gainHeart(cx, cy - 30);
    } else if (reward.kind === 'question') {
      void this.askQuestion(reward.index, `SUN BLOCK CHECK-UP ${reward.index + 1}/${WORLD1_QUESTIONS.length}`);
    }
  }

  private gainHeart(x: number, y: number) {
    sfx.play('power');
    if (this.hearts < MAX_HEARTS) {
      this.hearts += 1;
      this.floatText('+1 HEART', x, y, CSS.red);
    } else {
      this.addScore(500, x, y);
    }
    this.refreshHud();
  }

  private async askQuestion(index: number, header: string) {
    const q = WORLD1_QUESTIONS[index];
    if (q.id in run.answers) return;
    this.frozen = true;
    this.physics.pause();
    const choice = await ask(this, { header, prompt: q.prompt(industryNoun()), options: q.answers.map((a) => a.label) });
    run.answers[q.id] = choice;
    this.physics.resume();
    this.frozen = false;
    this.prevJump = true; // require a fresh press after closing
    this.addScore(500, this.player.x, this.player.y - 20);
    if (this.hearts < MAX_HEARTS) {
      this.hearts = Math.min(MAX_HEARTS, this.hearts + 1);
      this.refreshHud();
    }
  }

  private collectStar(s: Phaser.Physics.Arcade.Image) {
    if (!s.active) return;
    this.stars.remove(s, true, true);
    sfx.play('star');
    if (this.demo) {
      this.demoLit = Math.min(1, this.demoLit + 0.03);
    } else {
      run.stars += 1;
      this.addScore(100);
    }
    this.updateVisibility();
  }

  private updateCheckpoints() {
    for (const lamp of this.lamps) {
      if (!lamp.lit && this.player.x > lamp.col * TILE) {
        lamp.lit = true;
        lamp.img.setTexture('lamp-on');
        this.checkpointCol = lamp.col;
        const glow = this.add.circle(lamp.img.x, lamp.img.y - 30, 18, COLORS.goldLight, 0.18).setDepth(7);
        this.tweens.add({ targets: glow, alpha: 0.08, duration: 900, yoyo: true, repeat: -1 });
        if (!this.demo) {
          sfx.play('checkpoint');
          this.floatText('CHECKPOINT', lamp.img.x, lamp.img.y - 44, CSS.goldLight);
        }
      }
    }
  }

  // ---------------------------------------------------------------- enemies

  private updateEnemies(time: number) {
    const camRight = this.cameras.main.scrollX + GAME_W + 24;
    this.enemies.getChildren().forEach((o) => {
      const e = o as Enemy;
      if (!e.active || e.getData('dead')) return;
      const body = e.body as Phaser.Physics.Arcade.Body;
      if (!e.getData('awake')) {
        if (e.x < camRight) {
          e.setData('awake', true);
          body.enable = true;
          if (e.getData('type') === 'grump') {
            body.setVelocityX(-28);
            e.play('grump-walk');
          }
        }
        return;
      }
      if (e.y > this.level.rows * TILE + 32) {
        e.destroy();
        return;
      }
      if (this.frozen) return;

      if (e.getData('type') === 'grump') {
        let vx = body.velocity.x || -28;
        const ahead = vx < 0 ? body.left - 2 : body.right + 2;
        if (body.blocked.left) vx = 28;
        else if (body.blocked.right) vx = -28;
        else if (body.blocked.down && !this.solidAt(ahead, body.bottom + 4)) vx = -vx;
        body.setVelocityX(vx);
        e.setFlipX(vx > 0);
      } else {
        // Cricket: hops toward the player every so often
        if (body.blocked.down) {
          body.setVelocityX(0);
          e.setFrame(0);
          const dx = this.player.x - e.x;
          if (Math.abs(dx) < 170 && time > (e.getData('nextHop') ?? 0)) {
            body.setVelocity(Math.sign(dx) * 70, -240);
            e.setFlipX(dx > 0);
            e.setData('nextHop', time + 1400);
          }
        } else {
          e.setFrame(1);
        }
      }
    });
  }

  private onEnemyContact(e: Enemy) {
    if (e.getData('dead') || this.frozen) return;
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    const eb = e.body as Phaser.Physics.Arcade.Body;
    if (pb.velocity.y > 0 && pb.bottom - eb.top < 10) {
      this.killEnemy(e);
      pb.setVelocityY(-(this.prevJump ? PHYS.stompBounce * 1.35 : PHYS.stompBounce));
      sfx.play('stomp');
      this.addScore(200, e.x, e.y - 12);
    } else if (!this.demo) {
      this.hurt(e.x);
    }
  }

  private killEnemy(e: Enemy, flipped = false) {
    e.setData('dead', true);
    e.anims.stop();
    (e.body as Phaser.Physics.Arcade.Body).enable = false;
    if (flipped || e.getData('type') === 'cricket') {
      e.setFlipY(true);
      this.tweens.add({ targets: e, y: e.y + 140, duration: 700, ease: 'Quad.In', onComplete: () => e.destroy() });
    } else {
      e.setScale(1, 0.4).setY(e.y + 5);
      this.tweens.add({ targets: e, alpha: 0, delay: 250, duration: 250, onComplete: () => e.destroy() });
    }
  }

  // ---------------------------------------------------------------- damage

  private hurt(fromX: number) {
    if (this.time.now < this.invulnUntil || this.frozen) return;
    this.hearts -= 1;
    sfx.play('hurt');
    this.cameras.main.shake(120, 0.004);
    this.invulnUntil = this.time.now + PHYS.invulnMs;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.player.x < fromX ? -150 : 150, -200);
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
    if (this.hearts <= 0) {
      this.hearts = MAX_HEARTS;
      this.floatText('HEARTS RESTORED', this.player.x, this.player.y - 30, CSS.red);
    }
    const x = this.inArena ? (this.level.arena.left + 3) * TILE : this.checkpointCol * TILE + 8;
    this.player.setPosition(x, (STREET_ROW - 2) * TILE);
    (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.invulnUntil = this.time.now + PHYS.invulnMs;
    this.cameras.main.flash(150, 10, 10, 20);
    this.refreshHud();
  }

  // ---------------------------------------------------------------- boss

  private async enterArena() {
    this.inArena = true;
    this.frozen = true;
    const { left, right } = this.level.arena;
    for (let r = 0; r < STREET_ROW; r++) this.layer.putTileAt(T.WALL, left, r);

    const cam = this.cameras.main;
    cam.stopFollow();
    const arenaX = (left + 1) * TILE;
    this.tweens.add({ targets: cam, scrollX: arenaX, duration: 700, ease: 'Sine.InOut', onComplete: () => cam.setBounds(arenaX, 0, GAME_W, GAME_H) });

    const floorY = STREET_ROW * TILE;
    this.boss = new InvisibleListing(this, (left + 1) * TILE, right * TILE, floorY, () => this.onBossDefeated());
    this.physics.add.overlap(this.player, this.boss.sprite, () => this.onBossContact());
    this.physics.add.overlap(this.player, this.boss.projectiles, (_p, proj) => {
      this.boss?.poof(proj as Phaser.GameObjects.Text);
      this.hurt(this.player.x + 1);
    });
    this.boss.fadeIn();
    sfx.stopMusic();

    await this.wait(900);
    await say(this, 'THE INVISIBLE LISTING', 'Heh. Customers search for you every day... and find your competitors instead.');

    // The boss asks about anything the player skipped, plus its own question.
    const unanswered = WORLD1_QUESTIONS.map((q, i) => ({ q, i })).filter(({ q }) => !(q.id in run.answers));
    for (const { q } of unanswered) {
      this.physics.pause();
      run.answers[q.id] = await ask(this, { header: 'THE LISTING ASKS...', prompt: q.prompt(industryNoun()), options: q.answers.map((a) => a.label) });
      this.physics.resume();
    }

    const severity = WORLD1_QUESTIONS.reduce((sum, q) => sum + q.answers[run.answers[q.id] ?? 0].severity, 0);
    const hp = 3 + Math.round(severity / 2);
    run.bossHp = hp;
    const taunt =
      severity >= 4
        ? 'Your answers made me STRONG. Good luck finding me!'
        : severity >= 2
          ? "I'm lurking in the gaps. Let's see you light them up."
          : "You've barely left me anything to hide behind. Hmph.";
    await say(this, `THE INVISIBLE LISTING  (HP ${hp})`, `${taunt}\n\nTip: stomp me when I land!`);

    this.buildBossBar(hp);
    this.frozen = false;
    this.prevJump = true;
    sfx.startMusic();
    this.boss.start(hp, this.time.now);
  }

  private buildBossBar(hp: number) {
    const c = this.add.container(GAME_W / 2, 30).setScrollFactor(0).setDepth(100);
    c.add(this.add.text(0, 0, 'INVISIBLE LISTING', { fontFamily: FONT, fontSize: '8px', color: CSS.white }).setOrigin(0.5));
    for (let i = 0; i < hp; i++) c.add(this.add.rectangle((i - (hp - 1) / 2) * 14, 12, 10, 6, COLORS.gold).setStrokeStyle(1, COLORS.ink).setName(`hp${i}`));
    this.bossBar = c;
  }

  private refreshBossBar() {
    if (!this.boss || !this.bossBar) return;
    for (let i = 0; i < this.boss.maxHp; i++) {
      const seg = this.bossBar.getByName(`hp${i}`) as Phaser.GameObjects.Rectangle;
      seg?.setFillStyle(i < this.boss.hp ? COLORS.gold : 0x3a3352);
    }
  }

  private onBossContact() {
    const boss = this.boss;
    if (!boss || this.frozen) return;
    const pb = this.player.body as Phaser.Physics.Arcade.Body;
    const bb = boss.sprite.body as Phaser.Physics.Arcade.Body;
    if (boss.vulnerable) {
      if (pb.velocity.y > 0 && pb.bottom - bb.top < 14) {
        boss.takeHit();
        pb.setVelocityY(-PHYS.stompBounce * 1.3);
        this.addScore(1000, boss.sprite.x, boss.sprite.y - 30);
        this.refreshBossBar();
      }
    } else if (boss.harmful) {
      this.hurt(boss.sprite.x);
    }
  }

  private onBossDefeated() {
    this.frozen = true;
    this.refreshBossBar();
    run.finishedAt = Date.now();
    const seconds = Math.round((run.finishedAt - run.startedAt) / 1000);
    const timeBonus = Math.max(0, 300 - seconds) * 10;
    run.score += 5000 + timeBonus;
    this.refreshHud();
    sfx.stopMusic();
    sfx.play('win');

    // The whole town lights up
    this.tweens.addCounter({
      from: run.starsTotal ? run.stars / run.starsTotal : 0,
      to: 1,
      duration: 1500,
      onUpdate: (tw) => this.updateVisibility(tw.getValue() ?? 1),
    });
    const burst = this.add.particles(0, 0, 'star', {
      speed: { min: 60, max: 200 },
      angle: { min: 200, max: 340 },
      gravityY: 300,
      lifespan: 1600,
      scale: { start: 1, end: 0.4 },
      emitting: false,
    });
    burst.setDepth(55);
    this.time.delayedCall(500, () => burst.explode(30, this.boss!.sprite.x, this.boss!.sprite.y));

    this.time.delayedCall(1800, () => {
      const banner = this.add.text(GAME_W / 2, GAME_H / 2 + 20, 'WORLD 1 CLEAR!', { fontFamily: FONT, fontSize: '16px', color: CSS.white, stroke: '#1A1423', strokeThickness: 4 }).setOrigin(0.5).setScrollFactor(0).setDepth(120);
      this.tweens.add({ targets: banner, scale: { from: 0.5, to: 1 }, duration: 300, ease: 'Back.Out' });
    });
    this.time.delayedCall(4200, () => {
      // Hand the keyboard to the HTML form (otherwise Phaser swallows spaces/arrows).
      const keyboard = this.game.input.keyboard;
      if (keyboard) keyboard.enabled = false;
      showResults({
        onPlayAgain: () => {
          if (keyboard) keyboard.enabled = true;
          this.scene.start('Select');
        },
      });
    });
  }

  private wait(ms: number) {
    return new Promise<void>((resolve) => this.time.delayedCall(ms, resolve));
  }
}
