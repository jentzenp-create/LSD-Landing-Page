// All pixel art is drawn in code: original sprites, no external image assets.
// Sprites are text grids — one character per pixel, mapped through PALETTE.
import Phaser from 'phaser';
import { TILE } from './config';

const PALETTE: Record<string, string> = {
  k: '#1A1423', // outline
  y: '#F2B705', // LSD gold
  Y: '#FFD84D', // light gold
  o: '#C98A00', // dark gold
  s: '#F1C27D', // skin
  S: '#D99A5B', // skin shade
  h: '#3B2414', // hair
  n: '#24305E', // navy
  w: '#FFFFFF',
  g: '#8B8FA3',
  G: '#4A4E69',
  p: '#7A4EAB',
  P: '#4E2E7A',
  r: '#E04848',
  l: '#5BC75B',
  L: '#2E8B3E',
  c: '#DDF1FF', // boss body
  b: '#A8CCF0', // boss shade
};

const r = (ch: string, n: number) => ch.repeat(n);

// ---------- Hero ("Sunny": gold cap + gold hoodie) 16x16 ----------
const HERO_TOP = [
  '......kkkkk.....',
  '.....kyyyyyk....',
  '....kyyYYyyykk..',
  '....kyyyyyyyyyk.',
  '....kkkkkkkkkk..',
  '....khhsssskk...',
  '....khsssksk....',
  '....khssssssk...',
  '.....kssSSsk....',
  '....kkyyyyykk...',
];
const HERO_ARMS = ['...kyyyywyyyyk..', '...ksyyyyyyysk..', '....kkyyyyykk...'];
const HERO_IDLE = [...HERO_TOP, ...HERO_ARMS, '.....knnknnk....', '.....knnknnk....', '....kwwk.kwwk...'];
const HERO_RUN1 = [...HERO_TOP, ...HERO_ARMS, '....knnk.knnk...', '...knnk...knnk..', '..kwwk.....kwwk.'];
const HERO_RUN2 = [...HERO_TOP, ...HERO_ARMS, '.....knnnnk.....', '......knnk......', '.....kwwwk......'];
const HERO_JUMP = [
  ...HERO_TOP.slice(0, 9),
  '.kk.kkyyyyykk.kk',
  '.kskyyyywyyyyksk',
  '..kkyyyyyyyyykk.',
  '....kkyyyyykk...',
  '....kknnnnkk....',
  '...knnk..knnk...',
  '...kwwk..kwwk...',
];

// ---------- Grump (a walking 1-star review) 16x16 ----------
const GRUMP_BODY = [
  '................',
  '................',
  '......kkkk......',
  '....kkppppkk....',
  '...kppppppppk...',
  '..kppppppppppk..',
  '..kpkkppppkkpk..',
  '..kppwkppkwppk..',
  '..kppkkppkkppk..',
  '.kppppppppppppk.',
  '.kpppkkkkkkpppk.',
  '.kppkppppppkppk.',
  '.kPPPPPPPPPPPPk.',
  '.kPPPPPPPPPPPPk.',
];
const GRUMP_A = [...GRUMP_BODY, '..kkPkkkkkkPkk..', '..kk........kk..'];
const GRUMP_B = [...GRUMP_BODY, '...kPkkkkkkPk...', '...kk......kk...'];

// ---------- Cricket (no customers... just crickets) 16x16 ----------
const CRICKET_TOP = [
  '................',
  '................',
  '................',
  '...........kk...',
  '..........k..k..',
  '......kkkkk.....',
  '....kkllllllk...',
  '...kllllllkwlk..',
  '..kllllllllkkk..',
  '.kLLlllllllllk..',
  '.kLLLLLLLLLLk...',
];
const CRICKET_SIT = [...CRICKET_TOP, '..kLk.kLk.kLk...', '.kLk..kLk..kLk..', '.kk...kk....kk..', '................', '................'];
const CRICKET_HOP = [...CRICKET_TOP, '.kLk...kLk..kLk.', 'kLk....kLk...kLk', 'kk.....kk.....kk', '................', '................'];

// ---------- Collectibles ----------
const STAR = [
  '.....kk.....',
  '....kYYk....',
  '....kYYk....',
  'kkkkkYYkkkkk',
  'kYYYYyyYYYYk',
  '.kyyyyyyyyk.',
  '..kyyyyyyk..',
  '..kyyyyyyk..',
  '.kyyykkyyyk.',
  '.kyyk..kyyk.',
  'kyyk....kyyk',
  'kkk......kkk',
];
const HEART = ['.kk.kk..', 'krrkrrk.', 'krrrrrk.', 'krrrrrk.', '.krrrk..', '..krk...', '...k....'];
const HEART_EMPTY = HEART.map((row) => row.replace(/r/g, 'G'));
const HEART_BIG = [
  '.kkk..kkk...',
  'krrrkkrrrk..',
  'krwrrrrrrk..',
  'krrrrrrrrk..',
  '.krrrrrrk...',
  '..krrrrk....',
  '...krrk.....',
  '....kk......',
];

// ---------- Boss: The Invisible Listing (a lost map pin) 24x23 ----------
const BOSS = [
  '........kkkkkkkk........',
  '......kkcccccccckk......',
  '....kkcccccccccccckk....',
  '...k' + r('c', 16) + 'k...',
  '..k' + r('c', 18) + 'k..',
  '..k' + r('c', 18) + 'k..',
  '.kcccc' + 'kk' + 'cccccc' + 'kk' + 'ccccbk.',
  '.kccckwwkcccckwwkccccbk.',
  '.kccckwkkcccckkwkccccbk.',
  '.kccckkkkcccckkkkccccbk.',
  '.k' + r('c', 19) + 'bk.',
  '.kcccccckkkkkkkkcccccbk.',
  '.kccccckcccccccckccccbk.',
  '..k' + r('c', 16) + 'bbk..',
  '...k' + r('c', 14) + 'bbk...',
  '....k' + r('c', 12) + 'bbk....',
  '.....k' + r('c', 10) + 'bbk.....',
  '......k' + r('c', 8) + 'bbk......',
  '.......k' + r('c', 6) + 'bbk.......',
  '........k' + r('c', 4) + 'bbk........',
  '.........kccbbk.........',
  '..........kbbk..........',
  '...........kk...........',
];

// ---------- Checkpoint lamp post 8x32 (unlit / lit) ----------
const LAMP_HEAD_OFF = ['.kkkkkk.', 'kGGGGGGk', 'kgggggGk', 'kgggggGk', '.kkkkkk.'];
const LAMP_HEAD_ON = ['.kkkkkk.', 'kYYYYYYk', 'kYwwYYyk', 'kYYYYYyk', '.kkkkkk.'];
const LAMP_POLE = [...Array(25)].map(() => '...kk...');
const LAMP_BASE = ['..kGGk..', '.kGGGGk.'];

function drawGrid(ctx: CanvasRenderingContext2D, grid: string[], ox: number, oy: number) {
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}

function gridTexture(scene: Phaser.Scene, key: string, grid: string[]) {
  const w = Math.max(...grid.map((row) => row.length));
  const tex = scene.textures.createCanvas(key, w, grid.length)!;
  drawGrid(tex.getContext(), grid, 0, 0);
  tex.refresh();
}

// Several same-size grids into one horizontal strip with numbered frames.
function stripTexture(scene: Phaser.Scene, key: string, frames: string[][]) {
  const w = frames[0][0].length;
  const h = frames[0].length;
  const tex = scene.textures.createCanvas(key, w * frames.length, h)!;
  frames.forEach((grid, i) => {
    drawGrid(tex.getContext(), grid, i * w, 0);
    tex.add(i, 0, i * w, 0, w, h);
  });
  tex.refresh();
}

// ---------- Tileset (drawn with rects) ----------
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
export const SOLID_TILES = [T.STREET, T.DIRT, T.BRICK, T.SUN, T.USED, T.CRATE, T.WALL];

function drawTiles(scene: Phaser.Scene) {
  const n = 7;
  const tex = scene.textures.createCanvas('tiles', TILE * n, TILE)!;
  const ctx = tex.getContext();
  const px = (tx: number, x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(tx * TILE + x, y, w, h);
  };

  // STREET: sidewalk slab on top of dark earth
  px(T.STREET, 0, 0, 16, 16, '#2B2540');
  px(T.STREET, 0, 0, 16, 5, '#6E6A8C');
  px(T.STREET, 0, 0, 16, 1, '#9C98BC');
  px(T.STREET, 7, 1, 1, 4, '#4E4A6B');
  px(T.STREET, 15, 1, 1, 4, '#4E4A6B');
  px(T.STREET, 0, 5, 16, 1, '#1A1423');
  px(T.STREET, 3, 9, 2, 1, '#3A3352');
  px(T.STREET, 10, 12, 3, 1, '#3A3352');

  // DIRT
  px(T.DIRT, 0, 0, 16, 16, '#2B2540');
  px(T.DIRT, 2, 3, 2, 1, '#3A3352');
  px(T.DIRT, 9, 6, 3, 1, '#3A3352');
  px(T.DIRT, 5, 11, 2, 1, '#3A3352');
  px(T.DIRT, 12, 13, 2, 1, '#3A3352');

  // BRICK (and WALL, a darker brick)
  for (const [t, base, mortar, hi] of [
    [T.BRICK, '#8E4A3A', '#3E1E1A', '#B5654F'],
    [T.WALL, '#4A3F66', '#1A1423', '#6A5E8C'],
  ] as const) {
    px(t, 0, 0, 16, 16, mortar);
    for (let row = 0; row < 4; row++) {
      const off = row % 2 === 0 ? 0 : 4;
      for (let col = -1; col < 2; col++) {
        const x = col * 8 + off;
        const x0 = Math.max(0, x);
        const x1 = Math.min(16, x + 7);
        if (x1 <= x0) continue;
        px(t, x0, row * 4, x1 - x0, 3, base);
        px(t, x0, row * 4, x1 - x0, 1, hi);
      }
    }
  }

  // SUN block: gold block with a little sun
  px(T.SUN, 0, 0, 16, 16, '#1A1423');
  px(T.SUN, 1, 1, 14, 14, '#F2B705');
  px(T.SUN, 1, 1, 14, 1, '#FFD84D');
  px(T.SUN, 1, 1, 1, 14, '#FFD84D');
  px(T.SUN, 1, 14, 14, 1, '#C98A00');
  px(T.SUN, 14, 1, 1, 14, '#C98A00');
  px(T.SUN, 6, 6, 4, 4, '#FFFFFF');
  px(T.SUN, 5, 7, 6, 2, '#FFFFFF');
  px(T.SUN, 7, 5, 2, 6, '#FFFFFF');
  for (const [x, y] of [[7, 3], [7, 11], [3, 7], [11, 7]]) px(T.SUN, x, y, 2, 2, '#FFF3C4');
  for (const [x, y] of [[4, 4], [11, 4], [4, 11], [11, 11]]) px(T.SUN, x, y, 1, 1, '#FFF3C4');
  px(T.SUN, 2, 2, 1, 1, '#1A1423');
  px(T.SUN, 13, 2, 1, 1, '#1A1423');
  px(T.SUN, 2, 13, 1, 1, '#1A1423');
  px(T.SUN, 13, 13, 1, 1, '#1A1423');

  // USED block
  px(T.USED, 0, 0, 16, 16, '#1A1423');
  px(T.USED, 1, 1, 14, 14, '#5E5874');
  px(T.USED, 1, 1, 14, 1, '#7A7494');
  px(T.USED, 2, 2, 1, 1, '#1A1423');
  px(T.USED, 13, 2, 1, 1, '#1A1423');
  px(T.USED, 2, 13, 1, 1, '#1A1423');
  px(T.USED, 13, 13, 1, 1, '#1A1423');

  // CRATE
  px(T.CRATE, 0, 0, 16, 16, '#1A1423');
  px(T.CRATE, 1, 1, 14, 14, '#9A6B3F');
  px(T.CRATE, 1, 1, 14, 2, '#C08A55');
  px(T.CRATE, 1, 13, 14, 2, '#C08A55');
  for (let i = 0; i < 10; i++) px(T.CRATE, 3 + i, 3 + i, 2, 1, '#6E4A2A');

  for (let i = 0; i < n; i++) tex.add(i, 0, i * TILE, 0, TILE, TILE);
  tex.refresh();
}

function drawMisc(scene: Phaser.Scene) {
  // 1px white dot for particles, stars in sky, etc.
  const dot = scene.textures.createCanvas('dot', 2, 2)!;
  dot.getContext().fillStyle = '#FFFFFF';
  dot.getContext().fillRect(0, 0, 2, 2);
  dot.refresh();

  // Moon
  const moon = scene.textures.createCanvas('moon', 24, 24)!;
  const m = moon.getContext();
  m.fillStyle = '#E8E4FF';
  m.beginPath();
  m.arc(12, 12, 11, 0, Math.PI * 2);
  m.fill();
  m.fillStyle = '#C9C3EE';
  m.fillRect(6, 8, 3, 3);
  m.fillRect(14, 14, 4, 3);
  m.fillRect(13, 6, 2, 2);
  moon.refresh();
}

export function createTextures(scene: Phaser.Scene) {
  stripTexture(scene, 'hero', [HERO_IDLE, HERO_RUN1, HERO_RUN2, HERO_JUMP]);
  stripTexture(scene, 'grump', [GRUMP_A, GRUMP_B]);
  stripTexture(scene, 'cricket', [CRICKET_SIT, CRICKET_HOP]);
  gridTexture(scene, 'star', STAR);
  gridTexture(scene, 'heart', HEART);
  gridTexture(scene, 'heart-empty', HEART_EMPTY);
  gridTexture(scene, 'heart-big', HEART_BIG);
  gridTexture(scene, 'boss', BOSS);
  gridTexture(scene, 'lamp-off', [...LAMP_HEAD_OFF, ...LAMP_POLE, ...LAMP_BASE]);
  gridTexture(scene, 'lamp-on', [...LAMP_HEAD_ON, ...LAMP_POLE, ...LAMP_BASE]);
  drawTiles(scene);
  drawMisc(scene);

  const anims = scene.anims;
  anims.create({ key: 'hero-run', frames: anims.generateFrameNumbers('hero', { frames: [1, 0, 2, 0] }), frameRate: 12, repeat: -1 });
  anims.create({ key: 'grump-walk', frames: anims.generateFrameNumbers('grump', { frames: [0, 1] }), frameRate: 4, repeat: -1 });
}
