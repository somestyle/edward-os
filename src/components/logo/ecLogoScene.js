import * as THREE from 'three';

// The EC monogram from the favicon as a thin die-cut sticker. Foil letters sit on
// a white vinyl backing, and a glare streak slides across the surface as the
// sticker tilts toward the pointer. Motion is deliberately small: a slow drift
// on its own, a gentle tilt with the cursor, a single glare sweep on click.
//
// variant 'sticker' (default) has the vinyl backing; 'chrome' is the letters
// alone in brushed metal. Plain Three.js (r128); the React shell mounts it into
// a sized element and calls dispose() on unmount.

// Logo geometry in logo units: E spans x -1.5..-0.32, the C ring is centred at
// x 0.62 with radii 1 and 0.62, and both run y -1..1.
const PAD = 0.32;
const X0 = -1.5 - PAD, X1 = 1.62 + PAD, Y0 = -1 - PAD, Y1 = 1 + PAD;
const TEX_W = 1024;
const SCALE = TEX_W / (X1 - X0);
const TEX_H = Math.round((Y1 - Y0) * SCALE);

function traceEC(ctx) {
  const px = (x) => (x - X0) * SCALE, py = (y) => (Y1 - y) * SCALE;
  ctx.beginPath();
  const e = [[-1.5, -1], [-0.32, -1], [-0.32, -0.62], [-1.1, -0.62], [-1.1, -0.19], [-0.5, -0.19],
    [-0.5, 0.19], [-1.1, 0.19], [-1.1, 0.62], [-0.32, 0.62], [-0.32, 1], [-1.5, 1]];
  ctx.moveTo(px(e[0][0]), py(e[0][1]));
  e.slice(1).forEach(([x, y]) => ctx.lineTo(px(x), py(y)));
  ctx.closePath();
  const gap = THREE.MathUtils.degToRad(42), cx = px(0.62), cy = py(0);
  ctx.moveTo(cx + Math.cos(-gap) * SCALE, cy + Math.sin(-gap) * SCALE);
  ctx.arc(cx, cy, SCALE, -gap, gap, true);
  ctx.arc(cx, cy, 0.62 * SCALE, gap, -gap, false);
  ctx.closePath();
}

// One RGBA texture: R = letters, G = sticker backing (letters grown outward with
// the small notches closed, like a die-cut), B = soft shadow of whatever is opaque.
function buildMask(variant) {
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const letters = canvas(TEX_W, TEX_H);
  const lc = letters.getContext('2d');
  lc.fillStyle = '#fff';
  traceEC(lc);
  lc.fill('nonzero');

  const grow = canvas(TEX_W, TEX_H);
  const gc = grow.getContext('2d');
  gc.filter = `blur(${Math.round(SCALE * 0.1)}px)`;
  gc.drawImage(letters, 0, 0);
  const g = gc.getImageData(0, 0, TEX_W, TEX_H).data;
  const backing = canvas(TEX_W, TEX_H);
  const bc = backing.getContext('2d');
  const bd = bc.createImageData(TEX_W, TEX_H);
  for (let i = 3; i < g.length; i += 4) {
    const a = THREE.MathUtils.smoothstep(g[i], 22, 40) * 255;
    bd.data[i - 3] = bd.data[i - 2] = bd.data[i - 1] = 255; bd.data[i] = a;
  }
  bc.putImageData(bd, 0, 0);

  const shadow = canvas(TEX_W, TEX_H);
  const sc = shadow.getContext('2d');
  sc.filter = `blur(${Math.round(SCALE * 0.07)}px)`;
  sc.drawImage(variant === 'chrome' ? letters : backing, 0, 0);

  const out = canvas(TEX_W, TEX_H);
  const oc = out.getContext('2d');
  const od = oc.createImageData(TEX_W, TEX_H);
  const L = lc.getImageData(0, 0, TEX_W, TEX_H).data;
  const S = bc.getImageData(0, 0, TEX_W, TEX_H).data;
  const H = sc.getImageData(0, 0, TEX_W, TEX_H).data;
  for (let i = 0; i < od.data.length; i += 4) {
    od.data[i] = L[i + 3]; od.data[i + 1] = S[i + 3]; od.data[i + 2] = H[i + 3]; od.data[i + 3] = 255;
  }
  oc.putImageData(od, 0, 0);
  const tex = new THREE.CanvasTexture(out);
  tex.anisotropy = 4;
  return tex;
}

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const stickerShader = /* glsl */`
  uniform sampler2D map;
  uniform float glare;   // position of the glare streak across the sticker
  uniform float tiltX;   // forward/back tilt, shifts the chrome's reflected horizon
  uniform float chrome;  // 0 sticker, 1 chrome
  uniform float fade;
  varying vec2 vUv;

  vec3 brand(vec2 uv) {
    float u = clamp(uv.x * 0.7 - (uv.y - 0.5) * 0.9 + 0.12, 0.0, 1.0);
    vec3 sky = vec3(0.220, 0.741, 0.973), blue = vec3(0.145, 0.388, 0.922), violet = vec3(0.486, 0.227, 0.929);
    return u < 0.5 ? mix(sky, blue, u / 0.5) : mix(blue, violet, (u - 0.5) / 0.5);
  }

  void main() {
    vec4 m = texture2D(map, vUv);
    float letters = m.r;
    float backing = mix(m.g, letters, chrome);
    if (backing < 0.004) discard;

    // distance along the glare's diagonal
    float d = dot(vUv - 0.5, normalize(vec2(1.0, 0.55)));
    float streak = exp(-pow((d - glare) / 0.075, 2.0)) + 0.45 * exp(-pow((d - glare - 0.2) / 0.03, 2.0));

    vec3 tint = brand(vUv);
    vec3 foil;
    if (chrome < 0.5) {
      // metallic foil: the brand gradient, brighter toward the light, with a faint
      // holographic shift riding the glare
      foil = tint * (0.82 + 0.3 * smoothstep(0.35, -0.35, d - glare));
      vec3 holo = 0.5 + 0.5 * cos(6.2831 * (d * 1.6 - glare + vec3(0.0, 0.33, 0.67)));
      foil = mix(foil, foil + holo * 0.22, streak);
    } else {
      // brushed chrome tinted with the brand gradient; the horizon moves with tilt
      // a studio reflection: bright sky above a dark horizon line, which slides
      // with tilt
      float y = (vUv.y - 0.5) - tiltX * 0.9;
      float sky = smoothstep(-0.04, 0.22, y);
      float band = exp(-pow((y + 0.06) / 0.05, 2.0));
      vec3 steel = mix(vec3(0.36, 0.39, 0.46), vec3(0.96, 0.97, 0.99), sky);
      steel = mix(steel, vec3(0.10, 0.11, 0.14), band * 0.85);
      foil = mix(steel, tint, 0.3);
    }

    // white vinyl, a touch darker toward its cut edge so it reads on a light page
    vec3 vinyl = vec3(0.985, 0.985, 0.98) * mix(0.82, 1.0, smoothstep(0.35, 1.0, m.g));
    vec3 col = mix(vinyl, foil, letters);
    col += streak * mix(0.28, 0.85, letters);
    gl_FragColor = vec4(col, backing * fade);
  }
`;

const shadowShader = /* glsl */`
  uniform sampler2D map;
  uniform float strength;
  varying vec2 vUv;
  void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, texture2D(map, vUv).b * strength); }
`;

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const approach = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

/**
 * @param {HTMLElement} stage sized element that receives the canvas
 * @param {{ variant?: 'sticker' | 'chrome', dark?: boolean, reducedMotion?: boolean }} [opts]
 */
export function createEcLogo(stage, opts = {}) {
  const reduced = opts.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isChrome = opts.variant === 'chrome';

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

  const tex = buildMask(opts.variant);
  const w = X1 - X0, h = Y1 - Y0;
  const geo = new THREE.PlaneGeometry(w, h);
  const uniforms = { map: { value: tex }, glare: { value: -0.4 }, tiltX: { value: 0 }, chrome: { value: isChrome ? 1 : 0 }, fade: { value: 0 } };
  const sticker = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: stickerShader, transparent: true }));
  const shadowUniforms = { map: { value: tex }, strength: { value: 0 } };
  const shadow = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: shadowUniforms, vertexShader, fragmentShader: shadowShader, transparent: true, depthWrite: false }));
  shadow.position.z = -0.12;
  const card = new THREE.Group();
  card.add(shadow, sticker);
  scene.add(card);

  const resize = () => {
    const cw = stage.clientWidth || 1, ch = stage.clientHeight || 1;
    renderer.setSize(cw, ch, false);
    camera.aspect = cw / ch;
    // frame the sticker with a little room to tilt
    const fitH = h * 1.12, fitW = w * 1.12;
    const dist = Math.max(fitH, fitW / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.set(0, 0, dist);
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  const pointer = { x: 0, y: 0, active: false };
  const onMove = (e) => {
    const r = stage.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / Math.max(window.innerWidth / 2, 1)), -1, 1);
    pointer.y = THREE.MathUtils.clamp(-((e.clientY - (r.top + r.height / 2)) / Math.max(window.innerHeight / 2, 1)), -1, 1);
    pointer.active = true;
  };
  let sweepAt = -Infinity;
  const clock = new THREE.Clock();
  const onClick = () => { sweepAt = clock.elapsedTime; };
  window.addEventListener('pointermove', onMove, { passive: true });
  stage.addEventListener('click', onClick);

  let raf = 0, visible = true;
  const tilt = { x: 0, y: 0 };
  // the site puts its 'dark' class on the app root, so read it from the stage up
  const isDark = () => opts.dark ?? Boolean(stage.closest('.dark'));

  const frame = () => {
    raf = 0;
    const dt = Math.min(clock.getDelta(), 1 / 20);
    const t = clock.elapsedTime;

    // placed like a sticker: fades in and settles a few pixels
    const intro = reduced ? 1 : easeOutExpo(Math.min(1, t / 0.9));
    uniforms.fade.value = intro;
    card.position.y = (1 - intro) * 0.12;
    card.scale.setScalar(0.97 + 0.03 * intro);

    // small tilt: the cursor, or a slow drift when nobody is moving it
    const driftX = reduced ? 0 : Math.sin(t * 0.45) * 0.05;
    const driftY = reduced ? 0 : Math.sin(t * 0.32 + 1.2) * 0.09;
    const tx = (pointer.active && !reduced ? pointer.y * -0.16 : 0) + driftX;
    const ty = (pointer.active && !reduced ? pointer.x * 0.24 : 0) + driftY;
    tilt.x = approach(tilt.x, tx, 5, dt);
    tilt.y = approach(tilt.y, ty, 5, dt);
    card.rotation.set(tilt.x, tilt.y, -0.035);

    // the glare tracks the tilt; a click sends one sweep across
    let g = tilt.y * 2.6 - tilt.x * 1.8;
    const s = (t - sweepAt) / 0.9;
    if (s >= 0 && s < 1 && !reduced) g = THREE.MathUtils.lerp(-0.9, 0.9, easeOutExpo(s));
    uniforms.glare.value = g;
    uniforms.tiltX.value = tilt.x;

    // a lifted sticker casts a little more shadow, offset away from the light
    shadowUniforms.strength.value = (isDark() ? 0.55 : 0.16) * intro;
    shadow.position.set(0.05 + tilt.y * 0.25, -0.07 - tilt.x * 0.25, -0.12);

    renderer.render(scene, camera);
    if (visible && !document.hidden && !(reduced && t > 0.1 && !pointer.active)) raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf) { clock.getDelta(); raf = requestAnimationFrame(frame); } };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); });
  io.observe(stage);
  const onVis = () => { if (!document.hidden) start(); };
  document.addEventListener('visibilitychange', onVis);
  start();

  return {
    sweep: onClick,
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      stage.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVis);
      geo.dispose(); tex.dispose();
      sticker.material.dispose(); shadow.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
