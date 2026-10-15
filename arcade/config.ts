// Shared constants for the Bottleneck Busters arcade game.

// Fixed logical resolution (~16:9). Phaser scales this up/down to fit whatever
// box the page lives in (full browser window, Gatherly booth embed, phone).
export const GAME_W = 480;
export const GAME_H = 272;
export const TILE = 16;

export const FONT = '"Press Start 2P", monospace';

export const COLORS = {
  gold: 0xf2b705,
  goldLight: 0xffd84d,
  night: 0x0b0d17,
  nightTop: 0x07080f,
  nightBottom: 0x1d1b3a,
  ink: 0x1a1423,
  white: 0xffffff,
  windowDark: 0x24223a,
  windowLit: 0xf2b705,
  windowLitWarm: 0xffe39a,
};

export const CSS = {
  gold: '#F2B705',
  goldLight: '#FFD84D',
  white: '#FFFFFF',
  dim: '#A9A6C9',
  red: '#E04848',
  green: '#7EE07E',
};

export const PHYS = {
  gravity: 900,
  runSpeed: 135,
  accel: 900,
  airAccel: 650,
  drag: 1100,
  jumpVelocity: 360,
  jumpCutVelocity: 120,
  maxFall: 420,
  coyoteMs: 90,
  jumpBufferMs: 110,
  stompBounce: 260,
  invulnMs: 1300,
};

export const MAX_HEARTS = 3;

// True when the page is embedded (e.g. a Gatherly booth). Used to default sound off.
export const IN_IFRAME = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const params = new URLSearchParams(window.location.search);
// ?src=gatherly (or any tag) is stored with the lead so we know where it came from.
export const SOURCE = params.get('src') || (IN_IFRAME ? 'embed' : 'web');
export const PROBE = params.has('probe');
