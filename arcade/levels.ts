// Level layouts, built with small helpers instead of giant ASCII maps so
// they're easy to tweak. Units are tiles. Row 14 is street level.

export const T = {
  EMPTY: -1,
  STREET: 0, // ground top
  DIRT: 1, // ground fill
  BRICK: 2,
  SUN: 3, // sun block (reward or question)
  USED: 4, // spent sun block
  CRATE: 5,
  WALL: 6, // boss arena wall
};
export const SOLID = new Set([T.STREET, T.DIRT, T.BRICK, T.SUN, T.USED, T.CRATE, T.WALL]);

export const ROWS = 17;
export const STREET_ROW = 14;
const STREET = STREET_ROW;

export type SunReward =
  | { kind: 'star' } // +3 collectibles
  | { kind: 'power' } // Sunshine power-up (grow, extra hit, smash bricks)
  | { kind: 'bolt' } // Autopilot power-up (fast + invincible for a few seconds)
  | { kind: 'question'; index: number };

export interface LevelData {
  cols: number;
  rows: number;
  tiles: number[][];
  sunBlocks: Map<string, SunReward>; // "col,row" -> reward
  pickups: { col: number; row: number }[]; // stars (World 1) or hot leads (World 2)
  enemies: { col: number; role: 'walker' | 'hopper' }[];
  checkpoints: number[]; // cols
  start: { col: number };
  arena: { left: number; right: number }; // wall cols; fight happens between them
}

function builder(cols: number) {
  const tiles: number[][] = [...Array(ROWS)].map(() => Array(cols).fill(T.EMPTY));
  const sunBlocks = new Map<string, SunReward>();
  const pickups: LevelData['pickups'] = [];
  const enemies: LevelData['enemies'] = [];
  const set = (c: number, r: number, t: number) => {
    if (c >= 0 && c < cols && r >= 0 && r < ROWS) tiles[r][c] = t;
  };
  return {
    tiles,
    sunBlocks,
    pickups,
    enemies,
    set,
    ground(c0: number, c1: number) {
      for (let c = c0; c <= c1; c++) {
        set(c, STREET, T.STREET);
        for (let r = STREET + 1; r < ROWS; r++) set(c, r, T.DIRT);
      }
    },
    row(c0: number, r: number, len: number, t = T.BRICK) {
      for (let c = c0; c < c0 + len; c++) set(c, r, t);
    },
    stack(c: number, h: number, t = T.CRATE) {
      for (let i = 1; i <= h; i++) set(c, STREET - i, t);
    },
    sun(c: number, r: number, reward: SunReward) {
      set(c, r, T.SUN);
      sunBlocks.set(`${c},${r}`, reward);
    },
    line(c0: number, r: number, n: number) {
      for (let i = 0; i < n; i++) pickups.push({ col: c0 + i, row: r });
    },
    arc(c0: number, n: number, peak: number) {
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
        pickups.push({ col: c0 + i, row: Math.round(STREET - 2 - peak * (1 - t * t)) });
      }
    },
    walker: (col: number) => enemies.push({ col, role: 'walker' }),
    hopper: (col: number) => enemies.push({ col, role: 'hopper' }),
    arena(left: number, right: number) {
      for (let r = 0; r < STREET; r++) set(right, r, T.WALL);
      return { left, right };
    },
  };
}

/** World 1-1 "Ghost Town" (night): getting found. */
export function buildLevel1(): LevelData {
  const cols = 206;
  const b = builder(cols);

  // --- Section 1: warm-up --------------------------------------------------
  b.ground(0, 34);
  b.line(4, STREET - 1, 3);
  b.sun(9, 10, { kind: 'star' });
  b.row(12, 10, 1);
  b.sun(13, 10, { kind: 'question', index: 0 });
  b.row(14, 10, 1);
  b.line(12, 8, 3);
  b.walker(18);
  b.stack(22, 2);
  b.line(25, 9, 4);
  b.row(25, 10, 4);
  b.walker(31);
  b.arc(34, 5, 3); // gap 35-37

  // --- Section 2: crickets & stairs ---------------------------------------
  b.ground(38, 70);
  b.hopper(42);
  for (let i = 0; i < 4; i++) b.stack(48 + i, i + 1);
  for (let i = 0; i < 4; i++) b.stack(52 + i, 4 - i);
  b.line(50, STREET - 6, 5);
  b.row(59, 10, 2);
  b.sun(61, 10, { kind: 'power' });
  b.row(62, 10, 2);
  b.line(59, 9, 5);
  b.walker(64);
  b.walker(67);
  b.arc(70, 6, 4); // gap 71-74

  // --- Section 3: second question, checkpoint ------------------------------
  b.ground(75, 112);
  b.row(80, 10, 1);
  b.sun(81, 10, { kind: 'question', index: 1 });
  b.row(82, 10, 1);
  b.hopper(86);
  b.hopper(90);
  b.stack(93, 2);
  b.row(95, 9, 4);
  b.line(95, 8, 4);
  b.sun(97, 5, { kind: 'star' });
  b.stack(101, 3);
  b.walker(104);
  b.walker(107);
  b.arc(112, 5, 3); // gap 113-115

  // --- Section 4: platforms over the big pit -------------------------------
  b.ground(116, 150);
  b.hopper(122);
  b.sun(126, 10, { kind: 'question', index: 2 });
  b.sun(128, 10, { kind: 'power' });
  for (let i = 0; i < 5; i++) b.stack(136 + i, i + 1);
  b.line(137, STREET - 7, 3);
  b.walker(145);
  b.row(153, 11, 3); // pit 151-161
  b.line(153, 10, 3);
  b.row(158, 9, 3);
  b.line(158, 8, 3);
  b.ground(162, cols - 1);
  b.line(164, STREET - 1, 4);

  // --- Boss arena ------------------------------------------------------------
  const arena = b.arena(172, 203);
  b.row(177, 10, 4);
  b.row(195, 10, 4);

  return { cols, rows: ROWS, tiles: b.tiles, sunBlocks: b.sunBlocks, pickups: b.pickups, enemies: b.enemies, checkpoints: [116], start: { col: 2 }, arena };
}

/** World 2-1 "Sunrise Avenue" (day): speed to lead. Leads go cold if you dawdle. */
export function buildLevel2(): LevelData {
  const cols = 204;
  const b = builder(cols);

  // --- Section 1: first leads ----------------------------------------------
  b.ground(0, 30);
  b.line(6, STREET - 1, 3);
  b.row(11, 10, 1);
  b.sun(12, 10, { kind: 'question', index: 0 });
  b.row(13, 10, 1);
  b.sun(17, 10, { kind: 'power' });
  b.walker(21);
  b.stack(24, 2);
  b.line(23, 10, 3);
  b.walker(28);
  b.arc(30, 5, 3); // gap 31-33

  // --- Section 2: Autopilot run --------------------------------------------
  b.ground(34, 64);
  b.hopper(38);
  b.row(42, 9, 2);
  b.sun(44, 9, { kind: 'bolt' });
  b.row(45, 9, 3);
  b.line(42, 8, 6);
  b.walker(50);
  b.walker(53);
  b.walker(56);
  b.line(50, STREET - 1, 7);
  b.row(59, 10, 1);
  b.sun(60, 10, { kind: 'question', index: 1 });
  b.row(61, 10, 1);
  b.arc(64, 5, 3); // gap 65-67

  // --- Section 3: up high, checkpoint ----------------------------------------
  b.ground(68, 100);
  for (let i = 0; i < 4; i++) b.stack(72 + i, i + 1);
  b.row(78, 7, 4);
  b.line(78, 6, 4);
  b.hopper(84);
  b.hopper(88);
  b.line(92, STREET - 1, 5);
  b.sun(97, 10, { kind: 'question', index: 2 });
  b.row(102, 11, 2); // gap 101-104
  b.line(101, 10, 4);

  // --- Section 4: bricks, crowds -------------------------------------------
  b.ground(105, 140);
  b.walker(110);
  b.hopper(115);
  b.row(120, 10, 2);
  b.sun(122, 10, { kind: 'power' });
  b.row(123, 10, 3);
  b.line(120, 9, 6);
  b.stack(130, 3);
  b.line(129, 9, 3);
  b.walker(134);
  b.walker(137);
  b.row(143, 11, 3); // pit 141-152
  b.line(143, 10, 3);
  b.row(148, 9, 3);
  b.line(148, 8, 3);
  b.sun(150, 5, { kind: 'bolt' });
  b.ground(153, cols - 1);
  b.line(156, STREET - 1, 4);

  // --- Boss arena ------------------------------------------------------------
  const arena = b.arena(170, 201);
  b.row(175, 10, 4);
  b.row(193, 10, 4);

  return { cols, rows: ROWS, tiles: b.tiles, sunBlocks: b.sunBlocks, pickups: b.pickups, enemies: b.enemies, checkpoints: [105], start: { col: 2 }, arena };
}
