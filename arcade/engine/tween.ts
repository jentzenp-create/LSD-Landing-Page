// Tiny tween runner, ticked by the game loop (so it pauses with the game).
type Ease = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

interface Tween {
  target: Record<string, number>;
  from: Record<string, number>;
  to: Record<string, number>;
  duration: number;
  elapsed: number;
  delay: number;
  ease: Ease;
  yoyo: boolean;
  onUpdate?: () => void;
  onComplete?: () => void;
  done: boolean;
}

export class Tweens {
  private list: Tween[] = [];

  add(
    target: object,
    to: Record<string, number>,
    duration: number,
    opts: { ease?: Ease; delay?: number; yoyo?: boolean; onUpdate?: () => void; onComplete?: () => void } = {},
  ) {
    const t = target as unknown as Record<string, number>;
    const tw: Tween = {
      target: t,
      from: {},
      to,
      duration: Math.max(1, duration),
      elapsed: 0,
      delay: opts.delay ?? 0,
      ease: opts.ease ?? ease.outQuad,
      yoyo: !!opts.yoyo,
      onUpdate: opts.onUpdate,
      onComplete: opts.onComplete,
      done: false,
    };
    this.list.push(tw);
    return tw;
  }

  killOf(target: object) {
    for (const tw of this.list) if (tw.target === target) tw.done = true;
  }

  /** Wait `ms` of game time. */
  wait(ms: number) {
    return new Promise<void>((resolve) => this.add({ v: 0 }, { v: 1 }, ms, { onComplete: resolve }));
  }

  update(dtMs: number) {
    for (const tw of this.list) {
      if (tw.done) continue;
      if (tw.delay > 0) {
        tw.delay -= dtMs;
        if (tw.delay > 0) continue;
      }
      if (tw.elapsed === 0) for (const k in tw.to) tw.from[k] = tw.target[k];
      tw.elapsed += dtMs;
      let p = Math.min(1, tw.elapsed / tw.duration);
      if (tw.yoyo) p = p < 0.5 ? p * 2 : (1 - p) * 2;
      const e = tw.ease(p);
      for (const k in tw.to) tw.target[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      tw.onUpdate?.();
      if (tw.elapsed >= tw.duration) {
        tw.done = true;
        tw.onComplete?.();
      }
    }
    this.list = this.list.filter((tw) => !tw.done);
  }

  clear() {
    this.list = [];
  }
}
