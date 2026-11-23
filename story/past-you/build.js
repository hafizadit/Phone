// Builds story.html: a 1080x1920 IG story with a crayon-style crayon-box drawing.
// All "hand-drawn" lines are generated with seeded jitter, then roughened by an
// SVG crayon filter, so `node build.js` always produces the same picture.
const fs = require('fs');
const path = require('path');

// ---------- seeded randomness ----------
let seed = 20261123;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const jit = (a) => (rnd() * 2 - 1) * a;

const C = {
  bg: '#7a8ac5', text: '#dde895',
  white: '#fbf8f0', red: '#e8432e', orange: '#f2871b', yellow: '#f6d31c',
  green: '#78c43a', blue: '#2f7fd8', pink: '#f08bb0', purple: '#6f3d98', peach: '#f3b0a0',
};

// ---------- wobbly line helpers ----------
function resample(pts, step = 22) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
    for (let k = 0; k < n; k++) out.push([x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function wobble(pts, amt = 2.5, closed = false) {
  let p = resample(closed ? [...pts, pts[0]] : pts);
  let dx = 0, dy = 0;
  p = p.map(([x, y]) => { dx = dx * 0.6 + jit(amt); dy = dy * 0.6 + jit(amt); return [x + dx, y + dy]; });
  // overshoot the ends a little, like a quick hand stroke
  if (!closed && p.length > 1) {
    const [a, b] = [p[0], p[1]]; p.unshift([a[0] + (a[0] - b[0]) * 0.4, a[1] + (a[1] - b[1]) * 0.4]);
  }
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q${p[i][0].toFixed(1)},${p[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const L = p[p.length - 1]; d += ` L${L[0].toFixed(1)},${L[1].toFixed(1)}`;
  return d;
}
const stroke = (pts, color, w, { closed = false, amt = 2.5, op = 1, filter = 'crayon' } = {}) =>
  `<path d="${wobble(pts, amt, closed)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" filter="url(#${filter})"/>`;

// several loose passes in different colours, like the reference outlines
function sketch(pts, { closed = false, main = C.white, w = 6 } = {}) {
  const passes = [
    [C.pink, w * 0.7, -4, 3], [C.yellow, w * 0.6, 4, -3], [C.blue, w * 0.5, 2, 5], [main, w, 0, 0], [main, w * 0.6, 1, -1],
  ];
  return passes.map(([c, sw, ox, oy]) => stroke(pts.map(([x, y]) => [x + ox + jit(1.5), y + oy + jit(1.5)]), c, sw, { closed })).join('\n');
}
// back-and-forth crayon colouring, clipped to a polygon
let clipId = 0;
function scribble(poly, color, { gap = 11, w = 9, angle = -0.5, op = 0.95 } = {}) {
  const id = `clip${clipId++}`;
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs) - 40, Math.max(...xs) + 40, Math.min(...ys) - 40, Math.max(...ys) + 40];
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const pts = []; let flip = false;
  for (let t = -R; t <= R; t += gap) {
    const a = [-R + jit(8), t + jit(3)], b = [R + jit(8), t + gap / 2 + jit(3)];
    const seg = flip ? [b, a] : [a, b]; flip = !flip;
    seg.forEach(([u, v]) => pts.push([cx + u * ca - v * sa, cy + u * sa + v * ca]));
  }
  const d = 'M' + pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' L');
  return `<clipPath id="${id}"><path d="${wobble(poly, 2, true)}"/></clipPath>
  <g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" opacity="${op}" filter="url(#crayon-soft)"/></g>`;
}

// ---------- hand-drawn capital letters (unit box: 0..1 wide, 0..1 tall) ----------
const arc = (cx, cy, rx, ry, a0, a1, n = 14) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
});
const GLYPHS = {
  P: [[[0, 1.02], [0, 0]], [[0, 0], [0.45, 0], ...arc(0.45, 0.27, 0.42, 0.27, -90, 90), [0, 0.54]]],
  A: [[[0, 1], [0.5, 0], [1, 1]], [[0.2, 0.62], [0.82, 0.6]]],
  S: [[[0.92, 0.14], [0.62, 0], [0.25, 0.02], [0.04, 0.2], [0.18, 0.42], [0.75, 0.56], [0.97, 0.76], [0.82, 0.96], [0.42, 1.02], [0.04, 0.86]]],
  T: [[[-0.05, 0.02], [1.05, 0]], [[0.5, 0], [0.5, 1.02]]],
  Y: [[[0, 0], [0.5, 0.5]], [[1, 0], [0.5, 0.5], [0.5, 1.02]]],
  O: [[...arc(0.5, 0.5, 0.52, 0.52, -100, 255, 22)]],
  U: [[[0, 0], [0, 0.55], ...arc(0.5, 0.55, 0.5, 0.45, 180, 0, 12), [1, 0]]],
};
function letter(ch, x, y, w, h, color, sw = 17) {
  const polys = GLYPHS[ch].map(poly => poly.map(([u, v]) => [x + u * w, y + v * h]));
  return polys.map(p => [
    stroke(p, C.white, sw + 11, { amt: 2 }),   // white outline
    stroke(p, color, sw, { amt: 2 }),         // colour core
  ].join('\n')).join('\n');
}

// ---------- the drawing ----------
const out = [];
const g = (s) => out.push(s);

// box geometry
const F = { x0: 300, x1: 790, y0: 930, y1: 1270 };   // front face
const D = [64, -62];                                  // depth offset (back edge)
const topFace = [[F.x0, F.y0], [F.x1, F.y0], [F.x1 + D[0], F.y0 + D[1]], [F.x0 + D[0], F.y0 + D[1]]];
const side = [[F.x1, F.y0], [F.x1 + D[0], F.y0 + D[1]], [F.x1 + D[0], F.y1 + D[1]], [F.x1, F.y1]];

// box interior (dark opening) and right side
g(scribble(topFace, C.purple, { gap: 9, w: 9, angle: 0.15 }));
g(scribble(side, C.peach, { gap: 13, w: 7, angle: 1.2, op: 0.85 }));

// crayons standing in the box
const crayons = [
  { x: 352, top: 642, color: C.red },
  { x: 437, top: 590, color: C.orange },
  { x: 522, top: 625, color: C.green },
  { x: 607, top: 575, color: C.blue },
  { x: 692, top: 655, color: C.yellow },
];
const CW = 62, base = 905;
crayons.forEach((c, i) => {
  const l = c.x, r = c.x + CW, t = c.top, tipH = 58;
  const body = [[l, base], [l, t], [r, t], [r, base]];
  const tip = [[l + 7, t], [l + CW / 2 + jit(3), t - tipH], [r - 7, t]];
  g(scribble([[l, base + 40], [l, t], [r, t], [r, base + 40]], c.color, { gap: 9, w: 9, angle: 1.35 + jit(0.15) }));
  g(scribble([[l + 7, t + 2], [l + CW / 2, t - tipH], [r - 7, t + 2]], c.color, { gap: 7, w: 7, angle: 0.2 }));
  g(sketch([[l, base + 30], ...body.slice(1), [r, base + 30]], { w: 5 }));
  g(sketch(tip, { w: 5 }));
  // paper wrapper bands
  [t + 34, t + 52, base - 70, base - 52].forEach(yy => g(stroke([[l + 3, yy], [r - 3, yy + jit(3)]], C.white, 4, { amt: 1.5, op: 0.9 })));
});

// front face drawn over the crayon bottoms: fill with background so it hides them
const front = [[F.x0, F.y0], [F.x1, F.y0], [F.x1, F.y1], [F.x0, F.y1]];
g(`<path d="${wobble(front, 1.5, true)}" fill="${C.bg}"/>`);
g(sketch(front, { closed: true, w: 7 }));
g(sketch(topFace.slice(1), { w: 6 }));
g(sketch([topFace[3], topFace[0]], { w: 6 }));
g(sketch([side[1], side[2], side[3]], { w: 6 }));
// a light scribble along the top front lip
g(scribble([[F.x0, F.y0], [F.x1, F.y0], [F.x1, F.y0 + 22], [F.x0, F.y0 + 22]], C.peach, { gap: 7, w: 6, angle: 0.1, op: 0.7 }));

// "PAST" / "YOU" lettering on the front
const row1 = ['P', 'A', 'S', 'T'], cols1 = [C.red, C.orange, C.green, C.blue];
row1.forEach((ch, i) => g(letter(ch, 345 + i * 105 + jit(4), 975 + jit(6) + (i % 2) * 6, 74, 108, cols1[i])));
const row2 = ['Y', 'O', 'U'], cols2 = [C.yellow, C.pink, C.purple];
row2.forEach((ch, i) => g(letter(ch, 400 + i * 115 + jit(4), 1125 + jit(6) - (i % 2) * 5, 82, 108, cols2[i])));

// handwritten notes with arrows pointing at the crayons
const notes = [
  { text: 'genes', x: 92, y: 610, rot: -6, arrow: [[218, 620], [270, 640], [338, 690]] },
  { text: 'childhood', x: 70, y: 812, rot: -4, arrow: [[226, 770], [290, 742], [340, 750]] },
  { text: 'stress', x: 872, y: 552, rot: 5, arrow: [[868, 568], [790, 572], [690, 610]] },
  { text: 'hormones', x: 846, y: 760, rot: 4, arrow: [[880, 712], [830, 690], [772, 712]] },
];
notes.forEach(n => {
  g(`<text x="${n.x}" y="${n.y}" transform="rotate(${n.rot} ${n.x} ${n.y})" font-family="Gochi Hand" font-size="50" fill="${C.white}" filter="url(#crayon-text)">${n.text}</text>`);
  const a = n.arrow, e = a[a.length - 1], p = a[a.length - 2];
  const ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
  const head = (da) => [e[0] - 22 * Math.cos(ang + da), e[1] - 22 * Math.sin(ang + da)];
  g(stroke(a, C.white, 4.5, { amt: 1.5 }));
  g(stroke([head(0.5), e, head(-0.5)], C.white, 4.5, { amt: 1 }));
});

// little crayon dots and a star, like the reference
[[210, 1040, C.green, 7], [884, 1000, C.blue, 9], [248, 1250, C.blue, 6], [902, 1180, C.purple, 5], [180, 520, C.pink, 5], [930, 860, C.orange, 6]]
  .forEach(([x, y, c, r]) => g(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="5" filter="url(#crayon)"/>`));
const star = [545, 1350];
for (let k = 0; k < 4; k++) {
  const a = k * Math.PI / 4;
  g(stroke([[star[0] - 22 * Math.cos(a), star[1] - 22 * Math.sin(a)], [star[0] + 22 * Math.cos(a), star[1] + 22 * Math.sin(a)]], C.blue, 4, { amt: 1 }));
}

// ---------- page ----------
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Past You Story</title>
<style>
  @font-face { font-family: "DM Sans"; font-weight: 100 1000; src: url(fonts/DMSans-var.woff2) format("woff2"); }
  @font-face { font-family: "Gochi Hand"; src: url(fonts/GochiHand.woff2) format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; }
  .story { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: ${C.bg}; color: ${C.text};
           font-family: "DM Sans", sans-serif; font-weight: 700; letter-spacing: -0.045em; text-align: center; }
  .story svg { position: absolute; inset: 0; }
  .line { position: absolute; left: 0; right: 0; font-size: 58px; line-height: 1.04; }
  .top { top: 300px; }
  .bottom { top: 1460px; }
  .label { position: absolute; left: 0; right: 0; top: 1680px; font-size: 30px; letter-spacing: -0.04em; text-transform: uppercase; }
</style>
</head>
<body>
<div class="story">
  <div class="line top">Stop hating yourself<br>for who you used to be.</div>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
    <defs>
      <filter id="crayon" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3.2 0 0 0 -0.75" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <filter id="crayon-soft" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="2" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 -0.55" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <filter id="crayon-text" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="5" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.6" result="mask"/>
        <feComposite in="SourceGraphic" in2="mask" operator="in"/>
      </filter>
    </defs>
    <g transform="rotate(-6 545 940)">
${out.join('\n')}
    </g>
  </svg>
  <div class="line bottom">Past you could only draw<br>with the crayons they were given.</div>
  <div class="label">After Robert Sapolsky, Determined</div>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'story.html'), html);
console.log('wrote story.html');
