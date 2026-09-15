import * as THREE from 'three';

// Ed's career as a tiny planet. One landmark per role, wins beside the job they
// happened in, and a small avatar who walks the ground as you roll the world.
//
// The scene is plain Three.js (r128) behind a small control surface so the React
// widget can stay a thin shell: it owns the HUD and the day/night choice, and this
// module owns everything on the canvas.

export const STOPS = [
  { company: 'BMO Capital Markets', role: 'Desktop Specialist Lead', period: 'Jun 2011 – Jul 2014', year: '2011', kind: 'bank' },
  { company: 'Cityhunter App', role: 'UX Architect', period: 'Jun 2012 – Sep 2014', year: '2012', kind: 'phone' },
  { company: 'Toronto Star', role: 'Digital Designer, Team Lead', period: 'Mar 2015 – Apr 2016', year: '2015', kind: 'newsstand', win: 'star' },
  { company: 'Hubub', role: 'UX/UI Designer', period: 'Apr – Oct 2016', year: '2016', kind: 'bubble' },
  { company: 'Tier1 Financial Solutions', role: 'UX Manager and Lead Product Designer', period: 'Jan 2017 – Apr 2020', year: '2017', kind: 'ticker', win: 'trophy' },
  { company: 'Flybits', role: 'Product Design Manager', period: 'Jul 2020 – Mar 2021', year: '2020', kind: 'beacon' },
  { company: 'Kea AI', role: 'Head of Product Design', period: 'Mar 2021 – Jul 2022', year: '2021', kind: 'robot' },
  { company: 'SamaCare', role: 'Staff Product Designer', period: 'Aug 2022 – Sept 2024', year: '2022', kind: 'forms', win: 'rocket' },
  { company: 'Adopt AI', role: 'Design Advisor (Founding Staff Product Designer)', period: 'Oct 2024 – Apr 2026', year: '2024', kind: 'api', win: 'bulb' },
  { company: 'Caret Legal', role: 'Director of Product Design', period: 'Mar – May 2026', year: '2026', kind: 'court' },
  { company: 'Elation Health', role: 'Staff Product Designer', period: 'May 2026 – Present', year: '2026', kind: 'practice' },
];

/**
 * Mounts the planet into `stage` and returns its controls.
 * @param {HTMLElement} stage  a positioned, sized element that receives the canvas
 * @param {{ onStop: (index: number) => void, onAuto: (on: boolean) => void, night: boolean }} opts
 */
export function createTinyPlanet(stage, opts) {
  const N = STOPS.length;
  const TRAIL = STOPS.map((_, i) => ({ lat: -56 + i * (104 / (N - 1)), lon: i * 52 }));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 9001;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const D2R = THREE.MathUtils.degToRad, lerp = THREE.MathUtils.lerp;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const LOOK = new THREE.Vector3(0, 0.62, 0);
  const CAM_DIR = new THREE.Vector3(0, 1.43, 5.7).normalize(), BASE_DIST = new THREE.Vector3(0, 1.43, 5.7).length();
  let zoom = 1, zoomTarget = 1;
  const setZoom = (z) => { zoomTarget = Math.min(1.75, Math.max(0.55, z)); };
  const camDir = new THREE.Vector3();
  const look = new THREE.Vector3(), edTop = new THREE.Vector3();
  let lift = 0;
  const updateCamera = () => {
    // as the camera closes in, the aim rises from the planet's face toward Ed
    const k = Math.min(1, Math.max(0, (1 - zoom) / 0.45));
    look.set(0, lerp(LOOK.y, 1.55, k) + lift, 0);
    camera.position.copy(look).addScaledVector(CAM_DIR, BASE_DIST * zoom); camera.lookAt(look); camDir.copy(camera.position).normalize();
    // whatever the window shape, the top of Ed's hat stays inside the frame
    camera.updateMatrixWorld(); edTop.set(0, 1.55 + 0.72, 0).project(camera);
    if (edTop.y > 0.86) lift += 0.03; else if (edTop.y < 0.7 && lift > 0) lift = Math.max(0, lift - 0.015);
  };
  updateCamera();
  const FRONT = new THREE.Vector3(0, 1.15, 1).normalize();

  // --- Light: day and night sets, blended by `night` ---
  const DAY = { hemiSky: new THREE.Color(0xdbeafe), hemiGround: new THREE.Color(0xf5e6d3), sun: new THREE.Color(0xfff3e0), cloud: new THREE.Color(0xffffff) };
  const NIGHT = { hemiSky: new THREE.Color(0x5c6ea6), hemiGround: new THREE.Color(0x30293f), sun: new THREE.Color(0xb9c8ff), cloud: new THREE.Color(0xaeb8d3) };
  const hemi = new THREE.HemisphereLight(0xdbeafe, 0xf5e6d3, 1.0);
  const sunLight = new THREE.DirectionalLight(0xfff3e0, 1.15); sunLight.position.set(3, 5, 3);
  const fill = new THREE.DirectionalLight(0xdbeafe, 0.25); fill.position.set(-3, 0, 2);
  scene.add(hemi, sunLight, fill);

  const soft = (hex, extra) => new THREE.MeshLambertMaterial(Object.assign({ color: hex }, extra || {}));
  const M = {
    trunk: soft(0xc9a27e), bark: soft(0xa8805f), leaf: soft(0x86bd90), leafDeep: soft(0x679f74), leafLight: soft(0xaddbb2), bush: soft(0x95cc9f),
    pink: soft(0xf4b6c2), butter: soft(0xf6dfa1), lilac: soft(0xcdbdeb), white: soft(0xfff8ee), coral: soft(0xf2a28a), cream: soft(0xfbf1e3),
    mint: soft(0x9fd8c4), lav: soft(0xb8b0e6), stone: soft(0xd9cfc6), water: soft(0xa9d3e6), sand: soft(0xefe0c3), cloud: soft(0xffffff),
    trail: soft(0x7fb28d), orange: soft(0xf07a4a), rock: soft(0xbfb4aa), rockDark: soft(0xa79c92), snow: soft(0xffffff), ink: soft(0x2b2624),
    gold: soft(0xf0c46a, { emissive: 0xd9a441, emissiveIntensity: 0.15 }), red: soft(0xe57373), sky: soft(0xbfdcf2), shroom: soft(0xe9705f), tire: soft(0x3a3532),
    mochi: soft(0xfff6ec), blush: soft(0xf5b3bc), cuff: soft(0x3d3634), blue: soft(0x3b82f6), poodle: soft(0xfffaf3), apricot: soft(0xf3d5b5),
    lamp: soft(0xfff1b8, { emissive: 0xffe08a, emissiveIntensity: 0.4 }),
    slate: soft(0x4b5563), robot: soft(0xe9eef5), skin: soft(0xf8d9c0), paper: soft(0xffffff), glass: soft(0x9ec5e8),
    pin: soft(0x3b82f6, { emissive: 0x3b82f6, emissiveIntensity: 0.35 }), pinGold: soft(0xd9a441, { emissive: 0xd9a441, emissiveIntensity: 0.35 }),
    glow: new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.55, depthWrite: false }),
    glowGold: new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.55, depthWrite: false }),
    sunDisc: new THREE.MeshBasicMaterial({ color: 0xffd67a, toneMapped: false }), moon: soft(0xf4efdc, { emissive: 0xd9d2b8, emissiveIntensity: 0.35 }), crater: soft(0xd8d0b6),
  };

  // Hex colours are sRGB picks; r128 treats them as linear unless told otherwise,
  // which renders every pastel about a stop and a half too light in daylight.
  Object.values(M).forEach((m) => { if (m.color) m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear(); });
  [DAY, NIGHT].forEach((set) => Object.values(set).forEach((c) => c.convertSRGBToLinear()));

  // Sky dome: a gradient painted on the inside of a big sphere, blended for time of day.
  // Drawing it in WebGL (not CSS behind a transparent canvas) is what lets the sun
  // and moon glow additively instead of compositing as brown mud.
  const SKY = { dayTop: new THREE.Color(0x6fb2e8).convertSRGBToLinear(), dayBot: new THREE.Color(0xe6f2fb).convertSRGBToLinear(), nightTop: new THREE.Color(0x070c26).convertSRGBToLinear(), nightBot: new THREE.Color(0x1f2c55).convertSRGBToLinear() };
  const skyGeo = new THREE.SphereGeometry(40, 24, 18);
  skyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, toneMapped: false }));
  scene.add(sky);
  const skyTop = new THREE.Color(), skyBot = new THREE.Color(), skyC = new THREE.Color();
  let skyPainted = -1;
  const paintSky = (n) => {
    skyTop.lerpColors(SKY.dayTop, SKY.nightTop, n); skyBot.lerpColors(SKY.dayBot, SKY.nightBot, n);
    const pos = skyGeo.attributes.position, col = skyGeo.attributes.color;
    for (let i = 0; i < pos.count; i++) { const t = Math.min(1, Math.max(0, (pos.getY(i) + 6) / 30)); skyC.copy(skyBot).lerp(skyTop, t * t); col.setXYZ(i, skyC.r, skyC.g, skyC.b); }
    col.needsUpdate = true; skyPainted = n;
  };

  // --- Planet ---
  const R = 1.55;
  const planet = new THREE.Group();
  const geo = new THREE.SphereGeometry(R, 80, 56);
  const pos = geo.attributes.position, colors = [];
  const cA = new THREE.Color(0xb7dfc1).convertSRGBToLinear(), cB = new THREE.Color(0x9ccfa9).convertSRGBToLinear(), cC = new THREE.Color(0xcde9d0).convertSRGBToLinear(), tmpC = new THREE.Color();
  const hills = (v) => 0.5 + 0.5 * (Math.sin(v.x * 2.3 + v.y * 1.1) * Math.cos(v.z * 2.1 - v.x * 0.7) * 0.6 + Math.sin(v.y * 3.3 + v.z * 1.7) * 0.4);
  for (let i = 0; i < pos.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(pos, i); const h = hills(v); v.multiplyScalar(1 + (h - 0.5) * 0.028); pos.setXYZ(i, v.x, v.y, v.z); tmpC.copy(h > 0.62 ? cC : cA).lerp(cB, Math.max(0, 0.55 - h)); colors.push(tmpC.r, tmpC.g, tmpC.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geo.computeVertexNormals();
  planet.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true })));
  scene.add(planet);

  const UP = new THREE.Vector3(0, 1, 0);
  const normalAt = (latDeg, lonDeg) => { const lat = D2R(latDeg), lon = D2R(lonDeg); return new THREE.Vector3(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)); };
  const placeOn = (obj, n, r) => { obj.position.copy(n).multiplyScalar(r); obj.quaternion.setFromUnitVectors(UP, n); obj.userData.normal = n.clone(); return obj; };
  const popups = [];
  const addPop = (obj, n, r = R - 0.015) => { placeOn(obj, n, r); obj.rotateY(rand() * Math.PI * 2); obj.userData.spring = { s: 0, v: 0 }; obj.scale.setScalar(0.0001); planet.add(obj); popups.push(obj); return obj; };
  const cyl = (rt, rb, h, m, seg = 10) => { const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); g.position.y = h / 2; return g; };
  const cone = (r, h, m, seg = 10) => { const g = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); g.position.y = h / 2; return g; };
  const ball = (r, m, w = 10, h = 8) => new THREE.Mesh(new THREE.SphereGeometry(r, w, h), m);
  const box = (w, h, d, m) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.y = h / 2; return g; };
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const sc = (o, x, y, z) => { o.scale.set(x, y, z); return o; };
  const win = (x, y, z, w = 0.05, h = 0.05) => at(box(w, h, 0.012, M.lamp), x, y - h / 2, z);
  // Flat text on a plane, unlit so it stays crisp: signs, screens, the E on the beanie.
  const textTex = (text, color, w = 256, h = 128, px = 150) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = color; x.font = `bold ${px}px ui-rounded, "Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + h * 0.05); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; };
  const label = (text, w, h, color, extra) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial(Object.assign({ map: textTex(text, color), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }, extra || {})));

  // --- Scenery, with enough detail to stop reading as blocks ---
  const pineTree = (s) => { const g = new THREE.Group(); g.add(cyl(0.03, 0.05, 0.16, M.bark, 8)); g.add(at(cone(0.15, 0.22, M.leafDeep, 12), 0, 0.14, 0), at(cone(0.12, 0.2, M.leaf, 12), 0, 0.26, 0), at(cone(0.085, 0.17, M.leafLight, 12), 0, 0.38, 0)); g.add(at(sc(ball(0.05, M.leafLight, 8, 6), 1, 0.5, 1), 0.06, 0.29, 0.06)); g.scale.setScalar(s); return g; };
  const roundTree = (s, m) => { const g = new THREE.Group(); g.add(cyl(0.035, 0.055, 0.17, M.bark, 8)); g.add(at(ball(0.17, m, 12, 10), 0, 0.28, 0), at(ball(0.11, m, 10, 8), 0.11, 0.34, 0.03), at(ball(0.1, M.leafDeep, 10, 8), -0.09, 0.22, 0.05), at(sc(ball(0.06, M.leafLight, 8, 6), 1, 0.6, 1), 0.04, 0.4, 0.06)); g.scale.setScalar(s); return g; };
  const bush = (s) => { const g = new THREE.Group(); g.add(at(ball(0.1, M.bush), 0, 0.07, 0), at(ball(0.07, M.leafDeep, 8, 6), 0.08, 0.05, 0.03), at(sc(ball(0.05, M.leafLight, 8, 6), 1, 0.55, 1), -0.02, 0.13, 0.03)); g.scale.setScalar(s); return g; };
  const flowers = (m) => { const g = new THREE.Group(); [[-0.04, 0.02, 0.1], [0.04, -0.02, 0.085]].forEach(([x, z, h]) => { g.add(at(cyl(0.007, 0.007, h, M.leaf, 6), x, 0, z), at(sc(ball(0.03, m, 10, 6), 1, 0.45, 1), x, h, z), at(ball(0.012, M.butter, 6, 4), x, h + 0.008, z)); }); return g; };
  const rock = (s) => { const g = new THREE.Group(); g.add(at(sc(ball(0.07, M.rock, 8, 6), 1.3, 0.75, 1), 0, 0.04, 0), at(sc(ball(0.045, M.rockDark, 8, 6), 1, 0.7, 1), 0.07, 0.025, 0.03)); g.scale.setScalar(s); return g; };
  const mushroom = (s) => { const g = new THREE.Group(); g.add(cyl(0.018, 0.022, 0.06, M.cream, 8)); g.add(at(sc(ball(0.045, M.shroom, 12, 8), 1, 0.65, 1), 0, 0.06, 0)); [[0.015, 0.03], [-0.02, 0.01], [0.005, -0.03]].forEach(([x, z]) => g.add(at(ball(0.008, M.snow, 6, 4), x, 0.085, z))); g.scale.setScalar(s); return g; };
  const pond = (r) => { const g = new THREE.Group(); g.add(at(cyl(r + 0.07, r + 0.07, 0.012, M.sand, 20), 0, 0.002, 0), at(cyl(r, r, 0.02, M.water, 20), 0, 0.006, 0)); return g; };
  const instanced = (geometry, material, normals, r, jitter) => { const mesh = new THREE.InstancedMesh(geometry, material, normals.length), m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), pp = new THREE.Vector3(), ss = new THREE.Vector3(); normals.forEach((n, i) => { qq.setFromUnitVectors(UP, n); if (jitter) qq.multiply(new THREE.Quaternion().setFromAxisAngle(UP, rand() * Math.PI * 2)); pp.copy(n).multiplyScalar(r); const k = jitter ? 0.8 + rand() * 0.5 : 1; ss.set(k, k, k); m4.compose(pp, qq, ss); mesh.setMatrixAt(i, m4); }); return mesh; };
  const plinth = (g) => { g.add(cyl(0.11, 0.13, 0.06, M.stone, 16)); g.add(at(cyl(0.09, 0.09, 0.01, M.cream, 16), 0, 0.06, 0)); return g; };
  const star = (r) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath(); return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), M.gold); };
  const roof4 = (r, h, m) => { const c = cone(r, h, m, 4); c.rotation.y = Math.PI / 4; return c; };

  const landmark = (kind) => {
    const g = new THREE.Group();
    switch (kind) {
      // BMO: the bank, plus the trading desk with three screens where the desktop work happened
      case 'bank': g.add(box(0.36, 0.05, 0.24, M.stone), at(box(0.4, 0.02, 0.28, M.stone), 0, -0.02, 0)); for (let i = 0; i < 4; i++) g.add(at(cyl(0.02, 0.022, 0.2, M.white, 8), -0.12 + i * 0.08, 0.05, 0.08)); g.add(at(box(0.3, 0.2, 0.14, M.stone), 0, 0.05, -0.03), at(sc(roof4(0.17, 0.06, M.lav), 1, 1, 0.7), 0, 0.28, 0), at(box(0.32, 0.03, 0.16, M.lav), 0, 0.25, -0.03), at(box(0.06, 0.09, 0.012, M.ink), 0, 0.05, 0.043), win(-0.09, 0.19, 0.043), win(0.09, 0.19, 0.043)); { const d = new THREE.Group(); d.add(box(0.2, 0.07, 0.08, M.trunk)); [-0.065, 0, 0.065].forEach((x, i) => { d.add(at(box(0.055, 0.04, 0.008, M.ink), x, 0.09, 0.01), at(box(0.047, 0.032, 0.004, i === 1 ? M.leafLight : M.sky), x, 0.09, 0.016), at(cyl(0.005, 0.005, 0.02, M.cuff, 6), x, 0.07, 0.01)); }); d.scale.setScalar(0.8); d.position.set(0.08, 0, 0.21); d.rotation.y = -0.15; g.add(d); } break;
      // Cityhunter: the app on a phone, with the city it pointed you around
      case 'phone': [[-0.2, 0.2, 0.09, M.stone], [-0.11, 0.3, 0.08, M.lav], [0.14, 0.24, 0.08, M.stone], [0.23, 0.16, 0.07, M.cream]].forEach(([x, h, w, m]) => { g.add(at(box(w, h, 0.08, m), x, 0, -0.12)); for (let r = 0; r < Math.floor(h / 0.07); r++) g.add(win(x, 0.06 + r * 0.07, -0.079, 0.028, 0.028)); }); g.add(box(0.16, 0.3, 0.05, M.ink), at(box(0.13, 0.24, 0.02, M.sky), 0, 0.035, 0.02), at(box(0.05, 0.005, 0.02, M.stone), 0, 0.31, 0.02), at(box(0.09, 0.04, 0.01, M.white), 0, 0.2, 0.031), at(box(0.09, 0.02, 0.01, M.coral), 0, 0.14, 0.031), at(cone(0.04, 0.09, M.coral, 12), 0, 0.33, 0), at(ball(0.045, M.coral), 0, 0.42, 0), at(ball(0.016, M.white, 8, 6), 0, 0.42, 0.036)); break;
      // Toronto Star: the newsstand, with the StarTouch iPad propped on the counter
      case 'newsstand': g.add(box(0.28, 0.2, 0.2, M.mint)); { const r = at(box(0.34, 0.03, 0.26, M.coral), 0, 0.22, 0); r.rotation.x = 0.18; g.add(r); } g.add(at(box(0.22, 0.07, 0.012, M.white), 0, 0.1, 0.105), at(box(0.16, 0.02, 0.06, M.cream), -0.04, 0.2, 0.08), at(box(0.12, 0.02, 0.05, M.white), 0.06, 0.2, 0.07)); { const p = at(cyl(0.03, 0.03, 0.14, M.white, 10), 0.18, 0.03, 0.09); p.rotation.z = Math.PI / 2; g.add(p); } g.add(at(cyl(0.012, 0.012, 0.3, M.trunk, 6), -0.19, 0, -0.05), at(box(0.1, 0.06, 0.008, M.butter), -0.19, 0.24, -0.05)); { const t = new THREE.Group(); t.add(box(0.11, 0.14, 0.008, M.ink), at(box(0.095, 0.12, 0.004, M.white), 0, 0.01, 0.005), at(box(0.07, 0.012, 0.003, M.coral), 0, 0.1, 0.008), at(box(0.075, 0.03, 0.003, M.stone), 0, 0.06, 0.008), at(box(0.075, 0.025, 0.003, M.sky), 0, 0.025, 0.008)); t.position.set(0.1, 0, 0.16); t.rotation.x = -0.3; t.rotation.y = 0.25; g.add(t); } break;
      case 'bubble': g.add(cyl(0.012, 0.012, 0.22, M.trunk, 8)); { const b = at(ball(0.11, M.sky, 16, 12), 0, 0.3, 0); b.scale.set(1.25, 0.9, 0.7); g.add(b); const tail = at(cone(0.04, 0.08, M.sky, 8), -0.06, 0.2, 0); tail.rotation.z = 0.5; tail.rotation.x = Math.PI; g.add(tail); [-0.04, 0, 0.04].forEach((x) => g.add(at(ball(0.014, M.white, 8, 6), x, 0.3, 0.08))); } break;
      // Tier1: the tower, with a board on the front where the line goes up and to the right
      case 'ticker': g.add(box(0.2, 0.42, 0.2, M.stone), at(box(0.22, 0.05, 0.22, M.butter), 0, 0.26, 0)); for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) g.add(win(-0.045 + c * 0.09, 0.11 + r * 0.1, 0.105, 0.045, 0.045)); g.add(at(box(0.17, 0.09, 0.01, M.ink), 0, 0.36, 0.105), at(box(0.15, 0.07, 0.004, M.slate), 0, 0.36, 0.111)); [[-0.05, 0.335, 0.5], [-0.012, 0.35, -0.25], [0.025, 0.352, 0.75], [0.058, 0.385, 0.35]].forEach(([x, y, r]) => { const seg = at(box(0.04, 0.007, 0.004, M.leafLight), x, y, 0.115); seg.rotation.z = r; g.add(seg); }); g.add(at(cone(0.06, 0.1, M.lav, 4), 0, 0.42, 0), at(cyl(0.006, 0.006, 0.12, M.ink, 6), 0, 0.5, 0)); break;
      case 'beacon': g.add(cone(0.05, 0.42, M.stone, 10), at(box(0.16, 0.1, 0.14, M.cream), 0.1, 0, 0.02), at(sc(roof4(0.12, 0.06, M.coral), 1, 1, 0.9), 0.1, 0.1, 0.02)); for (let i = 0; i < 3; i++) g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.06 + i * 0.03, 0.008, 6, 20), M.coral), 0, 0.44 - i * 0.05, 0)); g.add(at(ball(0.03, M.lamp), 0, 0.45, 0)); break;
      // Caret Legal: the courthouse, with a gavel on the steps
      case 'court': g.add(box(0.36, 0.05, 0.24, M.stone), at(box(0.4, 0.02, 0.28, M.stone), 0, -0.02, 0)); for (let i = 0; i < 4; i++) g.add(at(cyl(0.02, 0.02, 0.22, M.white, 8), -0.12 + i * 0.08, 0.05, 0.08)); g.add(at(box(0.3, 0.22, 0.14, M.white), 0, 0.05, -0.03), at(sc(roof4(0.26, 0.07, M.lilac), 1, 1, 0.7), 0, 0.31, 0), at(box(0.32, 0.035, 0.16, M.white), 0, 0.275, -0.03), at(box(0.34, 0.012, 0.18, M.gold), 0, 0.27, -0.03), at(ball(0.03, M.gold, 8, 6), 0, 0.4, 0), at(box(0.06, 0.1, 0.012, M.ink), 0, 0.05, 0.043)); { const gv = new THREE.Group(); const head = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.06, 10), M.trunk); head.rotation.z = Math.PI / 2; head.position.set(0, 0.022, 0); const handle = at(cyl(0.006, 0.006, 0.1, M.bark, 6), 0, 0.012, 0); handle.rotation.x = Math.PI / 2; handle.position.z = 0.05; gv.add(head, handle, at(cyl(0.03, 0.03, 0.012, M.bark, 12), 0.07, 0, 0)); gv.position.set(0.19, 0.05, 0.14); gv.rotation.y = 0.5; g.add(gv); } break;
      // Kea AI: the voice-ordering robot at the drive-thru, thinking out loud with a looping "..."
      case 'robot': { g.add(at(cyl(0.012, 0.012, 0.2, M.stone, 8), -0.17, 0, 0.02), at(box(0.1, 0.12, 0.02, M.ink), -0.17, 0.19, 0.02), at(box(0.08, 0.02, 0.006, M.lamp), -0.17, 0.27, 0.032), at(box(0.06, 0.012, 0.006, M.coral), -0.17, 0.24, 0.032), at(box(0.07, 0.012, 0.006, M.white), -0.17, 0.215, 0.032)); const r = new THREE.Group(); [-0.03, 0.03].forEach((x) => r.add(at(box(0.035, 0.03, 0.05, M.cuff), x, 0, 0))); r.add(at(box(0.15, 0.15, 0.11, M.robot), 0, 0.03, 0), at(box(0.09, 0.05, 0.006, M.slate), 0, 0.11, 0.056), at(box(0.13, 0.11, 0.1, M.robot), 0, 0.2, 0), at(box(0.1, 0.05, 0.006, M.slate), 0, 0.23, 0.051), at(cyl(0.006, 0.006, 0.05, M.cuff, 6), 0, 0.31, 0), at(ball(0.014, M.coral, 8, 6), 0, 0.365, 0)); [-0.026, 0.026].forEach((x) => r.add(at(ball(0.012, M.sky, 10, 8), x, 0.255, 0.056))); { const hs = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.007, 6, 20, Math.PI), M.cuff); hs.position.set(0, 0.255, 0); hs.rotation.set(0, 0, 0); r.add(hs, at(ball(0.014, M.cuff, 8, 6), 0.068, 0.255, 0), at(cyl(0.004, 0.004, 0.05, M.cuff, 5), 0.05, 0.2, 0.05), at(ball(0.009, M.cuff, 6, 5), 0.05, 0.19, 0.06)); } [-1, 1].forEach((d) => { const arm = at(cyl(0.012, 0.012, 0.09, M.robot, 8), d * 0.09, 0.05, 0); arm.rotation.z = d * 0.35; r.add(arm, at(ball(0.016, M.cuff, 8, 6), d * 0.105, 0.015, 0)); }); const bub = new THREE.Group(); bub.add(sc(ball(0.075, M.white, 16, 12), 1.35, 0.85, 0.55)); { const tail = at(cone(0.03, 0.06, M.white, 8), -0.06, -0.075, 0); tail.rotation.z = -0.5; tail.rotation.x = Math.PI; bub.add(tail); } bub.userData.dots = [-0.036, 0, 0.036].map((x) => { const d = at(ball(0.012, M.ink, 8, 6), x, 0, 0.042); bub.add(d); return d; }); bub.position.set(0.13, 0.42, 0); bub.userData.y0 = 0.42; r.add(bub); r.position.set(0.09, 0, 0.04); r.rotation.y = -0.3; g.add(r); g.userData.anim = (now) => { bub.position.y = bub.userData.y0 + Math.sin(now * 0.003) * 0.008; bub.userData.dots.forEach((d, i) => { const k = ((now * 0.0016 - i * 0.28) % 1 + 1) % 1; d.scale.setScalar(0.65 + 0.7 * Math.max(0, Math.sin(k * Math.PI * 2)) ); }); }; } break;
      // SamaCare: the forms. A clipboard of checkboxes, a stack of paperwork, a pen
      case 'forms': { g.add(box(0.32, 0.11, 0.2, M.trunk), at(box(0.34, 0.012, 0.22, M.bark), 0, 0.11, 0)); const cb = new THREE.Group(); cb.add(box(0.17, 0.22, 0.012, M.bark), at(box(0.15, 0.19, 0.006, M.paper), 0, 0.012, 0.008), at(box(0.06, 0.025, 0.02, M.cuff), 0, 0.2, 0.004)); [0.155, 0.115, 0.075, 0.035].forEach((y, i) => { cb.add(at(box(0.022, 0.022, 0.004, M.mint), -0.052, y, 0.012), at(box(0.075, 0.008, 0.003, M.stone), 0.012, y, 0.012)); if (i < 3) { const tick = at(box(0.02, 0.005, 0.004, M.leafDeep), -0.05, y, 0.015); tick.rotation.z = 0.7; const tick2 = at(box(0.01, 0.005, 0.004, M.leafDeep), -0.06, y - 0.004, 0.015); tick2.rotation.z = -0.9; cb.add(tick, tick2); } }); cb.position.set(-0.07, 0.12, -0.02); cb.rotation.x = -0.32; g.add(cb); [0, 1, 2, 3].forEach((i) => g.add(at(box(0.11, 0.008, 0.14, M.paper), 0.09 + (i % 2) * 0.008, 0.125 + i * 0.008, 0.02 - (i % 2) * 0.006))); g.add(at(box(0.05, 0.005, 0.004, M.coral), 0.06, 0.16, -0.02)); { const pen = at(cyl(0.006, 0.006, 0.12, M.blue, 6), 0.12, 0.135, 0.08); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.5; g.add(pen, at(ball(0.02, M.red, 10, 8), -0.12, 0.14, 0.09)); } } break;
      // Adopt AI: a small dark building with a neon API sign on the roof
      case 'api': { g.add(box(0.3, 0.26, 0.22, M.slate), at(box(0.33, 0.02, 0.25, M.stone), 0, 0.26, 0), at(box(0.3, 0.012, 0.22, M.stone), 0, 0.13, 0)); for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) g.add(at(box(0.055, 0.045, 0.006, r === 1 && c === 1 ? M.lamp : M.glass), -0.085 + c * 0.085, 0.06 + r * 0.13, 0.111)); g.add(at(box(0.06, 0.08, 0.008, M.ink), 0, 0, 0.111), at(box(0.32, 0.03, 0.02, M.white), 0, 0.1, 0.115)); [-0.1, 0.1].forEach((x) => g.add(at(cyl(0.007, 0.007, 0.06, M.cuff, 6), x, 0.27, 0))); g.add(at(box(0.26, 0.11, 0.02, M.cuff), 0, 0.385, 0)); const neon = label('API', 0.2, 0.09, '#8fe3ff'); neon.position.set(0, 0.385, 0.012); const glow = label('API', 0.24, 0.11, '#5ad2ff', { blending: THREE.AdditiveBlending, opacity: 0.35 }); glow.position.set(0, 0.385, 0.013); const back = label('API', 0.2, 0.09, '#8fe3ff'); back.position.set(0, 0.385, -0.012); back.rotation.y = Math.PI; g.add(neon, glow, back); g.add(at(cyl(0.004, 0.004, 0.1, M.cuff, 5), 0.13, 0.27, -0.08), at(ball(0.012, M.coral, 8, 6), 0.13, 0.37, -0.08)); g.userData.anim = (now, night) => { const dip = Math.sin(now * 0.021) * Math.sin(now * 0.0071) > 0.985 ? 0.45 : 1; neon.material.opacity = (0.75 + night * 0.25) * dip; glow.material.opacity = (0.15 + night * 0.5) * dip; }; } break;
      // Elation Health: a family practice with a doctor at the door
      case 'practice': { g.add(box(0.3, 0.2, 0.22, M.white), at(box(0.32, 0.02, 0.24, M.mint), 0, 0.2, 0), at(box(0.06, 0.1, 0.012, M.sky), -0.07, 0, 0.115), win(0.08, 0.09, 0.115, 0.07, 0.06)); for (let i = 0; i < 5; i++) g.add(at(box(0.062, 0.02, 0.1, i % 2 ? M.white : M.mint), -0.124 + i * 0.062, 0.115, 0.155)); g.add(at(box(0.07, 0.02, 0.012, M.red), 0, 0.165, 0.115), at(box(0.02, 0.07, 0.012, M.red), 0, 0.14, 0.115)); g.add(at(cyl(0.008, 0.008, 0.16, M.stone, 6), 0.2, 0, 0.1), at(box(0.09, 0.05, 0.01, M.white), 0.2, 0.17, 0.1)); { const sign = label('Dr', 0.06, 0.035, '#3b82f6'); sign.position.set(0.2, 0.17, 0.106); g.add(sign); } const doc = new THREE.Group(); doc.add(at(sc(ball(0.05, M.white, 14, 12), 1, 1.2, 1), 0, 0.06, 0), at(box(0.012, 0.09, 0.004, M.sky), 0, 0.06, 0.05), at(ball(0.043, M.skin, 14, 12), 0, 0.15, 0), at(new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), M.ink), 0, 0.152, 0)); [-0.015, 0.015].forEach((x) => doc.add(at(ball(0.006, M.ink, 6, 5), x, 0.15, 0.04))); doc.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.003, 6, 12, Math.PI), M.ink), 0, 0.137, 0.042)); { const st = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 6, 16, Math.PI * 1.3), M.cuff); st.position.set(0, 0.105, 0.025); st.rotation.set(0.5, 0, 0.35); doc.add(st, at(ball(0.011, M.stone, 8, 6), 0.03, 0.07, 0.04)); } [-1, 1].forEach((d) => doc.add(at(cyl(0.01, 0.01, 0.07, M.white, 6), d * 0.055, 0.06, 0), at(ball(0.012, M.skin, 8, 6), d * 0.055, 0.02, 0))); doc.position.set(-0.18, 0, 0.16); doc.rotation.y = 0.4; g.add(doc); g.userData.anim = (now) => { doc.position.y = Math.abs(Math.sin(now * 0.004)) * 0.006; }; } break;
      case 'star': plinth(g); g.add(at(star(0.11), 0, 0.2, -0.015), at(cyl(0.015, 0.015, 0.08, M.stone, 8), 0, 0.07, 0)); break;
      case 'trophy': plinth(g); g.add(at(cyl(0.02, 0.03, 0.06, M.gold, 10), 0, 0.07, 0)); { g.add(at(cyl(0.07, 0.04, 0.1, M.gold, 12), 0, 0.13, 0)); [-1, 1].forEach((d) => { const h = at(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 12, Math.PI), M.gold), d * 0.075, 0.19, 0); h.rotation.z = d * Math.PI / 2; g.add(h); }); } break;
      case 'rocket': plinth(g); g.add(at(cyl(0.05, 0.05, 0.2, M.white, 14), 0, 0.07, 0), at(cone(0.05, 0.1, M.coral, 14), 0, 0.27, 0), at(ball(0.022, M.sky, 8, 6), 0, 0.18, 0.05)); for (let i = 0; i < 3; i++) { const f = at(box(0.03, 0.06, 0.008, M.coral), Math.cos(i * 2.09) * 0.055, 0.1, Math.sin(i * 2.09) * 0.055); f.rotation.y = -i * 2.09; g.add(f); } break;
      case 'bulb': plinth(g); g.add(at(cyl(0.035, 0.035, 0.05, M.stone, 10), 0, 0.07, 0), at(ball(0.08, M.lamp, 16, 12), 0, 0.2, 0)); break;
    }
    g.scale.setScalar(1.05);
    return g;
  };

  const cafe = () => {
    const g = new THREE.Group();
    g.add(box(0.3, 0.2, 0.24, M.butter), at(box(0.34, 0.04, 0.28, M.trunk), 0, 0.21, 0), at(box(0.05, 0.08, 0.05, M.stone), -0.1, 0.22, -0.06));
    for (let i = 0; i < 5; i++) g.add(at(box(0.068, 0.03, 0.12, i % 2 ? M.white : M.coral), -0.136 + i * 0.068, 0.2, 0.14));
    g.add(win(-0.07, 0.14, 0.125, 0.07, 0.06), at(box(0.06, 0.1, 0.012, M.ink), 0.07, 0.03, 0.125));
    const cup = at(cyl(0.045, 0.045, 0.06, M.white, 12), 0.2, 0.26, 0); cup.rotation.z = 0.15; g.add(cup, at(new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 6, 12), M.white), 0.245, 0.29, 0));
    g.add(at(cyl(0.05, 0.05, 0.012, M.cream, 12), 0.26, 0.08, 0.16), at(cyl(0.008, 0.008, 0.08, M.stone, 6), 0.26, 0, 0.16), at(cyl(0.006, 0.006, 0.18, M.stone, 6), 0.26, 0.08, 0.16), at(cone(0.09, 0.04, M.coral, 12), 0.26, 0.24, 0.16));
    g.userData.steam = [0, 1, 2].map((i) => { const s = at(ball(0.014, M.cloud, 8, 6), 0.2 + (i - 1) * 0.02, 0.33 + i * 0.03, 0); g.add(s); return s; });
    g.userData.smoke = [0, 1].map((i) => { const s = at(ball(0.018 + i * 0.006, M.cloud, 8, 6), -0.1, 0.32 + i * 0.05, -0.06); g.add(s); return s; });
    return g;
  };
  const bridge = () => {
    const g = new THREE.Group();
    g.add(at(box(0.62, 0.02, 0.09, M.orange), 0, 0.16, 0), at(box(0.62, 0.004, 0.01, M.butter), 0, 0.172, 0));
    [-0.18, 0.18].forEach((x) => g.add(at(box(0.04, 0.42, 0.06, M.orange), x, 0, 0), at(box(0.06, 0.02, 0.07, M.orange), x, 0.3, 0), at(box(0.06, 0.02, 0.07, M.orange), x, 0.4, 0)));
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.31, 0.17, 0.045), new THREE.Vector3(-0.18, 0.42, 0.045), new THREE.Vector3(0, 0.2, 0.045), new THREE.Vector3(0.18, 0.42, 0.045), new THREE.Vector3(0.31, 0.17, 0.045)]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.007, 5, false), M.orange); const cable2 = cable.clone(); cable2.position.z = -0.09; g.add(cable, cable2);
    [-0.09, -0.045, 0.045, 0.09, -0.27, -0.24, 0.24, 0.27].forEach((x) => { const y = curve.getPointAt((x + 0.31) / 0.62).y; [0.045, -0.045].forEach((z) => g.add(at(cyl(0.003, 0.003, y - 0.17, M.orange, 4), x, 0.17, z))); });
    return g;
  };
  const mountain = () => {
    const g = new THREE.Group();
    g.add(cone(0.3, 0.5, M.rock, 16), at(cone(0.12, 0.2, M.snow, 16), 0, 0.3, 0), at(cone(0.18, 0.3, M.rockDark, 14), 0.22, 0, -0.1), at(cone(0.07, 0.11, M.snow, 14), 0.22, 0.19, -0.1));
    for (let i = 0; i < 4; i++) { const seg = at(box(0.14, 0.008, 0.02, M.butter), (i % 2 ? -1 : 1) * 0.05, 0.08 + i * 0.09, 0.22 - i * 0.05); seg.rotation.z = (i % 2 ? -1 : 1) * 0.35; g.add(seg); }
    g.add(at(cyl(0.006, 0.006, 0.12, M.ink, 6), 0, 0.5, 0), at(box(0.06, 0.04, 0.005, M.coral), 0.03, 0.58, 0));
    [[-0.22, 0.02, 0.14], [-0.14, 0.14, 0.2], [0.3, 0.02, 0.16]].forEach(([x, y, z]) => g.add(at(pineTree(0.45), x, y, z)));
    return g;
  };
  // A poodle with an actual silhouette: chest, neck, snout, drooped ears, pom paws, tail pom, collar.
  const poodle = (m) => {
    const g = new THREE.Group();
    g.add(at(sc(ball(0.055, m, 12, 10), 1.7, 1.05, 1), 0, 0.1, 0), at(ball(0.045, m), 0.065, 0.105, 0), at(sc(ball(0.02, m, 8, 6), 1, 1.8, 1), 0.1, 0.13, 0), at(ball(0.04, m, 12, 10), 0.12, 0.16, 0), at(sc(ball(0.024, m, 10, 8), 1.4, 0.85, 0.9), 0.155, 0.145, 0), at(ball(0.009, M.ink, 6, 4), 0.18, 0.15, 0), at(ball(0.034, m, 10, 8), 0.115, 0.2, 0));
    [-1, 1].forEach((d) => g.add(at(sc(ball(0.028, m, 8, 6), 0.7, 1.6, 0.8), 0.105, 0.14, d * 0.044), at(ball(0.006, M.ink, 6, 4), 0.145, 0.165, d * 0.016)));
    const collar = at(new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 6, 14), M.blue), 0.095, 0.135, 0); collar.rotation.z = 0.3; collar.rotation.y = Math.PI / 2; g.add(collar);
    g.userData.legs = [[-0.045, 0.028], [0.045, 0.028], [-0.045, -0.028], [0.045, -0.028]].map(([x, z], i) => { const leg = new THREE.Group(); leg.position.set(x, 0.075, z); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.07, 6), m); l.position.y = -0.035; leg.add(l, at(ball(0.018, m, 8, 6), 0, -0.07, 0)); leg.userData.phase = i % 3 ? 0 : Math.PI; g.add(leg); return leg; });
    const tail = at(cyl(0.008, 0.008, 0.05, m, 6), -0.085, 0.12, 0); tail.rotation.z = 0.6; g.add(tail, at(ball(0.022, m, 8, 6), -0.1, 0.165, 0));
    g.scale.setScalar(1.1);
    return g;
  };

  // --- Place everything ---
  const stops = TRAIL.map((t, i) => { const g = addPop(landmark(STOPS[i].kind), normalAt(t.lat, t.lon), R - 0.01); g.rotation.set(0, 0, 0); placeOn(g, normalAt(t.lat, t.lon), R - 0.01); g.userData.stop = i; return g; });
  const animated = stops.filter((g) => g.userData.anim);
  // The wins — App Store award, acquisition, Series B, patent — sit beside the job they happened in.
  const wins = []; STOPS.forEach((st, i) => { if (!st.win) return; const t = TRAIL[i], n = normalAt(t.lat - 4, t.lon + 16); wins.push(n); addPop(landmark(st.win), n, R - 0.01); });
  { const dots = []; for (let i = 0; i < N - 1; i++) { const a = normalAt(TRAIL[i].lat, TRAIL[i].lon), b = normalAt(TRAIL[i + 1].lat, TRAIL[i + 1].lon); for (let k = 1; k < 7; k++) dots.push(a.clone().lerp(b, k / 7).normalize()); } const dg = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 10); dg.translate(0, 0.006, 0); planet.add(instanced(dg, M.trail, dots, R + 0.004, false)); }
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 10, 64, 64, 62); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.55, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glows = TRAIL.map((t, i) => { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.225, 40), M.glow.clone()); ring.rotation.x = -Math.PI / 2; const disc = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), new THREE.MeshBasicMaterial({ map: glowTex, color: new THREE.Color(0x3b82f6).convertSRGBToLinear(), transparent: true, opacity: 0.5, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = -0.002; g.add(disc, ring); placeOn(g, normalAt(t.lat, t.lon), R + 0.008); g.userData.ring = ring; g.userData.disc = disc; g.userData.phase = i * 0.7; planet.add(g); return g; });

  const CAFE = normalAt(-8, 250), BRIDGE = normalAt(-30, 140), MOUNT = normalAt(22, 335);
  const cafeObj = addPop(cafe(), CAFE, R - 0.01);
  addPop(pond(0.3), BRIDGE, R - 0.03); addPop(bridge(), BRIDGE, R - 0.005);
  addPop(mountain(), MOUNT, R - 0.05);
  addPop(pond(0.2), normalAt(-62, 40), R - 0.03);
  const poodles = [poodle(M.poodle), poodle(M.apricot)].map((p, i) => { p.userData.phase = i * Math.PI; return addPop(p, CAFE, R - 0.01); });

  const reserved = [...TRAIL.map((t) => normalAt(t.lat, t.lon)), ...wins, CAFE, BRIDGE, MOUNT];
  const free = (n, deg) => UP.angleTo(n) > D2R(22) && reserved.every((r) => r.angleTo(n) > D2R(deg));
  const scatter = (count, minDeg, make) => { let placed = 0, tries = 0; while (placed < count && tries++ < count * 30) { const n = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(); if (!free(n, minDeg)) continue; addPop(make(), n); placed++; } };
  const palette = [M.pink, M.butter, M.lilac, M.coral];
  scatter(20, 14, () => rand() > 0.5 ? pineTree(0.75 + rand() * 0.6) : roundTree(0.7 + rand() * 0.5, rand() > 0.5 ? M.leaf : M.leafLight));
  scatter(16, 11, () => bush(0.7 + rand() * 0.8));
  scatter(18, 9, () => flowers(palette[Math.floor(rand() * 4)]));
  scatter(8, 9, () => rock(0.7 + rand() * 0.8));
  scatter(8, 9, () => mushroom(0.8 + rand() * 0.5));
  { const tufts = []; let tries = 0; while (tufts.length < 40 && tries++ < 1500) { const n = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(); if (free(n, 7)) tufts.push(n); } const gg = new THREE.ConeGeometry(0.012, 0.07, 6); gg.translate(0, 0.035, 0); planet.add(instanced(gg, M.leafLight, tufts, R - 0.01, true)); }
  TRAIL.forEach((t) => { addPop(roundTree(0.5, M.leafLight), normalAt(t.lat + 9, t.lon + 16)); addPop(bush(0.6), normalAt(t.lat - 9, t.lon - 15)); });

  // --- Sky: clouds, stars, a sun and a moon that trade places ---
  const clouds = new THREE.Group();
  for (let i = 0; i < 4; i++) { const c = new THREE.Group(); [[0, 0, 0, 0.14], [0.19, 0.02, 0.02, 0.11], [-0.18, 0.01, 0.01, 0.1], [0.05, 0.08, -0.03, 0.09], [-0.07, 0.06, 0.05, 0.08], [0.3, -0.01, 0, 0.07]].forEach(([x, y, z, r]) => c.add(at(sc(ball(r, M.cloud), 1.15, 0.55, 0.8), x, y, z))); placeOn(c, normalAt((rand() - 0.5) * 60 - 10, rand() * 360), R + 0.9); clouds.add(c); }
  scene.add(clouds);
  const sp = []; for (let i = 0; i < 260; i++) { const v = new THREE.Vector3(rand() - 0.5, rand() - 0.3, rand() - 0.5).normalize().multiplyScalar(30); sp.push(v.x, v.y, v.z); }
  const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.13, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  const sp2 = []; for (let i = 0; i < 120; i++) { const v = new THREE.Vector3(rand() - 0.5, rand() - 0.25, rand() - 0.5).normalize().multiplyScalar(30); sp2.push(v.x, v.y, v.z); }
  const starGeo2 = new THREE.BufferGeometry(); starGeo2.setAttribute('position', new THREE.Float32BufferAttribute(sp2, 3));
  const stars2 = new THREE.Points(starGeo2, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(stars, stars2);
  const haloTex = (warm) => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 8, 64, 64, 64); g.addColorStop(0, warm ? 'rgba(255,220,140,0.55)' : 'rgba(220,228,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
  const raysTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.translate(128, 128); for (let i = 0; i < 12; i++) { const g = x.createLinearGradient(0, 0, 0, -128); g.addColorStop(0, 'rgba(255,225,150,0.5)'); g.addColorStop(1, 'rgba(255,225,150,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(-6, 0); x.lineTo(6, 0); x.lineTo(0, -128); x.closePath(); x.fill(); x.rotate(Math.PI / 6); } return new THREE.CanvasTexture(c); })();
  const sun = new THREE.Group(); sun.add(new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), M.sunDisc));
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(true), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.22 })); sunHalo.scale.set(1.9, 1.9, 1); sun.add(sunHalo);
  const rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: raysTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.18 })); rays.scale.set(2.4, 2.4, 1); sun.add(rays); sun.userData.rays = rays;
  sun.position.set(-1.4, 2.05, -2.5); scene.add(sun);
  const skyClouds = new THREE.Group();
  for (let i = 0; i < 3; i++) { const c = new THREE.Group(); [[0, 0, 0, 0.32], [0.34, 0.05, 0, 0.26], [-0.3, 0.03, 0, 0.22], [0.08, 0.17, 0, 0.2], [-0.12, 0.13, 0, 0.17]].forEach(([x, y, z, r]) => c.add(at(sc(ball(r, M.cloud, 10, 8), 1, 0.8, 0.6), x, y, z))); c.position.set(-3.4 + i * 3.1, 1.9 + (i % 2) * 0.55, -3.6 - i * 0.4); c.userData.x0 = c.position.x; c.userData.y0 = c.position.y; skyClouds.add(c); }
  scene.add(skyClouds);
  const moon = new THREE.Group(); moon.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), M.moon)); [[0.06, 0.08, 0.19, 0.05], [-0.09, -0.02, 0.19, 0.04], [0.02, -0.11, 0.18, 0.03]].forEach(([x, y, z, r]) => moon.add(at(sc(ball(r, M.crater, 8, 6), 1, 1, 0.4), x, y, z))); const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(false), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 })); moonHalo.scale.set(1.9, 1.9, 1); moon.add(moonHalo); moon.position.set(1.3, 2.0, -2.5); scene.add(moon);

  // --- Mochi Ed: a round body, a beanie that fits, a face that blinks ---
  const ed = new THREE.Group(), edBody = new THREE.Group(); ed.add(edBody);
  const HEAD = 0.3, HY = 0.31;
  const bodyGeo = new THREE.SphereGeometry(HEAD, 32, 24);
  { const bp = bodyGeo.attributes.position; for (let i = 0; i < bp.count; i++) { const v = new THREE.Vector3().fromBufferAttribute(bp, i); v.y *= 1.06; if (v.y < -0.22) v.y = -0.22 - (v.y + 0.22) * 0.35; bp.setXYZ(i, v.x, v.y, v.z); } bodyGeo.computeVertexNormals(); }
  edBody.add(at(new THREE.Mesh(bodyGeo, M.mochi), 0, HY, 0));
  const eyes = [], lights = [], happyEyes = [];
  [-0.1, 0.1].forEach((x) => { const e = at(ball(0.036, M.ink, 14, 12), x, HY + 0.06, 0.27); e.scale.set(1, 1.4, 0.7); edBody.add(e); eyes.push(e); const hi = at(ball(0.011, M.snow, 8, 6), x + 0.012, HY + 0.085, 0.295); edBody.add(hi); lights.push(hi); const h = at(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 14, Math.PI), M.ink), x, HY + 0.05, 0.275); h.visible = false; edBody.add(h); happyEyes.push(h); });
  [-1, 1].forEach((d) => { const c = at(new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), M.blush), d * 0.19, HY - 0.01, 0.232); c.rotation.y = d * 0.6; edBody.add(c); });
  const smile = at(new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 8, 16, Math.PI), M.ink), 0, HY - 0.02, 0.29); smile.rotation.z = Math.PI; edBody.add(smile);
  const bigSmile = at(sc(new THREE.Mesh(new THREE.CircleGeometry(0.036, 18), M.ink), 1.3, 0.85, 1), 0, HY - 0.04, 0.297); bigSmile.visible = false; edBody.add(bigSmile);
  const ohMouth = at(new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.008, 8, 16), M.ink), 0, HY - 0.035, 0.295); ohMouth.visible = false; edBody.add(ohMouth);
  // A beanie: a soft dome concentric with the head, sitting low with a little
  // slouch above it, a fat folded cuff, two knit rows, a pom-pom, and the E as a
  // small patch on the cuff.
  const cap = new THREE.Group(); cap.position.y = HY;
  const BR = HEAD + 0.018, BY = 1.12, EDGE = D2R(66);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(BR, 32, 18, 0, Math.PI * 2, 0, EDGE), M.ink); dome.scale.set(1, BY, 1); cap.add(dome);
  const edgeY = BR * Math.cos(EDGE) * BY, edgeR = BR * Math.sin(EDGE);
  const cuff = at(new THREE.Mesh(new THREE.TorusGeometry(edgeR - 0.004, 0.03, 10, 44), M.cuff), 0, edgeY, 0); cuff.rotation.x = Math.PI / 2; cap.add(cuff);
  [30, 48].forEach((deg) => { const th = D2R(deg); const row = at(new THREE.Mesh(new THREE.TorusGeometry(BR * Math.sin(th) + 0.003, 0.004, 6, 44), M.cuff), 0, BR * BY * Math.cos(th), 0); row.rotation.x = Math.PI / 2; cap.add(row); });
  { const pom = new THREE.Group(); pom.add(ball(0.062, M.blue, 12, 10)); [[0.04, 0.03, 0.02], [-0.04, 0.025, -0.02], [0.01, -0.03, 0.045], [-0.02, 0.04, -0.035], [0.03, -0.02, -0.04]].forEach(([x, y, z]) => pom.add(at(ball(0.034, M.blue, 8, 6), x, y, z))); pom.position.set(0.02, BR * BY + 0.04, 0); cap.add(pom); }
  const E = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), new THREE.MeshBasicMaterial({ map: textTex('E', '#fff', 256, 256, 210), transparent: true, toneMapped: false, depthWrite: false }));
  E.position.set(0, edgeY, edgeR + 0.027); cap.add(E);
  cap.rotation.x = -0.1; cap.rotation.y = -0.15; cap.rotation.z = 0.07; edBody.add(cap);
  ed.position.set(0, R + 0.01, 0); ed.scale.setScalar(0.76); scene.add(ed);
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 4, 32, 32, 30); g.addColorStop(0, 'rgba(40,30,20,0.32)'); g.addColorStop(1, 'rgba(40,30,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.scale.setScalar(0.74); shadow.position.set(0, R + 0.035, 0.02); scene.add(shadow);

  const pin = new THREE.Group();
  const pinCone = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), M.pin); pinCone.rotation.x = Math.PI; pin.add(pinCone);
  const pinBall = at(new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), M.pin), 0, 0.09, 0); pin.add(pinBall); scene.add(pin);

  // --- Trackball ---
  const q = planet.quaternion;
  const prevQ = new THREE.Quaternion(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), axis = new THREE.Vector3();
  let dragging = false, lastX = 0, lastY = 0, lastT = 0, idleSince = performance.now();
  const spin = { axis: new THREE.Vector3(0, 1, 0), speed: 0 };
  let target = null, arrived = false;
  const DRIFT_AXIS = new THREE.Vector3(0.35, 1, 0.15).normalize();
  const rotateBy = (ax, angle) => { tmpQ.setFromAxisAngle(ax, angle); q.premultiply(tmpQ); };
  const worldNormal = (o) => tmpV.copy(o.userData.normal).applyQuaternion(q);
  const nearestIndex = () => { let best = 0, bd = -2; stops.forEach((l, i) => { const d = worldNormal(l).dot(FRONT); if (d > bd) { bd = d; best = i; } }); return best; };
  const targetFor = (i) => { const n = worldNormal(stops[i]).clone(); return new THREE.Quaternion().setFromUnitVectors(n, FRONT).multiply(q); };
  // Landmarks have a front. When the planet settles on a stop, that stop turns to face the camera.
  const camLocal = new THREE.Vector3(), tangent = new THREE.Vector3(), zDir = new THREE.Vector3(), crossV = new THREE.Vector3(), baseQ = new THREE.Quaternion(), qInv = new THREE.Quaternion();
  const yawToward = (g, qAt) => { const n = g.userData.normal; camLocal.copy(camDir).applyQuaternion(qInv.copy(qAt).invert()); tangent.copy(camLocal).addScaledVector(n, -camLocal.dot(n)); if (tangent.lengthSq() < 1e-6) return g.userData.yaw || 0; tangent.normalize(); baseQ.setFromUnitVectors(UP, n); zDir.set(0, 0, 1).applyQuaternion(baseQ); return Math.atan2(n.dot(crossV.crossVectors(zDir, tangent)), zDir.dot(tangent)); };
  const faceStop = (g) => { g.quaternion.setFromUnitVectors(UP, g.userData.normal); g.rotateY(g.userData.yaw); };
  const settleOn = (i) => { target = targetFor(i); spin.speed = 0; arrived = false; stops[i].userData.yawTarget = yawToward(stops[i], target); };

  let auto = false, autoNextAt = 0;
  const setAuto = (on) => { auto = on; opts.onAuto(on); if (on) { target = null; spin.speed = 0; autoNextAt = performance.now() + 900; } };
  const stopAuto = () => { if (auto) setAuto(false); };

  const pointers = new Map(); let pinchDist = 0, pinchZoom = 1;
  const rollBy = (dx, dy, dt) => { const len = Math.hypot(dx, dy); if (len > 0) { axis.set(dy, dx, 0).normalize(); const angle = len * 0.0065; rotateBy(axis, angle); spin.axis.copy(axis); spin.speed = angle / dt * 16; } };
  const midpoint = () => { const [a, b] = [...pointers.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
  const onDown = (e) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); stage.setPointerCapture(e.pointerId); stopAuto(); target = null; spin.speed = 0; dragging = true; lastT = performance.now(); if (pointers.size === 2) { const m = midpoint(); lastX = m.x; lastY = m.y; pinchDist = m.d; pinchZoom = zoomTarget; } else { lastX = e.clientX; lastY = e.clientY; } };
  const onMove = (e) => { if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); const now = performance.now(), dt = Math.max(now - lastT, 1); if (pointers.size === 2) { const m = midpoint(); rollBy(m.x - lastX, m.y - lastY, dt); if (pinchDist > 0) setZoom(pinchZoom * (pinchDist / m.d)); lastX = m.x; lastY = m.y; } else if (pointers.size === 1) { rollBy(e.clientX - lastX, e.clientY - lastY, dt); lastX = e.clientX; lastY = e.clientY; } lastT = now; idleSince = now; };
  const onUp = (e) => { pointers.delete(e.pointerId); if (pointers.size === 1) { const [p] = [...pointers.values()]; lastX = p.x; lastY = p.y; spin.speed = 0; return; } if (pointers.size === 0) { dragging = false; idleSince = performance.now(); if (reduced) settleOn(nearestIndex()); } };
  const onWheel = (e) => { e.preventDefault(); stopAuto(); if (e.ctrlKey || e.metaKey) { setZoom(zoomTarget * (1 + e.deltaY * 0.0025)); return; } axis.set(e.deltaY, e.deltaX, 0); const len = axis.length(); if (!len) return; axis.normalize(); rotateBy(axis, len * 0.0028); target = null; spin.speed = 0; idleSince = performance.now(); };
  const step = (dir) => { stopAuto(); settleOn((nearestIndex() + dir + N) % N); idleSince = performance.now(); };
  const onKey = (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); } else if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(zoomTarget / 1.2); } else if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(zoomTarget * 1.2); } };
  stage.addEventListener('pointerdown', onDown); stage.addEventListener('pointermove', onMove); stage.addEventListener('pointerup', onUp); stage.addEventListener('pointercancel', onUp);
  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('keydown', onKey);
  { const n = stops[N - 1].userData.normal; q.setFromUnitVectors(n, FRONT); }
  stops.forEach((g) => { g.userData.yaw = g.userData.yawTarget = yawToward(g, q); faceStop(g); });

  // --- Day and night: the widget decides, the scene blends ---
  let night = opts.night ? 1 : 0, nightTarget = night;
  paintSky(night);
  const setNight = (on) => { nightTarget = on ? 1 : 0; };

  let shown = -1;
  const showStop = (i) => { if (i === shown) return; shown = i; opts.onStop(i); };

  const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  const cafeU = new THREE.Vector3().crossVectors(CAFE, UP).normalize(), cafeV = new THREE.Vector3().crossVectors(CAFE, cafeU).normalize(), poodleInv = new THREE.Quaternion();
  const onLoop = (a, r) => CAFE.clone().multiplyScalar(Math.cos(r)).addScaledVector(cafeU, Math.sin(r) * Math.cos(a)).addScaledVector(cafeV, Math.sin(r) * Math.sin(a)).normalize();
  const walkPoodle = (p, t) => { const a = t * 0.0011 + p.userData.phase, r = D2R(10), n = onLoop(a, r), n2 = onLoop(a + 0.02, r); p.position.copy(n).multiplyScalar(R - 0.01); p.quaternion.setFromUnitVectors(UP, n); const fwd = n2.sub(n).normalize().applyQuaternion(poodleInv.copy(p.quaternion).invert()); p.rotateY(Math.atan2(-fwd.z, fwd.x)); p.position.addScaledVector(n, Math.abs(Math.sin(t * 0.012 + p.userData.phase)) * 0.008); p.userData.normal.copy(n); p.userData.legs.forEach((l) => { l.rotation.z = Math.sin(t * 0.012 + p.userData.phase + l.userData.phase) * 0.55; }); };

  // --- Ed's walk: steady cadence, nudged by speed, never frantic ---
  const groundVel = new THREE.Vector3(), leanAxis = new THREE.Vector3(), leanQ = new THREE.Quaternion(), IDENTITY = new THREE.Quaternion(), invQ = new THREE.Quaternion();
  let stride = 0, moving = 0, hopImpulse = 0, hopV = 0;
  // --- Face: blinks and the occasional expression ---
  let face = 'normal', faceUntil = 0, nextBlink = performance.now() + 2500, blinkUntil = 0, nextSurprise = performance.now() + 9000;
  const setFace = (f, ms, now) => { face = f; faceUntil = now + ms; };
  const applyFace = (now) => {
    const blinking = now < blinkUntil, happy = face === 'happy';
    eyes.forEach((e) => { e.visible = !happy; e.scale.y = blinking ? 0.12 : 1.4; });
    lights.forEach((l) => { l.visible = !happy && !blinking; });
    happyEyes.forEach((h) => { h.visible = happy; });
    smile.visible = face === 'normal'; bigSmile.visible = happy; ohMouth.visible = face === 'surprised';
  };

  const pinPos = new THREE.Vector3();
  let last = performance.now(), raf = 0, disposed = false;
  const tick = (now) => {
    if (disposed) return;
    // Floored: a 120Hz device with a coarse timer can hand two frames the same
    // timestamp, and a zero frame-time turned ground speed into 0/0 = NaN, which
    // poisoned the walk and erased Ed.
    const dt = Math.min(Math.max((now - last) / 16.67, 0.05), 3), dtMs = dt * 16.67; last = now;
    const idle = now - idleSince;
    prevQ.copy(q);
    zoom += (zoomTarget - zoom) * (reduced ? 1 : Math.min(1, 0.16 * dt)); updateCamera();

    if (!dragging) {
      if (target) { q.slerp(target, reduced ? 1 : Math.min(1, 0.1 * dt)); if (q.angleTo(target) < 0.002) { q.copy(target); target = null; if (!arrived) { arrived = true; hopImpulse = reduced ? 0 : 0.04; setFace('happy', 1300, now); if (auto) autoNextAt = now + 2600; } } }
      else if (auto) { if (now >= autoNextAt) settleOn((shown + 1) % N); }
      else if (spin.speed > 0.0008) { rotateBy(spin.axis, spin.speed * dt); spin.speed *= Math.pow(0.93, dt); }
      else if (idle < 3200 && !reduced) { const i = nearestIndex(); if (worldNormal(stops[i]).angleTo(FRONT) > 0.02) settleOn(i); }
      else if (!reduced) { rotateBy(DRIFT_AXIS, 0.0022 * dt); }
    }

    tmpQ.copy(q).multiply(invQ.copy(prevQ).invert());
    const ang = 2 * Math.acos(Math.min(1, Math.abs(tmpQ.w)));
    if (ang > 1e-5) { const s = Math.sqrt(1 - tmpQ.w * tmpQ.w) || 1; axis.set(tmpQ.x / s, tmpQ.y / s, tmpQ.z / s); groundVel.crossVectors(axis, UP).multiplyScalar(ang * R * (tmpQ.w < 0 ? -1 : 1)); } else groundVel.set(0, 0, 0);
    const speed = groundVel.length() / dt;

    if (!reduced) {
      // the slow idle drift moves the ground at ~0.0034/frame; walking only starts well above that
      if (!Number.isFinite(stride)) stride = 0;
      if (!Number.isFinite(hopV)) hopV = 0;
      moving += ((speed > 0.007 ? 1 : 0) - moving) * Math.min(1, 0.14 * dt);
      stride += dtMs * 0.0085 * (1 + Math.min(0.5, speed * 12)) * Math.max(moving, 0.001);
      const hop = Math.abs(Math.sin(stride)) * 0.038 * moving;
      hopV += hopImpulse - hopV * 0.12; hopImpulse = 0; hopV *= 0.9;
      const liftY = hop + Math.max(0, hopV) * 1.6;
      const breathe = 1 + Math.sin(now * 0.0028) * 0.02;
      const squash = 1 - 0.09 * moving * (1 - Math.abs(Math.sin(stride))) + liftY * 0.8;
      edBody.position.y = liftY; edBody.scale.set(breathe / Math.sqrt(squash), squash * breathe, breathe / Math.sqrt(squash));
      if (speed > 1e-5) { leanAxis.crossVectors(UP, groundVel).negate().normalize(); leanQ.setFromAxisAngle(leanAxis, Math.min(0.16, speed * 2.2)); ed.quaternion.slerp(leanQ, 0.3); } else ed.quaternion.slerp(IDENTITY, 0.12);
      cafeObj.userData.steam.forEach((s, i) => { s.position.y = 0.33 + ((now * 0.0006 + i * 0.33) % 1) * 0.1; s.position.x = 0.2 + Math.sin(now * 0.003 + i) * 0.012; });
      cafeObj.userData.smoke.forEach((s, i) => { const k = (now * 0.00035 + i * 0.5) % 1; s.position.y = 0.3 + k * 0.16; s.position.x = -0.1 + Math.sin(k * 6 + i) * 0.02; s.scale.setScalar(0.7 + k * 0.6); });
      poodles.forEach((p) => walkPoodle(p, now));
      if (now >= nextBlink) { blinkUntil = now + 130; nextBlink = now + 2600 + Math.random() * 3200; if (Math.random() < 0.2) nextBlink = now + 330; }
      if (face !== 'normal' && now > faceUntil) face = 'normal';
      if (face === 'normal' && now >= nextSurprise) { setFace('surprised', 900, now); nextSurprise = now + 8000 + Math.random() * 7000; }
      applyFace(now);
    } else { applyFace(now); }
    clouds.rotation.y = -now * 0.00006;
    if (!reduced) for (const g of animated) if (g.visible) g.userData.anim(now, night);

    // Day to night
    night += (nightTarget - night) * (reduced ? 1 : Math.min(1, 0.045 * dt));
    hemi.color.lerpColors(DAY.hemiSky, NIGHT.hemiSky, night); hemi.groundColor.lerpColors(DAY.hemiGround, NIGHT.hemiGround, night); hemi.intensity = lerp(1.0, 0.5, night);
    sunLight.color.lerpColors(DAY.sun, NIGHT.sun, night); sunLight.intensity = lerp(1.15, 0.42, night);
    M.cloud.color.lerpColors(DAY.cloud, NIGHT.cloud, night);
    M.lamp.emissiveIntensity = lerp(0.35, 1.15, night);
    const tw = reduced ? 0.5 : Math.sin(now * 0.0016) * 0.5 + 0.5;
    stars.material.opacity = night * (0.55 + tw * 0.35); stars.visible = night > 0.02;
    stars2.material.opacity = night * (0.9 - tw * 0.4); stars2.visible = night > 0.02;
    if (!reduced) {
      sun.userData.rays.material.rotation = now * 0.00012;
      sunHalo.material.opacity = 0.2 + Math.sin(now * 0.0011) * 0.05; sunHalo.scale.setScalar(1.9 + Math.sin(now * 0.0009) * 0.1);
      moonHalo.material.opacity = 0.6 + Math.sin(now * 0.0008) * 0.18; moonHalo.scale.setScalar(1.9 + Math.sin(now * 0.0007) * 0.15);
      skyClouds.children.forEach((c, i) => { c.position.x = c.userData.x0 + Math.sin(now * 0.00014 + i * 2) * 0.5; c.position.y = c.userData.y0 + Math.sin(now * 0.00021 + i) * 0.06; });
    }
    if (Math.abs(night - skyPainted) > 0.004) paintSky(night);
    sun.scale.setScalar(Math.max(0.001, 1 - night)); sun.visible = night < 0.98;
    moon.scale.setScalar(Math.max(0.001, night)); moon.visible = night > 0.02;

    for (const g of stops) { const d = Math.atan2(Math.sin(g.userData.yawTarget - g.userData.yaw), Math.cos(g.userData.yawTarget - g.userData.yaw)); if (Math.abs(d) > 1e-4) { g.userData.yaw += d * (reduced ? 1 : Math.min(1, 0.1 * dt)); faceStop(g); } }
    for (const o of popups) { const vis = worldNormal(o).dot(camDir) > 0.1 ? 1 : 0; const s = o.userData.spring; if (reduced) s.s = vis; else { s.v += (vis - s.s) * 0.16 * dt; s.v *= Math.pow(0.74, dt); s.s += s.v * dt; } const k = Math.max(0.0001, s.s); o.scale.setScalar(k); o.visible = k > 0.01; }

    const active = nearestIndex(); showStop(active);
    for (let i = 0; i < glows.length; i++) { const g = glows[i], on = i === active, pulse = reduced ? 0 : Math.sin(now * 0.0025 + g.userData.phase) * 0.5 + 0.5; g.userData.ring.material.opacity = on ? 0.85 : 0.32 + pulse * 0.18; g.userData.disc.material.opacity = on ? 0.62 + pulse * 0.18 : 0.22 + pulse * 0.1; const k = on ? 1.06 + pulse * 0.08 : 0.94 + pulse * 0.06; g.scale.set(k, 1, k); }
    worldNormal(stops[active]); pinPos.copy(tmpV).multiplyScalar(R + 0.46 + (reduced ? 0 : Math.sin(now * 0.004) * 0.03)); pin.position.lerp(pinPos, reduced ? 1 : Math.min(1, 0.14 * dt)); pin.quaternion.setFromUnitVectors(UP, tmpV);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp);
    stage.removeEventListener('wheel', onWheel); stage.removeEventListener('keydown', onKey);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      mats.forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === stage) stage.removeChild(renderer.domElement);
  };

  return {
    step,
    setAuto: (on) => setAuto(on),
    toggleAuto: () => setAuto(!auto),
    zoomIn: () => setZoom(zoomTarget / 1.25),
    zoomOut: () => setZoom(zoomTarget * 1.25),
    setNight,
    dispose,
  };
}
