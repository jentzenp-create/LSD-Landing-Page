// Low-poly, flat-shaded models built from primitives (N64 style). Every model's
// origin is at its feet, facing +z (toward the camera) before rotation.
import * as THREE from 'three';
import { tex } from './textures';

const mats = new Map<string, THREE.Material>();
function mat(color: number, opts: THREE.MeshStandardMaterialParameters = {}) {
  const key = `${color}-${JSON.stringify(opts)}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, metalness: 0, ...opts });
    mats.set(key, m);
  }
  return m;
}

const C = {
  gold: 0xf2b705,
  goldDark: 0xc98a00,
  skin: 0xf1c27d,
  hair: 0x3b2414,
  navy: 0x24305e,
  white: 0xffffff,
  black: 0x15111f,
  purple: 0x8a5cc4,
  purpleDark: 0x5a3590,
  green: 0x5bc75b,
  greenDark: 0x2e8b3e,
};

function mesh(geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  return m;
}

function eye(r: number, x: number, y: number, z: number, pupilShift = 0) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.SphereGeometry(r, 10, 8), mat(C.white)));
  g.add(mesh(new THREE.SphereGeometry(r * 0.55, 8, 6), mat(C.black), pupilShift, 0, r * 0.62));
  g.position.set(x, y, z);
  return g;
}

// ---------------------------------------------------------------- hero

export interface HeroModel {
  root: THREE.Group;
  animate(t: number, state: 'idle' | 'run' | 'jump', facing: 1 | -1): void;
}

export function makeHero(): HeroModel {
  const root = new THREE.Group();
  const body = new THREE.Group(); // turns to face direction
  root.add(body);

  const limb = (color: number, r: number, len: number) => {
    const pivot = new THREE.Group();
    pivot.add(mesh(new THREE.CapsuleGeometry(r, len, 3, 8), mat(color), 0, -len / 2 - r * 0.4, 0));
    return pivot;
  };

  // Legs + shoes
  const legL = limb(C.navy, 0.085, 0.2);
  const legR = limb(C.navy, 0.085, 0.2);
  legL.position.set(-0.1, 0.36, 0);
  legR.position.set(0.1, 0.36, 0);
  for (const leg of [legL, legR]) leg.add(mesh(new THREE.BoxGeometry(0.16, 0.09, 0.24), mat(C.white), 0, -0.36, 0.04));
  body.add(legL, legR);

  // Torso (gold hoodie) with a little sun on the chest
  body.add(mesh(new THREE.CapsuleGeometry(0.21, 0.16, 3, 10), mat(C.gold), 0, 0.56, 0));
  const sun = mesh(new THREE.CircleGeometry(0.06, 10), mat(C.white, { emissive: 0xffffff, emissiveIntensity: 0.4 }), 0, 0.6, 0.215);
  body.add(sun);

  // Arms
  const armL = limb(C.gold, 0.07, 0.2);
  const armR = limb(C.gold, 0.07, 0.2);
  armL.position.set(-0.27, 0.7, 0);
  armR.position.set(0.27, 0.7, 0);
  armL.add(mesh(new THREE.SphereGeometry(0.075, 8, 6), mat(C.skin), 0, -0.34, 0));
  armR.add(mesh(new THREE.SphereGeometry(0.075, 8, 6), mat(C.skin), 0, -0.34, 0));
  body.add(armL, armR);

  // Head, hair, cap, face
  const head = new THREE.Group();
  head.position.set(0, 0.98, 0);
  head.add(mesh(new THREE.SphereGeometry(0.25, 14, 10), mat(C.skin)));
  head.add(mesh(new THREE.SphereGeometry(0.245, 12, 8), mat(C.hair), 0, -0.02, -0.06));
  const cap = mesh(new THREE.SphereGeometry(0.265, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.gold), 0, 0.03, 0);
  head.add(cap);
  head.add(mesh(new THREE.BoxGeometry(0.32, 0.04, 0.22), mat(C.goldDark), 0, 0.05, 0.27));
  head.add(mesh(new THREE.CapsuleGeometry(0.03, 0.05, 2, 6), mat(C.black), -0.09, -0.02, 0.23));
  head.add(mesh(new THREE.CapsuleGeometry(0.03, 0.05, 2, 6), mat(C.black), 0.09, -0.02, 0.23));
  const smile = mesh(new THREE.TorusGeometry(0.06, 0.012, 4, 8, Math.PI), mat(C.black), 0, -0.08, 0.235);
  smile.rotation.z = Math.PI;
  head.add(smile);
  body.add(head);

  return {
    root,
    animate(t, state, facing) {
      body.rotation.y = THREE.MathUtils.lerp(body.rotation.y, facing * 1.05, 0.25);
      if (state === 'run') {
        const s = Math.sin(t * 16);
        legL.rotation.x = s * 0.9;
        legR.rotation.x = -s * 0.9;
        armL.rotation.x = -s * 0.8;
        armR.rotation.x = s * 0.8;
        body.position.y = Math.abs(Math.cos(t * 16)) * 0.05;
      } else if (state === 'jump') {
        legL.rotation.x = 0.7;
        legR.rotation.x = -0.4;
        armL.rotation.x = -2.6;
        armR.rotation.x = 0.4;
        armL.rotation.z = -0.2;
        body.position.y = 0;
      } else {
        const b = Math.sin(t * 3) * 0.015;
        legL.rotation.x = legR.rotation.x = 0;
        armL.rotation.x = armR.rotation.x = 0;
        armL.rotation.z = armR.rotation.z = 0;
        body.position.y = b;
      }
      if (state !== 'jump') armL.rotation.z = 0;
    },
  };
}

// ---------------------------------------------------------------- enemies

export interface CreatureModel {
  root: THREE.Group;
  animate(t: number, moving: boolean, facing: 1 | -1, airborne?: boolean): void;
}

/** Grump: a walking 1-star review. Purple blob with angry brows. */
export function makeGrump(): CreatureModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const blob = mesh(new THREE.IcosahedronGeometry(0.42, 1), mat(C.purple), 0, 0.4, 0);
  blob.scale.set(1, 0.85, 0.9);
  body.add(blob);
  body.add(eye(0.11, -0.14, 0.5, 0.3, 0.03), eye(0.11, 0.14, 0.5, 0.3, -0.03));
  const browL = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), mat(C.black), -0.13, 0.63, 0.35);
  const browR = mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), mat(C.black), 0.13, 0.63, 0.35);
  browL.rotation.z = -0.4;
  browR.rotation.z = 0.4;
  body.add(browL, browR);
  const frown = mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 10, Math.PI), mat(C.black), 0, 0.26, 0.36);
  body.add(frown);
  // A single sad star on its head: it's a 1-star review
  const star = mesh(starGeometry(0.13, 0.06, 0.05), mat(C.gold, { emissive: C.goldDark, emissiveIntensity: 0.3 }), 0, 0.82, 0);
  body.add(star);
  const footL = mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(C.purpleDark), -0.18, 0.06, 0.05);
  const footR = mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(C.purpleDark), 0.18, 0.06, 0.05);
  body.add(footL, footR);
  return {
    root,
    animate(t, moving, facing) {
      body.rotation.y = facing * 0.6;
      const s = moving ? Math.sin(t * 9) : 0;
      blob.scale.y = 0.85 + Math.abs(s) * 0.08;
      footL.position.z = 0.05 + s * 0.12;
      footR.position.z = 0.05 - s * 0.12;
      star.rotation.y = t * 2;
    },
  };
}

/** Cricket: "no customers, just crickets". Hops toward you. */
export function makeCricket(): CreatureModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const torso = mesh(new THREE.CapsuleGeometry(0.17, 0.4, 3, 8), mat(C.green), 0, 0.3, 0);
  torso.rotation.z = Math.PI / 2;
  body.add(torso);
  body.add(mesh(new THREE.SphereGeometry(0.19, 10, 8), mat(C.green), 0.38, 0.4, 0));
  body.add(eye(0.08, 0.48, 0.48, 0.1), eye(0.08, 0.48, 0.48, -0.1));
  for (const z of [-0.1, 0.1]) {
    const ant = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 4), mat(C.greenDark), 0.45, 0.72, z);
    ant.rotation.z = -0.6;
    body.add(ant);
  }
  const legs: THREE.Group[] = [];
  for (const z of [-0.16, 0.16]) {
    const leg = new THREE.Group();
    leg.position.set(-0.15, 0.3, z);
    const thigh = mesh(new THREE.BoxGeometry(0.08, 0.32, 0.06), mat(C.greenDark), -0.05, 0.12, 0);
    thigh.rotation.z = 0.7;
    const shin = mesh(new THREE.BoxGeometry(0.06, 0.34, 0.05), mat(C.greenDark), -0.1, -0.12, 0);
    shin.rotation.z = -0.5;
    leg.add(thigh, shin);
    body.add(leg);
    legs.push(leg);
  }
  return {
    root,
    animate(t, _moving, facing, airborne) {
      body.rotation.y = facing === 1 ? -0.5 : Math.PI + 0.5;
      for (const leg of legs) leg.rotation.z = airborne ? -0.9 : 0;
      body.position.y = airborne ? 0 : Math.abs(Math.sin(t * 6)) * 0.02;
    },
  };
}

// ---------------------------------------------------------------- bosses

export interface BossModel {
  root: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  setOpacity(o: number): void;
  setGold(on: boolean): void;
  animate(t: number): void;
}

function bossMaterials(color: number) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.4, transparent: true, emissive: 0x1a2a40 });
}

function finishBoss(root: THREE.Group, body: THREE.Group, materials: THREE.MeshStandardMaterial[], baseColor: number): BossModel {
  return {
    root,
    materials,
    setOpacity(o) {
      for (const m of materials) {
        m.opacity = o;
        m.depthWrite = o > 0.9;
      }
    },
    setGold(on) {
      materials[0].color.setHex(on ? 0xf2b705 : baseColor);
      materials[0].emissive.setHex(on ? 0x6b4a00 : 0x1a2a40);
    },
    animate(t) {
      body.rotation.y = Math.sin(t * 1.3) * 0.25;
    },
  };
}

/** The Invisible Listing: a lost map pin. Origin at the pin's tip. */
export function makePinBoss(): BossModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const base = 0xdbeeff;
  const skin = bossMaterials(base);
  const face = new THREE.MeshStandardMaterial({ color: C.black, transparent: true, flatShading: true });
  const white = new THREE.MeshStandardMaterial({ color: C.white, transparent: true, flatShading: true });
  const cone = mesh(new THREE.ConeGeometry(0.78, 1.4, 12, 1, true), skin, 0, 0.7, 0);
  cone.rotation.x = Math.PI;
  body.add(cone);
  body.add(mesh(new THREE.SphereGeometry(1, 16, 12), skin, 0, 1.75, 0));
  for (const x of [-0.33, 0.33]) {
    body.add(mesh(new THREE.SphereGeometry(0.2, 10, 8), white, x, 1.9, 0.85));
    body.add(mesh(new THREE.SphereGeometry(0.11, 8, 6), face, x * 0.85, 1.88, 1.0));
    const brow = mesh(new THREE.BoxGeometry(0.34, 0.07, 0.07), face, x, 2.17, 0.9);
    brow.rotation.z = x < 0 ? -0.35 : 0.35;
    body.add(brow);
  }
  const frown = mesh(new THREE.TorusGeometry(0.22, 0.045, 4, 12, Math.PI), face, 0, 1.4, 0.9);
  body.add(frown);
  return finishBoss(root, body, [skin, face, white], base);
}

/** The Ghoster: a ghost in a tie who never replies. Origin at the hem. */
export function makeGhostBoss(): BossModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const base = 0xf2f0ff;
  const skin = bossMaterials(base);
  const face = new THREE.MeshStandardMaterial({ color: C.black, transparent: true, flatShading: true });
  const tie = new THREE.MeshStandardMaterial({ color: 0xd33a3a, transparent: true, flatShading: true });
  // Profile: dome on top of a straight sheet
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.sin(a) * 1.05, 2.0 + Math.cos(a) * 1.05));
  }
  pts.reverse();
  pts.push(new THREE.Vector2(1.1, 0.25));
  body.add(mesh(new THREE.LatheGeometry(pts, 14), skin));
  // Wavy hem
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const tip = mesh(new THREE.ConeGeometry(0.28, 0.4, 6), skin, Math.sin(a) * 0.85, 0.08, Math.cos(a) * 0.85);
    tip.rotation.x = Math.PI;
    body.add(tip);
  }
  for (const x of [-0.35, 0.35]) {
    const e = mesh(new THREE.SphereGeometry(0.17, 10, 8), face, x, 2.25, 0.9);
    e.scale.set(1, 1.4, 0.6);
    body.add(e);
  }
  body.add(mesh(new THREE.BoxGeometry(0.22, 0.16, 0.1), tie, 0, 1.6, 1.05));
  const tieBlade = mesh(new THREE.ConeGeometry(0.17, 0.7, 4), tie, 0, 1.2, 1.03);
  tieBlade.rotation.x = Math.PI;
  body.add(tieBlade);
  return finishBoss(root, body, [skin, face, tie], base);
}

// ---------------------------------------------------------------- props

export function starGeometry(outer: number, inner: number, depth: number) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: depth * 0.4, bevelSegments: 1 });
  geo.center();
  return geo;
}

let starGeo: THREE.BufferGeometry | undefined;
export function makeStar() {
  starGeo ??= starGeometry(0.4, 0.18, 0.12);
  return mesh(starGeo, mat(C.gold, { emissive: 0x7a5200, emissiveIntensity: 0.6, metalness: 0.3, roughness: 0.35 }));
}

export function makeHeart() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.35);
  shape.bezierCurveTo(-0.5, 0, -0.35, 0.35, 0, 0.15);
  shape.bezierCurveTo(0.35, 0.35, 0.5, 0, 0, -0.35);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
  geo.center();
  return mesh(geo, mat(0xe04848, { emissive: 0x501010 }));
}

const blockGeo = new THREE.BoxGeometry(1, 1, 1);
export function makeBlock(kind: 'brick' | 'crate' | 'sun' | 'used' | 'wall') {
  const t = tex[kind]();
  const m = new THREE.MeshStandardMaterial({
    map: t,
    roughness: 0.8,
    emissive: kind === 'sun' ? 0x6b4a00 : 0x000000,
    emissiveIntensity: kind === 'sun' ? 0.6 : 0,
  });
  return new THREE.Mesh(blockGeo, m);
}

export function makeLamp() {
  const root = new THREE.Group();
  root.add(mesh(new THREE.CylinderGeometry(0.07, 0.1, 3, 6), mat(0x3a3652), 0, 1.5, 0));
  root.add(mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), mat(0x3a3652), 0.2, 3, 0));
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0x8a86a8, emissive: 0x000000, flatShading: true });
  const bulb = mesh(new THREE.ConeGeometry(0.22, 0.3, 6), bulbMat, 0.4, 2.85, 0);
  root.add(bulb);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.position.set(0.4, 2.7, 0.1);
  glow.scale.set(3, 3, 1);
  root.add(glow);
  return {
    root,
    setLit(on: boolean) {
      bulbMat.color.setHex(on ? 0xfff2c0 : 0x8a86a8);
      bulbMat.emissive.setHex(on ? 0xffc040 : 0x000000);
      glow.material.opacity = on ? 0.9 : 0;
    },
  };
}

export function makeCard(kind: 'review' | 'email' | 'missed') {
  const t = kind === 'review' ? tex.reviewCard() : kind === 'email' ? tex.emailCard() : tex.missedCard();
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide });
  return new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.12), m);
}

export function makeBlobShadow() {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}

// ---------------------------------------------------------------- World 2 (daytime)

/** Snail: the slow reply. Crawls along, leaving a little trail. */
export function makeSnail(): CreatureModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const foot = mesh(new THREE.CapsuleGeometry(0.16, 0.55, 3, 8), mat(0x9fd38a), 0, 0.16, 0);
  foot.rotation.z = Math.PI / 2;
  body.add(foot);
  const head = new THREE.Group();
  head.position.set(0.38, 0.32, 0);
  head.add(mesh(new THREE.SphereGeometry(0.16, 10, 8), mat(0x9fd38a)));
  for (const z of [-0.07, 0.07]) {
    const stalk = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 5), mat(0x7bb768), 0.03, 0.2, z);
    head.add(stalk);
    head.add(eye(0.06, 0.05, 0.36, z));
  }
  body.add(head);
  // Spiral shell
  const shell = new THREE.Group();
  shell.position.set(-0.05, 0.48, 0);
  shell.add(mesh(new THREE.SphereGeometry(0.32, 12, 10), mat(0xd9893b)));
  const swirl = mesh(new THREE.TorusGeometry(0.17, 0.05, 6, 16), mat(0xa85f22), 0, 0, 0.27);
  shell.add(swirl);
  shell.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(0xa85f22), 0, 0, 0.32));
  body.add(shell);
  return {
    root,
    animate(t, moving, facing) {
      body.rotation.y = facing === 1 ? -0.45 : Math.PI + 0.45;
      const s = moving ? Math.sin(t * 5) : 0;
      foot.scale.y = 1 + s * 0.08;
      head.position.x = 0.38 + s * 0.03;
      swirl.rotation.z = t * 0.6;
    },
  };
}

/** Ringing phone: an unanswered call that hops at you. */
export function makePhone(): CreatureModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const red = 0xe04848;
  body.add(mesh(new THREE.BoxGeometry(0.7, 0.42, 0.55), mat(red), 0, 0.24, 0));
  const dial = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 14), mat(0xf4f0ff), 0, 0.3, 0.28);
  dial.rotation.x = Math.PI / 2;
  body.add(dial);
  const handset = new THREE.Group();
  handset.position.set(0, 0.55, 0);
  handset.add(mesh(new THREE.BoxGeometry(0.75, 0.1, 0.16), mat(0xb83232)));
  handset.add(mesh(new THREE.BoxGeometry(0.16, 0.14, 0.22), mat(0xb83232), -0.32, -0.07, 0));
  handset.add(mesh(new THREE.BoxGeometry(0.16, 0.14, 0.22), mat(0xb83232), 0.32, -0.07, 0));
  body.add(handset);
  body.add(eye(0.09, -0.15, 0.36, 0.25), eye(0.09, 0.15, 0.36, 0.25));
  return {
    root,
    animate(t, _moving, facing, airborne) {
      body.rotation.y = facing * 0.4;
      // Ringing: the handset rattles
      handset.position.y = 0.55 + (airborne ? 0.12 : Math.abs(Math.sin(t * 40)) * 0.04);
      handset.rotation.z = Math.sin(t * 38) * 0.12;
    },
  };
}

/** Captain Later: a giant alarm clock stuck on "later". Origin at its feet. */
export function makeClockBoss(): BossModel {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const base = 0x5aa0e6;
  const skin = bossMaterials(base);
  const metal = new THREE.MeshStandardMaterial({ color: 0xd8d8e8, transparent: true, flatShading: true, metalness: 0.4, roughness: 0.4 });
  const faceMat = new THREE.MeshStandardMaterial({ map: tex.clockFace(), transparent: true, roughness: 0.6 });
  const rim = mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.6, 20), skin, 0, 1.7, 0);
  rim.rotation.x = Math.PI / 2;
  body.add(rim);
  const face = mesh(new THREE.CircleGeometry(0.92, 24), faceMat, 0, 1.7, 0.31);
  body.add(face);
  for (const x of [-0.62, 0.62]) {
    const bell = mesh(new THREE.SphereGeometry(0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), metal, x, 2.65, 0);
    bell.rotation.z = x < 0 ? 0.45 : -0.45;
    body.add(bell);
  }
  body.add(mesh(new THREE.SphereGeometry(0.12, 8, 6), metal, 0, 2.9, 0));
  for (const x of [-0.55, 0.55]) {
    const leg = mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.6, 6), metal, x, 0.4, 0);
    leg.rotation.z = x < 0 ? -0.35 : 0.35;
    body.add(leg);
    body.add(mesh(new THREE.SphereGeometry(0.13, 8, 6), metal, x * 1.3, 0.1, 0));
  }
  return finishBoss(root, body, [skin, metal, faceMat], base);
}

let leadGeo: THREE.BufferGeometry | undefined;
/** A hot lead: an envelope with a notification dot. Cools from orange to blue. */
export function makeLead() {
  const root = new THREE.Group();
  leadGeo ??= new THREE.BoxGeometry(0.66, 0.44, 0.1);
  const paper = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, emissive: 0xff7a00, emissiveIntensity: 0.6, flatShading: true });
  root.add(new THREE.Mesh(leadGeo, paper));
  const flapMat = new THREE.MeshStandardMaterial({ color: 0xe8e4f4, flatShading: true });
  for (const s of [-1, 1]) {
    const flap = mesh(new THREE.BoxGeometry(0.42, 0.05, 0.04), flapMat, s * 0.15, 0.08, 0.06);
    flap.rotation.z = s * -0.55;
    root.add(flap);
  }
  const dot = mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff2010, emissiveIntensity: 0.6 }), 0.3, 0.2, 0.06);
  root.add(dot);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow(), color: 0xff8a1a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
  glow.scale.set(1.6, 1.6, 1);
  root.add(glow);
  const hot = new THREE.Color(0xff7a00);
  const cold = new THREE.Color(0x7ab8ff);
  return {
    root,
    /** heat: 1 = just arrived, 0 = gone cold */
    setHeat(heat: number) {
      paper.emissive.copy(cold).lerp(hot, heat);
      paper.emissiveIntensity = 0.25 + heat * 0.45;
      glow.material.color.copy(cold).lerp(hot, heat);
      glow.material.opacity = 0.35 + heat * 0.6;
      dot.visible = heat > 0.15;
    },
  };
}

/** Sunshine power-up: a little sun that slides along the ground. */
export function makeSunOrb() {
  const root = new THREE.Group();
  root.add(mesh(new THREE.IcosahedronGeometry(0.3, 1), new THREE.MeshStandardMaterial({ color: 0xffd84d, emissive: 0xffa000, emissiveIntensity: 0.9, flatShading: true })));
  const rays = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ray = mesh(new THREE.ConeGeometry(0.08, 0.22, 4), mat(0xffc400, { emissive: 0xff9a00, emissiveIntensity: 0.8 }), Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0);
    ray.rotation.z = a - Math.PI / 2;
    rays.add(ray);
  }
  root.add(rays);
  root.add(eye(0.06, -0.1, 0.06, 0.25), eye(0.06, 0.1, 0.06, 0.25));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  glow.scale.set(1.8, 1.8, 1);
  root.add(glow);
  return { root, animate: (t: number) => (rays.rotation.z = t * 2) };
}

/** Autopilot power-up: a lightning bolt. */
export function makeBolt() {
  const shape = new THREE.Shape();
  shape.moveTo(0.05, 0.45);
  shape.lineTo(-0.22, -0.02);
  shape.lineTo(-0.02, -0.02);
  shape.lineTo(-0.1, -0.45);
  shape.lineTo(0.22, 0.06);
  shape.lineTo(0.02, 0.06);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 });
  geo.center();
  const root = new THREE.Group();
  root.add(new THREE.Mesh(geo, mat(0x6ee7ff, { emissive: 0x1aa0ff, emissiveIntensity: 0.9 })));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow(), color: 0x7fd8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.set(1.8, 1.8, 1);
  root.add(glow);
  return { root, animate: (t: number) => (root.rotation.y = t * 3) };
}

/** Additive glow attached to the hero during Autopilot. */
export function makeAura() {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow(), color: 0x7fd8ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 }));
  s.scale.set(2.4, 2.4, 1);
  s.position.y = 0.6;
  return s;
}

/** Low-poly tree for the daytime street. */
export function makeTree(seed: number) {
  const root = new THREE.Group();
  root.add(mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6), mat(0x7a5233), 0, 0.8, 0));
  const leaf = mat(seed % 2 ? 0x5fbf5a : 0x4aa84f);
  root.add(mesh(new THREE.IcosahedronGeometry(0.85, 0), leaf, 0, 2.1, 0));
  root.add(mesh(new THREE.IcosahedronGeometry(0.6, 0), leaf, 0.45, 1.7, 0.15));
  root.add(mesh(new THREE.IcosahedronGeometry(0.55, 0), leaf, -0.45, 1.8, -0.1));
  return root;
}

export function makeCloud(seed: number) {
  const root = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25, fog: false });
  const n = 3 + (seed % 3);
  for (let i = 0; i < n; i++) {
    const r = 1.2 + ((seed * 7 + i * 3) % 5) * 0.3;
    root.add(mesh(new THREE.IcosahedronGeometry(r, 1), m, i * 1.5 - n * 0.7, (i % 2) * 0.5, 0));
  }
  return root;
}
