import '@fontsource/lilita-one/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import './arcade.css';
import { IN_IFRAME, PROBE } from './config';
import { Game } from './game';
import * as sfx from './sfx';

// Size the game to the *visible* viewport (mobile browsers' 100vh includes the
// part hidden behind the address bar / toolbars).
function syncViewport() {
  const vv = window.visualViewport;
  const w = vv ? vv.width * vv.scale : window.innerWidth;
  const h = vv ? vv.height * vv.scale : window.innerHeight;
  document.documentElement.style.setProperty('--app-w', `${Math.round(w)}px`);
  document.documentElement.style.setProperty('--app-h', `${Math.round(h)}px`);
}
syncViewport();
window.addEventListener('resize', syncViewport);
window.addEventListener('orientationchange', () => setTimeout(syncViewport, 250));
window.visualViewport?.addEventListener('resize', syncViewport);

// No zooming: block double-tap zoom and iOS pinch gestures (form fields still work).
let lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  (e) => {
    const t = e.target as HTMLElement | null;
    const now = Date.now();
    if (now - lastTouchEnd < 350 && !t?.closest('input, textarea, select, button, a, label')) e.preventDefault();
    lastTouchEnd = now;
  },
  { passive: false },
);
document.addEventListener('dblclick', (e) => e.preventDefault());
for (const ev of ['gesturestart', 'gesturechange']) document.addEventListener(ev, (e) => e.preventDefault());

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
    el.textContent = [
      `viewport ${window.innerWidth} x ${window.innerHeight}`,
      `pixel ratio ${window.devicePixelRatio}`,
      `embedded ${IN_IFRAME ? 'yes' : 'no'}`,
    ].join('  |  ');
  };
  render();
  window.addEventListener('resize', render);
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function boot() {
  // Fonts are also painted into 3D textures (review cards), so load them first.
  try {
    await Promise.race([document.fonts.load('40px "Lilita One"'), new Promise((r) => setTimeout(r, 2500))]);
  } catch {
    /* fall back to system fonts */
  }
  const stage = document.getElementById('stage')!;
  if (!webglAvailable()) {
    stage.innerHTML = '<p class="nogl">This game needs WebGL. Try the latest Chrome, Edge, Safari or Firefox.</p>';
    return;
  }
  const game = new Game(stage);
  game.attract();
  if (import.meta.env.DEV) (window as unknown as { __game: Game }).__game = game;
  if (PROBE) startProbe();
}

void boot();
