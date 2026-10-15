import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// The EC monogram from the favicon, extruded into glossy glass-like letters.
// It assembles on load, floats, tilts toward the pointer with a light that
// follows it, and spins the C on click. Reduced motion gets a still pose.
//
// Plain Three.js (r128) behind a small control surface, like the widget scenes:
// the React shell mounts it into a sized element and calls dispose() on unmount.

// Vertex colours are read as linear, so convert the brand hexes first.
const SKY = new THREE.Color('#38bdf8').convertSRGBToLinear();
const BLUE = new THREE.Color('#2563eb').convertSRGBToLinear();
const VIOLET = new THREE.Color('#7c3aed').convertSRGBToLinear();

function eShape() {
  const s = new THREE.Shape();
  const pts = [
    [-1.5, -1], [-0.32, -1], [-0.32, -0.62], [-1.1, -0.62], [-1.1, -0.19], [-0.5, -0.19],
    [-0.5, 0.19], [-1.1, 0.19], [-1.1, 0.62], [-0.32, 0.62], [-0.32, 1], [-1.5, 1],
  ];
  s.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  s.closePath();
  return s;
}

function cShape() {
  const s = new THREE.Shape();
  const R = 1, r = 0.62, gap = THREE.MathUtils.degToRad(42);
  s.absarc(0, 0, R, gap, Math.PI * 2 - gap, false);
  s.absarc(0, 0, r, Math.PI * 2 - gap, gap, true);
  s.closePath();
  return s;
}

// Diagonal sky → blue → violet, top-left to bottom-right, as in the favicon.
function paint(geometry, offsetX) {
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + offsetX, y = pos.getY(i);
    const u = THREE.MathUtils.clamp((x * 0.55 - y * 0.75 + 1.4) / 2.8, 0, 1);
    if (u < 0.5) c.copy(SKY).lerp(BLUE, u / 0.5);
    else c.copy(BLUE).lerp(VIOLET, (u - 0.5) / 0.5);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
// Damped spring step toward target, framerate independent.
const approach = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

/**
 * @param {HTMLElement} stage sized element that receives the canvas
 * @param {{ reducedMotion?: boolean }} [opts]
 */
export function createEcLogo(stage, opts = {}) {
  const reduced = opts.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 7.4);

  const material = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    metalness: 0.2,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 0.55,
  });

  const extrude = { depth: 0.34, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.055, bevelSegments: 8, curveSegments: 64 };
  const eGeo = new THREE.ExtrudeGeometry(eShape(), extrude);
  const cGeo = new THREE.ExtrudeGeometry(cShape(), extrude);
  eGeo.translate(0, 0, -0.17);
  cGeo.translate(0, 0, -0.17);
  const C_X = 0.62;
  paint(eGeo, 0);
  paint(cGeo, C_X);

  const logo = new THREE.Group();
  const eMesh = new THREE.Mesh(eGeo, material);
  const cPivot = new THREE.Group();
  const cMesh = new THREE.Mesh(cGeo, material);
  cPivot.position.set(C_X, 0, 0.16);
  cPivot.add(cMesh);
  logo.add(eMesh, cPivot);
  logo.position.x = 0.22;
  scene.add(logo);

  // Key, fill and a pointer-following light for the specular sweep.
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(-3, 4, 5);
  const rim = new THREE.DirectionalLight(0xa78bfa, 1.4);
  rim.position.set(4, -2, -3);
  const sweep = new THREE.PointLight(0xe0f2fe, 1.6, 12, 2);
  sweep.position.set(0, 0, 3.2);
  scene.add(key, rim, sweep, new THREE.AmbientLight(0xffffff, 0.15));

  // ---- sizing ----
  const resize = () => {
    const w = stage.clientWidth || 1, h = stage.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the monogram fully in frame whatever the aspect
    camera.position.z = 7.4 * Math.max(1, 1.35 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  // ---- input ----
  const pointer = { x: 0, y: 0, active: false };
  const onMove = (e) => {
    const r = stage.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.5, 1.5);
    pointer.y = THREE.MathUtils.clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1.5, 1.5);
    pointer.active = true;
  };
  let spinAt = -Infinity;
  const onClick = () => { spinAt = clock.elapsedTime; };
  window.addEventListener('pointermove', onMove, { passive: true });
  stage.addEventListener('click', onClick);

  // ---- loop, paused offscreen and in background tabs ----
  const clock = new THREE.Clock();
  let raf = 0, visible = true;
  const tilt = { x: 0, y: 0 };
  const sweepPos = new THREE.Vector2(0, 0);

  const frame = () => {
    raf = 0;
    const dt = Math.min(clock.getDelta(), 1 / 20);
    const t = clock.elapsedTime;

    // intro: E slides in from the left, C swings in from the right and lands in front
    const intro = reduced ? 1 : easeOutExpo(Math.min(1, t / 1.6));
    const introC = reduced ? 1 : easeOutExpo(THREE.MathUtils.clamp((t - 0.18) / 1.6, 0, 1));
    eMesh.position.x = (1 - intro) * -1.4;
    eMesh.rotation.y = (1 - intro) * -1.1;
    cPivot.position.x = C_X + (1 - introC) * 1.6;
    cPivot.position.z = 0.16 + (1 - introC) * -1.2;

    // idle float and a slow breath
    const floatY = reduced ? 0 : Math.sin(t * 1.1) * 0.06;
    const breath = reduced ? 0 : Math.sin(t * 0.6) * 0.1;
    logo.position.y = floatY;

    // pointer tilt with a damped follow
    const tx = pointer.active && !reduced ? pointer.y * -0.28 : 0;
    const ty = pointer.active && !reduced ? pointer.x * 0.42 : 0;
    tilt.x = approach(tilt.x, tx, 6, dt);
    tilt.y = approach(tilt.y, ty, 6, dt);
    logo.rotation.x = tilt.x + (reduced ? 0 : Math.sin(t * 0.8) * 0.04);
    logo.rotation.y = tilt.y + breath - 0.18;

    // the sweep light trails the pointer, or drifts on its own
    const sx = pointer.active ? pointer.x * 2.6 : Math.sin(t * 0.7) * 2.2;
    const sy = pointer.active ? pointer.y * 1.6 : Math.cos(t * 0.5) * 0.8;
    sweepPos.set(approach(sweepPos.x, sx, 4, dt), approach(sweepPos.y, sy, 4, dt));
    sweep.position.set(sweepPos.x, sweepPos.y, 3.2);

    // click: the C does a full turn with a little overshoot, the E nods
    const s = (t - spinAt) / 1.1;
    if (s >= 0 && s < 1 && !reduced) {
      const k = easeOutExpo(s);
      cMesh.rotation.y = k * Math.PI * 2;
      eMesh.position.y = Math.sin(Math.min(1, s * 2.2) * Math.PI) * 0.12;
    } else {
      cMesh.rotation.y = 0;
      eMesh.position.y = 0;
    }

    renderer.render(scene, camera);
    if (visible && !document.hidden && !(reduced && t > 0.1 && s >= 1 && !pointer.active)) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf) { clock.getDelta(); raf = requestAnimationFrame(frame); } };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); });
  io.observe(stage);
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener('visibilitychange', onVis);
  // a reduced-motion pose still answers the pointer with a single redraw
  if (reduced) window.addEventListener('pointermove', start, { passive: true });
  start();

  return {
    spin: onClick,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', start);
      stage.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVis);
      eGeo.dispose(); cGeo.dispose(); material.dispose(); envTex.dispose(); pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
