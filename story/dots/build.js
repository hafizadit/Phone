// Builds the "connect the dots" IG story (1080x1920), series part 5 (hope): the old dots
// are already joined and can't move, but new coloured dots keep appearing and the line turns.
//   node build.js && node render.js
const fs = require('fs');
const path = require('path');
const { createHand, createKit, defs } = require('../shared/hand');

// "lavender": next in the series after paper -> sage -> sky -> peach
const T = {
  bg: '#dcd6ea', text: '#33285a', line: '#2f2b3a', soft: '#5a5470', old: '#6b6878', grainDark: .09, grainLight: .035,
  page: '#fbf8f0', pageBase: '#efece4',
  orange: '#f2871b', green: '#6dbb34', blue: '#2d79d2', pink: '#ec6f9a',
};

const H = createHand(6121, 'dt');
const { rnd, jit, f, line, scribbleFill, blob } = H;
const { J, shadeOf, tint, write, rule, rough } = createKit(H, T);
const out = [];
const g = (s) => out.push(s);

// ---------- the activity-book page (local coordinates, origin top-left) ----------
const PW = 620, PH = 740;
const P = [];
const p = (s) => P.push(s);
const pageQuad = [J([0, 0], 6), J([PW, 0], 6), J([PW, PH], 6), J([0, PH], 6)];
p(blob(pageQuad, T.pageBase));
p(scribbleFill(pageQuad, T.page, { spill: 14, shade: '#e6e2d8', loops: false }));
p(rough(pageQuad, T.line, 6));
p(write(40, 74, 'sambung titik', { size: 44 }));

// dots: the old ones (already joined, grey) and the new ones (colour, still arriving)
const oldDots = [
  { n: 1, at: [92, 652], label: 'gen', lx: -22, ly: 56 },
  { n: 2, at: [214, 604] },
  { n: 3, at: [176, 500], label: 'masa kecil', lx: -14, ly: -26, anchor: 'end' },
  { n: 4, at: [244, 430] },
  { n: 5, at: [306, 548], label: 'stres', lx: -26, ly: 58 },
  { n: 6, at: [388, 470] },
];
// labels: anchor 'end' puts the word to the left of the dot
const newDots = [
  { n: 7, at: [462, 382], c: T.orange, label: 'buku', lx: 30, ly: 14 },
  { n: 8, at: [360, 292], c: T.green, label: 'teman baik', lx: -26, ly: 14, anchor: 'end' },
  { n: 9, at: [486, 212], c: T.blue, label: 'terapi', lx: 6, ly: 50 },
  { n: 10, at: [392, 124], c: T.pink, label: 'story ini', lx: -26, ly: 14, anchor: 'end' },
];
// a crayon dot: a filled, grainy blob, gone over twice
const dot = (at, color, r = 10) =>
  `<circle cx="${f(at[0])}" cy="${f(at[1])}" r="${r}" fill="${color}" filter="url(#crayon)"/>` +
  `<circle cx="${f(at[0] + jit(2))}" cy="${f(at[1] + jit(2))}" r="${f(r * 0.8)}" fill="${color}" opacity=".7" filter="url(#wax)"/>`;

// the old line: one go, grey, a bit heavy-handed
p(line(oldDots.map(d => d.at), T.old, 5, { amt: 3, over: 10, retrace: 0.6 }));
// the new line turns upward, each stretch in the colour of the dot it reaches; the last one is still being drawn
const chain = [oldDots[5], ...newDots];
for (let i = 1; i < chain.length; i++) {
  const a = chain[i - 1].at, b = chain[i].at, last = i === chain.length - 1;
  const end = last ? [a[0] + (b[0] - a[0]) * 0.62, a[1] + (b[1] - a[1]) * 0.62] : b;
  p(line([a, end], chain[i].c, 6, { amt: 3, over: last ? 0 : 8, retrace: 0.6 }));
}
oldDots.forEach(d => {
  p(dot(d.at, T.line));
  p(write(d.at[0] + 12, d.at[1] - 14, String(d.n), { size: 26, fill: T.soft }));
  if (d.label) p(write(d.at[0] + d.lx, d.at[1] + d.ly, d.label, { size: 32, fill: T.old, anchor: d.anchor || 'start' }));
});
newDots.forEach(d => {
  p(dot(d.at, d.c, 11));
  p(write(d.at[0] + 14, d.at[1] - 16, String(d.n), { size: 28, fill: shadeOf(d.c, 0.35) }));
  p(write(d.at[0] + d.lx, d.at[1] + d.ly, d.label, { size: 36, anchor: d.anchor || 'start' }));
});

// a crayon still drawing the newest stretch (the same kind of crayon as in part 1)
const [pa, pb] = [chain[chain.length - 2].at, chain[chain.length - 1].at];
const tipAt = [pa[0] + (pb[0] - pa[0]) * 0.62, pa[1] + (pb[1] - pa[1]) * 0.62];
const crayon = (() => {
  const w = 32, L = 180, tip = 32, c = T.pink, q = [];
  const body = [[-w / 2, -tip], [-w / 2, -L], [w / 2, -L], [w / 2, -tip]];
  q.push(blob([[-w / 2 + 4, -tip], [0, 0], [w / 2 - 4, -tip]], tint(c, 0.3)) + scribbleFill([[-w / 2 + 4, -tip], [0, -2], [w / 2 - 4, -tip]], c, { spill: 3, loops: false }));
  q.push(blob(body, tint(c, 0.45)) + scribbleFill(body, c, { spill: 5, shade: shadeOf(c, 0.2), loops: false }));
  q.push(rough([[-w / 2 + 4, -tip], [0, 0], [w / 2 - 4, -tip]], T.line, 3.5, { closed: false }));
  q.push(rough(body, T.line, 4));
  [-tip - 26, -tip - 44, -L + 30].forEach(y => q.push(rule([[-w / 2 + 2, y], [w / 2 - 2, y + jit(3)]], T.line, 3)));
  return `<g transform="translate(${tipAt[0]} ${tipAt[1]}) rotate(58)">${q.join('')}</g>`;
})();
p(crayon);

g(`<g transform="translate(230 560) rotate(-2 ${PW / 2} ${PH / 2})">${P.join('\n')}</g>`);

// ---------- page ----------
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Connect The Dots Story</title>
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
  <div class="line top">You can't move<br>the old dots.</div>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
    <defs>${defs(T)}
    </defs>
    <g id="art" transform="translate(0 7)">
${out.join('\n')}
    </g>
  </svg>
  <div class="line bottom">But new ones keep appearing.<br>That's how people change.</div>
  <div class="label">After Robert Sapolsky, Determined</div>
  <svg width="1080" height="1920" style="pointer-events:none" aria-hidden="true"><rect width="1080" height="1920" filter="url(#paper)"/></svg>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'story.html'), html);
console.log('story.html');
