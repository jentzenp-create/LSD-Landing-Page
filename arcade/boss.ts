// Boss logic: The Invisible Listing / The Ghoster (World 1), Captain Later (World 2).
// It drifts around almost invisible, drops problems the player has to dodge
// (1-star reviews or unanswered emails), then reveals itself and swoops down.
// It's only vulnerable while dazed on the ground: stomp it then.
import * as THREE from 'three';
import type { BossDef } from './content';
import type { Body } from './engine/physics';
import { overlaps } from './engine/physics';
import { ease } from './engine/tween';
import { makeBlobShadow, makeCard, makeClockBoss, makeGhostBoss, makePinBoss, makeStar, type BossModel } from './render/models';
import * as sfx from './sfx';
import type { World } from './world';

type State = 'idle' | 'hover' | 'telegraph' | 'swoop' | 'dazed' | 'rise' | 'dead';

const HOVER_Y = 4.6;
const GHOST_ALPHA = 0.18;

interface Projectile {
  x: number;
  y: number;
  vy: number;
  mesh: THREE.Mesh;
  alive: boolean;
}

export class Boss {
  readonly model: BossModel;
  state: State = 'idle';
  hp = 3;
  maxHp = 3;
  x: number;
  y = HOVER_Y;
  private look = { alpha: 0 };
  private headOffset: number; // head center -> model origin (tip / hem)
  private stateUntil = 0;
  private nextDrop = 0;
  private hoverT = 0;
  private projectiles: Projectile[] = [];
  private dizzy: THREE.Group;
  private landing: THREE.Mesh; // shadow showing where it's about to land

  constructor(
    private world: World,
    private def: BossDef,
    private left: number,
    private right: number,
    private floorY: number,
  ) {
    this.model = def.shape === 'pin' ? makePinBoss() : def.shape === 'ghost' ? makeGhostBoss() : makeClockBoss();
    this.headOffset = { pin: 1.75, ghost: 2.0, clock: 1.7 }[def.shape];
    this.x = (left + right) / 2;
    this.model.setOpacity(0);
    this.dizzy = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const s = makeStar();
      s.scale.setScalar(0.45);
      s.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.9, 0, Math.sin((i / 3) * Math.PI * 2) * 0.9);
      this.dizzy.add(s);
    }
    this.dizzy.visible = false;
    world.addToScene(this.dizzy);
    this.landing = makeBlobShadow();
    (this.landing.material as THREE.MeshBasicMaterial).color.setHex(0xff3b30);
    this.landing.visible = false;
    world.addToScene(this.landing);
    // Fade in for the intro
    world.tweens.add(this.look, { alpha: 0.75 }, 900, { onUpdate: () => this.model.setOpacity(this.look.alpha) });
  }

  get hitbox() {
    return { x: this.x - 0.9, y: this.y - 0.9, w: 1.8, h: 1.8 };
  }

  /** Generous target for stomping while it's dazed. */
  private get stompBox() {
    return { x: this.x - 1.3, y: this.y - 3.4, w: 2.6, h: 4.2 };
  }

  private get lowerBox() {
    return { x: this.x - 0.4, y: this.y + 0.9, w: 0.8, h: this.headOffset - 0.9 };
  }

  private get speedUp() {
    return this.maxHp - this.hp;
  }

  start(hp: number) {
    this.hp = this.maxHp = hp;
    this.toHover();
  }

  private setAlpha(a: number, ms: number) {
    this.world.tweens.killOf(this.look);
    this.world.tweens.add(this.look, { alpha: a }, ms, { onUpdate: () => this.model.setOpacity(this.look.alpha) });
  }

  private toHover() {
    this.state = 'hover';
    this.stateUntil = this.world.now + 3200;
    this.nextDrop = this.world.now + 900;
    this.setAlpha(GHOST_ALPHA, 300);
  }

  update(dt: number, player: Body, frozen: boolean) {
    const now = this.world.now;
    this.model.animate(now / 1000);
    this.model.root.position.set(this.x, -(this.y + this.headOffset), 0);
    this.dizzy.position.set(this.x, -(this.y - 1.4), 0);
    this.dizzy.rotation.y = now / 250;
    if (this.landing.visible) (this.landing.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.abs(Math.sin(now / 110)) * 0.35;

    if (frozen || this.state === 'idle' || this.state === 'dead') return;

    // Projectiles
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      p.y += p.vy * dt;
      p.mesh.position.set(p.x, -p.y, 0.3);
      p.mesh.rotation.z = Math.sin(now / 200 + p.x) * 0.3;
      if (overlaps(player, { x: p.x - 0.55, y: p.y - 0.3, w: 1.1, h: 0.6 })) {
        this.poof(p);
        this.world.hurt(p.x);
      } else if (p.y > this.floorY - 0.3) this.poof(p);
    }
    this.projectiles = this.projectiles.filter((p) => p.alive);

    if (this.state === 'hover') {
      this.hoverT += dt;
      const span = (this.right - this.left) / 2 - 3;
      const cx = (this.left + this.right) / 2;
      this.x = cx + Math.sin(this.hoverT * (0.7 + this.speedUp * 0.1)) * span;
      this.y = HOVER_Y + Math.sin(this.hoverT * 3) * 0.35;
      if (now > this.nextDrop) {
        this.drop();
        this.nextDrop = now + 1600;
      }
      if (now > this.stateUntil) this.toTelegraph(player);
    } else if (this.state === 'dazed' && now > this.stateUntil) {
      this.toRise();
    }

    // Contact with the player. While dazed it never hurts you, and any jump
    // into it (rising or falling, on or around its head) counts as a stomp.
    if (this.state === 'dazed') {
      if (!player.onGround && overlaps(player, this.stompBox)) this.takeHit();
    } else if (overlaps(player, this.hitbox) || overlaps(player, this.lowerBox)) {
      this.world.hurt(this.x);
    }
  }

  private toTelegraph(player: Body) {
    this.state = 'telegraph';
    const targetX = THREE.MathUtils.clamp(player.x + player.w / 2, this.left + 2, this.right - 2);
    this.setAlpha(1, 250);
    this.landing.position.set(targetX, -this.floorY + 0.03, 0);
    this.landing.scale.setScalar(2.6);
    this.landing.visible = true;
    this.world.tweens.add(this, { x: targetX, y: HOVER_Y - 0.6 }, 1000, {
      ease: ease.inOutSine,
      onComplete: () => this.toSwoop(),
    });
  }

  private toSwoop() {
    if (this.state === 'dead') return;
    this.state = 'swoop';
    this.world.tweens.add(this, { y: this.floorY - this.headOffset }, 560, {
      ease: ease.inQuad,
      onComplete: () => {
        this.landing.visible = false;
        if (this.state === 'dead') return;
        sfx.play('boss-land');
        this.world.shake(0.5, 200);
        this.world.puff(this.x, this.floorY, 10);
        this.state = 'dazed';
        this.dizzy.visible = true;
        this.stateUntil = this.world.now + 2800;
        // Sink a little so its head is easy to reach
        this.world.tweens.add(this, { y: this.y + 0.55 }, 160);
      },
    });
  }

  private toRise() {
    this.state = 'rise';
    this.dizzy.visible = false;
    this.world.tweens.add(this, { y: HOVER_Y }, 900, {
      ease: ease.inOutSine,
      onComplete: () => {
        if (this.state !== 'dead') this.toHover();
      },
    });
  }

  private drop() {
    const mesh = makeCard(this.def.projectile);
    this.world.addToScene(mesh);
    this.projectiles.push({ x: this.x, y: this.y + 1.3, vy: 4.2, mesh, alive: true });
  }

  private poof(p: Projectile) {
    p.alive = false;
    p.mesh.visible = false;
    this.world.puff(p.x, p.y, 4);
  }

  private takeHit() {
    this.hp -= 1;
    sfx.play('boss-hit');
    this.world.shake(0.3, 140);
    this.model.setGold(true);
    setTimeout(() => this.state !== 'dead' && this.model.setGold(false), 120);
    this.world.onBossHit();
    if (this.hp <= 0) this.defeat();
    else {
      this.dizzy.visible = false;
      this.world.tweens.killOf(this);
      this.toRise();
    }
  }

  private defeat() {
    this.state = 'dead';
    this.dizzy.visible = false;
    for (const p of this.projectiles) this.poof(p);
    this.world.tweens.killOf(this);
    this.setAlpha(1, 200);
    this.model.setGold(true);
    this.world.tweens.add(this, { x: (this.left + this.right) / 2, y: 6.5 }, 900, { ease: ease.outQuad });
    this.world.onBossDefeated();
  }
}
