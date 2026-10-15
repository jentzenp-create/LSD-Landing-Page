import '@fontsource/press-start-2p/400.css';
import '@fontsource/inter/400.css';
import './arcade.css';
import Phaser from 'phaser';
import { GAME_H, GAME_W, PHYS, PROBE, COLORS, IN_IFRAME } from './config';
import { BootScene } from './scenes/BootScene';
import { SelectScene } from './scenes/SelectScene';
import { World1Scene } from './scenes/World1Scene';
import * as sfx from './sfx';

// Global mute toggle (ignored while typing in the email form).
window.addEventListener('keydown', (e) => {
  const target = e.target as HTMLElement | null;
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
  if (e.key.toLowerCase() === 'm') sfx.toggleMute();
});

// ?probe shows the exact size of the box the game is rendered in. Load
// /arcade?probe inside a Gatherly booth to measure the embed.
function startProbe() {
  const el = document.createElement('div');
  el.className = 'probe';
  document.body.appendChild(el);
  const render = () => {
    const scale = Math.min(window.innerWidth / GAME_W, window.innerHeight / GAME_H);
    el.textContent = [
      `viewport ${window.innerWidth} x ${window.innerHeight}`,
      `pixel ratio ${window.devicePixelRatio}`,
      `embedded ${IN_IFRAME ? 'yes' : 'no'}`,
      `game scale ${scale.toFixed(2)}x`,
    ].join('  |  ');
  };
  render();
  window.addEventListener('resize', render);
}

async function boot() {
  // Make sure the pixel font is ready before Phaser draws any text.
  try {
    await Promise.race([document.fonts.load('8px "Press Start 2P"'), new Promise((r) => setTimeout(r, 2500))]);
  } catch {
    /* fall back to monospace */
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_W,
    height: GAME_H,
    backgroundColor: COLORS.night,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: PHYS.gravity }, debug: false },
    },
    input: { activePointers: 3 },
    scene: [BootScene, SelectScene, World1Scene],
  });

  if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
  if (PROBE) startProbe();
}

void boot();
