// Builds the "rapor" IG story (1080x1920): a primary-school report card that says
// "Kurang rajin", with sticky notes adding what the report card left out.
//   node build.js && node render.js
const fs = require('fs');
const path = require('path');
const { createHand, defs } = require('../shared/hand');

// "sage": the next step after past-you's "paper" (same lightness and warmth, new hue)
const T = {
  bg: '#d6dcc3', text: '#22402d', line: '#2f3631', grainDark: .09, grainLight: .035,
  page: '#fbf7ec', printed: '#4f544d', rule: '#8e9388',
  pen: '#1f2d66', redPen: '#cf3426', crayonRed: '#e2402c',
  notes: { pink: '#f5aec0', yellow: '#f8e17a', blue: '#acd4ee', green: '#c4e2a6' },
};

const H = createHand(5113, 'rp');
const { jit, f, line, outline, blob } = H;
const out = [];
const g = (s) => out.push(s);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const text = (x, y, s, { font = 'DM Sans', size = 20, weight = 500, fill = T.printed, anchor = 'start', ls = 0, rot = 0, filter = '' } = {}) =>
  `<text x="${f(x)}" y="${f(y)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''}${filter ? ` filter="url(#${filter})"` : ''}>${esc(s)}</text>`;
// handwriting: every letter gets its own small tilt and bounce
const hand = (x, y, s, { font = 'Caveat', size = 44, fill = T.pen, anchor = 'start', rot = 0, wob = 4, filter = 'ink', weight = 600 } = {}) => {
  const rots = [...s].map(() => f(jit(wob))).join(' '), dys = [...s].map(() => f(jit(wob * 0.35))).join(' ');
  return `<text x="${f(x)}" y="${f(y)}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" rotate="${rots}" dy="${dys}"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''} filter="url(#${filter})">${esc(s)}</text>`;
};
const rule = (x1, y1, x2, y2, w = 2.2) => line([[x1, y1], [x2, y2]], T.rule, w, { amt: 1, over: 2, retrace: 0, filter: 'ink' });

// ---------- the report card page ----------
const P = { x0: 300, x1: 780, y0: 562, y1: 1290 };
const page = [[P.x0, P.y0 + 4], [P.x1, P.y0], [P.x1 + 5, P.y1 - 3], [P.x0 - 3, P.y1]];
g(blob(page.map(([x, y]) => [x + 10, y + 12]), '#000', 0.07));          // soft shadow under the page
g(blob(page, T.page));
g(outline(page, T.line, 6, { over: 8 }));

// printed header
g(text(540, 626, 'LAPORAN HASIL BELAJAR', { size: 23, weight: 700, anchor: 'middle', ls: 2.5 }));
g(text(540, 656, 'Semester 1  ·  Kelas 4', { size: 18, weight: 500, anchor: 'middle', ls: 0.5 }));
g(rule(330, 676, 750, 674, 2));

// name
g(text(335, 718, 'Nama', { size: 19 }));
g(text(392, 718, ':', { size: 19 }));
g(rule(408, 724, 750, 722, 1.6));
g(hand(418, 716, 'Raka', { size: 42 }));

// grades table
const TX = [330, 630, 750], TY0 = 744, HEAD = 44, ROW = 52;
const grades = [['Matematika', 58], ['Bahasa Indonesia', 74], ['IPA', 61], ['IPS', 70], ['Seni Budaya', 88]];
const KKM = 65;                                                            // passing grade; below it the teacher writes in red
const rowsY = [TY0, TY0 + HEAD, ...grades.map((_, i) => TY0 + HEAD + ROW * (i + 1))];
rowsY.forEach(y => g(rule(TX[0], y + jit(1), TX[2], y + jit(1))));
TX.forEach(x => g(rule(x + jit(1), rowsY[0], x + jit(1), rowsY[rowsY.length - 1])));
g(text(345, TY0 + 29, 'Mata Pelajaran', { size: 18, weight: 700 }));
g(text(690, TY0 + 29, 'Nilai', { size: 18, weight: 700, anchor: 'middle' }));
grades.forEach(([subj, n], i) => {
  const y = TY0 + HEAD + ROW * i;
  g(text(345, y + 34, subj, { size: 21 }));
  g(hand(690 + jit(4), y + 38, String(n), { size: 44, anchor: 'middle', fill: n < KKM ? T.redPen : T.pen, wob: 3 }));
});

// teacher's note
const NB = { x0: 330, x1: 750, y0: 1070, y1: 1252 };
g(outline([[NB.x0, NB.y0], [NB.x1, NB.y0], [NB.x1, NB.y1], [NB.x0, NB.y1]], T.rule, 2.2, { amt: 1, over: 2, retrace: 0 }));
g(text(345, 1098, 'Catatan Wali Kelas', { size: 18, weight: 700 }));
g(hand(352, 1160, 'Kurang rajin.', { size: 56 }));
g(hand(352, 1212, 'Sering melamun di kelas.', { size: 40 }));
// signature scribble
g(line([[640, 1236], [652, 1222], [660, 1240], [672, 1218], [680, 1238], [700, 1226], [728, 1230]], T.pen, 2.6, { amt: 1.2, over: 4, retrace: 0, filter: 'ink' }));
// a crayon circle someone drew around the verdict
const loop = Array.from({ length: 30 }, (_, i) => { const a = -2.6 + i / 29 * Math.PI * 2.25; return [462 + 150 * Math.cos(a) + jit(3), 1142 + 46 * Math.sin(a) + jit(3)]; });
g(line(loop, T.crayonRed, 5.5, { amt: 2, over: 6, retrace: 0.6 }));

// ---------- sticky notes: what the report card didn't say ----------
function sticky(cx, cy, rot, color, lines, size = 40) {
  const w = 196, h = 178, x0 = cx - w / 2, y0 = cy - h / 2;
  const sq = [[x0, y0], [x0 + w, y0 + jit(2)], [x0 + w + jit(2), y0 + h], [x0 + jit(2), y0 + h]];
  const s = [];
  s.push(blob(sq.map(([x, y]) => [x + 6, y + 9]), '#000', 0.08));                       // shadow
  s.push(blob(sq, color));
  s.push(blob([[x0, y0], [x0 + w, y0], [x0 + w, y0 + 26], [x0, y0 + 26]], '#000', 0.05)); // the sticky strip
  s.push(blob([[x0 + w - 34, y0 + h], [x0 + w, y0 + h - 30], [x0 + w, y0 + h]], '#000', 0.1)); // lifted corner
  s.push(outline(sq, T.line, 3, { amt: 1.5, over: 4, retrace: 0.2 }));
  const lh = size * 0.98, top = cy - (lines.length - 1) * lh / 2 + size * 0.32;
  lines.forEach((ln, i) => s.push(hand(cx, top + i * lh, ln, { font: 'Gochi Hand', size, fill: T.line, anchor: 'middle', wob: 6, filter: 'crayon', weight: 400 })));
  return `<g transform="rotate(${rot} ${cx} ${cy})">${s.join('\n')}</g>`;
}
g(sticky(228, 770, -7, T.notes.pink, ['rumah', 'lagi ribut'], 38));
g(sticky(862, 660, 6, T.notes.yellow, ['belum', 'sarapan']));
g(sticky(864, 1000, -4, T.notes.blue, ['kurang', 'tidur']));
g(sticky(228, 1124, 5, T.notes.green, ['otaknya', 'masih', 'berkembang'], 33));

// ---------- page ----------
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Rapor Story</title>
<style>
  @font-face { font-family: "DM Sans"; font-weight: 100 1000; src: url(fonts/DMSans-var.woff2) format("woff2"); }
  @font-face { font-family: "Gochi Hand"; src: url(fonts/GochiHand.woff2) format("woff2"); }
  @font-face { font-family: "Caveat"; font-weight: 400 700; src: url(fonts/Caveat-var.ttf) format("truetype"); }
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
    <g transform="rotate(-2 540 925)">
${out.join('\n')}
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
