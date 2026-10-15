// "Choose your business" — doubles as the first diagnostic question (industry).
import Phaser from 'phaser';
import { COLORS, CSS, FONT, GAME_H, GAME_W } from '../config';
import { INDUSTRIES } from '../questions';
import { resetRun } from '../state';
import * as sfx from '../sfx';

export class SelectScene extends Phaser.Scene {
  constructor() {
    super('Select');
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.night);
    this.cameras.main.fadeIn(250, 5, 6, 12);
    this.add.image(400, 44, 'moon');

    const hero = this.add.sprite(GAME_W / 2, 62, 'hero', 0).setScale(2);
    hero.play('hero-run');

    this.add.text(GAME_W / 2, 100, 'CHOOSE YOUR BUSINESS', { fontFamily: FONT, fontSize: '16px', color: CSS.gold }).setOrigin(0.5);
    this.add.text(GAME_W / 2, 122, 'Your levels adapt to the kind of business you run.', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(0.5);

    let selected = 0;
    let done = false;
    const rowH = 24;
    const y0 = 146;
    const rows = INDUSTRIES.map((ind, i) => {
      const bg = this.add.rectangle(GAME_W / 2, y0 + i * rowH, 260, rowH - 4, COLORS.gold, 0).setStrokeStyle(1, COLORS.gold, 0.5);
      const t = this.add.text(GAME_W / 2, y0 + i * rowH, ind.label, { fontFamily: FONT, fontSize: '8px', color: CSS.white }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => select(i));
      bg.on('pointerdown', () => {
        select(i);
        confirm();
      });
      return { bg, t };
    });
    this.add.text(GAME_W / 2, GAME_H - 12, 'ARROWS + SPACE, OR TAP', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(0.5);

    const render = () =>
      rows.forEach((r, i) => {
        r.bg.setFillStyle(COLORS.gold, i === selected ? 1 : 0);
        r.t.setColor(i === selected ? '#1A1423' : CSS.white);
      });
    const select = (i: number) => {
      if (done || i === selected) return;
      selected = i;
      sfx.play('select');
      render();
    };
    const confirm = () => {
      if (done) return;
      done = true;
      sfx.unlock();
      sfx.play('power');
      resetRun(INDUSTRIES[selected].id);
      this.cameras.main.fadeOut(250, 5, 6, 12);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('World1', { demo: false }));
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') select((selected + rows.length - 1) % rows.length);
      else if (k === 'arrowdown' || k === 's') select((selected + 1) % rows.length);
      else if (k === ' ' || k === 'enter' || k === 'z') confirm();
    };
    render();
    // Ignore the key press that started the game
    this.time.delayedCall(250, () => this.input.keyboard?.on('keydown', onKey));
    this.events.once('shutdown', () => this.input.keyboard?.off('keydown', onKey));
  }
}
