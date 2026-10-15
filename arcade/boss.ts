// World 1 boss: THE INVISIBLE LISTING.
// It drifts around nearly invisible (like a business nobody can find on Google),
// drops "404"s, then reveals itself and swoops. It's only vulnerable while dazed
// on the ground after a swoop: stomp it then. Its HP is set by the player's answers.
import Phaser from 'phaser';
import { CSS, FONT } from './config';
import * as sfx from './sfx';

type BossState = 'idle' | 'hover' | 'telegraph' | 'swoop' | 'dazed' | 'rise' | 'dead';

const HOVER_Y = 70;
const GHOST_ALPHA = 0.16;

export class InvisibleListing {
  readonly sprite: Phaser.Physics.Arcade.Image;
  readonly projectiles: Phaser.Physics.Arcade.Group;
  state: BossState = 'idle';
  hp = 3;
  maxHp = 3;

  private stateUntil = 0;
  private nextDrop = 0;
  private hoverT = 0;
  private dizzy?: Phaser.GameObjects.Text;

  constructor(
    private scene: Phaser.Scene,
    private left: number,
    private right: number,
    private floorY: number,
    private onDefeated: () => void,
  ) {
    const cx = (left + right) / 2;
    this.sprite = scene.physics.add.image(cx, HOVER_Y, 'boss').setScale(2).setDepth(25).setAlpha(0);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(20, 18).setOffset(2, 1);
    this.projectiles = scene.physics.add.group({ allowGravity: false });
  }

  get vulnerable() {
    return this.state === 'dazed';
  }

  get harmful() {
    return this.state === 'hover' || this.state === 'telegraph' || this.state === 'swoop' || this.state === 'rise';
  }

  fadeIn(duration = 900) {
    this.scene.tweens.add({ targets: this.sprite, alpha: 0.7, duration });
  }

  start(hp: number, time: number) {
    this.hp = this.maxHp = hp;
    this.toHover(time);
  }

  private get speedUp() {
    return this.maxHp - this.hp; // gets faster as it takes damage
  }

  private toHover(time: number) {
    this.state = 'hover';
    this.stateUntil = time + Math.max(1400, 2800 - this.speedUp * 300);
    this.nextDrop = time + 500;
    this.scene.tweens.add({ targets: this.sprite, alpha: GHOST_ALPHA, duration: 300 });
  }

  update(time: number, delta: number, player: Phaser.Physics.Arcade.Sprite) {
    // Clean up 404s that hit the street
    this.projectiles.getChildren().forEach((obj) => {
      const p = obj as Phaser.GameObjects.Text;
      if (p.y > this.floorY - 6) this.poof(p);
    });

    if (this.state === 'hover') {
      this.hoverT += delta / 1000;
      const span = (this.right - this.left) / 2 - 40;
      const cx = (this.left + this.right) / 2;
      this.sprite.setPosition(cx + Math.sin(this.hoverT * (1.1 + this.speedUp * 0.15)) * span, HOVER_Y + Math.sin(this.hoverT * 3) * 6);
      if (time > this.nextDrop) {
        this.drop404();
        this.nextDrop = time + Math.max(550, 1100 - this.speedUp * 150);
      }
      if (time > this.stateUntil) this.toTelegraph(player);
    } else if (this.state === 'dazed' && time > this.stateUntil) {
      this.toRise(time);
    }

    if (this.dizzy) {
      this.dizzy.setPosition(this.sprite.x, this.sprite.y - 30);
      this.dizzy.setAngle(Math.sin(time / 90) * 15);
    }
  }

  private toTelegraph(player: Phaser.Physics.Arcade.Sprite) {
    this.state = 'telegraph';
    const targetX = Phaser.Math.Clamp(player.x, this.left + 30, this.right - 30);
    this.scene.tweens.add({ targets: this.sprite, alpha: { from: 0.4, to: 1 }, duration: 90, yoyo: true, repeat: 2, onComplete: () => this.sprite.setAlpha(1) });
    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: HOVER_Y - 10,
      duration: Math.max(380, 650 - this.speedUp * 60),
      ease: 'Sine.Out',
      onComplete: () => this.toSwoop(),
    });
  }

  private toSwoop() {
    if (this.state === 'dead') return;
    this.state = 'swoop';
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.floorY - this.sprite.displayHeight / 2 + 2,
      duration: 380,
      ease: 'Quad.In',
      onComplete: () => {
        if (this.state === 'dead') return;
        sfx.play('boss-land');
        this.scene.cameras.main.shake(160, 0.01);
        this.state = 'dazed';
        this.stateUntil = this.scene.time.now + Math.max(1100, 1700 - this.speedUp * 120);
        this.dizzy = this.scene.add.text(this.sprite.x, this.sprite.y - 30, '* * *', { fontFamily: FONT, fontSize: '8px', color: CSS.goldLight }).setOrigin(0.5).setDepth(26);
      },
    });
  }

  private toRise(time: number) {
    this.state = 'rise';
    this.dizzy?.destroy();
    this.dizzy = undefined;
    this.scene.tweens.add({
      targets: this.sprite,
      y: HOVER_Y,
      duration: 600,
      ease: 'Sine.InOut',
      onComplete: () => {
        if (this.state !== 'dead') this.toHover(time + 600);
      },
    });
  }

  private drop404() {
    const t = this.scene.add.text(this.sprite.x, this.sprite.y + 20, '404', { fontFamily: FONT, fontSize: '8px', color: CSS.red, stroke: '#1A1423', strokeThickness: 2 }).setOrigin(0.5).setDepth(24);
    this.projectiles.add(t);
    const body = t.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityY(95 + this.speedUp * 15);
    body.setSize(t.width - 4, t.height - 2);
  }

  poof(p: Phaser.GameObjects.Text) {
    if (!p.active) return;
    p.body && ((p.body as Phaser.Physics.Arcade.Body).enable = false);
    p.setActive(false);
    this.scene.tweens.add({ targets: p, alpha: 0, y: p.y - 6, duration: 200, onComplete: () => p.destroy() });
  }

  /** Called when the player lands on the boss while it's dazed. */
  takeHit() {
    if (!this.vulnerable) return;
    this.hp -= 1;
    sfx.play('boss-hit');
    this.sprite.setTintFill(0xffffff);
    this.scene.time.delayedCall(120, () => this.sprite.clearTint());
    this.scene.cameras.main.shake(120, 0.006);
    if (this.hp <= 0) {
      this.defeat();
    } else {
      this.toRise(this.scene.time.now);
    }
  }

  private defeat() {
    this.state = 'dead';
    this.dizzy?.destroy();
    this.projectiles.getChildren().slice().forEach((p) => this.poof(p as Phaser.GameObjects.Text));
    (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.scene.tweens.add({
      targets: this.sprite,
      x: '+=3',
      duration: 50,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.sprite.setTint(0xf2b705).setAlpha(1);
        const cx = (this.left + this.right) / 2;
        this.scene.tweens.add({ targets: this.sprite, x: cx, y: 110, duration: 900, ease: 'Sine.Out' });
        this.scene.tweens.add({ targets: this.sprite, scale: 2.3, duration: 300, yoyo: true, repeat: 2 });
        this.scene.add
          .text(cx, 62, 'VERIFIED!', { fontFamily: FONT, fontSize: '16px', color: CSS.gold, stroke: '#1A1423', strokeThickness: 4 })
          .setOrigin(0.5)
          .setDepth(60);
        this.onDefeated();
      },
    });
  }
}
