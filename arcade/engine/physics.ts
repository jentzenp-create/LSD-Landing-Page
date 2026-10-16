// Minimal platformer physics: axis-aligned boxes against a tile grid.
// Units are tiles; y points down (row 0 is the top of the level).
import { SOLID, T } from '../levels';

export interface Body {
  x: number; // left
  y: number; // top
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  blockedLeft: boolean;
  blockedRight: boolean;
  /** Tiles hit from below this step (for bumping blocks). */
  hitUp: { c: number; r: number }[];
}

export function makeBody(x: number, y: number, w: number, h: number): Body {
  return { x, y, w, h, vx: 0, vy: 0, onGround: false, blockedLeft: false, blockedRight: false, hitUp: [] };
}

const EPS = 1e-4;

export class TileGrid {
  constructor(
    public tiles: number[][],
    public cols: number,
    public rows: number,
  ) {}

  get(c: number, r: number) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return T.EMPTY;
    return this.tiles[r][c];
  }

  set(c: number, r: number, t: number) {
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) this.tiles[r][c] = t;
  }

  /** Off the left/right edge counts as wall; above and below the map is open. */
  solid(c: number, r: number) {
    if (c < 0 || c >= this.cols) return true;
    return SOLID.has(this.get(c, r));
  }

  solidAtPoint(x: number, y: number) {
    return this.solid(Math.floor(x), Math.floor(y));
  }

  /** Row of the first solid tile at or below y in column c, or -1 over a pit. */
  groundBelow(c: number, y: number) {
    for (let r = Math.max(0, Math.floor(y)); r < this.rows; r++) if (this.solid(c, r)) return r;
    return -1;
  }

  move(b: Body, dt: number) {
    b.blockedLeft = b.blockedRight = false;
    b.hitUp = [];

    // Horizontal
    b.x += b.vx * dt;
    const r0 = Math.floor(b.y + EPS);
    const r1 = Math.floor(b.y + b.h - EPS);
    if (b.vx > 0) {
      const c = Math.floor(b.x + b.w - EPS);
      for (let r = r0; r <= r1; r++)
        if (this.solid(c, r)) {
          b.x = c - b.w;
          b.vx = 0;
          b.blockedRight = true;
          break;
        }
    } else if (b.vx < 0) {
      const c = Math.floor(b.x + EPS);
      for (let r = r0; r <= r1; r++)
        if (this.solid(c, r)) {
          b.x = c + 1;
          b.vx = 0;
          b.blockedLeft = true;
          break;
        }
    }

    // Vertical
    b.onGround = false;
    b.y += b.vy * dt;
    const c0 = Math.floor(b.x + EPS);
    const c1 = Math.floor(b.x + b.w - EPS);
    if (b.vy > 0) {
      const r = Math.floor(b.y + b.h - EPS);
      for (let c = c0; c <= c1; c++)
        if (this.solid(c, r)) {
          b.y = r - b.h;
          b.vy = 0;
          b.onGround = true;
          break;
        }
    } else if (b.vy < 0) {
      const r = Math.floor(b.y + EPS);
      let hit = false;
      for (let c = c0; c <= c1; c++)
        if (this.solid(c, r)) {
          b.hitUp.push({ c, r });
          hit = true;
        }
      if (hit) {
        b.y = r + 1;
        b.vy = 0;
      }
    }
  }
}

export function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
