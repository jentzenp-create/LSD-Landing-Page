// Small canvas-painted textures with soft filtering: the slightly blurry,
// chunky N64 look. Nothing is downloaded.
import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

function canvasTex(key: string, size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, h = size) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = h;
  const g = c.getContext('2d')!;
  draw(g, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

function noise(g: CanvasRenderingContext2D, s: number, colors: string[], n: number, size = 2) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[i % colors.length];
    g.fillRect(Math.random() * s, Math.random() * s, size, size);
  }
}

export const tex = {
  sidewalk: () =>
    canvasTex('sidewalk', 64, (g, s) => {
      g.fillStyle = '#8d8aa8';
      g.fillRect(0, 0, s, s);
      noise(g, s, ['#9f9cba', '#7c7997'], 120);
      g.fillStyle = '#6d6a88';
      g.fillRect(0, 0, s, 2);
      g.fillRect(0, 0, 2, s);
    }),
  dirt: () =>
    canvasTex('dirt', 64, (g, s) => {
      g.fillStyle = '#3a3152';
      g.fillRect(0, 0, s, s);
      noise(g, s, ['#463c62', '#2e2742', '#524770'], 160, 3);
    }),
  brick: () =>
    canvasTex('brick', 64, (g, s) => {
      g.fillStyle = '#4a2420';
      g.fillRect(0, 0, s, s);
      for (let row = 0; row < 4; row++) {
        const off = row % 2 ? 16 : 0;
        for (let x = -32; x < s; x += 32) {
          g.fillStyle = row % 2 ? '#a5543f' : '#b35f48';
          g.fillRect(x + off + 1, row * 16 + 1, 30, 14);
          g.fillStyle = 'rgba(255,255,255,0.12)';
          g.fillRect(x + off + 1, row * 16 + 1, 30, 3);
        }
      }
    }),
  wall: () =>
    canvasTex('wall', 64, (g, s) => {
      g.fillStyle = '#1e1a30';
      g.fillRect(0, 0, s, s);
      for (let row = 0; row < 4; row++) {
        const off = row % 2 ? 16 : 0;
        for (let x = -32; x < s; x += 32) {
          g.fillStyle = '#4c4270';
          g.fillRect(x + off + 1, row * 16 + 1, 30, 14);
        }
      }
    }),
  crate: () =>
    canvasTex('crate', 64, (g, s) => {
      g.fillStyle = '#a8763f';
      g.fillRect(0, 0, s, s);
      g.fillStyle = '#7a5229';
      g.lineWidth = 7;
      g.strokeStyle = '#7a5229';
      g.strokeRect(4, 4, s - 8, s - 8);
      g.beginPath();
      g.moveTo(6, 6);
      g.lineTo(s - 6, s - 6);
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 6; i++) g.fillRect(8, 10 + i * 8, s - 16, 2);
    }),
  sun: () =>
    canvasTex('sun', 64, (g, s) => {
      const grad = g.createLinearGradient(0, 0, s, s);
      grad.addColorStop(0, '#ffe066');
      grad.addColorStop(1, '#e0a400');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
      g.strokeStyle = '#a87700';
      g.lineWidth = 4;
      g.strokeRect(2, 2, s - 4, s - 4);
      g.fillStyle = '#fffbe8';
      g.beginPath();
      g.arc(32, 32, 9, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = '#fffbe8';
      g.lineWidth = 4;
      g.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.beginPath();
        g.moveTo(32 + Math.cos(a) * 14, 32 + Math.sin(a) * 14);
        g.lineTo(32 + Math.cos(a) * 21, 32 + Math.sin(a) * 21);
        g.stroke();
      }
      g.fillStyle = '#a87700';
      for (const [x, y] of [[7, 7], [57, 7], [7, 57], [57, 57]]) {
        g.beginPath();
        g.arc(x, y, 2.5, 0, Math.PI * 2);
        g.fill();
      }
    }),
  used: () =>
    canvasTex('used', 64, (g, s) => {
      g.fillStyle = '#6a6582';
      g.fillRect(0, 0, s, s);
      g.strokeStyle = '#4a4660';
      g.lineWidth = 4;
      g.strokeRect(2, 2, s - 4, s - 4);
      g.fillStyle = '#4a4660';
      for (const [x, y] of [[7, 7], [57, 7], [7, 57], [57, 57]]) {
        g.beginPath();
        g.arc(x, y, 2.5, 0, Math.PI * 2);
        g.fill();
      }
    }),
  sky: () =>
    canvasTex(
      'sky',
      4,
      (g) => {
        const grad = g.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#05060d');
        grad.addColorStop(0.55, '#1a1838');
        grad.addColorStop(1, '#3a2a5c');
        g.fillStyle = grad;
        g.fillRect(0, 0, 4, 256);
      },
      256,
    ),
  skyDay: () =>
    canvasTex(
      'skyDay',
      4,
      (g) => {
        const grad = g.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#3f8fe0');
        grad.addColorStop(0.6, '#8cc8f5');
        grad.addColorStop(1, '#ffe4b0');
        g.fillStyle = grad;
        g.fillRect(0, 0, 4, 256);
      },
      256,
    ),
  sidewalkDay: () =>
    canvasTex('sidewalkDay', 64, (g, s) => {
      g.fillStyle = '#d9d2c3';
      g.fillRect(0, 0, s, s);
      noise(g, s, ['#e6dfd0', '#cbc3b2'], 120);
      g.fillStyle = '#bdb4a2';
      g.fillRect(0, 0, s, 2);
      g.fillRect(0, 0, 2, s);
    }),
  dirtDay: () =>
    canvasTex('dirtDay', 64, (g, s) => {
      g.fillStyle = '#9a6a43';
      g.fillRect(0, 0, s, s);
      noise(g, s, ['#a8774e', '#87593a', '#b5845a'], 160, 3);
    }),
  clockFace: () =>
    canvasTex('clockFace', 256, (g) => {
      g.fillStyle = '#fffaf0';
      g.beginPath();
      g.arc(128, 128, 126, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#1a1423';
      g.font = 'bold 30px "Lilita One", Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      for (let i = 1; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        g.fillText(String(i), 128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100);
      }
      // Grumpy eyes + "LATER" instead of a time
      for (const x of [92, 164]) {
        g.beginPath();
        g.arc(x, 112, 16, 0, Math.PI * 2);
        g.fill();
      }
      g.lineWidth = 8;
      g.strokeStyle = '#1a1423';
      g.beginPath();
      g.moveTo(70, 82);
      g.lineTo(110, 94);
      g.moveTo(186, 82);
      g.lineTo(146, 94);
      g.stroke();
      g.fillStyle = '#d33';
      g.font = 'bold 34px "Lilita One", Arial, sans-serif';
      g.fillText('LATER', 128, 168);
    }),
  /** A missed call: instantly reads as "you didn't pick up". */
  missedCard: () =>
    canvasTex(
      'missed',
      256,
      (g) => {
        g.fillStyle = '#ffffff';
        roundRect(g, 4, 4, 248, 152, 18);
        g.fill();
        g.strokeStyle = '#d33';
        g.lineWidth = 6;
        roundRect(g, 4, 4, 248, 152, 18);
        g.stroke();
        // phone handset
        g.save();
        g.translate(56, 60);
        g.rotate(-0.6);
        g.fillStyle = '#d33';
        roundRect(g, -34, -10, 68, 20, 9);
        g.fill();
        g.fillRect(-34, -10, 16, 30);
        g.fillRect(18, -10, 16, 30);
        g.restore();
        g.fillStyle = '#d33';
        g.font = 'bold 40px "Lilita One", Arial, sans-serif';
        g.textAlign = 'left';
        g.fillText('MISSED', 104, 72);
        g.textAlign = 'center';
        g.fillText('CALL (3)', 128, 132);
      },
      160,
    ),
  glow: () =>
    canvasTex('glow', 64, (g, s) => {
      const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, 'rgba(255,230,150,1)');
      grad.addColorStop(0.4, 'rgba(255,200,80,0.35)');
      grad.addColorStop(1, 'rgba(255,200,80,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    }),
  /** A 1-star review card: instantly reads as "bad review". */
  reviewCard: () =>
    canvasTex(
      'review',
      256,
      (g) => {
        g.fillStyle = '#ffffff';
        roundRect(g, 4, 4, 248, 152, 18);
        g.fill();
        g.strokeStyle = '#d33';
        g.lineWidth = 6;
        roundRect(g, 4, 4, 248, 152, 18);
        g.stroke();
        for (let i = 0; i < 5; i++) drawStar(g, 38 + i * 45, 52, 19, i === 0 ? '#f2b705' : '#cfcfd8');
        g.fillStyle = '#d33';
        g.font = 'bold 44px "Lilita One", Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText('TERRIBLE!', 128, 128);
      },
      160,
    ),
  /** An email nobody answered. */
  emailCard: () =>
    canvasTex(
      'email',
      256,
      (g) => {
        g.fillStyle = '#ffffff';
        roundRect(g, 4, 4, 248, 152, 14);
        g.fill();
        g.strokeStyle = '#8a8aa0';
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(10, 12);
        g.lineTo(128, 92);
        g.lineTo(246, 12);
        g.stroke();
        g.save();
        g.translate(128, 112);
        g.rotate(-0.12);
        g.strokeStyle = '#d33';
        g.lineWidth = 6;
        g.strokeRect(-100, -30, 200, 56);
        g.fillStyle = '#d33';
        g.font = 'bold 40px "Lilita One", Arial, sans-serif';
        g.textAlign = 'center';
        g.fillText('NO REPLY', 0, 13);
        g.restore();
      },
      160,
    ),
};

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function drawStar(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  g.fillStyle = color;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  g.closePath();
  g.fill();
}
