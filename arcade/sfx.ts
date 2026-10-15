// Tiny Web Audio synth: chiptune bleeps + a looping bassline. No audio files.
// Browsers block audio until a click/keypress, so unlock() is called on the first input.
import { IN_IFRAME } from './config';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
// Default muted inside an embed (Gatherly booths have live voice/video).
let muted = IN_IFRAME;
let musicTimer: number | undefined;
let musicOn = false;

const listeners = new Set<(m: boolean) => void>();

export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.18;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

export function isMuted() {
  return muted;
}

export function onMuteChange(fn: (m: boolean) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function toggleMute() {
  muted = !muted;
  unlock();
  if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.18, ctx.currentTime, 0.02);
  listeners.forEach((fn) => fn(muted));
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.5, slideTo?: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  gain.gain.setValueAtTime(vol, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

type Sfx = 'jump' | 'star' | 'stomp' | 'hurt' | 'bump' | 'power' | 'select' | 'boss-hit' | 'boss-land' | 'win' | 'checkpoint';

export function play(name: Sfx) {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'jump':
      tone(260, t, 0.16, 'square', 0.25, 520);
      break;
    case 'star':
      tone(988, t, 0.06, 'square', 0.25);
      tone(1319, t + 0.06, 0.14, 'square', 0.25);
      break;
    case 'stomp':
      tone(400, t, 0.12, 'square', 0.35, 120);
      break;
    case 'hurt':
      tone(300, t, 0.3, 'sawtooth', 0.3, 80);
      break;
    case 'bump':
      tone(140, t, 0.08, 'triangle', 0.6);
      break;
    case 'power':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.1, 'square', 0.25));
      break;
    case 'select':
      tone(660, t, 0.05, 'square', 0.2);
      break;
    case 'checkpoint':
      [784, 988, 1175].forEach((f, i) => tone(f, t + i * 0.08, 0.12, 'triangle', 0.4));
      break;
    case 'boss-hit':
      tone(180, t, 0.25, 'sawtooth', 0.4, 60);
      tone(900, t, 0.1, 'square', 0.2, 400);
      break;
    case 'boss-land':
      tone(90, t, 0.3, 'triangle', 0.8, 40);
      break;
    case 'win':
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, t + i * 0.11, 0.18, 'square', 0.25));
      break;
  }
}

// Original 2-bar loop: bass + sparse lead, A-minor-ish.
const BASS = [110, 0, 110, 0, 131, 0, 147, 0, 98, 0, 98, 0, 131, 0, 123, 0];
const LEAD = [0, 0, 440, 0, 523, 0, 0, 587, 0, 0, 392, 0, 523, 0, 494, 0];
const STEP = 0.15;

export function startMusic() {
  if (musicOn) return;
  musicOn = true;
  const loop = () => {
    if (!musicOn) return;
    if (ctx && !muted) {
      const t0 = ctx.currentTime + 0.05;
      BASS.forEach((f, i) => f && tone(f, t0 + i * STEP, STEP * 0.9, 'triangle', 0.55));
      LEAD.forEach((f, i) => f && tone(f, t0 + i * STEP, STEP * 0.7, 'square', 0.12));
    }
    musicTimer = window.setTimeout(loop, BASS.length * STEP * 1000);
  };
  loop();
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer) window.clearTimeout(musicTimer);
}
