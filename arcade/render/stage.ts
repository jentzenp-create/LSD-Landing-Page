// Three.js renderer, camera, lights, sky (night or day) and the town in the background.
// Game coordinates: x = tile column, y = row (down). Three.js: y up, so y3 = -y.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { LOW_FX } from '../config';
import { tex } from './textures';

const FOV = 30;
const ASPECT = 16 / 9;

export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(FOV, ASPECT, 0.5, 250);
  readonly hemi = new THREE.HemisphereLight(0x9aa2ff, 0x2a2040, 0.9);
  readonly moonLight = new THREE.DirectionalLight(0xc8d0ff, 1.4);
  readonly warmLight = new THREE.DirectionalLight(0xffc870, 0);
  private moon: THREE.Mesh;
  private sun: THREE.Group;
  private sky: THREE.Points;
  theme: 'night' | 'day' = 'night';
  private pixelRatio: number;
  private frameTimes: number[] = [];

  /** Where the camera looks (game coords) and how far back it sits. */
  cam = { x: 12, y: 9.3, dist: 26 };

  constructor(private container: HTMLElement) {
    this.pixelRatio = LOW_FX ? 0.75 : Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer = new THREE.WebGLRenderer({ antialias: !LOW_FX, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.prepend(this.renderer.domElement);

    this.scene.background = tex.sky();
    this.scene.fog = new THREE.Fog(0x1a1838, 34, 95);
    this.moonLight.position.set(-8, 14, 12);
    this.warmLight.position.set(6, 8, 14);
    this.scene.add(this.hemi, this.moonLight, this.moonLight.target, this.warmLight, this.warmLight.target, new THREE.AmbientLight(0x404060, 0.4));

    this.moon = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshBasicMaterial({ color: 0xece8ff, fog: false }));
    this.scene.add(this.moon);

    const starPos: number[] = [];
    for (let i = 0; i < 400; i++) starPos.push(Math.random() * 400 - 60, Math.random() * 60 + 2, -120 - Math.random() * 20);
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    this.sky = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, fog: false, transparent: true, opacity: 0.8 }));
    this.scene.add(this.sky);

    // The Local Sun: big warm sun with a halo, used for daytime worlds.
    this.sun = new THREE.Group();
    this.sun.add(new THREE.Mesh(new THREE.SphereGeometry(5, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffd84d, fog: false })));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.glow(), color: 0xffc23d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    halo.scale.set(30, 30, 1);
    this.sun.add(halo);
    this.sun.visible = false;
    this.scene.add(this.sun);

    this.resize();
    new ResizeObserver(() => this.resize()).observe(container);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Half the visible width (in tiles) at the gameplay plane. */
  halfWidth(dist = this.cam.dist) {
    return dist * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * this.camera.aspect;
  }

  /** Visible width needed -> camera distance. */
  distForWidth(width: number) {
    return width / 2 / (Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * ASPECT);
  }

  setTheme(theme: 'night' | 'day') {
    this.theme = theme;
    const day = theme === 'day';
    this.scene.background = day ? tex.skyDay() : tex.sky();
    const fog = this.scene.fog as THREE.Fog;
    fog.near = day ? 45 : 34;
    fog.far = day ? 130 : 95;
    this.moon.visible = this.sky.visible = !day;
    this.sun.visible = day;
    this.hemi.color.setHex(day ? 0xdff0ff : 0x9aa2ff);
    this.hemi.groundColor.setHex(day ? 0xa08a6a : 0x2a2040);
    this.moonLight.color.setHex(day ? 0xfff1d0 : 0xc8d0ff);
    this.moonLight.intensity = day ? 2.4 : 1.4;
    if (day) {
      this.hemi.intensity = 1.5;
      this.warmLight.intensity = 0.5;
      fog.color.setHex(0xcfe6f7);
    } else this.setLit(0);
  }

  /** Brightness of the town: 0 = dark and empty, 1 = fully lit. Night only. */
  setLit(lit: number) {
    if (this.theme === 'day') return;
    this.hemi.intensity = 0.75 + lit * 1.0;
    this.warmLight.intensity = lit * 1.2;
    (this.scene.fog as THREE.Fog).color.setHSL(0.7, 0.35, 0.16 + lit * 0.06);
  }

  render(dt: number) {
    const { x, y, dist } = this.cam;
    this.camera.position.set(x, -y + 2.2, dist);
    this.camera.lookAt(x, -y + 0.3, 0);
    this.moon.position.set(x + 30, 28, -110);
    this.sun.position.set(x + 20, 16, -115);
    this.sky.position.x = x * 0.9;
    this.moonLight.target.position.set(x, -10, 0);
    this.moonLight.position.set(x - 8, 14, 12);
    this.warmLight.target.position.set(x, -10, 0);
    this.warmLight.position.set(x + 6, 8, 14);
    this.renderer.render(this.scene, this.camera);
    this.autoQuality(dt);
  }

  /** Drop resolution if frames are slow (e.g. a laptop also running a Gatherly video call). */
  private autoQuality(dt: number) {
    if (this.pixelRatio <= 0.75) return;
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes = [];
    if (avg > 1 / 45) {
      this.pixelRatio = Math.max(0.75, this.pixelRatio - 0.5);
      this.renderer.setPixelRatio(this.pixelRatio);
      this.resize();
    }
  }

  /** Project a game-space point to % of the stage (for HTML labels). */
  toScreen(x: number, y: number) {
    const v = new THREE.Vector3(x, -y, 0).project(this.camera);
    return { left: (v.x * 0.5 + 0.5) * 100, top: (-v.y * 0.5 + 0.5) * 100 };
  }
}

/** Background buildings with windows that switch on as the town gets "found". */
export class Town {
  readonly group = new THREE.Group();
  private windows: THREE.InstancedMesh;
  private thresholds: number[] = [];
  private litColors: THREE.Color[] = [];
  private dark = new THREE.Color(0x26233f);
  private lastLit = -1;

  private day: boolean;

  constructor(width: number, streetY: number, theme: 'night' | 'day' = 'night') {
    this.day = theme === 'day';
    const rnd = mulberry(this.day ? 11 : 7);
    const windowSpots: { x: number; y: number; z: number }[] = [];
    const layers = this.day
      ? [
          { z: -9, colors: [0xf2dcb3, 0xe39b78, 0x8cc7c4, 0xf4c27a, 0xc9b6e4], minH: 4, maxH: 9, windows: true },
          { z: -19, colors: [0xc8d9ea, 0xe8cfb0, 0xb7d3c9], minH: 7, maxH: 16, windows: true },
          { z: -34, colors: [0xa9c4dc], minH: 10, maxH: 24, windows: false },
        ]
      : [
          { z: -9, colors: [0x2b2748], minH: 4, maxH: 10, windows: true },
          { z: -19, colors: [0x221f3c], minH: 8, maxH: 18, windows: true },
          { z: -34, colors: [0x1a1830], minH: 12, maxH: 28, windows: false },
        ];
    const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
    for (const layer of layers) {
      // Every building in a layer is merged into one mesh: 1 draw call per layer
      // (per-building color via vertex colors).
      const parts: THREE.BufferGeometry[] = [];
      const paint = (g: THREE.BufferGeometry, color: number) => {
        const c = new THREE.Color(color);
        const n = g.attributes.position.count;
        const arr = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) arr.set([c.r, c.g, c.b], i * 3);
        g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
        return g;
      };
      for (let x = -20; x < width + 30; ) {
        const w = 3 + rnd() * 5;
        const h = layer.minH + rnd() * (layer.maxH - layer.minH);
        const d = 4 + rnd() * 3;
        const color = layer.colors[Math.floor(rnd() * layer.colors.length)];
        const trim = new THREE.Color(color).multiplyScalar(this.day ? 0.82 : 1.15).getHex();
        parts.push(paint(box(w, h, d, x + w / 2, -streetY + h / 2 - 1, layer.z), color));
        parts.push(paint(box(w + 0.3, 0.25, d + 0.3, x + w / 2, -streetY + h - 1, layer.z), trim)); // rooftop ledge
        if (rnd() < 0.35) parts.push(paint(box(0.9, 1.1, 0.9, x + w * (0.25 + rnd() * 0.5), -streetY + h - 0.4, layer.z), trim)); // water tank / vent
        if (layer.windows) {
          for (let wy = 1.2; wy < h - 1.6; wy += 1.5)
            for (let wx = 0.8; wx < w - 0.6; wx += 1.1) windowSpots.push({ x: x + wx, y: -streetY + wy - 1, z: layer.z + d / 2 + 0.02 });
        }
        x += w + 0.5 + rnd() * 2.5;
      }
      const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true });
      this.group.add(new THREE.Mesh(mergeGeometries(parts), mat));
      parts.forEach((g) => g.dispose());
    }

    this.windows = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5, 0.75), new THREE.MeshBasicMaterial({ color: 0xffffff }), windowSpots.length);
    const m = new THREE.Matrix4();
    const warm = [new THREE.Color(0xf2b705), new THREE.Color(0xffe39a), new THREE.Color(0xffd166)];
    windowSpots.forEach((p, i) => {
      m.makeTranslation(p.x, p.y, p.z);
      this.windows.setMatrixAt(i, m);
      this.windows.setColorAt(i, this.day ? this.glass(rnd()) : this.dark);
      this.thresholds.push(rnd() * 0.97);
      this.litColors.push(warm[Math.floor(rnd() * warm.length)]);
    });
    this.group.add(this.windows);
  }

  private glass(r: number) {
    return new THREE.Color(r < 0.5 ? 0x9fd0f0 : r < 0.8 ? 0xc4e4f7 : 0x7fb6dc);
  }

  setLit(lit: number) {
    if (this.day) return;
    if (Math.abs(lit - this.lastLit) < 0.004) return;
    this.lastLit = lit;
    this.thresholds.forEach((t, i) => this.windows.setColorAt(i, lit >= t ? this.litColors[i] : this.dark));
    if (this.windows.instanceColor) this.windows.instanceColor.needsUpdate = true;
  }

  dispose() {
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose();
    });
  }
}

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
