// Builds the "rapor" IG story (1080x1920): a primary-school report card that says
// "Kurang rajin", with sticky notes adding what the report card left out.
//   node build.js && node render.js
const fs = require('fs');
const path = require('path');
const { createHand, defs } = require('../shared/hand');

// "sage": the next step after past-you's "paper" (same lightness and warmth, new hue)
const T = {
  bg: '#d6dcc3', text: '#22402d', line: '#2f3631', soft: '#4c544e', grainDark: .09, grainLight: .035,
  page: '#fbf7ec', pageBase: '#eeeddf',
  pen: '#2a47a3', red: '#e2402c',                       // blue crayon for the teacher, red crayon for bad grades
  notes: { pink: '#f29ab3', yellow: '#f5d64a', blue: '#8ec2ea', green: '#a8d589' },
};

const H = createHand(5113, 'rp');
const { rnd, jit, f, line, outline, scribbleFill, blob } = H;
// lighten a hex colour towards white (solid base under crayon hatching, so nothing shows through)
const shadeOf = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - k)).toString(16).padStart(2, '0')).join('');
const tint = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - k) + 255 * k).toString(16).padStart(2, '0')).join('');
const out = [];
const g = (s) => out.push(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const J = (p, a = 8) => [p[0] + jit(a), p[1] + jit(a)];
// written by hand in crayon: every letter has its own size, tilt, height and spacing,
// and the word is gone over a second time, slightly off
const write = (x, y, s, { size = 40, fill = T.line, anchor = 'start', rot = 0, wob } = {}) => {
  const small = size < 42;                         // small words keep a bit more control so they stay readable
  wob = wob ?? (small ? 6 : 10);
  let prev = 0;
  const spans = [...s].map((c, i) => {
    const h = jit(size * 0.09), dy = h - prev; prev = h;
    return `<tspan font-size="${f(size * (small ? 0.92 + rnd() * 0.16 : 0.86 + rnd() * 0.28))}" dx="${f(i ? size * (rnd() * (small ? 0.045 : 0.07) + (small ? 0.018 : -0.005)) : 0)}" dy="${f(small ? dy * 0.6 : dy)}" rotate="${f(jit(wob))}">${esc(c)}</tspan>`;
  }).join('');
  const pass = (ox, oy, op, filter) => `<text x="${f(x + ox)}" y="${f(y + oy)}" font-family="Gochi Hand" fill="${fill}" stroke="${fill}" stroke-width="${f(size * (small ? 0.012 : 0.022))}" stroke-linejoin="round" text-anchor="${anchor}" opacity="${op}" filter="url(#${filter})">${spans}</text>`;
  const body = pass(0, 0, 1, small ? 'crayon' : 'scrawl') + pass(jit(small ? 1.2 : 2.5), jit(small ? 1.2 : 2.5), small ? 0.3 : 0.45, 'crayon');
  return rot ? `<g transform="rotate(${rot} ${f(x)} ${f(y)})">${body}</g>` : body;
};
// lines: wobblier, overshooting corners, often gone over twice
const rule = (pts) => line(pts, T.line, 3.8, { amt: 4, over: 14, retrace: 0.65, op: 0.8 });
const rough = (poly, color, w) => outline(poly, color, w, { amt: 4.5, over: 16, retrace: 0.7 })
  + outline(poly.map(p => J(p, 5)), color, w * 0.55, { amt: 4.5, over: 10, retrace: 0 });

// ---------- the report card: a crooked sheet coloured in with white crayon ----------
const page = [J([298, 566]), J([782, 556]), J([790, 1292]), J([292, 1300])];
g(blob(page, T.pageBase));
g(scribbleFill(page, T.page, { spill: 16, shade: '#e4e2d2', loops: false }));   // white crayon, messy, runs past the edges
g(rough(page, T.line, 6.5));

g(write(540, 650, 'RAPOR', { size: 70, anchor: 'middle', wob: 5 }));
g(write(540, 694, 'kelas 4', { size: 32, anchor: 'middle', fill: T.soft }));
g(rule([[338, 716], [540, 712], [742, 714]]));
g(write(340, 772, 'nama:', { size: 34, fill: T.soft }));
g(write(436, 775, 'Raka', { size: 48, fill: T.pen }));

// grades table, drawn freehand
const X0 = 332, XM = 622, X1 = 748, rowsY = [800, 852, 914, 976, 1038];
rowsY.forEach(y => g(rule([[X0 + jit(4), y + jit(3)], [X1 + jit(4), y + jit(3)]])));
[X0, XM, X1].forEach(x => g(rule([[x + jit(3), rowsY[0] + jit(3)], [x + jit(4), rowsY[4] + jit(3)]])));
g(write(360, 838, 'pelajaran', { size: 30, fill: T.soft }));
g(write(686, 838, 'nilai', { size: 30, fill: T.soft, anchor: 'middle' }));
const KKM = 65;                                          // passing grade; below it goes red
[['Matematika', 58], ['IPA', 61], ['B. Indonesia', 74]].forEach(([subj, n], i) => {
  const y = rowsY[1] + 62 * i;
  g(write(348, y + 44, subj, { size: 36 }));
  g(write(686 + jit(4), y + 48, String(n), { size: 52, anchor: 'middle', fill: n < KKM ? T.red : T.pen, wob: 6 }));
});

// teacher's note
g(rough([[X0, 1072], [X1, 1068], [X1 + 3, 1258], [X0 - 2, 1262]], T.line, 3.6));
g(write(348, 1108, 'catatan wali kelas:', { size: 28, fill: T.soft }));
g(write(352, 1178, 'Kurang rajin.', { size: 66, fill: T.pen, wob: 5 }));
g(write(352, 1232, 'sering melamun di kelas.', { size: 32, fill: T.pen }));
// someone circled the verdict in red crayon
const loop = Array.from({ length: 30 }, (_, i) => { const a = -2.6 + i / 29 * Math.PI * 2.2; return [520 + 192 * Math.cos(a) + jit(4), 1164 + 41 * Math.sin(a) + jit(4)]; });
g(line(loop, T.red, 6, { amt: 4, over: 12, retrace: 0.7 }));

// ---------- sticky notes: what the report card didn't say ----------
function sticky(cx, cy, rot, color, lines, size = 40) {
  const w = 214, h = 196, x0 = cx - w / 2, y0 = cy - h / 2, x1 = x0 + w, y1 = y0 + h;
  const sq = [J([x0, y0], 5), J([x1, y0], 5), J([x1, y1], 5), J([x0, y1], 5)];
  const s = [];
  s.push(blob(sq, tint(color, 0.6)));
  s.push(scribbleFill(sq, color, { spill: 22, shade: shadeOf(color, 0.18) }));   // messy colouring that goes over the lines
  s.push(rough(sq, T.line, 4.5));
  s.push(line([[x1 - 38, y1 + 3], [x1 - 4, y1 - 32]], T.line, 3.5, { amt: 3, over: 8, retrace: 0.4 }));   // curled corner
  const lh = size * 0.98, top = cy - (lines.length - 1) * lh / 2 + size * 0.32;
  lines.forEach((ln, i) => s.push(write(cx, top + i * lh, ln, { size, anchor: 'middle', wob: 8 })));
  return `<g transform="rotate(${rot} ${cx} ${cy})">${s.join('\n')}</g>`;
}
g(sticky(220, 762, -8, T.notes.pink, ['rumah', 'lagi ribut'], 42));
g(sticky(860, 650, 7, T.notes.yellow, ['belum', 'sarapan'], 46));
g(sticky(862, 1004, -5, T.notes.blue, ['kurang', 'tidur'], 48));
g(sticky(222, 1134, 6, T.notes.green, ['otaknya', 'masih', 'berkembang'], 35));

// ---------- page ----------
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Rapor Story</title>
<style>
  @font-face { font-family: "DM Sans"; font-weight: 100 1000; src: url(fonts/DMSans-var.woff2) format("woff2"); }
  @font-face { font-family: "Gochi Hand"; src: url(fonts/GochiHand.woff2) format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; }
  .story { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: ${T.bg}; color: ${T.text};
           font-family: "DM Sans", sans-serif; font-weight: 700; letter-spacing: -0.045em; text-align: center; }
  .story svg { position: absolute; inset: 0; }
  /* same composition as past-you: one centred column, even gaps */
  .line { position: absolute; left: 0; right: 0; }
  .top { top: 326px; font-size: 64px; line-height: 1.04; }
  .bottom { top: 1410px; font-size: 50px; line-height: 1.1; }
  .label { position: absolute; left: 0; right: 0; top: 1618px; font-size: 28px; letter-spacing: -0.04em; text-transform: uppercase; }
</style>
</head>
<body>
<div class="story">
  <div class="line top">“Kurang rajin” was never<br>the whole story.</div>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
    <defs>${defs(T)}
    </defs>
    <g transform="translate(540 951) scale(0.94) translate(-540 -925)">
    <g transform="rotate(-2 540 925)">
${out.join('\n')}
    </g>
    </g>
  </svg>
  <div class="line bottom">Self-control is shaped by things<br>a kid never got to choose.</div>
  <div class="label">After Robert Sapolsky, Determined</div>
  <svg width="1080" height="1920" style="pointer-events:none" aria-hidden="true"><rect width="1080" height="1920" filter="url(#paper)"/></svg>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'story.html'), html);
console.log('story.html');
