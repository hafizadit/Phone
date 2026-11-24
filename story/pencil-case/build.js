// Builds the "pencil case" IG story (1080x1920), series part 3: a fancy 3-tier pencil
// case ("punya dia") next to a plastic bag with one stubby pencil ("punya kamu").
//   node build.js && node render.js
const fs = require('fs');
const path = require('path');
const { createHand, createKit, defs } = require('../shared/hand');

// "sky": next in the series after paper (cream) and sage (green)
const T = {
  bg: '#cdd9e4', text: '#1d3150', line: '#2c3340', soft: '#4a5363', grainDark: .09, grainLight: .035,
  pink: '#f29ab3', lilac: '#c6a2ea', yellow: '#f5d64a', lid: '#ec7fa0',
  bag: '#fbfbf8', bagShade: '#d9dde3',
  pencil: '#f4c430', eraser: '#ef8fa8', wood: '#e9c79c', lead: '#3a3a3a',
  red: '#e2402c', green: '#6dbb34', blue: '#2d79d2', orange: '#f2871b', purple: '#7a3fa3',
};

const H = createHand(2207, 'pc');
const { rnd, jit, line, scribbleFill, blob } = H;
const { J, shadeOf, tint, write, rule, rough, arrow } = createKit(H, T);
const out = [];
const g = (s) => out.push(s);
// colour a shape the series way: solid light base (so nothing shows through) + messy crayon on top + rough outline
const shape = (poly, color, { spill = 18, outlineW = 5.5, loops = true } = {}) =>
  blob(poly, tint(color, 0.55)) + scribbleFill(poly, color, { spill, shade: shadeOf(color, 0.18), loops }) + rough(poly, T.line, outlineW);

// ================= punya dia: the 3-tier pencil case =================
// lid, hinged at the back and swung open; stickers on the inside
const lid = [J([168, 800]), J([586, 794]), J([612, 548]), J([190, 560])];
g(shape(lid, T.lid));
// stickers: a star, a heart and one that says "gizi cukup"
const star = (cx, cy, r, color) => {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return [cx + rr * Math.cos(a) + jit(2), cy + rr * Math.sin(a) + jit(2)]; });
  return shape(pts, color, { spill: 6, outlineW: 3.5, loops: false });
};
g(star(258, 628, 40, T.yellow));
const heart = Array.from({ length: 24 }, (_, i) => { const t = i / 24 * Math.PI * 2; return [540 + 2.2 * 16 * Math.sin(t) ** 3, 624 - 2.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]; });
g(shape(heart, T.red, { spill: 5, outlineW: 3.5, loops: false }));
const tag = [J([318, 594], 4), J([480, 588], 4), J([484, 662], 4), J([322, 668], 4)];
g(shape(tag, '#fbf7ec', { spill: 6, outlineW: 3.5, loops: false }));
g(write(401, 640, 'gizi cukup', { size: 34, anchor: 'middle' }));

// lots of pens and pencils standing up inside
const pens = [[196, 752, T.red], [236, 738, T.blue], [276, 760, T.green], [316, 732, T.orange], [356, 756, T.purple], [396, 742, T.pink], [436, 728, T.blue], [476, 754, T.yellow], [516, 740, T.green]];
pens.forEach(([x, top, c]) => {
  const w = 26 + jit(3), base = 830, tip = 22 + rnd() * 8, mid = x + w / 2 + jit(2);
  g(blob([[x, base], [x, top], [mid, top - tip], [x + w, top], [x + w, base]], tint(c, 0.5)));
  g(scribbleFill([[x, base], [x, top], [x + w, top], [x + w, base]], c, { spill: 6, loops: false }));
  g(rough([[x, base], [x, top], [mid, top - tip], [x + w, top], [x + w, base]], T.line, 3.5, { closed: false }));
});

// the three tiers, each a little out of line, labelled with what came in the box
const tiers = [
  { x0: 132, x1: 552, y0: 812, y1: 928, color: T.pink, label: 'les privat' },
  { x0: 146, x1: 566, y0: 928, y1: 1044, color: T.lilac, label: 'rumah tenang' },
  { x0: 126, x1: 546, y0: 1044, y1: 1160, color: T.yellow, label: 'ortu ada waktu' },
];
tiers.forEach((t, i) => {
  g(shape([J([t.x0, t.y0], 5), J([t.x1, t.y0], 5), J([t.x1, t.y1], 5), J([t.x0, t.y1], 5)], t.color, { spill: 14 }));
  g(write(t.x0 + 28, t.y0 + 72, t.label, { size: 44 }));
  // a little button on the side, like the real ones
  const bx = t.x1 - 34, by = (t.y0 + t.y1) / 2;
  g(shape(Array.from({ length: 10 }, (_, k) => { const a = k / 10 * Math.PI * 2; return [bx + 13 * Math.cos(a), by + 13 * Math.sin(a)]; }), T.red, { spill: 3, outlineW: 3, loops: false }));
});
g(write(340, 1240, 'punya dia', { size: 46, anchor: 'middle' }));

// ================= punya kamu: a plastic bag with one stubby pencil =================
// the stub, worn down, sticking out of the bag
const sx = 812, sy = 930, ang = -12;
const stub = [];
const sp = (pts, color, opts) => stub.push(shape(pts, color, opts));
sp([[sx - 14, sy - 80], [sx + 14, sy - 80], [sx + 14, sy - 104], [sx - 14, sy - 104]], T.eraser, { spill: 4, outlineW: 3.5, loops: false });  // chewed eraser
stub.push(rough([[sx - 15, sy - 80], [sx + 15, sy - 80]], T.line, 3));
sp([[sx - 14, sy + 10], [sx - 14, sy - 80], [sx + 14, sy - 80], [sx + 14, sy + 10]], T.pencil, { spill: 4, outlineW: 3.5, loops: false });
g(`<g transform="rotate(${ang} ${sx} ${sy})">${stub.join('')}</g>`);

// the bag (drawn after, so the pencil disappears into it): a kresek with two ears
const bag = [[668, 1000], [676, 900], [690, 846], [716, 836], [736, 872], [770, 912], [812, 926], [856, 910], [884, 870], [904, 834], [930, 844], [944, 900], [954, 1000],
             [962, 1090], [940, 1160], [880, 1182], [812, 1188], [742, 1180], [684, 1158], [660, 1090]].map(p => J(p, 4));
g(shape(bag, T.bag, { spill: 12 }));
// holes in the ears
const hole = (cx, cy) => rough(Array.from({ length: 10 }, (_, k) => { const a = k / 10 * Math.PI * 2; return [cx + 15 * Math.cos(a), cy + 24 * Math.sin(a)]; }), T.line, 3.5);
g(hole(712, 882)); g(hole(910, 880));
// crinkles
g(rule([[716, 960], [740, 1030], [728, 1100]], T.line, 2.6));
g(rule([[900, 960], [882, 1040], [904, 1110]], T.line, 2.6));
g(rule([[790, 1120], [812, 1150], [846, 1132]], T.line, 2.4));
g(write(818, 1240, 'punya kamu', { size: 46, anchor: 'middle' }));
// note: it got used all the way down
g(write(830, 712, 'dipakai sampai', { size: 36, anchor: 'middle' }));
g(write(830, 752, 'pendek', { size: 36, anchor: 'middle' }));
g(arrow([[838, 768], [836, 792], [822, 816]]));

// ---------- page ----------
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Pencil Case Story</title>
<style>
  @font-face { font-family: "DM Sans"; font-weight: 100 1000; src: url(fonts/DMSans-var.woff2) format("woff2"); }
  @font-face { font-family: "Gochi Hand"; src: url(fonts/GochiHand.woff2) format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; }
  .story { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: ${T.bg}; color: ${T.text};
           font-family: "DM Sans", sans-serif; font-weight: 700; letter-spacing: -0.045em; text-align: center; }
  .story svg { position: absolute; inset: 0; }
  /* series composition: one centred column, even gaps */
  .line { position: absolute; left: 0; right: 0; }
  .top { top: 326px; font-size: 64px; line-height: 1.04; }
  .bottom { top: 1410px; font-size: 50px; line-height: 1.1; }
  .label { position: absolute; left: 0; right: 0; top: 1618px; font-size: 28px; letter-spacing: -0.04em; text-transform: uppercase; }
</style>
</head>
<body>
<div class="story">
  <div class="line top">Stop comparing yourself<br>to a 3-level pencil case.</div>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
    <defs>${defs(T)}
    </defs>
    <g id="art" transform="translate(0 44)">
${out.join('\n')}
    </g>
  </svg>
  <div class="line bottom">Nobody picks the kit<br>they start school with.</div>
  <div class="label">After Robert Sapolsky, Determined</div>
  <svg width="1080" height="1920" style="pointer-events:none" aria-hidden="true"><rect width="1080" height="1920" filter="url(#paper)"/></svg>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'story.html'), html);
console.log('story.html');
