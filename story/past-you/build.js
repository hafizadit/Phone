// Builds the "Past you" IG story (1080x1920) in one or more colour themes.
//   node build.js            -> story.html in the default theme
//   node build.js --all      -> variants/<theme>.html for every theme
// The crayon drawing is generated with seeded randomness (same picture every
// run) and roughened with SVG filters for wax grain and uneven pressure.
const fs = require('fs');
const path = require('path');

const THEMES = {
  paper:  { bg: '#ece3cf', text: '#2c3a8f', line: '#3a3150', inside: '#3a3150', side: '#e7a58f', notes: '#3a3150', star: '#2f7fd8', grainDark: .09, grainLight: .035, letterOutline: false, crayons: {} },
  tomato: { bg: '#d9533a', text: '#ffe6c6', line: '#fff3df', inside: '#5b1c22', side: '#f6b48e', notes: '#fff3df', star: '#ffe6c6', grainDark: .12, grainLight: .018, letterOutline: true, crayons: { red: '#7d1838', orange: '#ffb13d' } },
  forest: { bg: '#2f4637', text: '#f1de8e', line: '#f4eedf', inside: '#16241b', side: '#c98f6c', notes: '#f4eedf', star: '#f1de8e', grainDark: .12, grainLight: .018, letterOutline: true, crayons: {} },
  butter: { bg: '#f0d25e', text: '#4a2357', line: '#3b2a55', inside: '#3b2a55', side: '#e98a6b', notes: '#3b2a55', star: '#2f7fd8', grainDark: .09, grainLight: .035, letterOutline: false, crayons: { yellow: '#1f9a94' } },
  night:  { bg: '#1f2655', text: '#ffb48a', line: '#f6efe2', inside: '#0d1130', side: '#c27c9a', notes: '#f6efe2', star: '#ffb48a', grainDark: .12, grainLight: .018, letterOutline: true, crayons: {} },
  blush:  { bg: '#e8aebb', text: '#6e1a2e', line: '#4d1a2b', inside: '#4d1a2b', side: '#f3d27a', notes: '#4d1a2b', star: '#2f7fd8', grainDark: .09, grainLight: .035, letterOutline: false, crayons: { pink: '#d23c74' } },
};
const DEFAULT_THEME = 'paper';

const CRAYON = { red: '#e2402c', orange: '#f2871b', yellow: '#f4cf1d', green: '#6dbb34', blue: '#2d79d2', pink: '#ef86ab', purple: '#7a3fa3' };

function build(themeName) {
  const T = THEMES[themeName];
  const K = { ...CRAYON, ...(T.crayons || {}) };   // per-theme swaps so no crayon vanishes into the background

  // ---------- seeded randomness (reset per build so every theme gets the same drawing) ----------
  let seed = 7319;
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const f = (n) => n.toFixed(1);

  // ---------- hand-line helpers ----------
  function resample(pts, step = 16) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
      for (let k = 0; k < n; k++) out.push([x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n]);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  // a line that drifts like a real hand: slow wander + small tremor + loose ends
  function handPath(pts, { amt = 3, over = 10 } = {}) {
    let p = resample(pts);
    let dx = 0, dy = 0, vx = 0, vy = 0;
    p = p.map(([x, y]) => {
      vx = vx * 0.7 + jit(amt * 0.35); vy = vy * 0.7 + jit(amt * 0.35);
      dx = dx * 0.85 + vx; dy = dy * 0.85 + vy;
      return [x + dx + jit(amt * 0.3), y + dy + jit(amt * 0.3)];
    });
    if (p.length > 1) {
      const ext = (a, b, k) => [a[0] + (a[0] - b[0]) / Math.hypot(a[0] - b[0], a[1] - b[1] || 1e-6) * k, a[1] + (a[1] - b[1]) / Math.hypot(a[0] - b[0] || 1e-6, a[1] - b[1]) * k];
      p.unshift(ext(p[0], p[1], rnd() * over));
      p.push(ext(p[p.length - 1], p[p.length - 2], rnd() * over));
    }
    let d = `M${f(p[0][0])},${f(p[0][1])}`;
    for (let i = 1; i < p.length - 1; i++) d += ` Q${f(p[i][0])},${f(p[i][1])} ${f((p[i][0] + p[i + 1][0]) / 2)},${f((p[i][1] + p[i + 1][1]) / 2)}`;
    const L = p[p.length - 1]; return d + ` L${f(L[0])},${f(L[1])}`;
  }
  const pathEl = (d, color, w, op = 1, filter = 'crayon') =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}" filter="url(#${filter})"/>`;

  // one stroke, sometimes gone over a second time (only part of it, slightly off)
  function line(pts, color, w, { amt = 3, over = 10, retrace = 0.55, op = 1 } = {}) {
    let s = pathEl(handPath(pts, { amt, over }), color, w * (0.85 + rnd() * 0.3), op);
    if (rnd() < retrace) {
      const r = resample(pts, 8), a = Math.floor(rnd() * r.length * 0.4), b = Math.floor(r.length * (0.6 + rnd() * 0.4));
      const part = r.slice(a, Math.max(a + 2, b)).map(([x, y]) => [x + jit(3), y + jit(3)]);
      s += pathEl(handPath(part, { amt, over: 6 }), color, w * (0.5 + rnd() * 0.3), op * 0.9);
    }
    return s;
  }
  // shape outline drawn edge by edge, corners don't quite meet
  function outline(poly, color, w, { closed = true, amt = 3, over = 12 } = {}) {
    const edges = [];
    const n = closed ? poly.length : poly.length - 1;
    for (let i = 0; i < n; i++) edges.push([poly[i], poly[(i + 1) % poly.length]]);
    return edges.map(([a, b]) => line([[a[0] + jit(4), a[1] + jit(4)], [b[0] + jit(4), b[1] + jit(4)]], color, w, { amt, over })).join('\n');
  }
  // loose back-and-forth colouring: uneven spacing, misses spots, goes over the lines
  let clipN = 0;
  function colorIn(poly, color, { gap = 12, w = 10, angle = 0.6, op = 0.92, spill = 10, sparse = 0.08 } = {}) {
    const id = `${themeName}-c${clipN++}`;
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const grown = poly.map(([x, y]) => { const l = Math.hypot(x - cx, y - cy) || 1, e = spill * (0.2 + rnd()) ; return [x + (x - cx) / l * e, y + (y - cy) / l * e]; });
    const xs = grown.map(p => p[0]), ys = grown.map(p => p[1]);
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 30;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const pts = []; let flip = false;
    for (let t = -R; t <= R; t += gap * (0.6 + rnd() * 0.9)) {
      if (rnd() < sparse) { t += gap * 1.5; continue; }        // a missed patch
      const a = [-R + jit(30), t + jit(4)], b = [R + jit(30), t + gap * 0.6 + jit(5)];
      (flip ? [b, a] : [a, b]).forEach(([u, v]) => pts.push([cx + u * ca - v * sa, cy + u * sa + v * ca]));
      flip = !flip;
    }
    const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    return `<clipPath id="${id}"><path d="${handPath(grown, { amt: 4, over: 0 })}Z"/></clipPath>
<g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" opacity="${op}" filter="url(#wax)"/></g>`;
  }

  // ---------- wobbly capitals (unit box) ----------
  const arc = (cx, cy, rx, ry, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const GLYPHS = {
    P: [[[0.02, 1.04], [0, 0]], [[-0.02, 0.02], [0.4, 0], ...arc(0.42, 0.29, 0.44, 0.29, -90, 95), [0.03, 0.6]]],
    A: [[[0, 1], [0.48, -0.02], [1, 1.03]], [[0.18, 0.64], [0.86, 0.6]]],
    S: [[[0.95, 0.16], [0.64, -0.02], [0.22, 0.03], [0.02, 0.22], [0.2, 0.44], [0.74, 0.55], [0.98, 0.78], [0.8, 0.98], [0.38, 1.03], [0.02, 0.85]]],
    T: [[[-0.1, 0.04], [1.08, -0.03]], [[0.46, 0], [0.52, 1.05]]],
    Y: [[[0, 0], [0.5, 0.52]], [[1.02, -0.04], [0.5, 0.52], [0.47, 1.04]]],
    O: [[...arc(0.5, 0.5, 0.52, 0.53, -110, 262, 18)]],
    U: [[[0, -0.02], [0.02, 0.56], ...arc(0.5, 0.56, 0.49, 0.46, 180, 0, 10), [1.02, -0.05]]],
  };
  function letter(ch, x, y, w, h, color, sw) {
    const rot = jit(9), s = 0.9 + rnd() * 0.22;
    const cx = x + w / 2, cy = y + h / 2;
    const polys = GLYPHS[ch].map(poly => poly.map(([u, v]) => [x + u * w, y + v * h]));
    const ox = jit(3), oy = jit(3);
    const body = polys.map(p => [
      T.letterOutline ? pathEl(handPath(p.map(([a, b]) => [a + ox, b + oy]), { amt: 3, over: 6 }), T.line, sw + 9, 0.95) : '',
      line(p, color, sw, { amt: 3, over: 6, retrace: 0.7 }),
    ].join('\n')).join('\n');
    return `<g transform="rotate(${f(rot)} ${f(cx)} ${f(cy)}) translate(${f(cx)} ${f(cy)}) scale(${f(s)}) translate(${f(-cx)} ${f(-cy)})">${body}</g>`;
  }

  // ---------- the drawing ----------
  const out = [];
  const g = (s) => out.push(s);
  const J = (p, a = 10) => [p[0] + jit(a), p[1] + jit(a)];

  // crooked box: corners nudged by hand
  const fTL = J([300, 935]), fTR = J([792, 918]), fBR = J([785, 1268]), fBL = J([306, 1282]);
  const bTL = J([366, 868]), bTR = J([858, 852]), bBR = J([848, 1205]);
  const topFace = [fTL, fTR, bTR, bTL];
  const side = [fTR, bTR, bBR, fBR];

  g(colorIn(topFace, T.inside, { gap: 10, w: 10, angle: 0.2, spill: 4 }));
  g(colorIn(side, T.side, { gap: 15, w: 8, angle: 1.25, op: 0.85, spill: 8, sparse: 0.15 }));

  // crayons: uneven widths, heights and lean
  const crayons = [
    { x: 345, top: 650, w: 60, lean: -6, color: K.red },
    { x: 428, top: 592, w: 66, lean: -2, color: K.orange },
    { x: 514, top: 640, w: 58, lean: 3, color: K.green },
    { x: 596, top: 570, w: 64, lean: -1, color: K.blue },
    { x: 684, top: 668, w: 60, lean: 7, color: K.yellow },
  ];
  const base = 905;
  crayons.forEach((c) => {
    const l = c.x, r = c.x + c.w, t = c.top, tipH = 50 + rnd() * 16, mid = l + c.w / 2 + jit(5);
    const bodyPoly = [[l, base + 40], [l + jit(2), t], [r + jit(2), t], [r, base + 40]];
    const tipPoly = [[l + 8, t + 2], [mid, t - tipH], [r - 8, t + 2]];
    const cg = [];
    cg.push(colorIn(bodyPoly, c.color, { gap: 10, w: 10, angle: 1.3 + jit(0.25), spill: 9 }));
    cg.push(colorIn(tipPoly, c.color, { gap: 8, w: 8, angle: 0.3 + jit(0.3), spill: 6 }));
    cg.push(outline([[l, base + 20], [l, t], [r, t], [r, base + 20]], T.line, 6.5, { closed: false, over: 7 }));
    cg.push(outline([[l + 7, t], [mid, t - tipH], [r - 7, t]], T.line, 6.5, { closed: false, over: 3 }));
    // wavy wrapper bands, not all the same
    [t + 30 + jit(4), t + 50 + jit(4), base - 75 + jit(6)].forEach((yy, k) => {
      if (k === 2 && rnd() < 0.4) return;
      cg.push(line([[l + 3, yy], [mid, yy + jit(5)], [r - 3, yy + jit(4)]], T.line, 3.5, { amt: 2, over: 3, retrace: 0.2 }));
    });
    g(`<g transform="rotate(${c.lean} ${l + c.w / 2} ${base})">${cg.join('\n')}</g>`);
  });

  // front face: background fill hides crayon bottoms, then a loose outline
  const front = [fTL, fTR, fBR, fBL];
  g(`<path d="${handPath(front, { amt: 2, over: 0 })}Z" fill="${T.bg}"/>`);
  g(outline(front, T.line, 8));
  g(outline([fTR, bTR, bTL, fTL], T.line, 7, { closed: false }));
  g(outline([bTR, bBR, fBR], T.line, 7, { closed: false }));
  g(line([J(fBR, 4), J([fBR[0] + 10, fBR[1] + 3], 2)], T.line, 5)); // a little slip of the hand

  // PAST / YOU, wonky
  const lw = T.letterOutline ? 16 : 19;
  [['P', K.red], ['A', K.orange], ['S', K.green], ['T', K.blue]]
    .forEach(([ch, c], i) => g(letter(ch, 340 + i * 106 + jit(8), 970 + jit(10), 72 + jit(8), 112 + jit(10), c, lw)));
  [['Y', K.yellow], ['O', K.pink], ['U', K.purple]]
    .forEach(([ch, c], i) => g(letter(ch, 395 + i * 116 + jit(8), 1122 + jit(10), 84 + jit(8), 110 + jit(10), c, lw)));

  // handwritten notes: each letter gets its own little tilt and bounce
  const notes = [
    { text: 'genes', x: 88, y: 612, rot: -8, arrow: [[214, 626], [262, 640], [316, 690]] },
    { text: 'childhood', x: 62, y: 830, rot: -5, arrow: [[214, 780], [276, 744], [330, 758]] },
    { text: 'stress', x: 868, y: 548, rot: 6, arrow: [[860, 566], [770, 566], [682, 604]] },
    { text: 'hormones', x: 838, y: 772, rot: 3, arrow: [[876, 718], [826, 688], [774, 712]] },
  ];
  notes.forEach(n => {
    const rots = [...n.text].map(() => f(jit(9))).join(' ');
    const dys = [...n.text].map(() => f(jit(3.5))).join(' ');
    g(`<text x="${n.x}" y="${n.y}" transform="rotate(${n.rot} ${n.x} ${n.y})" font-family="Gochi Hand" font-size="52" fill="${T.notes}" rotate="${rots}" dy="${dys}" filter="url(#crayon)">${n.text}</text>`);
    const a = n.arrow, e = a[a.length - 1], p = a[a.length - 2];
    const ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
    const head = (da, len) => [e[0] - len * Math.cos(ang + da), e[1] - len * Math.sin(ang + da)];
    g(line(a, T.notes, 4.5, { amt: 2.5, over: 4, retrace: 0.3 }));
    g(line([head(0.45 + jit(0.15), 20 + jit(5)), e], T.notes, 4.5, { amt: 1, over: 3, retrace: 0 }));
    g(line([head(-0.5 + jit(0.15), 18 + jit(5)), e], T.notes, 4.5, { amt: 1, over: 3, retrace: 0 }));
  });

  // a few dots and a scribbled star
  [[208, 1050, K.green, 7], [886, 1000, K.blue, 9], [250, 1262, K.blue, 6], [906, 1190, K.purple, 5], [176, 520, K.pink, 6], [934, 866, K.orange, 7]]
    .forEach(([x, y, c, r]) => g(line(Array.from({ length: 9 }, (_, i) => { const a = i / 8 * Math.PI * 2.15; return [x + r * Math.cos(a), y + r * Math.sin(a)]; }), c, 5, { amt: 1, over: 2, retrace: 0 })));
  const star = [548, 1352];
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 4 + jit(0.12), L = 18 + rnd() * 10;
    g(line([[star[0] - L * Math.cos(a), star[1] - L * Math.sin(a)], [star[0] + L * Math.cos(a), star[1] + L * Math.sin(a)]], T.star, 4, { amt: 1, over: 3, retrace: 0 }));
  }

  // ---------- page ----------
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Past You Story</title>
<style>
  @font-face { font-family: "DM Sans"; font-weight: 100 1000; src: url(__FONTS__/DMSans-var.woff2) format("woff2"); }
  @font-face { font-family: "Gochi Hand"; src: url(__FONTS__/GochiHand.woff2) format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; }
  .story { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: ${T.bg}; color: ${T.text};
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
      <!-- crayon line: wobble + wax grain + patchy pressure -->
      <filter id="crayon" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="4" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.55 1.1" numOctaves="2" seed="11" result="grain"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="21" result="press"/>
        <feComposite in="grain" in2="press" operator="arithmetic" k2="1" k3="0.9" result="mix"/>
        <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.62" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <!-- crayon colouring: grainier, lighter, more paper showing through -->
      <filter id="wax" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="7" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.7 1.3" numOctaves="3" seed="2" result="grain"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" seed="33" result="press"/>
        <feComposite in="grain" in2="press" operator="arithmetic" k2="1" k3="1" result="mix"/>
        <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.3 0 0 0 -0.72" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <!-- paper: fine tooth + faint blotches, kept light -->
      <filter id="paper" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="9" result="tooth"/>
        <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2 0 0 0 1.25" result="dark"/>
        <feFlood flood-color="#000" flood-opacity="${T.grainDark}"/>
        <feComposite in2="dark" operator="in" result="darkSpecks"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves="3" seed="14" result="blot"/>
        <feColorMatrix in="blot" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.75" result="blotA"/>
        <feComponentTransfer in="blotA" result="blotSoft"><feFuncA type="linear" slope="${T.grainLight}"/></feComponentTransfer>
        <feMerge><feMergeNode in="blotSoft"/><feMergeNode in="darkSpecks"/></feMerge>
      </filter>
    </defs>
    <g transform="rotate(-5 545 940)">
${out.join('\n')}
    </g>
  </svg>
  <div class="line bottom">Past you could only draw<br>with the crayons they were given.</div>
  <div class="label">After Robert Sapolsky, Determined</div>
  <svg width="1080" height="1920" style="pointer-events:none" aria-hidden="true"><rect width="1080" height="1920" filter="url(#paper)"/></svg>
</div>
</body>
</html>
`;
}

module.exports = { build, THEMES };

if (require.main === module) {
  const dir = __dirname;
  if (process.argv.includes('--all')) {
    fs.mkdirSync(path.join(dir, 'variants'), { recursive: true });
    for (const name of Object.keys(THEMES)) {
      fs.writeFileSync(path.join(dir, 'variants', `${name}.html`), build(name).replace(/__FONTS__/g, '../fonts'));
      console.log(`variants/${name}.html`);
    }
  } else {
    const name = process.argv[2] || DEFAULT_THEME;
    fs.writeFileSync(path.join(dir, 'story.html'), build(name).replace(/__FONTS__/g, 'fonts'));
    console.log(`story.html (${name})`);
  }
}
