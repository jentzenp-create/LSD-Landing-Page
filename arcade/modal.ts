// In-game dialog boxes: multiple-choice questions and "press to continue" speech.
// Works with keyboard (arrows/WASD + space/enter, or number keys) and mouse/touch.
import Phaser from 'phaser';
import { COLORS, CSS, FONT, GAME_H, GAME_W } from './config';
import * as sfx from './sfx';

const PANEL_W = 420;
const PAD = 14;

function panel(scene: Phaser.Scene, height: number) {
  const c = scene.add.container(0, 0).setScrollFactor(0).setDepth(200);
  const dim = scene.add.rectangle(0, 0, GAME_W, GAME_H, 0x05060c, 0.55).setOrigin(0);
  const x = (GAME_W - PANEL_W) / 2;
  const y = Math.round((GAME_H - height) / 2);
  const box = scene.add.rectangle(x, y, PANEL_W, height, COLORS.ink, 0.96).setOrigin(0).setStrokeStyle(2, COLORS.gold);
  c.add([dim, box]);
  return { c, x, y };
}

function measureHeight(scene: Phaser.Scene, text: string, wrap: number) {
  const t = scene.add.text(0, 0, text, { fontFamily: FONT, fontSize: '8px', lineSpacing: 6, wordWrap: { width: wrap } });
  const h = t.height;
  t.destroy();
  return h;
}

export interface AskOptions {
  header: string;
  prompt: string;
  options: string[];
}

export function ask(scene: Phaser.Scene, opts: AskOptions): Promise<number> {
  return new Promise((resolve) => {
    const wrap = PANEL_W - PAD * 2;
    const promptH = measureHeight(scene, opts.prompt, wrap);
    const optH = 20;
    const height = PAD + 12 + promptH + 14 + opts.options.length * optH + 20 + PAD;
    const { c, x, y } = panel(scene, height);

    const header = scene.add.text(x + PAD, y + PAD, opts.header, { fontFamily: FONT, fontSize: '8px', color: CSS.gold });
    const prompt = scene.add.text(x + PAD, y + PAD + 16, opts.prompt, { fontFamily: FONT, fontSize: '8px', color: CSS.white, lineSpacing: 6, wordWrap: { width: wrap } });
    c.add([header, prompt]);

    let selected = 0;
    let done = false;
    const optY0 = y + PAD + 16 + promptH + 14;
    const rows = opts.options.map((label, i) => {
      const bg = scene.add.rectangle(x + PAD - 4, optY0 + i * optH - 5, wrap + 8, optH - 2, COLORS.gold, 0).setOrigin(0);
      const t = scene.add.text(x + PAD + 4, optY0 + i * optH, `${i + 1}. ${label}`, { fontFamily: FONT, fontSize: '8px', color: CSS.white });
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => select(i));
      bg.on('pointerdown', () => {
        select(i);
        confirm();
      });
      c.add([bg, t]);
      return { bg, t };
    });
    const hint = scene.add.text(x + PANEL_W / 2, y + height - PAD - 6, 'ARROWS + SPACE, 1-3, OR TAP', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(0.5);
    c.add(hint);

    function render() {
      rows.forEach((row, i) => {
        row.bg.setFillStyle(COLORS.gold, i === selected ? 1 : 0);
        row.t.setColor(i === selected ? '#1A1423' : CSS.white);
      });
    }
    function select(i: number) {
      if (done || i === selected) return;
      selected = i;
      sfx.play('select');
      render();
    }
    function confirm() {
      if (done) return;
      done = true;
      scene.input.keyboard?.off('keydown', onKey);
      sfx.play('power');
      scene.tweens.add({
        targets: rows[selected].bg,
        alpha: 0.3,
        duration: 70,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          c.destroy();
          resolve(selected);
        },
      });
    }
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') select((selected + rows.length - 1) % rows.length);
      else if (k === 'arrowdown' || k === 's') select((selected + 1) % rows.length);
      else if (k === ' ' || k === 'enter' || k === 'z') confirm();
      else if (/^[1-9]$/.test(k) && Number(k) <= rows.length) {
        select(Number(k) - 1);
        confirm();
      }
    }
    render();
    // Small delay so the jump press that bumped the block doesn't instantly confirm.
    scene.time.delayedCall(250, () => scene.input.keyboard?.on('keydown', onKey));
  });
}

/** A speech box that waits for a key/tap (or auto-advances after `autoMs`). */
export function say(scene: Phaser.Scene, speaker: string, line: string, autoMs = 6000): Promise<void> {
  return new Promise((resolve) => {
    const wrap = PANEL_W - PAD * 2;
    const lineH = measureHeight(scene, line, wrap);
    const height = PAD + 16 + lineH + 22 + PAD;
    const { c, x, y } = panel(scene, height);
    c.add(scene.add.text(x + PAD, y + PAD, speaker, { fontFamily: FONT, fontSize: '8px', color: CSS.gold }));
    c.add(scene.add.text(x + PAD, y + PAD + 16, line, { fontFamily: FONT, fontSize: '8px', color: CSS.white, lineSpacing: 6, wordWrap: { width: wrap } }));
    const more = scene.add.text(x + PANEL_W - PAD, y + height - PAD - 4, 'NEXT >', { fontFamily: FONT, fontSize: '8px', color: CSS.dim }).setOrigin(1, 0.5);
    c.add(more);
    scene.tweens.add({ targets: more, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      scene.input.keyboard?.off('keydown', onKey);
      scene.input.off('pointerdown', finish);
      timer.remove();
      sfx.play('select');
      c.destroy();
      resolve();
    };
    const onKey = (e: KeyboardEvent) => {
      if ([' ', 'enter', 'z', 'arrowright'].includes(e.key.toLowerCase())) finish();
    };
    const timer = scene.time.delayedCall(autoMs, finish);
    scene.time.delayedCall(300, () => {
      if (done) return;
      scene.input.keyboard?.on('keydown', onKey);
      scene.input.on('pointerdown', finish);
    });
  });
}
