// FILM MODE: Anusha's résumé as a cinematic title sequence in extruded gold, one card after another.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { makeProp } from './props.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const expoOut = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x, 0, 1));
const backOut = x => { x = clamp(x, 0, 1); const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* ---------- the script: every line of the résumé, in order ---------- */
const S = (sec, head, roman) => ({ kind: 'title', sec, head, sub: roman });
const I = (sec, head, sub, det = '') => ({ kind: 'item', sec, head, sub, det });
const CARDS = [
  { kind: 'intro', sec: '', head: 'ANUSHA KARWA', sub: 'Computer Science Engineer · Startup Builder', det: 'Pune, India' },
  S('Education', 'EDUCATION', 'Chapter I'),
  I('Education', 'PGP STARTUP LEADERSHIP', 'Mesa School of Business', 'Ongoing · full time'),
  I('Education', 'B.TECH COMPUTER SCIENCE', "MKSSS's CCOEW, Pune", 'CGPA 8.40 · 2025'),
  I('Education', 'XII 92.5%  ·  X 95.2%', 'Late P Jog College of Science · Jnana Prabodhini Prashala', 'HSC 2021 · CBSE 2019'),
  S('Experience', 'EXPERIENCE', 'Chapter II'),
  I('Experience', 'MASTERCARD', 'Core Payment Services · Jun 2025 – Aug 2026', 'Mission-critical payment infrastructure · high-volume transactions & risk analytics · data pipelines for decisions · end-to-end testing'),
  I('Experience', 'IBM', 'Project Intern · Aug – Dec 2024', 'Scalable PII detection for PDFs, images & documents · EasyOCR + Microsoft Presidio · 94% accuracy · compliance-ready reports'),
  I('Experience', 'MASTERCARD', 'Summer Intern · May – Jul 2024', 'Real-time risk data export · Keystone.js + MongoDB · production in 2 months · containerized testing · 96% reliability'),
  S('Leadership', 'LEADERSHIP', 'Chapter III'),
  I('Leadership', 'E-CELL  ·  PR HEAD', 'Entrepreneurship Club · Aug – Dec 2024', '10-member PR team · 15+ brand partnerships worth ₹1L+ · Shark Tank speakers · TiE mentorship · 10+ clubs · Pune founder meetup'),
  I('Leadership', 'E-CELL  ·  PR MEMBER', 'On-ground outreach', '30+ startups, brands & founders pitched · cold calls & vendor visits · 5+ events · 500+ students reached'),
  I('Leadership', 'DEBATE CLUB', 'Graphics Head & Member · Aug – Dec 2024', '+40% registrations · 5 campaigns · 5,000+ post reach · 20+ creatives in Canva & Photoshop · 300+ participants'),
  S('Projects', 'PROJECTS', 'Chapter IV'),
  I('Projects', 'NYAYA-VAANI', 'AI legal assistant · Smart India Hackathon 2024', 'RAG + NLP for real-time legal insights'),
  I('Projects', 'LAPTOP PRICE PREDICTION', 'Machine learning', 'Decision tree + regression · 1,000+ laptops · 92% accuracy'),
  I('Projects', 'GROCERY AT YOUR FINGERTIPS', 'Java · JSP · MySQL', 'Real-time delivery platform · 100+ products · order tracking · responsive UI'),
  I('Projects', 'TOUR ME', 'Trip management system · MySQL', '10+ itineraries · automated bookings, cost estimates & planning'),
  I('Projects', 'ONLINE SHOPPING', 'Java e-commerce prototype', '50+ products · queues, stacks & doubly linked lists for multi-user orders'),
  I('Projects', 'MYSTERY ROOMS', 'UI/UX demo website', 'Escape-room booking platform · 10+ pages · navigation & conversion'),
  I('Projects', 'PAPYRO', 'Japanese stationery & toys · brand site', '4+ categories · Instagram reach 5,000+ accounts · 4 global influencers'),
  S('Achievements', 'ACHIEVEMENTS', 'Chapter V'),
  I('Achievements', '1ST  ·  TiE', 'Business Hackathon', 'Startup expansion strategies & brand growth frameworks'),
  I('Achievements', '1ST', "Engineer's Monopoly", 'Design, analytics & rapid problem-solving'),
  I('Achievements', 'AIR 8', 'NCAT', 'Bronze, Homi Bhabha Science Exam · PRMO qualified · Maharashtra State Scholarship ranker'),
  I('Achievements', '250+', 'Student magazines sold', 'First lesson in sales · District badminton champion, state-level player'),
  S('Certifications', 'CERTIFICATIONS', 'Chapter VI'),
  I('Certifications', '2,000+', 'Problems solved on CodeChef', 'Strong foundation in data structures & algorithms'),
  I('Certifications', 'ALWAYS LEARNING', 'Amazon ML Summer School 2023 · Google Android Compose Camp (24 badges)', 'Google Foundations of Cybersecurity · IBM Design Thinking · Python & Java, Coding Ninjas'),
  S('Skills', 'SKILLS', 'Chapter VII'),
  I('Skills', 'TECHNICAL', 'Java · Python · DSA · Machine Learning · RAG + NLP', 'MySQL · MongoDB · Keystone.js · JSP · EasyOCR · Presidio'),
  I('Skills', 'BUSINESS', 'Partnerships · Sponsorship · PR · Sales', 'Brand marketing · Canva · Photoshop'),
  I('Skills', 'SOFT SKILLS', 'First-principles thinking · Data-driven decisions', 'Execution · Stakeholder communication & leadership'),
  I('Skills', 'INTERESTS', 'Badminton · Strategy games', 'Art · Travel · Cooking'),
  { kind: 'final', sec: 'Contact', head: 'ANUSHA KARWA', sub: 'Open to AI product roles', det: 'Fintech · AI products · early-stage startups' }
];
const PROPS = ['', 'crown', 'rocket', 'books', 'medal', 'crown', 'card', 'scan', 'bars', 'crown', 'coins', 'megaphone', 'bars', 'crown', 'scales', 'laptop', 'crates', 'globe', 'blocks', 'key', 'planes', 'crown', 'trophy', 'medal', 'orbit', 'magazines', 'crown', 'hex', 'books', 'crown', 'orbit', 'coins', 'megaphone', 'planes', 'crown'];
const STYLES = ['push', 'rise', 'slide', 'burst', 'swing'];
let tt = 0;
CARDS.forEach((c, i) => {
  const words = (c.sub + ' ' + c.det).length;
  c.dur = c.kind === 'title' ? 1.15 : c.kind === 'intro' ? 4.3 : c.kind === 'final' ? 9999 : clamp(1.7 + words * 0.012, 2.0, 2.9);
  c.prop = PROPS[i];
  c.pos = new THREE.Vector3(Math.sin(i * 1.3) * 7, Math.sin(i * 0.8) * 2.5, -i * 34);
  c.style = c.kind === 'item' ? STYLES[i % STYLES.length] : c.kind;
  c.t0 = tt; tt += c.kind === 'final' ? 0 : c.dur;
});
const TOTAL = tt;

/* ---------- renderer ---------- */
const canvas = $('#gl');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); }
catch (e) { document.body.classList.add('resume-only'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#050304');
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 400);
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), 0.55, 0.6, 0.78); composer.addPass(bloom);
composer.addPass(new OutputPass());
const grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uFade: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uT, uFade; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec2 d = vUv - 0.5; vec3 c = texture2D(tDiffuse, vUv).rgb; c *= 1.0 - dot(d, d) * 1.5; c += (h(vUv * 900.0 + fract(uT * 5.0)) - 0.5) * 0.035;
      float bar = step(0.5 - 0.5 * 0.82, abs(vUv.y - 0.5)) * 0.0; gl_FragColor = vec4(c * uFade * (1.0 - bar), 1.0); }` });
composer.addPass(grade);

scene.add(new THREE.AmbientLight(0x3a2a1a, 0.6));
const key = new THREE.PointLight(0xffe2a8, 300, 60, 1.6); scene.add(key);
const rim = new THREE.DirectionalLight(0xff6a3a, 1.4); rim.position.set(-6, 4, -8); scene.add(rim, rim.target);
const fill = new THREE.DirectionalLight(0xfff1d6, 0.8); fill.position.set(4, 3, 10); scene.add(fill, fill.target);

/* soft textures */
const puff = (inner = 0.0) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(inner, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
const PUFF = puff();
const streakTex = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 32; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 512, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 32); const v = g.createLinearGradient(0, 0, 0, 32); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = v; g.fillRect(0, 0, 512, 32); return new THREE.CanvasTexture(c); })();

/* crimson glow behind the type, and anamorphic streak */
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFF, color: 0x8a1018, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending })); glow.position.set(0, 0, -6); glow.scale.set(26, 14, 1); scene.add(glow);
const streak = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.5), new THREE.MeshBasicMaterial({ map: streakTex, color: 0xffd28a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); streak.position.z = 2; scene.add(streak);
const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff(0.02), color: 0xfff0c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); flare.scale.setScalar(3); flare.position.z = 2.5; scene.add(flare);

/* light rays from above */
const rayMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: { uT: { value: 0 }, uI: { value: 0.5 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform float uT, uI; varying vec2 vUv; void main(){ float a = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x) * smoothstep(0.0, 1.0, vUv.y); a *= 0.55 + 0.45 * sin(uT * 0.6 + vUv.x * 7.0); gl_FragColor = vec4(vec3(1.0, 0.78, 0.45) * a * 0.07 * uI, 1.0); }` });
const rayGroup = new THREE.Group(); scene.add(rayGroup);
for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2 + R() * 3, 40), rayMat); m.position.set((i - 3) * 4 + (R() - .5) * 2, 6, (R() - .5) * 6); m.rotation.z = (i - 3) * 0.09; rayGroup.add(m); }

/* gold dust everywhere, plus a few large bokeh discs */
const dN = 2600, dp = new Float32Array(dN * 3), dph = new Float32Array(dN);
for (let i = 0; i < dN; i++) { dp.set([(R() - .5) * 60, (R() - .5) * 34, (R() - .5) * 50], i * 3); dph[i] = R(); }
const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('aP', new THREE.BufferAttribute(dph, 1));
const dustMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uH: { value: innerHeight }, uI: { value: 1 } },
  vertexShader: `attribute float aP; uniform float uT, uH, uI; varying float vA; void main(){ vec3 p = position; p.y += mod(uT * (0.25 + aP * 0.5) + aP * 34.0, 34.0) - 17.0 - position.y * 0.0; p.x += sin(uT * 0.4 + aP * 30.0) * 0.6;
    vec4 mv = modelViewMatrix * vec4(p, 1.0); vA = uI * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(uT * 2.0 + aP * 50.0), 3.0)); gl_PointSize = (0.05 + aP * 0.07) * uH / -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(1.0, 0.8, 0.45) * a * 1.4, a * vA); }` });
const dust = new THREE.Points(dg, dustMat); dust.frustumCulled = false; scene.add(dust);
const bokeh = Array.from({ length: 18 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFF, color: new THREE.Color().setHSL(0.09 + R() * 0.04, 0.8, 0.55), transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending })); s.userData = { x: (R() - .5) * 30, y: (R() - .5) * 16, z: -4 - R() * 14, s: 1.5 + R() * 4, ph: R() * 6.28 }; scene.add(s); return s; });

/* sparks for "burst" landings and the intro */
const SPK = 500, sp = new Float32Array(SPK * 3), sv = new Float32Array(SPK * 3);
for (let i = 0; i < SPK; i++) { const a = R() * 6.28, b = (R() - .5) * 3, v = 3 + R() * 9; sv.set([Math.cos(a) * v, Math.sin(a) * v * 0.6 + b, (R() - .5) * 4], i * 3); }
const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('aV', new THREE.BufferAttribute(sv, 3));
const sparkMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 9 }, uH: { value: innerHeight } },
  vertexShader: `attribute vec3 aV; uniform float uK, uH; varying float vA; void main(){ vec3 p = aV * (1.0 - exp(-uK * 2.2)) * 0.6; p.y -= uK * uK * 0.6; vA = clamp(1.0 - uK / 1.4, 0.0, 1.0); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = 0.09 * uH / -mv.z; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(1.0, 0.85, 0.5) * 2.0, smoothstep(0.5, 0.0, d) * vA); }` });
const sparks = new THREE.Points(sg, sparkMat); sparks.frustumCulled = false; scene.add(sparks);

/* ---------- gold type ---------- */
const GOLD = { color: 0xe0ad55, metalness: 1, roughness: 0.3, envMapIntensity: 1.0 };
let font = null;
const visibleW = () => 2 * 12.2 * Math.tan(THREE.MathUtils.degToRad(20)) * camera.aspect; // width at the end of the slow push-in
function textMesh(str, size) {
  const g = new TextGeometry(str, { font, size, height: size * 0.22, curveSegments: 5, bevelEnabled: true, bevelThickness: size * 0.035, bevelSize: size * 0.022, bevelSegments: 3 });
  g.computeBoundingBox(); const bb = g.boundingBox; g.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z - bb.min.z) / 2);
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ ...GOLD, transparent: true, opacity: 1 }));
}
function buildCard(c) {
  if (c.group) return c.group;
  const grp = new THREE.Group(), type = new THREE.Group(); grp.add(type);
  const vw = visibleW(), maxW = vw * (camera.aspect < 1 ? 0.8 : 0.76);
  const size = c.kind === 'title' ? 1.55 : c.kind === 'intro' || c.kind === 'final' ? 1.35 : 1.2;
  let m = textMesh(c.head, size), w = m.geometry.boundingBox.max.x - m.geometry.boundingBox.min.x, lines = null;
  if (w > maxW * 1.35 && c.head.includes(' ')) { const words = c.head.split(' ').filter(Boolean), mid = Math.ceil(words.length / 2); lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]; m.geometry.dispose(); m.material.dispose(); }
  if (lines) { const ms = lines.map(l => textMesh(l, size)); w = Math.max(...ms.map(x => x.geometry.boundingBox.max.x - x.geometry.boundingBox.min.x)); ms.forEach((x, i) => { x.position.y = (0.5 - i) * size * 1.35; type.add(x); }); } else type.add(m);
  const fit = Math.min(1, maxW / w); type.scale.setScalar(fit);
  const rule = new THREE.Mesh(new THREE.BoxGeometry(1, 0.035, 0.035), new THREE.MeshBasicMaterial({ color: new THREE.Color('#b0141e').multiplyScalar(1.6), transparent: true }));
  rule.position.y = -(lines ? size * 1.35 : size * 0.75) - 0.2; type.add(rule);
  // the prop: beside the type when there is room, otherwise above it; behind it on chapter titles
  const prop = c.prop ? makeProp(c.prop) : null, textW = w * fit;
  let layout = 'none';
  if (prop) {
    const holder = new THREE.Group(); holder.add(prop.g); grp.add(holder); // the holder sets layout; the prop animates itself inside it
    if (c.kind === 'title' || c.kind === 'final') { layout = 'behind'; holder.position.set(0, 0, -3); holder.scale.setScalar(c.kind === 'final' ? 1.7 : 1.5); }
    else if (textW + 5.2 < vw * 0.9) { layout = 'side'; const side = c.pos.x > 0 ? -1 : 1; const total = textW + 5.2; type.position.x = -side * (total / 2 - textW / 2); holder.position.set(side * (total / 2 - 2.1), 0.2, 0.5); }
    else { layout = 'above'; holder.position.set(0, camera.aspect < 1 ? 2.3 : 2.2, -0.5); holder.scale.setScalar(camera.aspect < 1 ? 0.5 : 0.62); type.position.y = camera.aspect < 1 ? -0.7 : -1.15; }
  }
  grp.userData = { type, rule, w, fit, prop, layout, baseX: type.position.x, baseY: type.position.y };
  grp.position.copy(c.pos); grp.visible = false; scene.add(grp); c.group = grp; return grp;
}
function disposeCard(c) { if (!c.group) return; c.group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material && !o.material._shared) o.material.dispose(); }); scene.remove(c.group); c.group = null; }
function setOpacity(grp, a) { grp.traverse(o => { if (o.material && o.material.transparent !== undefined && o.isMesh && !o.material._shared) o.material.opacity = a; }); }

/* intro: gold dust gathers into a monogram */
let mono = null;
function monogramPoints() {
  const c = document.createElement('canvas'); c.width = 420; c.height = 260; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.font = 'italic 600 220px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ak.', 210, 120);
  const d = g.getImageData(0, 0, 420, 260).data, pts = []; for (let y = 0; y < 260; y += 3) for (let x = 0; x < 420; x += 3) if (d[(y * 420 + x) * 4 + 3] > 128) pts.push([(x - 210) * 0.022, (130 - y) * 0.022]);
  const n = pts.length, A = new Float32Array(n * 3), B = new Float32Array(n * 3), D = new Float32Array(n);
  pts.forEach(([x, y], i) => { const a = R() * 6.28, r = 10 + R() * 18; A.set([Math.cos(a) * r, Math.sin(a) * r * 0.6, -6 + (R() - .5) * 8], i * 3); B.set([x, y, 0], i * 3); D[i] = R(); });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(B, 3)); geo.setAttribute('aS', new THREE.BufferAttribute(A, 3)); geo.setAttribute('aD', new THREE.BufferAttribute(D, 1));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uK: { value: 0 }, uX: { value: 0 }, uH: { value: innerHeight } },
    vertexShader: `attribute vec3 aS; attribute float aD; uniform float uK, uX, uH; varying float vA; void main(){ float k = clamp((uK - aD * 0.35) / 0.65, 0.0, 1.0); k = 1.0 - pow(1.0 - k, 3.0);
      vec3 p = mix(aS, position, k); float a = atan(aS.y, aS.x) + (1.0 - k) * 3.0; p.xy += vec2(cos(a), sin(a)) * (1.0 - k) * 2.0; p += normalize(position + vec3(0.001)) * uX * uX * 14.0;
      vA = smoothstep(0.0, 0.2, k) * (1.0 - uX); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = 0.075 * uH / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vec3(1.0, 0.8, 0.42) * 1.5, smoothstep(0.5, 0.0, d) * vA); }` });
  mono = new THREE.Points(geo, mat); mono.frustumCulled = false; scene.add(mono);
}

/* ---------- caption overlay ---------- */
const cap = $('#caption'), capSec = $('#capSec'), capSub = $('#capSub'), capDet = $('#capDet'), chip = $('#chapter');
let capCard = -1;
function showCaption(i) {
  const c = CARDS[i]; capCard = i;
  cap.className = 'caption k-' + c.kind;
  capSec.textContent = '';
  capSub.textContent = c.sub; capDet.textContent = c.det || '';
  chip.textContent = c.sec || 'Anusha Karwa';
  $('#finale').hidden = c.kind !== 'final';
}

/* ---------- sound: a small cinematic score ---------- */
let actx = null, master = null, soundOn = false;
function audioInit() {
  actx = new (window.AudioContext || window.webkitAudioContext)(); master = actx.createGain(); master.gain.value = 0;
  const comp = actx.createDynamicsCompressor(); master.connect(comp); comp.connect(actx.destination);
  const conv = actx.createConvolver(); const len = actx.sampleRate * 3.5, ir = actx.createBuffer(2, len, actx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
  conv.buffer = ir; const wet = actx.createGain(); wet.gain.value = 0.4; conv.connect(wet); wet.connect(master); master.reverb = conv;
  // string pad: D minor → B♭ → F → C, eight seconds each
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const padG = actx.createGain(); padG.gain.value = 0.16; lp.connect(padG); padG.connect(master); padG.connect(conv);
  const chords = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64]]; const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const voices = [0, 1, 2, 3].map(() => [-6, 6].map(det => { const o = actx.createOscillator(); o.type = 'sawtooth'; o.detune.value = det; const g = actx.createGain(); g.gain.value = 0.06; o.connect(g); g.connect(lp); o.start(); return o; }));
  const t0 = actx.currentTime; for (let k = 0; k < 40; k++) chords[k % 4].forEach((m, v) => voices[v].forEach(o => o.frequency.setTargetAtTime(hz(m), t0 + k * 8, 0.6)));
  const lfo = actx.createOscillator(); lfo.frequency.value = 0.08; const lg = actx.createGain(); lg.gain.value = 300; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
}
function hit(kind) {
  if (!actx || !soundOn) return; const t = actx.currentTime;
  const noise = (dur, f0, f1, vol) => { const b = actx.createBuffer(1, actx.sampleRate * dur, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = actx.createBufferSource(); s.buffer = b; const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(master); g.connect(master.reverb); s.start(t); };
  const boom = vol => { const o = actx.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.6); const g = actx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6); o.connect(g); g.connect(master); g.connect(master.reverb); o.start(t); o.stop(t + 1.7); };
  const bell = (f, vol) => [1, 2.76, 5.4].forEach((m, i) => { const o = actx.createOscillator(); o.frequency.value = f * m; const g = actx.createGain(); g.gain.setValueAtTime(vol / (i + 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4 / (i + 1)); o.connect(g); g.connect(master.reverb); g.connect(master); o.start(t); o.stop(t + 2.5); });
  if (kind === 'title' || kind === 'intro' || kind === 'final') { boom(0.9); noise(1.6, 300, 4000, 0.12); bell(587.3, 0.05); }
  else { noise(0.7, 600, 3000, 0.05); bell([587.3, 659.3, 880, 784][Math.floor(Math.random() * 4)], 0.035); }
}
function setSound(v) { soundOn = v; if (v && !actx) audioInit(); if (actx) { actx.resume(); master.gain.setTargetAtTime(v ? 0.7 : 0, actx.currentTime, 0.4); } $('#snd').setAttribute('aria-pressed', v); $('#snd').textContent = v ? 'Sound on' : 'Sound off'; }

/* ---------- timeline + controls ---------- */
let T = 0, playing = false, started = false, lastIdx = -1, startTime = 0;
const cardAt = t => { let i = 0; while (i < CARDS.length - 1 && t >= CARDS[i + 1].t0) i++; return i; };
const prog = $('#progress');
(() => { // section ticks on the progress bar
  const secs = CARDS.map((c, i) => [c, i]).filter(([c]) => c.kind === 'title' || c.kind === 'intro' || c.kind === 'final');
  secs.forEach(([c]) => { const b = document.createElement('button'); b.className = 'tick'; b.style.left = (c.t0 / TOTAL * 100) + '%'; b.title = c.kind === 'intro' ? 'Opening' : c.kind === 'final' ? 'Contact' : c.sec; b.setAttribute('aria-label', 'Jump to ' + b.title); b.addEventListener('click', e => { e.stopPropagation(); jump(c.t0 + 0.01); }); prog.appendChild(b); });
})();
window.__film = { cards: CARDS, total: TOTAL, still: t => { T = t; lastIdx = -1; setPlaying(false); } }; // for previews and tests
function jump(t) { T = clamp(t, 0, TOTAL); lastIdx = -1; if (!playing) setPlaying(true); }
function setPlaying(v) { playing = v; $('#pp').textContent = v ? 'Pause' : 'Play'; $('#pp').setAttribute('aria-pressed', v); }
$('#pp').addEventListener('click', () => { if (T >= TOTAL) jump(0); else setPlaying(!playing); });
$('#prev').addEventListener('click', () => { const i = cardAt(T); jump(CARDS[Math.max(0, (T - CARDS[i].t0 < 0.8 ? i - 1 : i))].t0 + 0.01); });
$('#next').addEventListener('click', () => { const i = cardAt(T); jump(CARDS[Math.min(CARDS.length - 1, i + 1)].t0 + 0.01); });
prog.addEventListener('click', e => { const r = prog.getBoundingClientRect(); jump((e.clientX - r.left) / r.width * TOTAL); });
$('#snd').addEventListener('click', () => setSound(!soundOn));
$('#replay').addEventListener('click', () => jump(0));
addEventListener('keydown', e => {
  if (!started || !$('#resume').hidden) { if (e.key === 'Escape') toggleResume(false); return; }
  if (e.key === ' ') { e.preventDefault(); $('#pp').click(); }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); $('#next').click(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); $('#prev').click(); }
});
/* résumé reading view, built from the same script */
(() => {
  const box = $('#resumeBody'); let sec = null, ul = null;
  CARDS.forEach(c => {
    if (c.kind === 'intro') { box.insertAdjacentHTML('beforeend', `<header><h2>Anusha Karwa</h2><p>${c.sub} · ${c.det}</p></header>`); return; }
    if (c.kind === 'title') { box.insertAdjacentHTML('beforeend', `<h3>${c.sec}</h3>`); ul = document.createElement('ul'); box.appendChild(ul); return; }
    if (c.kind === 'final') { box.insertAdjacentHTML('beforeend', `<h3>Contact</h3><p>${c.sub}. ${c.det}. <a href="https://www.linkedin.com/in/anusha-karwa-945300223" target="_blank" rel="noopener">LinkedIn</a></p>`); return; }
    ul.insertAdjacentHTML('beforeend', `<li><b>${c.head.replace(/\s+·\s+/g, ' · ')}</b><span>${c.sub}</span>${c.det ? `<small>${c.det}</small>` : ''}</li>`);
  });
})();
let wasPlaying = false;
function toggleResume(v) { const r = $('#resume'); if (v === undefined) v = r.hidden; r.hidden = !v; if (v) { wasPlaying = playing; setPlaying(false); r.scrollTop = 0; $('#resumeClose').focus(); } else if (wasPlaying) setPlaying(true); $('#resBtn').setAttribute('aria-expanded', v); }
$('#resBtn').addEventListener('click', () => toggleResume());
$('#resumeClose').addEventListener('click', () => toggleResume(false));
$('#loaderResume').addEventListener('click', () => { start(false); toggleResume(true); });

function start(sound) {
  if (started) return; started = true; startTime = time; $('#loader').classList.add('gone'); $('#ui').classList.add('show');
  if (sound) setSound(true); setPlaying(true);
}
$('#go').addEventListener('click', () => start(false));
$('#goSound').addEventListener('click', () => start(true));

addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight); CARDS.forEach(disposeCard); lastIdx = -1; });

/* ---------- per-frame direction: the camera flies from card to card ---------- */
const OFF = new THREE.Vector3(0, 0.5, 13), from = new THREE.Vector3(), to = new THREE.Vector3(), look = new THREE.Vector3(), lookFrom = new THREE.Vector3();
const TRAVEL = 0.6;
let last = performance.now(), time = 0;
function camFor(i, out) { const c = CARDS[i]; return out.copy(c.pos).add(OFF); }
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now; time += dt;
  if (playing) T = Math.min(TOTAL, T + dt);
  const i = cardAt(T), c = CARDS[i], u = T - c.t0, dur = c.kind === 'final' ? 1e9 : c.dur;
  if (i !== lastIdx) {
    CARDS.forEach((k, j) => { if (j < i - 1 || j > i + 2) disposeCard(k); });
    buildCard(c); showCaption(i); if (playing && started) hit(c.kind); lastIdx = i;
    setTimeout(() => { if (CARDS[i + 1]) buildCard(CARDS[i + 1]); }, 30);
    setTimeout(() => { if (CARDS[i + 2]) buildCard(CARDS[i + 2]); }, 200);
  }
  if (playing && T >= TOTAL) setPlaying(false);
  const capIn = c.kind === 'intro' ? u > 2.6 : u > TRAVEL * 0.8, capOut = c.kind !== 'final' && u > dur - 0.25;
  cap.classList.toggle('in', capIn && !capOut);

  // camera flight: swoop from the previous card to this one, banking into the turn, then drift
  camFor(i, to); look.copy(c.pos);
  if (i === 0) { from.set(0, 6, 60); lookFrom.set(0, 0, -20); }
  else { camFor(i - 1, from); lookFrom.copy(CARDS[i - 1].pos); }
  const travel = reduce ? 1 : (i === 0 ? clamp(u / 2.4, 0, 1) : clamp(u / TRAVEL, 0, 1)), k = travel < 0.5 ? 4 * travel ** 3 : 1 - Math.pow(-2 * travel + 2, 3) / 2;
  camera.position.lerpVectors(from, to, k); camera.position.y += Math.sin(k * Math.PI) * 1.5;
  camera.position.z -= Math.max(0, u - TRAVEL) * 0.35;
  const lk = new THREE.Vector3().lerpVectors(lookFrom, look, Math.min(1, k * 1.3)); camera.lookAt(lk);
  camera.rotation.z += Math.sin(k * Math.PI) * (to.x - from.x) * -0.012;

  // cards: the current one makes its entrance; the next ones wait in the dark, props already turning
  for (let j = Math.max(0, i - 1); j <= Math.min(CARDS.length - 1, i + 2); j++) {
    const cj = CARDS[j], g = cj.group; if (!g) continue;
    const ud = g.userData, uj = j === i ? u : j < i ? T - cj.t0 : 0, isCur = j === i;
    g.visible = j !== 0 || true;
    const tg = ud.type;
    tg.position.set(ud.baseX, ud.baseY, 0); tg.rotation.set(0, 0, 0);
    const startU = cj.kind === 'intro' ? 2.4 : TRAVEL * 0.35;
    const e = isCur ? (reduce ? 1 : expoOut((uj - startU) / 0.7)) : j < i ? 1 : 0;
    const st = reduce ? 'fade' : cj.style;
    if (st === 'push' || st === 'title' || st === 'intro' || st === 'final') { tg.position.z = lerp(-26, 0, e); }
    else if (st === 'rise') { tg.position.y += lerp(-4, 0, e); tg.rotation.x = lerp(-1.3, 0, e); }
    else if (st === 'slide') { tg.position.x += lerp(12, 0, e); tg.rotation.y = lerp(-0.9, 0, e); }
    else if (st === 'swing') { tg.rotation.y = lerp(Math.PI * 0.55, 0, backOut((uj - startU) / 0.8)); }
    else if (st === 'burst') { tg.scale.setScalar(ud.fit * lerp(1.8, 1, backOut((uj - startU) / 0.5))); }
    if (st !== 'burst') tg.scale.setScalar(ud.fit);
    tg.rotation.y += Math.sin(time * 0.6 + j) * 0.05;
    tg.traverse(o => { if (o.isMesh) o.material.opacity = j > i ? 0 : clamp(e * 1.4, 0, 1); });
    ud.rule.scale.x = Math.max(0.001, ud.w * 0.6 * (isCur ? smooth(startU + 0.3, startU + 0.9, uj) : j < i ? 1 : 0));
    if (ud.prop) ud.prop.up(j > i ? 0.0001 : Math.max(0.0001, uj - (cj.kind === 'intro' ? 2.4 : TRAVEL * 0.2)), time);
    if (ud.prop) ud.prop.g.visible = j <= i;
  }

  // light: a key light sweeps across the current card for the glint
  const sweep = smooth(0.3, Math.min(dur, 2.6), u);
  key.position.set(c.pos.x + lerp(-14, 14, sweep), c.pos.y + 4, c.pos.z + 9); key.intensity = 140 + Math.sin(sweep * Math.PI) * 160;
  rim.position.set(c.pos.x - 6, c.pos.y + 4, c.pos.z - 8); rim.target.position.copy(c.pos); fill.position.set(c.pos.x + 4, c.pos.y + 3, c.pos.z + 10); fill.target.position.copy(c.pos);
  streak.material.opacity = Math.sin(clamp((u - 0.4) / 0.9, 0, 1) * Math.PI) * (c.kind === 'item' ? 0.2 : 0.6);
  streak.position.set(c.pos.x + lerp(-8, 8, sweep), c.pos.y + 0.2, c.pos.z + 2);
  flare.material.opacity = streak.material.opacity * 0.6; flare.position.set(streak.position.x, streak.position.y, c.pos.z + 2.5);
  glow.position.set(c.pos.x, c.pos.y, c.pos.z - 6); glow.material.opacity = (c.kind === 'title' || c.kind === 'final' ? 0.75 : 0.35) * (0.85 + 0.15 * Math.sin(time * 1.5));
  rayGroup.position.set(camera.position.x, 0, camera.position.z - 22); rayMat.uniforms.uT.value = time; rayMat.uniforms.uI.value = c.kind === 'item' ? 0.6 : 1.1;
  dust.position.set(camera.position.x, camera.position.y, camera.position.z - 14); dustMat.uniforms.uT.value = time;
  bokeh.forEach(b => { const d = b.userData; b.position.set(camera.position.x + d.x + Math.sin(time * 0.1 + d.ph) * 2, camera.position.y + d.y + Math.cos(time * 0.13 + d.ph) * 1.5, camera.position.z + d.z - 10); b.scale.setScalar(d.s); });
  const sparkT = c.style === 'burst' || c.kind === 'title' ? u - 0.35 : c.kind === 'intro' ? u - 2.4 : 9;
  sparkMat.uniforms.uK.value = sparkT < 0 ? 9 : sparkT; sparks.position.set(c.pos.x, c.pos.y, c.pos.z + 0.5);
  if (mono) { const intro = c.kind === 'intro'; mono.visible = intro; if (intro) { mono.position.copy(c.pos); mono.material.uniforms.uK.value = clamp(u / 1.8, 0, 1); mono.material.uniforms.uX.value = smooth(2.0, 2.6, u); } }
  grade.uniforms.uT.value = time; grade.uniforms.uFade.value = started ? lerp(0.25, 1, smooth(startTime, startTime + 1.0, time)) : 0.25;

  // the caption follows the type: centred under its gold rule
  if (c.group) { const ud = c.group.userData, p = new THREE.Vector3(), q = new THREE.Vector3(); ud.rule.getWorldPosition(p); ud.type.getWorldPosition(q); p.project(camera); q.project(camera);
    cap.style.top = clamp((1 - p.y) / 2 * 100 + 2.2, 30, 80) + '%'; cap.style.left = clamp((q.x + 1) / 2 * 100, 25, 75) + '%'; cap.style.width = ud.layout === 'side' ? 'min(560px, 52vw)' : 'min(860px, calc(100vw - 32px))'; }
  $('#bar').style.width = (T / TOTAL * 100) + '%';
  composer.render(); requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
new FontLoader().load('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/gentilis_bold.typeface.json', async f => {
  font = f;
  await Promise.race([document.fonts.load('italic 600 220px "Cormorant Garamond"'), new Promise(r => setTimeout(r, 2500))]).catch(() => {});
  monogramPoints(); buildCard(CARDS[0]); buildCard(CARDS[1]);
  clearTimeout(window.__bootTimer);
  $('#loader').classList.add('ready');
  let n = 3; const tick = () => { if (started) return; if (n === 0) { start(false); return; } $('#lstat').textContent = `Starting in ${n}…`; n--; setTimeout(tick, 1000); }; tick();
  requestAnimationFrame(frame);
}, undefined, () => { document.body.classList.add('resume-only'); $('#loader').classList.add('gone'); toggleResume(true); });
