import * as THREE from 'three';

// Ed's career as floating islands in a sea of clouds, explored by airship. One
// island per role, each dressed for the job. The React widget owns the HUD; this
// module owns the world, the flight model and the discovery state, and reports
// back through callbacks.

export const SKY_ISLANDS = [
  { company: 'BMO Capital Markets', role: 'Desktop Specialist Lead', period: 'Jun 2011 – Jul 2014', year: '2011', kind: 'bank' },
  { company: 'Cityhunter App', role: 'UX Architect', period: 'Jun 2012 – Sep 2014', year: '2012', kind: 'phone' },
  { company: 'Toronto Star', role: 'Digital Designer, Team Lead', period: 'Mar 2015 – Apr 2016', year: '2015', kind: 'newsstand' },
  { company: 'Hubub', role: 'UX/UI Designer', period: 'Apr – Oct 2016', year: '2016', kind: 'bubble' },
  { company: 'Tier1 Financial Solutions', role: 'UX Manager and Lead Product Designer', period: 'Jan 2017 – Apr 2020', year: '2017', kind: 'ticker' },
  { company: 'Flybits', role: 'Product Design Manager', period: 'Jul 2020 – Mar 2021', year: '2020', kind: 'beacon' },
  { company: 'Kea AI', role: 'Head of Product Design', period: 'Mar 2021 – Jul 2022', year: '2021', kind: 'robot' },
  { company: 'SamaCare', role: 'Staff Product Designer', period: 'Aug 2022 – Sept 2024', year: '2022', kind: 'forms' },
  { company: 'Adopt AI', role: 'Design Advisor (Founding Staff Product Designer)', period: 'Oct 2024 – Apr 2026', year: '2024', kind: 'api' },
  { company: 'Caret Legal', role: 'Director of Product Design', period: 'Mar – May 2026', year: '2026', kind: 'court' },
  { company: 'Elation Health', role: 'Staff Product Designer', period: 'May 2026 – Present', year: '2026', kind: 'practice', summit: true },
];

/**
 * @param {HTMLElement} stage  sized element that receives the canvas and pointer input
 * @param {{ compass: HTMLCanvasElement, radar: HTMLCanvasElement, onIsland: Function, onFound: Function, onLever: Function, onTour: Function, onTouched: Function }} opts
 */
export function createSkyIslands(stage, opts) {

  const ISLANDS = SKY_ISLANDS; const _unused = null;
  const N = ISLANDS.length; void _unused;
  const POS = ISLANDS.map((d, i) => { const a = 0.4 + i * 1.95, r = 12 + i * 2.7; return new THREE.Vector3(Math.sin(a) * r, 1.8 + (i / (N - 1)) * 3.2 + Math.sin(i * 2.3) * 0.5, -Math.cos(a) * r); });
  const HOVER = 2.3; // how far above an island's grass the ship parks

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 9173;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const clamp = THREE.MathUtils.clamp, damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 300);
  const FOG = new THREE.Color(0xd8e9f8).convertSRGBToLinear();
  scene.fog = new THREE.Fog(FOG, 70, 260);
  const SUN_DIR = new THREE.Vector3(-0.55, 0.75, 0.35).normalize();

  const srgb = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const soft = (hex, extra) => { const m = new THREE.MeshLambertMaterial(Object.assign({ color: hex }, extra || {})); m.color.convertSRGBToLinear(); if (extra && extra.emissive) m.emissive.convertSRGBToLinear(); return m; };

  // --- The painter's material: warm light, lavender shadow, a soft rim. Clouds, ground and canopies share it. ---
  const PAINT_VS = `#include <common>
#include <fog_pars_vertex>
varying vec3 vN; varying vec3 vW;
void main(){ vN = normalize(normalMatrix * normal); vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
#include <fog_vertex>
}`;
  const PAINT_FS = `uniform vec3 uColor; uniform vec3 uShadow; uniform vec3 uSun; uniform float uRim; uniform float uWrap; uniform float uOpacity;
varying vec3 vN; varying vec3 vW;
#include <common>
#include <fog_pars_fragment>
void main(){ vec3 n = normalize(vN); float d = dot(n, uSun); float l = smoothstep(-uWrap, 0.75, d); vec3 col = mix(uShadow, uColor, l); float skyUp = n.y * 0.5 + 0.5; col *= 0.92 + skyUp * 0.12; vec3 v = normalize(cameraPosition - vW); float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0) * uRim * (0.4 + 0.6 * l); col += rim * vec3(1.0, 0.97, 0.9); gl_FragColor = vec4(col, uOpacity);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}`;
  const paint = (color, shadow, opts) => { const o = Object.assign({ rim: 0.25, wrap: 0.35, opacity: 1 }, opts || {}); return new THREE.ShaderMaterial({ uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uColor: { value: srgb(color) }, uShadow: { value: srgb(shadow) }, uSun: { value: SUN_DIR.clone() }, uRim: { value: o.rim }, uWrap: { value: o.wrap }, uOpacity: { value: o.opacity } }]), vertexShader: PAINT_VS, fragmentShader: PAINT_FS, fog: true, transparent: o.opacity < 1, depthWrite: o.opacity >= 1 }); };
  const M = {
    cloud: paint(0xffffff, 0xb4c3e8, { rim: 0.4, wrap: 0.5 }), cloudFar: paint(0xfbfcff, 0xc3cfec, { rim: 0.25, wrap: 0.7 }),
    grass: paint(0xa7d68f, 0x5f9a68, { rim: 0.2 }), grassDeep: paint(0x8cc47f, 0x4f8a5c, { rim: 0.15 }), rock: paint(0xb9b2a8, 0x6e6a73, { rim: 0.18, wrap: 0.25 }), moss: paint(0x86b87a, 0x4f7d55, { rim: 0.15 }),
    leaf: paint(0x8fca8e, 0x3f7f57, { rim: 0.3 }), leafLight: paint(0xb9e0a3, 0x5c9a67, { rim: 0.3 }), leafDeep: paint(0x6fb07c, 0x2f6a47, { rim: 0.25 }),
    stone: soft(0xd9d3c6), stoneOld: soft(0xbdb6a5), dirt: soft(0xb59a76), trunk: soft(0x8b6b4e), bark: soft(0x6e5238),
    white: soft(0xfff8ee), cream: soft(0xfbf1e3), butter: soft(0xf6dfa1), coral: soft(0xf2a28a), mint: soft(0x9fd8c4), lav: soft(0xb8b0e6), lilac: soft(0xcdbdeb), sky: soft(0xbfdcf2),
    ink: soft(0x2b2624), slate: soft(0x4b5563), cuff: soft(0x3d3634), red: soft(0xe57373), blue: soft(0x3b82f6), gold: soft(0xf0c46a, { emissive: 0xd9a441, emissiveIntensity: 0.15 }),
    robot: soft(0xe9eef5), paper: soft(0xffffff), glass: soft(0x9ec5e8), mochi: soft(0xfff6ec), blush: soft(0xf5b3bc),
    brass: soft(0xc7a256, { emissive: 0x4a3410, emissiveIntensity: 0.12 }), copper: soft(0xb3744a), verdigris: soft(0x7fb2a4), hull: soft(0x6b4a33), deck: soft(0xa8805a), rope: soft(0xd9c9a3),
    lamp: soft(0xfff1b8, { emissive: 0xffe08a, emissiveIntensity: 0.5 }), crystal: soft(0xa9e6ff, { emissive: 0x53c6f5, emissiveIntensity: 1.1 }), guardian: soft(0x9aa79b),
    jelly: new THREE.MeshLambertMaterial({ color: srgb(0xc4ece6), emissive: srgb(0x7fc9c0), emissiveIntensity: 0.3, transparent: true, opacity: 0.82 }),
    water: new THREE.MeshLambertMaterial({ color: srgb(0xcfe9ff), transparent: true, opacity: 0.75 }),
  };

  const hemi = new THREE.HemisphereLight(srgb(0xbcdcf8), srgb(0xe6e1d8), 1.0); scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(srgb(0xfff1d8), 1.25); sunLight.position.copy(SUN_DIR).multiplyScalar(40); scene.add(sunLight);
  const fill = new THREE.DirectionalLight(srgb(0xcfe0f7), 0.3); fill.position.set(6, 2, -4); scene.add(fill);

  // Sky dome: deep blue overhead into a warm white horizon
  const skyGeo = new THREE.SphereGeometry(140, 32, 20);
  skyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3));
  { const top = srgb(0x2f7fd6), mid = srgb(0x79b6ea), bot = srgb(0xdcecf9), c = new THREE.Color(); const pos = skyGeo.attributes.position, col = skyGeo.attributes.color; for (let i = 0; i < pos.count; i++) { const t = clamp(pos.getY(i) / 140, -1, 1); if (t > 0.05) c.copy(mid).lerp(top, Math.pow((t - 0.05) / 0.95, 0.7)); else c.copy(bot).lerp(mid, clamp((t + 0.12) / 0.17, 0, 1)); col.setXYZ(i, c.r, c.g, c.b); } }
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })); scene.add(sky);
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, 'rgba(255,243,200,0.9)'); g.addColorStop(0.25, 'rgba(255,236,190,0.35)'); g.addColorStop(1, 'rgba(255,240,210,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.85, fog: false })); sunSprite.scale.set(44, 44, 1); scene.add(sunSprite);

  // --- Geometry helpers ---
  const cyl = (rt, rb, h, m, seg = 10) => { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); g.position.y = h / 2; return g; };
  const cone = (r, h, m, seg = 10) => { const g = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); g.position.y = h / 2; return g; };
  const ball = (r, m, w = 10, h = 8) => new THREE.Mesh(new THREE.SphereGeometry(r, w, h), m);
  const box = (w, h, d, m) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.y = h / 2; return g; };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const sc = (o, x, y, z) => { o.scale.set(x, y, z); return o; };
  const win = (x, y, z, w = 0.05, h = 0.05) => at(box(w, h, 0.012, M.lamp), x, y - h / 2, z);
  // Merge [geometry, matrix] pairs into one geometry so a cloud or a rock is a single draw
  const merge = (parts) => { const pos = [], nor = []; const v = new THREE.Vector3(), nm = new THREE.Matrix3(); for (const [geo, m] of parts) { const g = geo.index ? geo.toNonIndexed() : geo; const p = g.attributes.position, n = g.attributes.normal; nm.getNormalMatrix(m); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(m); pos.push(v.x, v.y, v.z); v.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); nor.push(v.x, v.y, v.z); } } const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); return out; };
  const mat4 = (x, y, z, sx, sy, sz) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(sx, sy || sx, sz || sx));
  const SPH = new THREE.SphereGeometry(1, 14, 10).toNonIndexed(), SPH_HI = new THREE.SphereGeometry(1, 20, 14).toNonIndexed();
  const textTex = (text, color, w = 256, h = 128, px = 150) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = color; x.font = `bold ${px}px ui-rounded, "Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + h * 0.05); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
  const label = (text, w, h, color, extra) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial(Object.assign({ map: textTex(text, color), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }, extra || {})));
  const roof4 = (r, h, m) => { const c = cone(r, h, m, 4); c.rotation.y = Math.PI / 4; return c; };

  // --- Clouds: layered soft billboards. Lit on top, blue in the shadow, and they fade as you fly into them ---
  const puffTex = (variant) => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const blobs = 4 + variant; for (let i = 0; i < blobs; i++) { const px = 128 + (rand() - 0.5) * 110, py = 120 + (rand() - 0.5) * 70, r = 58 + rand() * 42; const g = x.createRadialGradient(px - r * 0.18, py - r * 0.22, r * 0.05, px, py, r); g.addColorStop(0, 'rgba(255,255,255,0.92)'); g.addColorStop(0.45, 'rgba(250,251,255,0.55)'); g.addColorStop(0.8, 'rgba(214,224,246,0.22)'); g.addColorStop(1, 'rgba(200,212,240,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); } x.globalCompositeOperation = 'source-atop'; const sh = x.createLinearGradient(0, 40, 0, 256); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.55, 'rgba(190,204,238,0.18)'); sh.addColorStop(1, 'rgba(160,178,224,0.42)'); x.fillStyle = sh; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); return t; };
  const puffs = [puffTex(0), puffTex(1), puffTex(2)];
  const clouds = [];
  const cloudCluster = (x, y, z, w, n, tint, far) => { const g = new THREE.Group(); g.position.set(x, y, z); const mat = new THREE.SpriteMaterial({ map: puffs[Math.floor(rand() * 3)], transparent: true, depthWrite: false, opacity: far ? 0.9 : 0.86, color: tint, fog: true }); g.userData = { x0: x, ph: rand() * 6, v: 0.5 + rand() * 0.8, mat, base: mat.opacity, w }; for (let k = 0; k < n; k++) { const sp = new THREE.Sprite(mat); const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * w * 0.5; const px = Math.cos(a) * rr, pz = Math.sin(a) * rr * 0.6; const edge = rr / (w * 0.5); const sz = w * (0.42 + rand() * 0.3) * (1 - edge * 0.35); sp.position.set(px, (1 - edge) * w * 0.14 + rand() * w * 0.08 - w * 0.04, pz); sp.scale.set(sz, sz * 0.62, 1); sp.material.rotation = 0; g.add(sp); } scene.add(g); clouds.push(g); return g; };
  const WHITE = srgb(0xffffff), FARTINT = srgb(0xf4f7ff);
  for (let i = 0; i < 22; i++) { const a = rand() * Math.PI * 2, r = 6 + Math.sqrt(rand()) * 50; cloudCluster(Math.cos(a) * r, -0.8 + rand() * 2.6, Math.sin(a) * r, 5 + rand() * 6, 9 + Math.floor(rand() * 6), WHITE, false); }
  for (let i = 0; i < 8; i++) { const a = rand() * Math.PI * 2, r = 20 + rand() * 50; cloudCluster(Math.cos(a) * r, 8 + rand() * 5, Math.sin(a) * r, 8 + rand() * 7, 10 + Math.floor(rand() * 6), WHITE, false); }
  for (let i = 0; i < 16; i++) { const a = rand() * Math.PI * 2, r = 70 + rand() * 70; cloudCluster(Math.cos(a) * r, -5 + rand() * 9, Math.sin(a) * r, 22 + rand() * 24, 12 + Math.floor(rand() * 8), FARTINT, true); }
  // The sea itself: a dense bed of shaded puffs below the flight line
  const seaMat = new THREE.SpriteMaterial({ map: puffs[1], transparent: true, depthWrite: false, opacity: 0.95 });
  const sea = []; for (let i = 0; i < 360; i++) { const s = new THREE.Sprite(seaMat); const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 100; s.position.set(Math.cos(a) * r, -4.2 + rand() * 2.0, Math.sin(a) * r); const k = 7 + rand() * 11; s.scale.set(k, k * 0.55, 1); s.userData = { x0: s.position.x, ph: rand() * 6 }; scene.add(s); sea.push(s); }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(220, 48), new THREE.MeshBasicMaterial({ color: srgb(0xf1f5fb) })); floor.rotation.x = -Math.PI / 2; floor.position.y = -4.6; scene.add(floor);

  // --- Vegetation and ruins ---
  const ghibliTree = (s, light) => { const g = new THREE.Group(); g.add(cyl(0.045, 0.075, 0.34, M.bark, 8)); const parts = []; [[0, 0.5, 0, 0.3], [0.2, 0.62, 0.05, 0.22], [-0.18, 0.58, 0.08, 0.2], [0.04, 0.78, -0.02, 0.2], [0.1, 0.42, 0.2, 0.17], [-0.1, 0.45, -0.18, 0.16]].forEach(([x, y, z, r]) => parts.push([SPH, mat4(x, y, z, r * 1.05, r * 0.85, r)])); g.add(new THREE.Mesh(merge(parts), light ? M.leafLight : M.leaf)); g.scale.setScalar(s); return g; };
  const pineTree = (s) => { const g = new THREE.Group(); g.add(cyl(0.03, 0.05, 0.16, M.bark, 8)); g.add(at(cone(0.15, 0.22, M.leafDeep, 12), 0, 0.14, 0), at(cone(0.12, 0.2, M.leaf, 12), 0, 0.26, 0), at(cone(0.085, 0.17, M.leafLight, 12), 0, 0.38, 0)); g.scale.setScalar(s); return g; };
  const bush = (s) => { const g = new THREE.Mesh(merge([[SPH, mat4(0, 0.07, 0, 0.1, 0.08, 0.1)], [SPH, mat4(0.08, 0.05, 0.03, 0.07, 0.06, 0.07)], [SPH, mat4(-0.05, 0.1, 0.02, 0.06, 0.05, 0.06)]]), M.leafDeep); g.scale.setScalar(s); return g; };
  const mossBall = (r) => sc(ball(r, M.moss, 8, 6), 1, 0.55, 1);
  const ruin = (s) => { const g = new THREE.Group(); [-0.14, 0.14].forEach((x) => g.add(at(box(0.08, 0.3, 0.08, M.stoneOld), x, 0, 0), at(mossBall(0.05), x + 0.03, 0.3, 0.02))); g.add(at(box(0.4, 0.07, 0.1, M.stoneOld), 0, 0.3, 0), at(mossBall(0.07), -0.1, 0.37, 0)); g.scale.setScalar(s); return g; };
  const tower = () => { const g = new THREE.Group(); g.add(cyl(0.08, 0.11, 0.62, M.white, 14), at(cyl(0.095, 0.1, 0.06, M.verdigris, 14), 0, 0.28, 0), at(box(0.12, 0.1, 0.12, M.lamp), 0, 0.62, 0), at(cone(0.1, 0.1, M.verdigris, 14), 0, 0.72, 0), at(box(0.04, 0.07, 0.012, M.ink), 0, 0.02, 0.105)); return g; };
  const greatTree = () => { const g = new THREE.Group(); const trunk = cyl(0.13, 0.24, 1.1, M.bark, 12); trunk.rotation.z = 0.06; g.add(trunk); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const r = at(cyl(0.035, 0.07, 0.55, M.bark, 6), Math.cos(a) * 0.18, 0.02, Math.sin(a) * 0.18); r.rotation.z = Math.cos(a) * 0.95; r.rotation.x = -Math.sin(a) * 0.95; g.add(r); } const parts = []; [[0, 1.2, 0, 0.62], [0.4, 1.35, 0.1, 0.4], [-0.35, 1.4, -0.05, 0.38], [0.05, 1.65, 0.05, 0.34], [0.2, 0.95, 0.35, 0.3], [-0.25, 1.0, -0.3, 0.28]].forEach(([x, y, z, r]) => parts.push([SPH_HI, mat4(x, y, z, r * 1.1, r * 0.8, r)])); g.add(new THREE.Mesh(merge(parts), M.leaf)); return g; };
  const guardian = () => { const g = new THREE.Group(); g.add(at(sc(ball(0.09, M.guardian, 12, 10), 1, 1.35, 0.8), 0, 0.42, 0), at(sc(ball(0.07, M.guardian, 12, 10), 1, 0.9, 0.9), 0, 0.62, 0), at(ball(0.012, M.lamp, 6, 5), -0.025, 0.63, 0.06), at(ball(0.012, M.lamp, 6, 5), 0.025, 0.63, 0.06)); [-1, 1].forEach((d) => { const arm = at(cyl(0.025, 0.02, 0.38, M.guardian, 8), d * 0.11, 0.1, 0.02); arm.rotation.z = d * 0.12; g.add(arm, at(cyl(0.035, 0.035, 0.28, M.guardian, 8), d * 0.055, 0, 0)); }); g.add(at(mossBall(0.06), 0.02, 0.7, -0.02), at(mossBall(0.045), -0.08, 0.5, 0.03)); return g; };

  const landmark = (kind) => {
    const g = new THREE.Group();
    switch (kind) {
      case 'bank': g.add(box(0.36, 0.05, 0.24, M.stone)); for (let i = 0; i < 4; i++) g.add(at(cyl(0.02, 0.022, 0.2, M.white, 8), -0.12 + i * 0.08, 0.05, 0.08)); g.add(at(box(0.3, 0.2, 0.14, M.stone), 0, 0.05, -0.03), at(box(0.32, 0.03, 0.16, M.lav), 0, 0.25, -0.03), at(box(0.06, 0.09, 0.012, M.ink), 0, 0.05, 0.043)); break;
      case 'phone': [[-0.2, 0.2, 0.09, M.stone], [-0.11, 0.3, 0.08, M.lav], [0.14, 0.24, 0.08, M.stone], [0.23, 0.16, 0.07, M.cream]].forEach(([x, h, w, m]) => { g.add(at(box(w, h, 0.08, m), x, 0, -0.12)); for (let r = 0; r < Math.floor(h / 0.07); r++) g.add(win(x, 0.06 + r * 0.07, -0.079, 0.028, 0.028)); }); g.add(box(0.16, 0.3, 0.05, M.ink), at(box(0.13, 0.24, 0.02, M.sky), 0, 0.035, 0.02), at(cone(0.04, 0.09, M.coral, 12), 0, 0.33, 0), at(ball(0.045, M.coral), 0, 0.42, 0)); break;
      case 'newsstand': g.add(box(0.28, 0.2, 0.2, M.mint)); { const r = at(box(0.34, 0.03, 0.26, M.coral), 0, 0.22, 0); r.rotation.x = 0.18; g.add(r); } g.add(at(box(0.22, 0.07, 0.012, M.white), 0, 0.1, 0.105)); { const p = at(cyl(0.03, 0.03, 0.14, M.white, 10), 0.18, 0.03, 0.09); p.rotation.z = Math.PI / 2; g.add(p); } break;
      case 'bubble': g.add(cyl(0.012, 0.012, 0.22, M.trunk, 8)); { const b = at(ball(0.11, M.sky, 16, 12), 0, 0.3, 0); b.scale.set(1.25, 0.9, 0.7); g.add(b); [-0.04, 0, 0.04].forEach((x) => g.add(at(ball(0.014, M.white, 8, 6), x, 0.3, 0.08))); } break;
      case 'ticker': g.add(box(0.2, 0.42, 0.2, M.stone), at(box(0.22, 0.05, 0.22, M.butter), 0, 0.26, 0), at(box(0.17, 0.09, 0.01, M.ink), 0, 0.36, 0.105)); [[-0.05, 0.335, 0.5], [-0.012, 0.35, -0.25], [0.025, 0.352, 0.75], [0.058, 0.385, 0.35]].forEach(([x, y, r]) => { const seg = at(box(0.04, 0.007, 0.004, M.leafLight), x, y, 0.115); seg.rotation.z = r; g.add(seg); }); g.add(at(cone(0.06, 0.1, M.lav, 4), 0, 0.42, 0)); break;
      case 'beacon': g.add(cone(0.05, 0.42, M.stone, 10)); for (let i = 0; i < 3; i++) g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.06 + i * 0.03, 0.008, 6, 20), M.coral), 0, 0.44 - i * 0.05, 0)); g.add(at(ball(0.03, M.lamp), 0, 0.45, 0)); break;
      case 'robot': { const r = new THREE.Group(); r.add(at(box(0.15, 0.15, 0.11, M.robot), 0, 0.03, 0), at(box(0.09, 0.05, 0.006, M.slate), 0, 0.11, 0.056), at(box(0.13, 0.11, 0.1, M.robot), 0, 0.2, 0), at(cyl(0.006, 0.006, 0.05, M.cuff, 6), 0, 0.31, 0), at(ball(0.014, M.coral, 8, 6), 0, 0.365, 0)); [-0.026, 0.026].forEach((x) => r.add(at(ball(0.012, M.sky, 10, 8), x, 0.255, 0.056))); const hs = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.007, 6, 20, Math.PI), M.cuff); hs.position.set(0, 0.255, 0); r.add(hs); const bub = new THREE.Group(); bub.add(sc(ball(0.075, M.white, 16, 12), 1.35, 0.85, 0.55)); bub.userData.dots = [-0.036, 0, 0.036].map((x) => { const d = at(ball(0.012, M.ink, 8, 6), x, 0, 0.042); bub.add(d); return d; }); bub.position.set(0.13, 0.42, 0); r.add(bub); g.add(r); g.userData.anim = (now) => { bub.position.y = 0.42 + Math.sin(now * 0.003) * 0.008; bub.userData.dots.forEach((d, i) => { const k = ((now * 0.0016 - i * 0.28) % 1 + 1) % 1; d.scale.setScalar(0.65 + 0.7 * Math.max(0, Math.sin(k * Math.PI * 2))); }); }; } break;
      case 'forms': { g.add(box(0.32, 0.11, 0.2, M.trunk)); const cb = new THREE.Group(); cb.add(box(0.17, 0.22, 0.012, M.bark), at(box(0.15, 0.19, 0.006, M.paper), 0, 0.012, 0.008)); [0.155, 0.115, 0.075, 0.035].forEach((y) => cb.add(at(box(0.022, 0.022, 0.004, M.mint), -0.052, y, 0.012), at(box(0.075, 0.008, 0.003, M.stone), 0.012, y, 0.012))); cb.position.set(-0.07, 0.12, -0.02); cb.rotation.x = -0.32; g.add(cb); [0, 1, 2, 3].forEach((i) => g.add(at(box(0.11, 0.008, 0.14, M.paper), 0.09 + (i % 2) * 0.008, 0.115 + i * 0.008, 0.02))); } break;
      case 'api': { g.add(box(0.3, 0.26, 0.22, M.slate), at(box(0.33, 0.02, 0.25, M.stone), 0, 0.26, 0)); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) g.add(at(box(0.055, 0.045, 0.006, r === 1 && c === 1 ? M.lamp : M.glass), -0.085 + c * 0.085, 0.06 + r * 0.13, 0.111)); [-0.1, 0.1].forEach((x) => g.add(at(cyl(0.007, 0.007, 0.06, M.cuff, 6), x, 0.27, 0))); g.add(at(box(0.26, 0.11, 0.02, M.cuff), 0, 0.385, 0)); const neon = label('API', 0.2, 0.09, '#8fe3ff'); neon.position.set(0, 0.385, 0.012); const glow = label('API', 0.24, 0.11, '#5ad2ff', { blending: THREE.AdditiveBlending, opacity: 0.35 }); glow.position.set(0, 0.385, 0.013); g.add(neon, glow); g.userData.anim = (now) => { const dip = Math.sin(now * 0.021) * Math.sin(now * 0.0071) > 0.985 ? 0.45 : 1; neon.material.opacity = 0.9 * dip; glow.material.opacity = 0.3 * dip; }; } break;
      case 'court': g.add(box(0.36, 0.05, 0.24, M.stone)); for (let i = 0; i < 4; i++) g.add(at(cyl(0.02, 0.02, 0.22, M.white, 8), -0.12 + i * 0.08, 0.05, 0.08)); g.add(at(box(0.3, 0.22, 0.14, M.white), 0, 0.05, -0.03), at(box(0.34, 0.012, 0.18, M.gold), 0, 0.27, -0.03), at(sc(roof4(0.26, 0.07, M.lilac), 1, 1, 0.7), 0, 0.29, 0), at(box(0.06, 0.1, 0.012, M.ink), 0, 0.05, 0.043)); break;
      case 'practice': { g.add(box(0.3, 0.2, 0.22, M.white), at(box(0.32, 0.02, 0.24, M.mint), 0, 0.2, 0), at(box(0.06, 0.1, 0.012, M.sky), -0.07, 0, 0.115), win(0.08, 0.09, 0.115, 0.07, 0.06)); for (let i = 0; i < 5; i++) g.add(at(box(0.062, 0.02, 0.1, i % 2 ? M.white : M.mint), -0.124 + i * 0.062, 0.115, 0.155)); g.add(at(box(0.07, 0.02, 0.012, M.red), 0, 0.165, 0.115), at(box(0.02, 0.07, 0.012, M.red), 0, 0.14, 0.115)); const sign = label('Dr', 0.06, 0.035, '#3b82f6'); sign.position.set(0.2, 0.17, 0.106); g.add(at(cyl(0.008, 0.008, 0.16, M.stone, 6), 0.2, 0, 0.1), at(box(0.09, 0.05, 0.01, M.white), 0.2, 0.17, 0.1), sign); } break;
    }
    return g;
  };

  // --- Islands: terraced grass, a sculpted rock underside, roots, a waterfall, a crystal ---
  const fallTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); for (let i = 0; i < 9; i++) { const w = 3 + rand() * 6, px = rand() * 64; const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0.1)'); x.fillStyle = g; x.fillRect(px, 0, w, 256); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2); return t; })();
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 6, 64, 64, 64); g.addColorStop(0, 'rgba(170,230,255,0.95)'); g.addColorStop(0.4, 'rgba(120,200,255,0.35)'); g.addColorStop(1, 'rgba(120,200,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const beamTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,232,170,0)'); g.addColorStop(0.7, 'rgba(255,232,170,0.35)'); g.addColorStop(1, 'rgba(255,232,170,0.75)'); x.fillStyle = g; x.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(c); })();
  const islands = [], crystals = [], animated = [], beams = [], rings = [];
  // The rock never rises above the dirt band: its widest sphere tops out at y = 0, then it tapers to a point.
  const rockGeo = (R) => { const parts = [[SPH, mat4(0, -0.5, 0, R * 1.0, 0.5, R * 1.0)], [SPH, mat4(0, -R * 0.8, 0, R * 0.7, R * 0.8, R * 0.7)], [SPH, mat4(0, -R * 1.5, 0, R * 0.3, R * 0.6, R * 0.3)]]; for (let k = 0; k < 7; k++) { const a = rand() * Math.PI * 2, y = -0.55 - rand() * R * 0.9, rr = R * (0.35 + rand() * 0.35) * (1 - (-y) / (R * 1.7)); const s = R * (0.12 + rand() * 0.14); parts.push([SPH, mat4(Math.cos(a) * rr, y, Math.sin(a) * rr, s, s * 1.4, s)]); } return merge(parts); };
  // --- Themed props ---
  const officeTower = (w, h, m, lit) => { const g = new THREE.Group(); g.add(box(w, h, w * 0.8, m), at(box(w * 1.06, 0.03, w * 0.86, M.stoneOld), 0, h, 0)); for (let r = 0; r < Math.floor(h / 0.12); r++) for (let c = 0; c < 2; c++) g.add(at(box(w * 0.22, 0.05, 0.008, lit ? M.lamp : M.glass), (c - 0.5) * w * 0.4, 0.08 + r * 0.12, w * 0.4 + 0.004)); return g; };
  const lampPost = () => { const g = new THREE.Group(); g.add(cyl(0.012, 0.016, 0.34, M.cuff, 6), at(box(0.06, 0.06, 0.06, M.lamp), 0, 0.36, 0), at(cone(0.05, 0.03, M.cuff, 8), 0, 0.42, 0)); return g; };
  const flagpole = (m) => { const g = new THREE.Group(); g.add(cyl(0.008, 0.01, 0.5, M.stone, 6), at(box(0.16, 0.1, 0.006, m), 0.08, 0.42, 0), at(ball(0.014, M.gold, 6, 5), 0, 0.51, 0)); return g; };
  const cypress = (s) => { const g = new THREE.Group(); g.add(cyl(0.02, 0.03, 0.1, M.bark, 6), at(sc(ball(0.09, M.leafDeep, 10, 8), 1, 3.4, 1), 0, 0.38, 0)); g.scale.setScalar(s); return g; };
  const blossom = (s) => { const g = new THREE.Group(); g.add(cyl(0.035, 0.06, 0.3, M.bark, 8)); g.add(new THREE.Mesh(merge([[SPH, mat4(0, 0.45, 0, 0.28, 0.22, 0.26)], [SPH, mat4(0.18, 0.55, 0.05, 0.2, 0.16, 0.18)], [SPH, mat4(-0.16, 0.52, -0.04, 0.19, 0.15, 0.18)], [SPH, mat4(0.02, 0.68, 0, 0.17, 0.13, 0.16)]]), M.blossom)); g.scale.setScalar(s); return g; };
  const hedgeRow = (n, m) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(at(sc(ball(0.09, m, 8, 6), 1.1, 0.8, 1), i * 0.15, 0.06, 0)); return g; };
  const flowerPatch = (m, n, r) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * r; g.add(at(cyl(0.006, 0.006, 0.07, M.leaf, 5), Math.cos(a) * rr, 0, Math.sin(a) * rr), at(sc(ball(0.028, m, 8, 5), 1, 0.5, 1), Math.cos(a) * rr, 0.07, Math.sin(a) * rr)); } return g; };
  const shard = (h, m) => { const g = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), m); g.scale.set(1, h / 0.08, 1); g.position.y = h * 0.5; g.rotation.z = (rand() - 0.5) * 0.4; g.rotation.x = (rand() - 0.5) * 0.4; return g; };
  const antenna = (h) => { const g = new THREE.Group(); g.add(cyl(0.012, 0.03, h, M.cuff, 6)); [0.35, 0.65].forEach((k) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 6, 16), M.brass); r.rotation.x = Math.PI / 2; r.position.y = h * k; g.add(r); }); g.add(at(ball(0.02, M.red, 8, 6), 0, h + 0.02, 0)); return g; };
  const dish = () => { const g = new THREE.Group(); g.add(cyl(0.012, 0.018, 0.16, M.stone, 6)); const d = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI / 3), M.white); d.scale.y = 0.55; d.position.set(0.04, 0.2, 0); d.rotation.z = -0.9; g.add(d); return g; };
  const car = (m) => { const g = new THREE.Group(); g.add(at(box(0.16, 0.05, 0.08, m), 0, 0.03, 0), at(box(0.09, 0.045, 0.07, M.sky), -0.005, 0.08, 0)); [[-0.05, 0.045], [0.05, 0.045], [-0.05, -0.045], [0.05, -0.045]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.015, 10), M.cuff); w.rotation.x = Math.PI / 2; w.position.set(x, 0.02, z); g.add(w); }); return g; };
  const stall = (m) => { const g = new THREE.Group(); g.add(box(0.2, 0.1, 0.12, M.trunk), at(box(0.24, 0.02, 0.16, m), 0, 0.26, 0)); [-0.09, 0.09].forEach((x) => g.add(at(cyl(0.006, 0.006, 0.18, M.stone, 5), x, 0.1, 0.06))); g.add(at(box(0.05, 0.03, 0.04, M.coral), -0.05, 0.1, 0.02), at(box(0.05, 0.03, 0.04, M.butter), 0.04, 0.1, 0.02)); return g; };
  const stoneCircle = (r) => { const g = new THREE.Group(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; g.add(at(box(0.07, 0.16 + rand() * 0.1, 0.05, M.stoneOld), Math.cos(a) * r, 0, Math.sin(a) * r).rotateY(-a)); } return g; };
  const boardwalk = (len) => { const g = new THREE.Group(); for (let i = 0; i < len; i++) g.add(at(box(0.12, 0.02, 0.28, i % 2 ? M.deck : M.trunk), i * 0.125, 0.02, 0)); [0, len - 1].forEach((i) => [-1, 1].forEach((d) => g.add(at(cyl(0.01, 0.01, 0.12, M.trunk, 5), i * 0.125, -0.06, d * 0.13)))); return g; };
  const crane = () => { const g = new THREE.Group(); g.add(cyl(0.02, 0.03, 0.6, M.copper, 6)); const arm = at(box(0.5, 0.03, 0.03, M.copper), 0.18, 0.6, 0); g.add(arm, at(cyl(0.004, 0.004, 0.25, M.cuff, 4), 0.4, 0.47, 0), at(box(0.06, 0.05, 0.06, M.trunk), 0.4, 0.33, 0)); return g; };
  M.blossom = paint(0xf6c1d1, 0xc57c99, { rim: 0.3 }); M.autumn = paint(0xe6b061, 0x9c5f2a, { rim: 0.3 }); M.hedge = paint(0x6faa78, 0x2f6a47, { rim: 0.15 });
  M.pave = paint(0xcfd3d8, 0x7e8794, { rim: 0.12, wrap: 0.3 }); M.plaza = paint(0xe6dfd2, 0x9a8f7f, { rim: 0.12, wrap: 0.3 }); M.slateGround = paint(0x6b7385, 0x2e3446, { rim: 0.25, wrap: 0.3 });
  M.rockCool = paint(0xa8adb8, 0x5b6275, { rim: 0.18, wrap: 0.25 }); M.rockWarm = paint(0xc5b09a, 0x7a6350, { rim: 0.18, wrap: 0.25 }); M.rockDark = paint(0x7d7f8c, 0x3a3d4c, { rim: 0.2, wrap: 0.25 });
  M.brick = soft(0xb8664f); M.tealRoof = soft(0x6aa8a0); M.shardBlue = soft(0xa9e6ff, { emissive: 0x53c6f5, emissiveIntensity: 0.7 });

  // --- Themes: one world per role ---
  const T = [
    { name: 'financial district', ground: M.plaza, rock: M.rockCool, shape: 'round', size: 1.25, terrace: true, waterfall: true, lm: 2.0,
      dress: (g, R) => { g.add(at(officeTower(0.26, 0.7, M.stone, false), -R * 0.55, 0, -R * 0.35), at(officeTower(0.2, 0.5, M.stoneOld, true), -R * 0.25, 0, -R * 0.62), at(flagpole(M.blue), R * 0.45, 0, R * 0.5), at(lampPost(), R * 0.6, 0, 0.1), at(lampPost(), -R * 0.6, 0, R * 0.3), at(ghibliTree(0.7, false), R * 0.62, 0, -R * 0.3), at(hedgeRow(4, M.hedge), -R * 0.3, 0, R * 0.62)); } },
    { name: 'city', ground: M.pave, rock: M.rockDark, shape: 'long', size: 1.2, terrace: false, waterfall: false, lm: 1.9,
      dress: (g, R) => { [[-0.7, 0.55, 0.9, M.lav, true], [-0.45, 0.85, 1.15, M.stone, true], [0.55, 0.65, 0.95, M.slate, true], [0.78, 0.4, 0.6, M.cream, false], [0.1, 0.3, 0.45, M.lilac, true]].forEach(([x, z, h, m, lit]) => g.add(at(officeTower(0.22, h, m, lit), x * R, 0, z * R))); g.add(at(lampPost(), 0, 0, R * 0.7), at(lampPost(), -R * 0.2, 0, -R * 0.2), at(antenna(0.5), R * 0.6, 0, -R * 0.55), at(ghibliTree(0.55, true), R * 0.35, 0, R * 0.62)); } },
    { name: 'old town', ground: M.grass, rock: M.rockWarm, shape: 'round', size: 1.2, terrace: true, waterfall: true, lm: 1.9,
      dress: (g, R) => { const h = (x, z, w, hh) => { const b = new THREE.Group(); b.add(box(w, hh, w * 0.9, M.cream), at(roof4(w * 0.78, 0.16, M.brick), 0, hh, 0), win(0, hh * 0.6, w * 0.45 + 0.004, 0.05, 0.06)); return at(b, x, 0, z); }; g.add(h(-R * 0.55, R * 0.35, 0.3, 0.3), h(-R * 0.6, -R * 0.35, 0.26, 0.24), h(R * 0.55, R * 0.5, 0.24, 0.22)); const clock = new THREE.Group(); clock.add(box(0.2, 0.7, 0.2, M.cream), at(roof4(0.16, 0.2, M.brick), 0, 0.7, 0), at(new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), M.white), 0, 0.55, 0.101), at(box(0.006, 0.04, 0.004, M.ink), 0, 0.57, 0.104), at(box(0.03, 0.006, 0.004, M.ink), 0.012, 0.55, 0.104)); g.add(at(clock, R * 0.5, 0, -R * 0.45), at(lampPost(), 0, 0, R * 0.66), at(ghibliTree(0.8, false), R * 0.1, 0, R * 0.55), at(stall(M.coral), -R * 0.15, 0, R * 0.45)); } },
    { name: 'social garden', ground: M.grass, rock: M.rockWarm, shape: 'round', size: 1.1, terrace: false, waterfall: true, lm: 1.9,
      dress: (g, R) => { g.add(at(blossom(1.0), R * 0.55, 0, -R * 0.35), at(blossom(0.8), -R * 0.6, 0, R * 0.3), at(blossom(0.7), R * 0.5, 0, R * 0.55), at(flowerPatch(M.pink, 18, R * 0.35), -R * 0.25, 0, -R * 0.45), at(flowerPatch(M.butter, 14, R * 0.3), R * 0.15, 0, R * 0.5)); for (let k = 0; k < 4; k++) { const a = k * 1.4 + 0.5; const pole = new THREE.Group(); pole.add(cyl(0.01, 0.01, 0.2, M.trunk, 6), at(sc(ball(0.07, M.sky, 12, 8), 1.2, 0.85, 0.6), 0, 0.28, 0)); g.add(at(pole, Math.cos(a) * R * 0.68, 0, Math.sin(a) * R * 0.68)); } g.add(at(hedgeRow(5, M.hedge), -R * 0.5, 0, R * 0.62)); } },
    { name: 'tower district', ground: M.plaza, rock: M.rockCool, shape: 'spire', size: 1.25, terrace: true, waterfall: false, lm: 1.9,
      dress: (g, R) => { g.add(at(officeTower(0.24, 0.9, M.stone, true), -R * 0.55, 0, -R * 0.35), at(officeTower(0.2, 0.65, M.stoneOld, false), -R * 0.6, 0, R * 0.3), at(officeTower(0.18, 0.5, M.stone, true), R * 0.6, 0, R * 0.45)); [[R * 0.55, -R * 0.5], [R * 0.15, R * 0.62], [-R * 0.2, R * 0.6]].forEach(([x, z]) => { const t = ghibliTree(0.75, false); t.children[1].material = M.autumn; g.add(at(t, x, 0, z)); }); g.add(at(flagpole(M.gold), R * 0.3, 0, -R * 0.62)); } },
    { name: 'lighthouse point', ground: M.grassDeep, rock: M.rockDark, shape: 'long', size: 1.15, terrace: false, waterfall: true, lm: 1.9,
      dress: (g, R) => { g.add(at(tower(), R * 0.6, 0, -R * 0.3), at(dish(), R * 0.35, 0, R * 0.5), at(dish(), -R * 0.55, 0, -R * 0.4), at(antenna(0.45), -R * 0.65, 0, R * 0.25), at(pineTree(1.1), -R * 0.3, 0, -R * 0.6), at(pineTree(0.9), 0.1, 0, R * 0.62), at(pineTree(0.8), -R * 0.7, 0, 0), at(boardwalk(5), R * 0.2, 0, R * 0.62)); for (let k = 0; k < 5; k++) { const a = rand() * Math.PI * 2, rr = R * (0.6 + rand() * 0.3); g.add(at(sc(ball(0.07 + rand() * 0.05, M.rock, 7, 5), 1.3, 0.7, 1), Math.cos(a) * rr, 0, Math.sin(a) * rr)); } } },
    { name: 'diner lot', ground: M.pave, rock: M.rockWarm, shape: 'round', size: 1.2, terrace: false, waterfall: false, lm: 2.0,
      dress: (g, R) => { const diner = new THREE.Group(); diner.add(box(0.5, 0.24, 0.3, M.butter), at(box(0.56, 0.04, 0.36, M.red), 0, 0.24, 0), win(-0.15, 0.17, 0.155, 0.1, 0.09), win(0.15, 0.17, 0.155, 0.1, 0.09), at(box(0.08, 0.12, 0.012, M.ink), 0, 0, 0.155), at(box(0.34, 0.1, 0.02, M.red), 0, 0.34, 0.1)); const sign = label('DRIVE-THRU', 0.3, 0.06, '#fff8ee'); sign.position.set(0, 0.34, 0.112); diner.add(sign); g.add(at(diner, -R * 0.4, 0, -R * 0.3)); g.add(at(box(R * 1.3, 0.012, 0.32, M.slate), 0, 0, R * 0.5)); for (let k = 0; k < 5; k++) g.add(at(box(0.1, 0.014, 0.02, M.butter), -R * 0.5 + k * R * 0.25, 0.002, R * 0.5)); g.add(at(car(M.red), -R * 0.3, 0.01, R * 0.5), at(car(M.white), R * 0.3, 0.01, R * 0.5), at(lampPost(), R * 0.62, 0, 0), at(lampPost(), -R * 0.66, 0, R * 0.2), at(ghibliTree(0.7, true), R * 0.55, 0, -R * 0.5)); } },
    { name: 'clinic garden', ground: M.grass, rock: M.rockWarm, shape: 'round', size: 1.15, terrace: true, waterfall: true, lm: 1.9,
      dress: (g, R) => { const annex = new THREE.Group(); annex.add(box(0.36, 0.22, 0.26, M.white), at(box(0.4, 0.03, 0.3, M.mint), 0, 0.22, 0), win(-0.1, 0.16, 0.135, 0.08, 0.07), win(0.1, 0.16, 0.135, 0.08, 0.07), at(box(0.07, 0.02, 0.012, M.red), 0, 0.29, 0.1), at(box(0.02, 0.07, 0.012, M.red), 0, 0.265, 0.1)); g.add(at(annex, -R * 0.55, 0, -R * 0.3)); for (let r = 0; r < 3; r++) g.add(at(hedgeRow(5, r % 2 ? M.hedge : M.leafLight), -R * 0.1, 0, R * 0.3 + r * 0.17)); g.add(at(flowerPatch(M.white, 12, R * 0.22), R * 0.55, 0, -R * 0.4), at(ghibliTree(0.75, true), R * 0.6, 0, R * 0.25), at(lampPost(), -R * 0.62, 0, R * 0.45)); } },
    { name: 'neon lab', ground: M.slateGround, rock: M.rockDark, shape: 'spire', size: 1.25, terrace: true, waterfall: false, lm: 2.0,
      dress: (g, R) => { for (let k = 0; k < 9; k++) { const a = rand() * Math.PI * 2, rr = R * (0.35 + rand() * 0.45); g.add(at(shard(0.18 + rand() * 0.3, M.shardBlue), Math.cos(a) * rr, 0, Math.sin(a) * rr)); } g.add(at(antenna(0.7), -R * 0.55, 0, -R * 0.4), at(antenna(0.45), R * 0.6, 0, R * 0.3), at(officeTower(0.2, 0.5, M.slate, true), R * 0.55, 0, -R * 0.5), at(crane(), -R * 0.5, 0, R * 0.4)); const sg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 })); sg.scale.setScalar(2.4); sg.position.y = 0.4; g.add(sg); } },
    { name: 'justice hill', ground: M.grassDeep, rock: M.rockWarm, shape: 'round', size: 1.2, terrace: true, waterfall: true, lm: 2.0,
      dress: (g, R) => { [[R * 0.6, -R * 0.3], [R * 0.66, R * 0.15], [-R * 0.62, R * 0.35], [-R * 0.66, -R * 0.15], [R * 0.2, R * 0.66]].forEach(([x, z]) => g.add(at(cypress(0.9 + rand() * 0.3), x, 0, z))); g.add(at(stoneCircle(0.32), -R * 0.35, 0, R * 0.38), at(lampPost(), R * 0.35, 0, R * 0.55), at(flagpole(M.lilac), -R * 0.5, 0, -R * 0.55)); for (let k = 0; k < 5; k++) g.add(at(box(0.22, 0.05, 0.1, M.stone), R * 0.05, 0.02 + k * 0.05, R * 0.3 + k * 0.08)); } },
    { name: 'summit', ground: M.grass, rock: M.rockWarm, shape: 'round', size: 1.7, terrace: true, waterfall: true, lm: 2.0,
      dress: (g, R) => { g.add(at(greatTree(), R * 0.35, 0.22, -R * 0.15), at(guardian(), R * 0.75, 0, R * 0.45), at(ruin(1.2), -R * 0.55, 0, -R * 0.6), at(blossom(0.9), -R * 0.65, 0, R * 0.4), at(flowerPatch(M.pink, 16, R * 0.3), R * 0.1, 0, R * 0.6), at(flowerPatch(M.butter, 12, R * 0.25), -R * 0.3, 0, R * 0.55), at(ghibliTree(1.0, false), R * 0.62, 0, -R * 0.55)); const f2 = new THREE.Group(); const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.8), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); sheet.position.set(0, -0.85, 0); f2.add(sheet); f2.position.set(-R + 0.02, 0.02, -0.3); f2.rotation.y = -Math.PI / 2; g.add(f2); } },
  ];

  const makeIsland = (i) => {
    const K = 1.4, d = ISLANDS[i], th = T[i], g = new THREE.Group(), R = th.size * K;
    const sx = th.shape === 'long' ? 1.45 : 1, sz = th.shape === 'long' ? 0.78 : 1;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(R, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), th.ground); cap.scale.set(sx, 0.18, sz); g.add(cap);
    const band = cyl(R * 0.99, R * 1.03, 0.18, M.dirt, 28); band.scale.set(sx, 1, sz); band.position.y = -0.18; g.add(band);
    const rock = new THREE.Mesh(rockGeo(R), th.rock); rock.scale.set(sx, th.shape === 'spire' ? 1.5 : 1, sz); g.add(rock);
    for (let k = 0; k < 6; k++) { const a = rand() * Math.PI * 2; g.add(at(mossBall(0.09 + rand() * 0.09), Math.cos(a) * R * 0.96 * sx, -0.4 - rand() * 0.4, Math.sin(a) * R * 0.96 * sz)); }
    for (let k = 0; k < 4; k++) { const a = rand() * Math.PI * 2, rr = R * (0.4 + rand() * 0.5); const root = at(cyl(0.012, 0.03, 0.5 + rand() * 0.5, M.bark, 5), Math.cos(a) * rr * sx, -0.2, Math.sin(a) * rr * sz); root.rotation.x = Math.PI + (rand() - 0.5) * 0.5; root.rotation.z = (rand() - 0.5) * 0.5; g.add(root); }
    const lmY = th.terrace ? 0.24 : 0.02;
    if (th.terrace) { const TT = R * 0.45; const terr = new THREE.Mesh(new THREE.SphereGeometry(TT, 22, 8, 0, Math.PI * 2, 0, Math.PI / 2), th.ground); terr.scale.set(1, 0.2, 1); terr.position.set(0, 0.22, -R * 0.1); g.add(terr, at(cyl(TT * 0.99, TT * 1.02, 0.24, M.stoneOld, 22), 0, -0.02, -R * 0.1)); for (let k = 0; k < 4; k++) g.add(at(box(0.16, 0.06, 0.1, M.stone), TT + 0.02 - k * 0.09, 0.19 - k * 0.06, -R * 0.1 + 0.1)); }
    const lm = landmark(d.kind); lm.position.set(0, lmY, -R * 0.1); lm.scale.setScalar(th.lm * K); g.add(lm); if (lm.userData.anim) animated.push(lm);
    const dressed = new THREE.Group(); th.dress(dressed, R / K); dressed.scale.setScalar(K); g.add(dressed);
    for (let k = 0; k < 6; k++) { const a = rand() * Math.PI * 2, rr = R * (0.3 + rand() * 0.65); g.add(at(cone(0.012, 0.07, M.leafLight, 5), Math.cos(a) * rr * sx, 0, Math.sin(a) * rr * sz)); }
    if (th.waterfall) { const f = new THREE.Group(); const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 2.2), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide })); sheet.position.set(0, -1.05, 0); f.add(sheet); for (let k = 0; k < 4; k++) f.add(at(sc(ball(0.09 + k * 0.03, M.cloud, 8, 6), 1.3, 0.6, 1), (k - 1.5) * 0.1, -2.15 - (k % 2) * 0.06, 0.02)); f.add(at(box(0.32, 0.02, 0.18, M.water), 0, 0.02, -0.06)); f.position.set(R * sx - 0.02, 0.02, 0.28); f.rotation.y = Math.PI / 2; g.add(f); }
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(d.summit ? 0.3 : 0.2), M.crystal); cr.position.y = -R * (th.shape === 'spire' ? 2.6 : 1.9); cr.scale.y = 1.5; g.add(cr);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); glow.scale.setScalar(d.summit ? 2.6 : 1.8); glow.position.copy(cr.position); g.add(glow); crystals.push({ cr, glow, phase: rand() * 6 });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.12, 4.6, 14, 1, true), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, opacity: 0.6, fog: false })); beam.position.y = 2.5; g.add(beam); beams.push(beam);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 48), new THREE.MeshBasicMaterial({ color: srgb(0xfff1c2), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3; g.add(ring); rings.push({ ring, t: -1 });
    g.position.copy(POS[i]); g.rotation.y = rand() * Math.PI * 2; g.userData.bob = rand() * 6;
    scene.add(g); islands.push(g);
  };
  for (let i = 0; i < N; i++) makeIsland(i);
  for (let k = 0; k < 12; k++) { const g = new THREE.Group(), R = 0.5 + rand() * 0.5; const cap = new THREE.Mesh(new THREE.SphereGeometry(R, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.grass); cap.scale.set(1, 0.2, 1); g.add(cap, new THREE.Mesh(rockGeo(R), M.rock), at(ghibliTree(0.6, k % 2 === 0), 0, 0, 0), at(bush(0.7), R * 0.5, 0, R * 0.3)); if (k % 4 === 0) g.add(at(tower(), -R * 0.4, 0, R * 0.2)); const a = rand() * Math.PI * 2, r = 22 + rand() * 50; g.position.set(Math.cos(a) * r, 0.5 + rand() * 6, Math.sin(a) * r); g.userData.bob = rand() * 6; scene.add(g); islands.push(g); }

  // --- Jellyfish ---
  const jellies = [];
  for (let k = 0; k < 7; k++) { const j = new THREE.Group(); j.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.jelly), at(sc(ball(0.36, M.jelly, 14, 8), 1, 0.25, 1), 0, 0, 0)); [-0.05, 0.05].forEach((x) => j.add(at(sc(ball(0.03, M.ink, 8, 6), 1, 1.3, 0.6), x, 0.12, 0.38))); j.userData.tent = []; for (let t = 0; t < 7; t++) { const a = t / 7 * Math.PI * 2; const s = at(cyl(0.012, 0.005, 1.0, M.jelly, 5), Math.cos(a) * 0.22, -1.0, Math.sin(a) * 0.22); s.userData.a = a; j.add(s); j.userData.tent.push(s); } const a = rand() * Math.PI * 2, r = 8 + rand() * 34; j.position.set(Math.cos(a) * r, 2.5 + rand() * 3.5, Math.sin(a) * r); Object.assign(j.userData, { ph: rand() * 6, va: rand() * Math.PI * 2 }); scene.add(j); jellies.push(j); }

  // --- The airship: an old-world flying machine. Ribbed envelope, a wooden hull on brass hangers, a crystal engine, lanterns. ---
  const ship = new THREE.Group();
  {
    const envTex = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d'); for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#e2cfa0' : '#efe4c9'; x.fillRect(i * (1024 / 12), 0, 1024 / 12, 256); } x.fillStyle = '#7fb2a4'; x.fillRect(0, 96, 1024, 14); x.fillRect(0, 146, 1024, 14); x.fillStyle = '#c7a256'; for (let i = 0; i < 24; i++) { x.beginPath(); x.arc(i * (1024 / 24) + 21, 128, 7, 0, Math.PI * 2); x.fill(); } const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; })();
    const env = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 24), new THREE.MeshLambertMaterial({ map: envTex })); env.scale.set(2.35, 1, 1); env.position.y = 1.05; ship.add(env);
    for (let i = -3; i <= 3; i++) { const x = i * 0.32; const rr = 0.5 * Math.sqrt(Math.max(0.02, 1 - Math.pow(x / 1.175, 2))); const rib = new THREE.Mesh(new THREE.TorusGeometry(rr + 0.006, 0.012, 6, 44), M.brass); rib.rotation.y = Math.PI / 2; rib.position.set(x, 1.05, 0); ship.add(rib); }
    ship.add(at(box(2.0, 0.03, 0.05, M.brass), 0, 0.53, 0));
    { const nose = cone(0.09, 0.3, M.brass, 12); nose.rotation.z = -Math.PI / 2; nose.position.set(1.2, 1.05, 0); const tail = cone(0.09, 0.3, M.brass, 12); tail.rotation.z = Math.PI / 2; tail.position.set(-1.2, 1.05, 0); ship.add(nose, tail); }
    [1, -1].forEach((d) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.36, 0.02), M.verdigris); f.position.set(-1.02, 1.05 + d * 0.42, 0); f.rotation.z = d * 0.18; ship.add(f, at(box(0.44, 0.012, 0.03, M.brass), -1.02, 1.05 + d * 0.42 + (d > 0 ? 0.18 : -0.18), 0)); });
    [-1, 1].forEach((d) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.38), M.verdigris); f.position.set(-1.02, 1.05, d * 0.5); f.rotation.x = -d * 0.12; ship.add(f); });
    const hull = new THREE.Group();
    hull.add(new THREE.Mesh(merge([[SPH, mat4(0, 0, 0, 0.72, 0.2, 0.26)], [SPH, mat4(0.15, 0.02, 0, 0.5, 0.17, 0.22)]]), M.hull));
    hull.add(at(box(1.15, 0.03, 0.42, M.deck), -0.05, 0.1, 0), at(box(1.2, 0.02, 0.46, M.brass), -0.05, 0.13, 0));
    [-1, 1].forEach((d) => { hull.add(at(box(1.1, 0.012, 0.012, M.brass), -0.05, 0.28, d * 0.22)); for (let i = 0; i < 6; i++) hull.add(at(cyl(0.006, 0.006, 0.15, M.brass, 5), -0.55 + i * 0.2, 0.13, d * 0.22)); });
    hull.add(at(box(0.42, 0.24, 0.3, M.hull), -0.3, 0.13, 0), at(box(0.46, 0.03, 0.34, M.copper), -0.3, 0.37, 0));
    [-0.38, -0.22].forEach((x) => [-1, 1].forEach((d) => hull.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 14), M.brass), x, 0.26, d * 0.151), at(new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), M.lamp), x, 0.26, d * 0.156))));
    hull.add(at(cyl(0.008, 0.008, 0.2, M.brass, 5), 0.62, 0.13, 0), at(box(0.06, 0.08, 0.06, M.lamp), 0.62, 0.33, 0), at(cone(0.05, 0.04, M.copper, 8), 0.62, 0.41, 0));
    { const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 14), M.bark); wheel.rotation.y = Math.PI / 2; wheel.position.set(0.1, 0.33, 0); hull.add(at(cyl(0.012, 0.012, 0.16, M.bark, 6), 0.1, 0.13, 0), wheel); }
    const ed = new THREE.Group(); ed.add(ball(0.13, M.mochi, 18, 14)); [-0.045, 0.045].forEach((x) => ed.add(at(sc(ball(0.016, M.ink, 8, 6), 1, 1.4, 0.7), x, 0.02, 0.12))); { const smile = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12, Math.PI), M.ink); smile.rotation.z = Math.PI; smile.position.set(0, -0.02, 0.125); ed.add(smile); } [-1, 1].forEach((d) => ed.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), M.blush), d * 0.08, -0.01, 0.1)));
    const cap = new THREE.Group(); cap.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 10, 0, Math.PI * 2, 0, 1.15), M.ink)); const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.016, 8, 24), M.cuff); cuff.rotation.x = Math.PI / 2; cuff.position.y = 0.055; cap.add(cuff, at(ball(0.03, M.blue, 8, 6), 0.01, 0.16, 0)); cap.rotation.z = 0.08; ed.add(cap);
    ed.position.set(-0.02, 0.36, 0); ed.rotation.y = Math.PI / 2; hull.add(ed); ship.userData.ed = ed;
    hull.position.y = 0.14; ship.add(hull);
    [[-0.5, 0.2], [0.45, 0.2]].forEach(([x, z]) => [-1, 1].forEach((d) => ship.add(at(cyl(0.006, 0.006, 0.28, M.rope, 5), x, 0.26, d * z))));
    ship.userData.props = [-1, 1].map((d) => { const pod = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 6, 20), M.brass); ring.rotation.y = Math.PI / 2; ring.position.x = 0.12; pod.add(sc(ball(0.09, M.copper, 12, 10), 1.8, 0.9, 0.9), ring); const blades = new THREE.Group(); for (let b = 0; b < 3; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.035), M.cuff); bl.position.y = 0.15; const holder = new THREE.Group(); holder.add(bl); holder.rotation.x = b * Math.PI * 2 / 3; blades.add(holder); } blades.position.x = 0.19; pod.add(blades, at(ball(0.03, M.brass, 8, 6), 0.19, 0, 0)); const strut = cyl(0.01, 0.01, 0.34, M.brass, 5); strut.rotation.x = Math.PI / 2; strut.position.set(0.02, 0, -d * 0.17); pod.add(strut); pod.position.set(-0.15, 0.32, d * 0.52); ship.add(pod); return blades; });
    const cage = new THREE.Group(); cage.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.11), M.crystal)); [0, Math.PI / 3, 2 * Math.PI / 3].forEach((a) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.008, 6, 24), M.brass); r.rotation.y = a; cage.add(r); }); const cg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); cg.scale.setScalar(0.9); cage.add(cg); cage.position.set(0.05, -0.04, 0); ship.add(cage); ship.userData.cage = cage; ship.userData.coreGlow = cg;
  }
  // The model points along +x. A middle group turns it to face -z (heading 0); the rig above adds yaw.
  const shipYaw = new THREE.Group(); shipYaw.rotation.y = Math.PI / 2; shipYaw.add(ship);
  const shipRig = new THREE.Group(); shipRig.add(shipYaw); scene.add(shipRig);
  const streaks = new THREE.Group(); const streakMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
  for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 1.2 + rand() * 1.5), streakMat); s.position.set((rand() - 0.5) * 6, (rand() - 0.5) * 3.5 + 0.8, -(rand() * 20)); streaks.add(s); }
  shipRig.add(streaks);

  // --- Flight: velocity, banking, a spring camera ---
  const pos = new THREE.Vector3(0, 3.8, 5), fwd = new THREE.Vector3(), right = new THREE.Vector3(), vel = new THREE.Vector3();
  let yaw = Math.atan2(POS[0].x - pos.x, -(POS[0].z - pos.z)), yawIn = 0, climbIn = 0, throttle = 0, boost = 0, speed = 0, bank = 0, pitch = 0, fov = 48;
  const keys = new Set(); let lever = 0.3, autopilot = null, tour = false, tourDwellUntil = 0, drag = null, pitchNudge = 0, moved = false, parked = false;
  const visited = new Set(); let near = -1, hereSince = 0;
  const heading = () => ((yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const dragIn = { yaw: 0, climb: 0 };
  const touched = () => { if (!moved) { moved = true; opts.onTouched(); } };
  stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, id: e.pointerId }; stage.setPointerCapture(e.pointerId); stopTour(); autopilot = null; parked = false; touched(); });
  stage.addEventListener('pointermove', (e) => { if (!drag || drag.id !== e.pointerId) return; drag.px = e.clientX; drag.py = e.clientY; });
  const endDrag = (e) => { if (drag && drag.id === e.pointerId) { drag = null; dragIn.yaw = 0; dragIn.climb = 0; } };
  const updateStick = (dt) => { if (!drag) return; const k = 1 - Math.exp(-2.2 * dt); drag.x += (drag.px - drag.x) * k; drag.y += (drag.py - drag.y) * k; const dx = (drag.px - drag.x) / Math.min(stage.clientWidth, 900), dy = (drag.py - drag.y) / Math.min(stage.clientHeight, 700); dragIn.yaw = clamp(dx * 9, -1, 1); dragIn.climb = clamp(-dy * 7, -1, 1); };
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('wheel', (e) => { e.preventDefault(); pitchNudge = clamp(pitchNudge - e.deltaY * 0.002, -1, 1); touched(); }, { passive: false });
  const keyName = (e) => e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const onKeyDown = (e) => { const k = keyName(e); if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'e', 'q'].includes(k)) { if (e.target && e.target.closest && e.target.closest('[data-si-lever]')) return; e.preventDefault(); keys.add(k); if (k !== 'Shift') { stopTour(); autopilot = null; parked = false; touched(); } } if (k === 'n') { e.preventDefault(); stopTour(); headForNext(); touched(); } if (k === ' ') { e.preventDefault(); setTour(!tour); touched(); } };
  const onKeyUp = (e) => keys.delete(keyName(e));
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  // The lever: its value is the throttle; the top notch is boost. Autopilot moves it for you.
  let leverShown = -1;
  const drawLever = (v) => { if (Math.abs(v - leverShown) < 0.002) return; leverShown = v; opts.onLever(v); };
  const setLever = (v) => { lever = clamp(v, 0, 1); drawLever(lever); };
  const userLever = (v) => { stopTour(); autopilot = null; parked = false; setLever(v); touched(); };
  drawLever(lever);
  const nextUnvisited = () => { for (let i = 0; i < N; i++) if (!visited.has(i)) return i; return N - 1; };
  const headForNext = () => { autopilot = nextUnvisited(); };
  const setTour = (on) => { tour = on; opts.onTour(on); if (on) { autopilot = nextUnvisited(); tourDwellUntil = 0; } else autopilot = null; };
  const stopTour = () => { if (tour) setTour(false); };

  // --- HUD ---
  let shown = -1, shownState = '';
  const showIsland = (i, state, dist) => {
    const d = ISLANDS[i];
    const label = state === 'here' ? (d.summit ? 'You are here · summit' : 'You are here · ' + d.year) : (visited.has(i) ? 'Found · ' : 'Ahead · ') + Math.round(dist * 10) + ' m';
    if (i !== shown || label !== shownState) { shown = i; shownState = label; opts.onIsland(i, state === 'here', label); }
  };
  const discover = (i, now) => { visited.add(i); opts.onFound(i, visited.size); rings[i].t = now; if (tour) tourDwellUntil = now + 2800; };
  const compass = opts.compass.getContext('2d'), radar = opts.radar.getContext('2d');
  const INK = '#2d3b4a', SOFT = '#6f7f90';
  const drawCompass = () => { const W = 440, h = heading(); compass.clearRect(0, 0, W, 72); compass.textAlign = 'center'; compass.textBaseline = 'middle'; for (let deg = 0; deg < 360; deg += 15) { const rel = ((deg - h * 180 / Math.PI + 540) % 360) - 180; if (Math.abs(rel) > 70) continue; const x = W / 2 + rel * 3; compass.globalAlpha = (1 - Math.abs(rel) / 70) * 0.5; compass.fillStyle = SOFT; compass.fillRect(x - 0.5, 44, 1, deg % 45 === 0 ? 8 : 4); } for (const [t, deg] of [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]]) { const rel = ((deg - h * 180 / Math.PI + 540) % 360) - 180; if (Math.abs(rel) > 70) continue; const x = W / 2 + rel * 3; compass.globalAlpha = 1 - Math.abs(rel) / 70; compass.fillStyle = t.length === 1 ? INK : SOFT; compass.font = (t.length === 1 ? '600 24px' : '600 14px') + ' "Iowan Old Style", "Palatino Linotype", Georgia, serif'; compass.fillText(t, x, 24); } compass.globalAlpha = 1; compass.fillStyle = INK; compass.beginPath(); compass.moveTo(W / 2 - 5, 58); compass.lineTo(W / 2 + 5, 58); compass.lineTo(W / 2, 66); compass.closePath(); compass.fill(); };
  const drawRadar = () => { const S = 224, c = S / 2, range = 40, h = heading(); radar.clearRect(0, 0, S, S); radar.strokeStyle = SOFT; radar.globalAlpha = 0.25; radar.lineWidth = 1; [0.33, 0.66, 1].forEach((k) => { radar.beginPath(); radar.arc(c, c, c * k - 2, 0, Math.PI * 2); radar.stroke(); }); radar.beginPath(); radar.moveTo(c, 6); radar.lineTo(c, S - 6); radar.moveTo(6, c); radar.lineTo(S - 6, c); radar.stroke(); radar.globalAlpha = 1; POS.forEach((p, i) => { const dx = p.x - pos.x, dz = p.z - pos.z; const rx = dx * Math.cos(h) + dz * Math.sin(h), rz = -dx * Math.sin(h) + dz * Math.cos(h); const dist = Math.hypot(rx, rz); const k = Math.min(1, dist / range) * (c - 10); const ang = Math.atan2(rx, -rz); const x = c + Math.sin(ang) * k, y = c - Math.cos(ang) * k; radar.beginPath(); radar.arc(x, y, ISLANDS[i].summit ? 5 : 4, 0, Math.PI * 2); radar.fillStyle = ISLANDS[i].summit ? '#cfa14a' : visited.has(i) ? INK : '#3a8fd3'; radar.globalAlpha = visited.has(i) ? 0.4 : 1; radar.fill(); radar.globalAlpha = 1; }); radar.fillStyle = INK; radar.beginPath(); radar.moveTo(c, c - 8); radar.lineTo(c + 6, c + 6); radar.lineTo(c, c + 3); radar.lineTo(c - 6, c + 6); radar.closePath(); radar.fill(); };

  const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(), lookNow = new THREE.Vector3();
  fwd.set(Math.sin(yaw), 0, -Math.cos(yaw));
  camera.position.copy(pos).addScaledVector(fwd, -10).add(new THREE.Vector3(0, 3.4, 0)); lookNow.copy(pos);
  let last = performance.now(), hudAt = 0, raf = 0, disposed = false;
  const tick = (now) => {
    if (disposed) return;
    const dt = Math.min(Math.max(now - last, 1), 100) / 1000; last = now;
    const kFwd = keys.has('w') || keys.has('ArrowUp'), kBack = keys.has('s') || keys.has('ArrowDown'), kL = keys.has('a') || keys.has('ArrowLeft'), kR = keys.has('d') || keys.has('ArrowRight'), kBoost = keys.has('Shift');
    if (kFwd) setLever(lever + 0.9 * dt); if (kBack) setLever(lever - 1.2 * dt);
    let wantThrottle = Math.min(1, lever / 0.84), wantYaw = (kR ? 1 : 0) - (kL ? 1 : 0) + (drag ? dragIn.yaw : 0), wantClimb = (keys.has('e') ? 1 : 0) - (keys.has('q') ? 1 : 0) + (drag ? dragIn.climb : 0) + pitchNudge;
    pitchNudge = damp(pitchNudge, 0, 3, dt);
    let wantBoost = (lever > 0.84 || (kBoost && lever > 0.2)) ? 1 : 0;
    if (autopilot !== null) {
      const t = POS[autopilot]; const dx = t.x - pos.x, dz = t.z - pos.z, dist = Math.hypot(dx, dz);
      const want = Math.atan2(dx, -dz); const diff = ((want - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      wantYaw = clamp(diff * 2.4, -1, 1); wantClimb = clamp((t.y + HOVER - pos.y) * 0.9, -1, 1);
      wantThrottle = dist > 3.8 ? clamp((dist - 3.8) / 5, 0.15, 1) * (Math.abs(diff) < 1.2 ? 1 : 0.3) : 0;
      wantBoost = dist > 18 && Math.abs(diff) < 0.3 ? 1 : 0;
      if (dist < 4 && speed < 0.6) { if (!tour) { autopilot = null; parked = true; } else if (visited.has(autopilot) && now > tourDwellUntil) { if (visited.size >= N) { setTour(false); parked = true; } else autopilot = nextUnvisited(); } }
      lever = damp(lever, wantThrottle * 0.84 + wantBoost * 0.16, 3, dt); drawLever(lever);
    }
    if (parked && autopilot === null && lever > 0.001) { lever = damp(lever, 0, 4, dt); drawLever(lever); }
    updateStick(dt);
    throttle = damp(throttle, wantThrottle, 4, dt);
    boost = damp(boost, wantBoost, 3, dt);
    yawIn = damp(yawIn, clamp(wantYaw, -1, 1), 5, dt);
    climbIn = damp(climbIn, clamp(wantClimb, -1, 1), 4, dt);
    const maxSpeed = 6.5 + boost * 6;
    const targetSpeed = throttle * maxSpeed;
    speed = damp(speed, targetSpeed, targetSpeed > speed ? 1.4 : 2.2, dt);
    const turnRate = (0.5 + Math.min(1, Math.abs(speed) / 6.5) * 0.45) * (1 - boost * 0.3);
    yaw += yawIn * turnRate * dt;
    bank = damp(bank, yawIn * 0.38 * Math.min(1, Math.abs(speed) / 4 + 0.25), 3.5, dt);
    pitch = damp(pitch, climbIn * 0.16 - (targetSpeed - speed) * 0.02, 4, dt);
    fwd.set(Math.sin(yaw), 0, -Math.cos(yaw)); right.set(-fwd.z, 0, fwd.x);
    vel.x = damp(vel.x, fwd.x * speed, 2.8, dt); vel.z = damp(vel.z, fwd.z * speed, 2.8, dt);
    pos.addScaledVector(vel, dt);
    pos.y = clamp(pos.y + climbIn * 2.2 * dt, 0.8, 11);
    const rr = Math.hypot(pos.x, pos.z); if (rr > 70) { pos.x *= 70 / rr; pos.z *= 70 / rr; }
    // Ship pose: rig yaws; the ship rolls about its heading and pitches nose-up on a climb
    shipRig.position.copy(pos); if (!reduced) shipRig.position.y += Math.sin(now * 0.0014) * 0.05;
    shipRig.rotation.set(0, -yaw, 0); shipYaw.rotation.set(0, Math.PI / 2, 0); shipYaw.rotateX(bank); shipYaw.rotateZ(pitch);
    if (!reduced) { ship.userData.props.forEach((b) => { b.rotation.x += (2 + throttle * 16 + boost * 14) * dt; }); ship.userData.ed.rotation.z = Math.sin(now * 0.0021) * 0.05; ship.userData.cage.rotation.y += dt * (0.8 + boost * 3); ship.userData.coreGlow.material.opacity = 0.45 + throttle * 0.25 + boost * 0.3 + Math.sin(now * 0.006) * 0.08; }
    streakMat.opacity = boost * 0.55; if (boost > 0.02) streaks.children.forEach((s) => { s.position.z += speed * dt * 1.8 * 1; if (s.position.z > 2) { s.position.z = -20 - rand() * 6; s.position.x = (rand() - 0.5) * 6; s.position.y = (rand() - 0.5) * 3.5 + 0.8; } });
    // Chase camera: hangs back with speed, swings to the outside of a turn, widens on boost
    const back = 10 + speed * 0.2 + boost * 1.2;
    camPos.copy(pos).addScaledVector(fwd, -back).addScaledVector(right, -bank * 0.8); camPos.y = pos.y + 3.4 - climbIn * 0.3 + boost * 0.2;
    camLook.copy(pos).addScaledVector(fwd, 6); camLook.y = pos.y + 0.3 + climbIn * 0.3;
    camera.position.x = damp(camera.position.x, camPos.x, 5.5, dt); camera.position.y = damp(camera.position.y, camPos.y, 5.5, dt); camera.position.z = damp(camera.position.z, camPos.z, 5.5, dt);
    lookNow.x = damp(lookNow.x, camLook.x, 10, dt); lookNow.y = damp(lookNow.y, camLook.y, 10, dt); lookNow.z = damp(lookNow.z, camLook.z, 10, dt);
    camera.lookAt(lookNow); camera.rotateZ(-bank * 0.05);
    fov = damp(fov, 56 + boost * 8, 3, dt); if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
    // Nearest island, discovery, HUD
    let best = -1, bd = 1e9; POS.forEach((p, i) => { const d = Math.hypot(p.x - pos.x, p.z - pos.z); if (d < bd) { bd = d; best = i; } });
    const here = bd < 4.6 && Math.abs(POS[best].y + HOVER - pos.y) < 2.6;
    if (here && best !== near) { near = best; hereSince = now; } else if (!here) near = -1;
    if (here && !visited.has(best) && now - hereSince > 250) discover(best, now);
    showIsland(best, here ? 'here' : 'far', bd);
    if (now - hudAt > 80) { hudAt = now; drawCompass(); drawRadar(); }
    // World motion
    if (!reduced) {
      for (const c of clouds) { const u = c.userData; c.position.x = u.x0 + Math.sin(now * 0.00008 * u.v + u.ph) * 2.5; const d = c.position.distanceTo(camera.position) - u.w * 0.35; u.mat.opacity = u.base * clamp((d - 1.5) / 7, 0.06, 1); }
      for (const s of sea) s.position.x = s.userData.x0 + Math.sin(now * 0.0001 + s.userData.ph) * 1.5;
      fallTex.offset.y = -now * 0.0011;
      jellies.forEach((j) => { const u = j.userData; const k = Math.sin(now * 0.0025 + u.ph); j.scale.set(1 + k * 0.08, 1 - k * 0.06, 1 + k * 0.08); j.position.y += k * 0.004; j.position.x += Math.sin(u.va) * 0.006; j.position.z += Math.cos(u.va) * 0.006; u.va += 0.0006; u.tent.forEach((t) => { t.rotation.z = Math.cos(t.userData.a) * (0.12 + k * 0.08); t.rotation.x = -Math.sin(t.userData.a) * (0.12 + k * 0.08); }); });
    }
    beams.forEach((b, i) => { b.visible = !visited.has(i); b.material.opacity = 0.3 + (reduced ? 0.15 : Math.sin(now * 0.002 + i) * 0.15 + 0.15); b.rotation.y = now * 0.0004; });
    rings.forEach((rg) => { if (rg.t < 0) { rg.ring.visible = false; return; } const k = (now - rg.t) / 1400; if (k > 1) { rg.t = -1; rg.ring.visible = false; return; } rg.ring.visible = true; rg.ring.scale.setScalar(1 + k * 4); rg.ring.material.opacity = (1 - k) * 0.9; });
    crystals.forEach((c) => { const p = reduced ? 0.5 : Math.sin(now * 0.003 + c.phase) * 0.5 + 0.5; c.cr.rotation.y = now * 0.0008; c.glow.material.opacity = 0.35 + p * 0.3; c.cr.material.emissiveIntensity = 0.8 + p * 0.5; });
    animated.forEach((g) => g.userData.anim(now));
    sky.position.copy(camera.position); floor.position.x = camera.position.x; floor.position.z = camera.position.z;
    sunSprite.position.copy(camera.position).addScaledVector(SUN_DIR, 120);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    disposed = true; cancelAnimationFrame(raf); ro.disconnect();
    window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp);
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
    renderer.dispose(); if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
  };
  return { setLever: userLever, headForNext: () => { stopTour(); headForNext(); touched(); }, toggleTour: () => { setTour(!tour); touched(); }, dispose };
}
