// 3D props for the film: one small gold sculpture per résumé card, each with its own entrance.
// Every prop is built from primitives and animated by u (seconds since its card began).
import * as THREE from 'three';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const back = x => { x = clamp(x, 0, 1); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

export const M = {
  gold: new THREE.MeshStandardMaterial({ color: 0xe0ad55, metalness: 1, roughness: 0.28 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x2a1a10, metalness: 0.8, roughness: 0.35 }),
  satin: new THREE.MeshStandardMaterial({ color: 0xc89540, metalness: 0.9, roughness: 0.5 }),
  crimson: new THREE.MeshStandardMaterial({ color: 0x9e1019, metalness: 0.4, roughness: 0.35, emissive: 0x3a0306 }),
  ivory: new THREE.MeshStandardMaterial({ color: 0xa89878, metalness: 0.2, roughness: 0.75 }),
  glow: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffcf7a').multiplyScalar(2.2) }),
  laser: new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff3a3a').multiplyScalar(2.5), transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  line: new THREE.LineBasicMaterial({ color: new THREE.Color('#e3b25b').multiplyScalar(1.4) })
};
Object.values(M).forEach(m => { m._shared = true; });
const mesh = (g, m = M.gold) => new THREE.Mesh(g, m);
const rounded = (w, h, r, d) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }); g.center(); return g; };

const B = {
  cap() { // mortarboard drops in spinning, tassel swings
    const g = new THREE.Group(), board = mesh(new THREE.BoxGeometry(3, 0.12, 3), M.dark); board.rotation.y = Math.PI / 4;
    const crown = mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.7, 32), M.dark); crown.position.y = -0.4;
    const trim = mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 48)); trim.rotation.x = Math.PI / 2; trim.position.y = -0.72;
    const button = mesh(new THREE.SphereGeometry(0.12, 12, 8)); button.position.y = 0.1;
    const tassel = new THREE.Group(); const cord = mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 6)); cord.position.y = -0.7; const tuft = mesh(new THREE.ConeGeometry(0.14, 0.45, 10)); tuft.position.y = -1.45; tassel.add(cord, tuft); tassel.position.set(1.4, 0.06, 0);
    g.add(board, crown, trim, button, tassel);
    return { g, up: (u, t) => { const k = back(u / 0.8); g.position.y = lerp(5, 0, ease(u / 0.7)); g.rotation.y = (1 - ease(u / 0.9)) * 5 + t * 0.3; g.rotation.x = 0.35; g.scale.setScalar(Math.max(0.001, k)); tassel.rotation.z = Math.sin(t * 3) * 0.25; } };
  },
  books() { // books fall one by one into a stack
    const g = new THREE.Group(), list = [];
    for (let i = 0; i < 5; i++) { const b = new THREE.Group(); const cover = mesh(new THREE.BoxGeometry(2.6 - i * 0.12, 0.34, 1.8), i % 2 ? M.crimson : M.dark); const pages = mesh(new THREE.BoxGeometry(2.5 - i * 0.12, 0.26, 1.72), M.ivory); pages.position.x = 0.06; const spine = mesh(new THREE.BoxGeometry(0.06, 0.36, 1.82)); spine.position.x = -(2.6 - i * 0.12) / 2; b.add(cover, pages, spine); b.userData.r = (i % 2 ? 0.12 : -0.1); g.add(b); list.push(b); }
    return { g, up: (u, t) => list.forEach((b, i) => { const k = ease((u - i * 0.12) / 0.45); b.position.y = lerp(6, i * 0.36 - 0.7, k); b.rotation.y = b.userData.r + (1 - k) * 2; b.visible = u > i * 0.12; g.rotation.y = Math.sin(t * 0.5) * 0.3; }) };
  },
  rocket() { // a startup lifts off on a column of sparks
    const g = new THREE.Group(), r = new THREE.Group();
    const body = mesh(new THREE.CylinderGeometry(0.42, 0.5, 2.2, 24)); const nose = mesh(new THREE.ConeGeometry(0.42, 0.9, 24), M.crimson); nose.position.y = 1.55;
    const win = mesh(new THREE.TorusGeometry(0.16, 0.05, 8, 24), M.dark); win.position.set(0, 0.4, 0.45);
    r.add(body, nose, win);
    for (let i = 0; i < 3; i++) { const fin = mesh(new THREE.BoxGeometry(0.06, 0.7, 0.6), M.crimson); const a = i * Math.PI * 2 / 3; fin.position.set(Math.cos(a) * 0.5, -0.85, Math.sin(a) * 0.5); fin.rotation.y = -a; r.add(fin); }
    const flame = mesh(new THREE.ConeGeometry(0.32, 1.2, 16), M.glow); flame.rotation.x = Math.PI; flame.position.y = -1.7; r.add(flame);
    g.add(r);
    return { g, up: (u, t) => { r.position.y = lerp(-6, 0, ease(u / 0.9)) + Math.sin(t * 6) * 0.05; r.rotation.y = t * 0.8; r.rotation.z = 0.25; flame.scale.set(1, 0.8 + Math.sin(t * 30) * 0.2, 1); } };
  },
  card() { // a gold payment card flips into view
    const g = new THREE.Group(), c = mesh(rounded(4.2, 2.65, 0.25, 0.08), M.satin);
    const chip = mesh(new THREE.BoxGeometry(0.62, 0.48, 0.04), M.dark); chip.position.set(-1.3, 0.25, 0.08);
    const stripe = mesh(new THREE.BoxGeometry(4.2, 0.4, 0.02), M.dark); stripe.position.set(0, 0.6, -0.07);
    const dots = new THREE.Group(); for (let i = 0; i < 4; i++) { const d = mesh(new THREE.BoxGeometry(0.55, 0.12, 0.02), M.dark); d.position.set(-1.25 + i * 0.75, -0.55, 0.07); dots.add(d); }
    const wave = new THREE.Group(); for (let i = 0; i < 3; i++) { const a = mesh(new THREE.TorusGeometry(0.18 + i * 0.13, 0.025, 6, 24, Math.PI * 0.6), M.dark); a.rotation.z = -Math.PI * 0.3; a.position.set(1.45, 0.25, 0.07); wave.add(a); }
    c.add(chip, stripe, dots, wave); g.add(c);
    return { g, up: (u, t) => { const k = ease(u / 1.0); c.rotation.y = (1 - k) * Math.PI * 3 + Math.sin(t * 0.8) * 0.25; c.rotation.x = -0.2; c.position.y = Math.sin(t * 1.2) * 0.1; g.scale.setScalar(Math.max(0.001, back(u / 0.6))); } };
  },
  scan() { // documents fan out and a laser scans them for sensitive data
    const g = new THREE.Group(), docs = [];
    for (let i = 0; i < 3; i++) { const d = mesh(new THREE.BoxGeometry(1.7, 2.2, 0.03), M.ivory); for (let l = 0; l < 6; l++) { const bar = mesh(new THREE.BoxGeometry(1.2 * (0.6 + ((l * 7 + i) % 4) * 0.1), 0.08, 0.01), l === 2 || l === 4 ? M.crimson : M.dark); bar.position.set(-0.1, 0.7 - l * 0.28, 0.025); d.add(bar); } g.add(d); docs.push(d); }
    const laser = mesh(new THREE.PlaneGeometry(5.6, 0.05), M.laser); laser.position.z = 0.4; g.add(laser);
    return { g, up: (u, t) => { docs.forEach((d, i) => { const k = ease((u - i * 0.1) / 0.5); d.position.set((i - 1) * 1.85 * k, 0, -i * 0.05); d.rotation.y = (i - 1) * -0.25 * k; }); laser.position.y = 1.2 - ((u * 1.2) % 2.4); laser.visible = u > 0.5; } };
  },
  coins() { // fifteen coins rain down into towers
    const g = new THREE.Group(), coins = [], geo = new THREE.CylinderGeometry(0.42, 0.42, 0.11, 32);
    for (let i = 0; i < 15; i++) { const c = mesh(geo); const col = i % 3; c.userData = { x: (col - 1) * 1.1, y: -1 + Math.floor(i / 3) * 0.12 + (col === 1 ? 0.12 : 0), d: i * 0.05, s: Math.random() * 6 }; g.add(c); coins.push(c); }
    const rup = mesh(new THREE.TorusGeometry(1.9, 0.04, 8, 64)); rup.rotation.x = Math.PI / 2; rup.position.y = -1.1; g.add(rup);
    return { g, up: (u, t) => { coins.forEach(c => { const k = ease((u - c.userData.d) / 0.45); c.position.set(c.userData.x, lerp(6, c.userData.y, k), 0); c.rotation.x = (1 - k) * c.userData.s; c.visible = u > c.userData.d; }); g.rotation.y = 0.5 + Math.sin(t * 0.6) * 0.3; rup.scale.setScalar(back(u / 0.8) || 0.001); } };
  },
  megaphone() { // sound rings ripple outward
    const g = new THREE.Group(), horn = mesh(new THREE.CylinderGeometry(1.0, 0.3, 1.8, 32, 1, true)); horn.material = M.gold; horn.rotation.z = -Math.PI / 2; horn.position.x = 0.4;
    const handle = mesh(new THREE.BoxGeometry(0.25, 0.8, 0.25), M.crimson); handle.position.set(-0.3, -0.55, 0); const back_ = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.3, 24), M.dark); back_.rotation.z = Math.PI / 2; back_.position.x = -0.6;
    const rings = [0, 1, 2].map(() => { const r = mesh(new THREE.TorusGeometry(1, 0.035, 8, 48)); r.rotation.y = Math.PI / 2; g.add(r); return r; });
    g.add(horn, handle, back_);
    return { g, up: (u, t) => { g.rotation.y = -0.5 + Math.sin(t * 0.7) * 0.2; g.scale.setScalar(back(u / 0.6) || 0.001); rings.forEach((r, i) => { const k = ((t * 0.8 + i / 3) % 1); r.position.x = 1.4 + k * 3; r.scale.setScalar(1 + k * 1.4); r.visible = u > 0.4; }); } };
  },
  bars() { // a chart grows: registrations up 40%
    const g = new THREE.Group(), bars = [1.0, 1.25, 1.4, 1.95].map((h, i) => { const b = mesh(new THREE.BoxGeometry(0.6, 1, 0.6), i === 3 ? M.crimson : M.gold); b.userData.h = h * 1.6; b.position.x = (i - 1.5) * 0.85; g.add(b); return b; });
    const arrow = mesh(new THREE.ConeGeometry(0.3, 0.6, 4), M.glow); g.add(arrow);
    return { g, up: (u, t) => { bars.forEach((b, i) => { const h = Math.max(0.01, b.userData.h * ease((u - i * 0.1) / 0.6)); b.scale.y = h; b.position.y = h / 2 - 1.2; }); arrow.position.set(1.28, bars[3].scale.y - 0.85 + Math.sin(t * 4) * 0.08, 0); arrow.visible = u > 0.6; g.rotation.y = -0.4 + Math.sin(t * 0.5) * 0.25; } };
  },
  scales() { // scales of justice settle into balance
    const g = new THREE.Group(), pole = mesh(new THREE.CylinderGeometry(0.07, 0.09, 3, 12)); const base = mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.25, 32)); base.position.y = -1.55;
    const top = mesh(new THREE.SphereGeometry(0.16, 16, 12)); top.position.y = 1.55; const beam = new THREE.Group(); beam.position.y = 1.35; const bar = mesh(new THREE.BoxGeometry(3.2, 0.08, 0.08)); beam.add(bar);
    const pans = [-1, 1].map(s => { const p = new THREE.Group(); p.position.x = s * 1.55; const dish = mesh(new THREE.SphereGeometry(0.55, 24, 8, 0, Math.PI * 2, Math.PI * 0.6, Math.PI * 0.4)); dish.position.y = -1.0; dish.rotation.x = Math.PI;
      for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.45, -1.0, Math.sin(a) * 0.45)]; p.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), M.line)); }
      p.add(dish); beam.add(p); return p; });
    g.add(pole, base, top, beam);
    return { g, up: (u, t) => { const tilt = Math.exp(-u * 1.6) * Math.cos(u * 6) * 0.45; beam.rotation.z = tilt; pans.forEach(p => p.rotation.z = -tilt); g.rotation.y = Math.sin(t * 0.4) * 0.4; g.scale.setScalar(back(u / 0.6) || 0.001); } };
  },
  laptop() { // the lid opens on a rising prediction line
    const g = new THREE.Group(), base = mesh(new THREE.BoxGeometry(3, 0.14, 2)); const lid = new THREE.Group(); lid.position.set(0, 0.07, -1);
    const screen = mesh(new THREE.BoxGeometry(3, 2, 0.08)); screen.position.set(0, 1, 0); const glass = mesh(new THREE.PlaneGeometry(2.7, 1.7), M.dark); glass.position.set(0, 1, 0.05);
    const pts = []; for (let i = 0; i <= 20; i++) pts.push(new THREE.Vector3(-1.2 + i * 0.12, 0.35 + Math.pow(i / 20, 1.6) * 1.2 + Math.sin(i) * 0.06, 0.07)); const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color('#ff5a4a').multiplyScalar(2) }));
    lid.add(screen, glass, ln); g.add(base, lid);
    return { g, up: (u, t) => { lid.rotation.x = lerp(Math.PI / 2, -0.25, ease(u / 0.8)); ln.geometry.setDrawRange(0, Math.floor(21 * clamp((u - 0.6) / 0.8, 0, 1))); g.rotation.set(0.35, -0.5 + Math.sin(t * 0.5) * 0.2, 0); g.scale.setScalar(back(u / 0.5) || 0.001); } };
  },
  crates() { // grocery crates stack themselves
    const g = new THREE.Group(), list = []; const pos = [[-1, 0], [0, 0], [1, 0], [-0.5, 1], [0.5, 1], [0, 2]];
    pos.forEach(([x, y], i) => { const c = mesh(new THREE.BoxGeometry(0.92, 0.9, 0.92), i % 2 ? M.gold : M.crimson); const lid = mesh(new THREE.BoxGeometry(0.96, 0.08, 0.96), M.dark); lid.position.y = 0.45; c.add(lid); c.userData = { x: x * 0.98, y: y * 0.95 - 1, d: i * 0.08 }; g.add(c); list.push(c); });
    return { g, up: (u, t) => { list.forEach(c => { const k = back((u - c.userData.d) / 0.45); c.position.set(lerp(c.userData.x + 5, c.userData.x, clamp(k, 0, 1.1)), c.userData.y, 0); c.visible = u > c.userData.d; }); g.rotation.y = -0.6 + Math.sin(t * 0.5) * 0.2; } };
  },
  globe() { // a wireframe globe with a plane circling it
    const g = new THREE.Group(), w = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1.5, 18, 12)), M.line); const core = mesh(new THREE.SphereGeometry(1.42, 32, 24), M.dark);
    const orbit = new THREE.Group(); const plane = mesh(new THREE.ConeGeometry(0.16, 0.6, 4), M.crimson); plane.rotation.z = -Math.PI / 2; plane.position.x = 2.1; orbit.add(plane); orbit.rotation.x = 0.5;
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 2.1, 2.1).getPoints(80).map(p => new THREE.Vector3(p.x, 0, p.y))), M.line); orbit.add(path);
    g.add(core, w, orbit);
    return { g, up: (u, t) => { w.rotation.y = core.rotation.y = t * 0.4; orbit.rotation.y = -t * 1.6; g.scale.setScalar(back(u / 0.6) || 0.001); } };
  },
  blocks() { // a queue slides along while a stack builds
    const g = new THREE.Group(), q = [], s = [];
    for (let i = 0; i < 5; i++) { const b = mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), M.gold); g.add(b); q.push(b); }
    for (let i = 0; i < 4; i++) { const b = mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), M.crimson); g.add(b); s.push(b); }
    return { g, up: (u, t) => { q.forEach((b, i) => { const x = ((t * 0.9 + i * 0.7) % 3.5) - 2.6; b.position.set(x, -0.6, 0); b.scale.setScalar(Math.min(1, (x + 2.6) * 3, (0.9 - x) * 3) || 0.001); }); s.forEach((b, i) => { const k = ease((u - i * 0.15) / 0.4); b.position.set(1.6, lerp(4, -0.6 + i * 0.64, k), 0); b.visible = u > i * 0.15; }); g.rotation.y = -0.35; } };
  },
  key() { // a key turns in a door
    const g = new THREE.Group(), door = mesh(new THREE.BoxGeometry(1.8, 3, 0.14), M.dark); const frame = mesh(new THREE.TorusGeometry(0.2, 0.05, 8, 24)); frame.position.set(0.55, 0, 0.1); door.add(frame);
    const key = new THREE.Group(); const bow = mesh(new THREE.TorusGeometry(0.35, 0.09, 12, 32)); bow.position.x = -1.2; const shaft = mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 12)); shaft.rotation.z = Math.PI / 2; shaft.position.x = -0.15;
    [0.25, 0.5].forEach(x => { const t = mesh(new THREE.BoxGeometry(0.12, 0.25, 0.08)); t.position.set(x, -0.15, 0); key.add(t); }); key.add(bow, shaft); key.position.set(1.2, 0, 0.3);
    g.add(door, key);
    return { g, up: (u, t) => { const k = ease(u / 0.7); key.position.x = lerp(3.5, 1.2, k); key.rotation.x = smoothTurn(u); door.rotation.y = -0.5 - clamp((u - 1.2) / 0.6, 0, 1) * 0.6; g.rotation.y = 0.3; } };
    function smoothTurn(u) { return clamp((u - 0.7) / 0.5, 0, 1) * Math.PI / 2; }
  },
  planes() { // paper planes loop in formation
    const g = new THREE.Group(), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.8, -0.55, 0.05, -0.5, 0, 0, -0.35, 0, 0, 0.8, 0.55, 0.05, -0.5, 0, 0, -0.35, 0, 0, 0.8, 0, -0.22, -0.4, 0, 0, -0.35], 3)); geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0xf6ead2, side: THREE.DoubleSide, roughness: 0.6, flatShading: true }); mat._shared = true;
    const ps = [0, 1, 2, 3].map(i => { const p = new THREE.Mesh(geo, i === 0 ? M.gold : mat); g.add(p); return p; });
    return { g, up: (u, t) => ps.forEach((p, i) => { const a = t * 1.3 + i * 1.57, r = 1.8; p.position.set(Math.cos(a) * r, Math.sin(a * 2) * 0.4, Math.sin(a) * r * 0.6); p.lookAt(Math.cos(a + 0.1) * r, Math.sin((a + 0.1) * 2) * 0.4, Math.sin(a + 0.1) * r * 0.6); p.scale.setScalar(back((u - i * 0.1) / 0.5) || 0.001); }) };
  },
  trophy() { // a trophy rises on its plinth, turning
    const g = new THREE.Group(), pts = []; [[0, 0], [0.5, 0], [0.55, 0.12], [0.18, 0.3], [0.14, 0.9], [0.3, 1.05], [0.95, 1.4], [1.0, 2.3], [0.9, 2.35]].forEach(([x, y]) => pts.push(new THREE.Vector2(x, y)));
    const cup = mesh(new THREE.LatheGeometry(pts, 48)); cup.position.y = -1.2; const hs = [-1, 1].map(s => { const h = mesh(new THREE.TorusGeometry(0.42, 0.07, 10, 24, Math.PI)); h.rotation.z = s * Math.PI / 2; h.position.set(s * 0.98, 0.55, 0); return h; });
    const plinth = mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), M.dark); plinth.position.y = -1.45; const star = mesh(new THREE.OctahedronGeometry(0.22), M.glow); star.position.y = 1.5;
    g.add(cup, ...hs, plinth, star);
    return { g, up: (u, t) => { g.position.y = lerp(-4, 0, ease(u / 0.8)); g.rotation.y = t * 0.9; star.rotation.y = t * 3; star.visible = u > 0.7; } };
  },
  medal() { // a medal swings in on its ribbon
    const g = new THREE.Group(), disc = mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.14, 48)); disc.rotation.x = Math.PI / 2; const rim = mesh(new THREE.TorusGeometry(0.85, 0.06, 10, 48)); const star = mesh(new THREE.OctahedronGeometry(0.4), M.dark); star.scale.z = 0.3; star.position.z = 0.1;
    const rib = new THREE.Group(); [-1, 1].forEach(s => { const r = mesh(new THREE.BoxGeometry(0.42, 1.8, 0.02), M.crimson); r.position.set(s * 0.25, 1.6, -0.05); r.rotation.z = s * 0.28; rib.add(r); });
    const medal = new THREE.Group(); medal.add(disc, rim, star); g.add(rib, medal);
    return { g, up: (u, t) => { g.rotation.z = Math.exp(-u * 1.8) * Math.sin(u * 7) * 0.6; medal.rotation.y = Math.sin(t * 1.2) * 0.5; g.position.y = lerp(5, 0, ease(u / 0.5)) - 0.4; } };
  },
  magazines() { // a stack of magazines fans out
    const g = new THREE.Group(), list = [];
    for (let i = 0; i < 9; i++) { const m = mesh(new THREE.BoxGeometry(1.4, 1.9, 0.05), i % 3 === 0 ? M.crimson : i % 3 === 1 ? M.ivory : M.gold); m.geometry.translate(0, 0.95, 0); m.position.y = -1.2; g.add(m); list.push(m); }
    return { g, up: (u, t) => { const k = back(u / 0.8); list.forEach((m, i) => { m.rotation.z = (i - 4) * 0.2 * k; m.position.z = i * 0.03; }); g.rotation.y = Math.sin(t * 0.5) * 0.3; g.scale.setScalar(Math.max(0.001, ease(u / 0.3))); } };
  },
  hex() { // badges snap into a honeycomb
    const g = new THREE.Group(), list = [], geo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 6);
    const cells = []; for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) { const s = -q - r; if (Math.abs(s) <= 2 && cells.length < 19) cells.push([q, r]); }
    cells.forEach(([q, r], i) => { const h = mesh(geo, i === 9 ? M.crimson : M.gold); h.rotation.x = Math.PI / 2; h.userData = { x: 0.78 * (q + r / 2), y: 0.68 * r, d: Math.hypot(q, r) * 0.08, a: Math.random() * 6.28 }; g.add(h); list.push(h); });
    return { g, up: (u, t) => { list.forEach(h => { const k = ease((u - h.userData.d) / 0.5); h.position.set(lerp(Math.cos(h.userData.a) * 6, h.userData.x, k), lerp(Math.sin(h.userData.a) * 4, h.userData.y, k), 0); h.rotation.z = (1 - k) * 4; }); g.rotation.y = Math.sin(t * 0.5) * 0.35; } };
  },
  orbit() { // spheres and rings orbit like an atom
    const g = new THREE.Group(), core = mesh(new THREE.IcosahedronGeometry(0.6, 1)), wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.95, 1)), M.line);
    const rings = [0, 1, 2].map(i => { const r = new THREE.Group(); const t = mesh(new THREE.TorusGeometry(1.7, 0.025, 6, 80)); const b = mesh(new THREE.SphereGeometry(0.16, 16, 12), i === 1 ? M.crimson : M.gold); b.position.x = 1.7; r.add(t, b); r.rotation.set(i * 1.05, i * 0.6, 0); g.add(r); return r; });
    g.add(core, wire);
    return { g, up: (u, t) => { rings.forEach((r, i) => r.children[0].parent.rotation.z = t * (1 + i * 0.4)); core.rotation.y = t; wire.rotation.y = -t * 0.6; g.scale.setScalar(back(u / 0.6) || 0.001); } };
  },
  crown() { // finale: a slow gold crown of rings
    const g = new THREE.Group(), rings = [1.6, 2.2, 2.8].map((r, i) => { const m = mesh(new THREE.TorusGeometry(r, 0.03, 8, 120), i === 1 ? M.crimson : M.gold); m.rotation.x = Math.PI / 2 + 0.3; g.add(m); return m; });
    return { g, up: (u, t) => rings.forEach((m, i) => { m.rotation.z = t * (0.2 + i * 0.12) * (i % 2 ? -1 : 1); m.scale.setScalar(back((u - i * 0.15) / 0.8) || 0.001); }) };
  }
};
export function makeProp(name) { const b = B[name]; return b ? b() : null; }
