// Three.js renderer, camera, lights and the night-time town in the background.
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
  private sky: THREE.Points;
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

  /** Brightness of the town: 0 = dark and empty, 1 = fully lit. */
  setLit(lit: number) {
    this.hemi.intensity = 0.75 + lit * 1.0;
    this.warmLight.intensity = lit * 1.2;
    (this.scene.fog as THREE.Fog).color.setHSL(0.7, 0.35, 0.16 + lit * 0.06);
  }

  render(dt: number) {
    const { x, y, dist } = this.cam;
    this.camera.position.set(x, -y + 2.2, dist);
    this.camera.lookAt(x, -y + 0.3, 0);
    this.moon.position.set(x + 30, 28, -110);
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

  constructor(width: number, streetY: number) {
    const rnd = mulberry(7);
    const windowSpots: { x: number; y: number; z: number }[] = [];
    const layers = [
      { z: -9, color: 0x2b2748, minH: 4, maxH: 10, windows: true },
      { z: -19, color: 0x221f3c, minH: 8, maxH: 18, windows: true },
      { z: -34, color: 0x1a1830, minH: 12, maxH: 28, windows: false },
    ];
    const box = (w: number, h: number, d: number, x: number, y: number, z: number) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
    for (const layer of layers) {
      // Every building in a layer is merged into one mesh: 1 draw call per layer.
      const parts: THREE.BufferGeometry[] = [];
      for (let x = -20; x < width + 30; ) {
        const w = 3 + rnd() * 5;
        const h = layer.minH + rnd() * (layer.maxH - layer.minH);
        const d = 4 + rnd() * 3;
        parts.push(box(w, h, d, x + w / 2, -streetY + h / 2 - 1, layer.z));
        parts.push(box(w + 0.3, 0.25, d + 0.3, x + w / 2, -streetY + h - 1, layer.z)); // rooftop ledge
        if (rnd() < 0.35) parts.push(box(0.9, 1.1, 0.9, x + w * (0.25 + rnd() * 0.5), -streetY + h - 0.4, layer.z)); // water tank / vent
        if (layer.windows) {
          for (let wy = 1.2; wy < h - 1.6; wy += 1.5)
            for (let wx = 0.8; wx < w - 0.6; wx += 1.1) windowSpots.push({ x: x + wx, y: -streetY + wy - 1, z: layer.z + d / 2 + 0.02 });
        }
        x += w + 0.5 + rnd() * 2.5;
      }
      const mat = new THREE.MeshStandardMaterial({ color: layer.color, roughness: 1, flatShading: true });
      this.group.add(new THREE.Mesh(mergeGeometries(parts), mat));
      parts.forEach((g) => g.dispose());
    }

    this.windows = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.5, 0.75), new THREE.MeshBasicMaterial({ color: 0xffffff }), windowSpots.length);
    const m = new THREE.Matrix4();
    const warm = [new THREE.Color(0xf2b705), new THREE.Color(0xffe39a), new THREE.Color(0xffd166)];
    windowSpots.forEach((p, i) => {
      m.makeTranslation(p.x, p.y, p.z);
      this.windows.setMatrixAt(i, m);
      this.windows.setColorAt(i, this.dark);
      this.thresholds.push(rnd() * 0.97);
      this.litColors.push(warm[Math.floor(rnd() * warm.length)]);
    });
    this.group.add(this.windows);
  }

  setLit(lit: number) {
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
