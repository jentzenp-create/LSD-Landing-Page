// World 1-1 "Ghost Town" layout, built with small helpers instead of a giant
// ASCII map so it's easy to tweak. Units are tiles (16px). Row 14 is street level.
import { T } from './art';

export const ROWS = 17;
const STREET = 14;

export type SunReward = { kind: 'star' } | { kind: 'heart' } | { kind: 'question'; index: number };

export interface LevelData {
  cols: number;
  rows: number;
  tiles: number[][];
  sunBlocks: Map<string, SunReward>; // "col,row" -> reward
  stars: { col: number; row: number }[];
  enemies: { col: number; type: 'grump' | 'cricket' }[];
  checkpoints: number[]; // cols
  start: { col: number };
  arena: { left: number; right: number }; // wall cols; fight happens between them
}

export function buildLevel1(): LevelData {
  const cols = 206;
  const tiles: number[][] = [...Array(ROWS)].map(() => Array(cols).fill(T.EMPTY));
  const sunBlocks = new Map<string, SunReward>();
  const stars: LevelData['stars'] = [];
  const enemies: LevelData['enemies'] = [];

  const set = (c: number, r: number, t: number) => {
    if (c >= 0 && c < cols && r >= 0 && r < ROWS) tiles[r][c] = t;
  };
  const ground = (c0: number, c1: number) => {
    for (let c = c0; c <= c1; c++) {
      set(c, STREET, T.STREET);
      for (let r = STREET + 1; r < ROWS; r++) set(c, r, T.DIRT);
    }
  };
  const row = (c0: number, r: number, len: number, t = T.BRICK) => {
    for (let c = c0; c < c0 + len; c++) set(c, r, t);
  };
  const stack = (c: number, h: number, t = T.CRATE) => {
    for (let i = 1; i <= h; i++) set(c, STREET - i, t);
  };
  const sun = (c: number, r: number, reward: SunReward) => {
    set(c, r, T.SUN);
    sunBlocks.set(`${c},${r}`, reward);
  };
  const starRow = (c0: number, r: number, n: number) => {
    for (let i = 0; i < n; i++) stars.push({ col: c0 + i, row: r });
  };
  const starArc = (c0: number, n: number, peak: number) => {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
      stars.push({ col: c0 + i, row: Math.round(STREET - 2 - peak * (1 - t * t)) });
    }
  };
  const enemy = (col: number, type: 'grump' | 'cricket') => enemies.push({ col, type });

  // --- Section 1: warm-up --------------------------------------------------
  ground(0, 34);
  starRow(4, STREET - 1, 3);
  sun(9, 10, { kind: 'star' });
  row(12, 10, 1);
  sun(13, 10, { kind: 'question', index: 0 });
  row(14, 10, 1);
  starRow(12, 9 - 1, 3);
  enemy(18, 'grump');
  stack(22, 2);
  starRow(25, 9, 4);
  row(25, 10, 4);
  enemy(31, 'grump');
  // gap 35-37
  starArc(34, 5, 3);

  // --- Section 2: crickets & stairs ---------------------------------------
  ground(38, 70);
  enemy(42, 'cricket');
  for (let i = 0; i < 4; i++) stack(48 + i, i + 1);
  for (let i = 0; i < 4; i++) stack(52 + i, 4 - i);
  starRow(50, STREET - 6, 5);
  row(59, 10, 2);
  sun(61, 10, { kind: 'heart' });
  row(62, 10, 2);
  starRow(59, 9, 5);
  enemy(64, 'grump');
  enemy(67, 'grump');
  // gap 71-74
  starArc(70, 6, 4);

  // --- Section 3: second question, checkpoint ------------------------------
  ground(75, 112);
  row(80, 10, 1);
  sun(81, 10, { kind: 'question', index: 1 });
  row(82, 10, 1);
  enemy(86, 'cricket');
  enemy(90, 'cricket');
  stack(93, 2);
  row(95, 9, 4);
  starRow(95, 8, 4);
  sun(97, 5, { kind: 'star' });
  stack(101, 3);
  enemy(104, 'grump');
  enemy(107, 'grump');
  // gap 113-115
  starArc(112, 5, 3);

  // --- Section 4: platforms over the big pit -------------------------------
  ground(116, 150);
  enemy(122, 'cricket');
  sun(126, 10, { kind: 'star' });
  sun(128, 10, { kind: 'star' });
  for (let i = 0; i < 5; i++) stack(136 + i, i + 1);
  starRow(137, STREET - 7, 3);
  enemy(145, 'grump');
  // pit 151-161 with floating platforms
  row(153, 11, 3);
  starRow(153, 10, 3);
  row(158, 9, 3);
  starRow(158, 8, 3);
  ground(162, cols - 1);
  starRow(164, STREET - 1, 4);

  // --- Boss arena (walls at 172 and 203) -----------------------------------
  const arena = { left: 172, right: 203 };
  for (let r = 0; r < STREET; r++) set(arena.right, r, T.WALL);
  row(177, 10, 4);
  row(195, 10, 4);

  return {
    cols,
    rows: ROWS,
    tiles,
    sunBlocks,
    stars,
    enemies,
    checkpoints: [116],
    start: { col: 2 },
    arena,
  };
}

export const STREET_ROW = STREET;
