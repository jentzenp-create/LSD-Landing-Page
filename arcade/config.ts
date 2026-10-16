// Shared constants for the Bottleneck Busters arcade game.

// Paste the GoHighLevel "Inbound Webhook" URL from the game's workflow here
// (Automation > Workflows > trigger "Inbound Webhook"). Leads are sent to it
// when a player submits the email form. Empty = leads are only logged.
export const GHL_WEBHOOK_URL = '';

// The level is laid out on a grid of 1x1 tiles. Physics runs in tile units,
// y pointing down (row 0 at the top), and the renderer flips it for 3D.
export const PHYS = {
  gravity: 56,
  runSpeed: 8.4,
  accel: 56,
  airAccel: 40,
  drag: 68,
  jumpVelocity: 22.5,
  jumpCutVelocity: 7.5,
  maxFall: 26,
  coyoteMs: 90,
  jumpBufferMs: 110,
  stompBounce: 16,
  invulnMs: 1300,
};

export const MAX_HEARTS = 3;

export const COLORS = {
  gold: 0xf2b705,
  goldLight: 0xffd84d,
  night: 0x0b0d17,
  ink: 0x1a1423,
};

// True when the page is embedded (e.g. a Gatherly booth). Used to default sound off.
export const IN_IFRAME = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const params = new URLSearchParams(window.location.search);
// ?src=gatherly (or any tag) is sent with the lead so you know where it came from.
export const SOURCE = params.get('src') || (IN_IFRAME ? 'embed' : 'web');
export const PROBE = params.has('probe');
// ?lowfx drops resolution for slow machines (also kicks in automatically).
export const LOW_FX = params.has('lowfx');
