// On-screen buttons for phones/tablets. Polls every active pointer each frame,
// so holding "right" and tapping "jump" at the same time works.
import Phaser from 'phaser';
import { COLORS, CSS, FONT, GAME_H, GAME_W } from './config';

export interface TouchControls {
  read(): { left: boolean; right: boolean; jump: boolean };
}

export function createTouchControls(scene: Phaser.Scene): TouchControls | undefined {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (!coarse) return undefined;
  scene.input.addPointer(2);

  const y = GAME_H - 30;
  const zones = {
    left: new Phaser.Geom.Rectangle(0, y - 34, 64, 64),
    right: new Phaser.Geom.Rectangle(64, y - 34, 64, 64),
    jump: new Phaser.Geom.Rectangle(GAME_W - 110, y - 44, 110, 74),
  };
  const btn = (x: number, label: string, r = 20) => {
    scene.add.circle(x, y, r, COLORS.ink, 0.45).setStrokeStyle(2, COLORS.gold, 0.6).setScrollFactor(0).setDepth(110);
    scene.add.text(x, y, label, { fontFamily: FONT, fontSize: '8px', color: CSS.goldLight }).setOrigin(0.5).setScrollFactor(0).setDepth(111);
  };
  btn(32, '<');
  btn(92, '>');
  btn(GAME_W - 40, 'JUMP', 24);

  return {
    read() {
      const state = { left: false, right: false, jump: false };
      for (const p of scene.input.manager.pointers) {
        if (!p.isDown) continue;
        if (zones.left.contains(p.x, p.y)) state.left = true;
        if (zones.right.contains(p.x, p.y)) state.right = true;
        if (zones.jump.contains(p.x, p.y)) state.jump = true;
      }
      return state;
    },
  };
}
