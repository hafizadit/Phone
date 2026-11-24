// Builds the "tracing paper" IG story (1080x1920), series part 4: a house drawing
// copied down the generations on see-through tracing paper (kakek-nenek -> orang tua -> kamu).
//   node build.js && node render.js
const fs = require('fs');
const path = require('path');
const { createHand, createKit, defs } = require('../shared/hand');

// "peach": next in the series after paper -> sage -> sky
const T = {
  bg: '#efd9c7', text: '#4b2a22', line: '#3a2f2c', soft: '#5e4c46', grainDark: .09, grainLight: .035,
  paper: '#f8f1e4', trace: '#fffdf8',
  roof: '#e2402c', door: '#2d79d2', wall: '#f5d64a', sun: '#f2871b', grass: '#6dbb34',
  pencil: '#f4c430', eraser: '#ef8fa8', wood: '#e9c79c', lead: '#3a3a3a',
};

const H = createHand(4409, 'tr');
const { rnd, jit, f, line, scribbleFill, blob } = H;
const { J, shadeOf, tint, write, rule, rough, arrow } = createKit(H, T);
const out = [];
const g = (s) => out.push(s);

// ---------- the drawing that gets copied: a simple house (sheet-local coordinates) ----------
// `part` = how much of it is traced so far (1 = all), `colour` = whether it's coloured in
function house({ part = 1, colour = true, wob = 5, k = 0.74, hx = -28, hy = -6 } = {}) {
  const s = [];
  // drawn at scale k inside the sheet (points are scaled, so crayon lines keep their width)
  const P = (pts) => pts.map(([x, y]) => J([hx + x * k, hy + y * k], wob));
  const body = P([[110, 250], [330, 250], [330, 420], [110, 420]]);
  const roof = P([[90, 252], [220, 128], [350, 252]]);
  const door = P([[190, 420], [190, 330], [250, 330], [250, 420]]);
  const win = P([[270, 290], [312, 290], [312, 328], [270, 328]]);
  const chim = P([[285, 196], [285, 150], [312, 150], [312, 222]]);
  if (colour) {
    s.push(blob(roof, tint(T.roof, 0.5)) + scribbleFill(roof, T.roof, { spill: 12, shade: shadeOf(T.roof, 0.2), loops: false }));
    s.push(blob(body, tint(T.wall, 0.5)) + scribbleFill(body, T.wall, { spill: 12, shade: shadeOf(T.wall, 0.15), loops: false }));
    s.push(scribbleFill(door, T.door, { spill: 6, loops: false }));
    s.push(rule(P([[60, 424], [380, 420]]), T.grass, 6));
  }
  const strokes = [
    () => rough(roof, T.line, 4.5, { closed: false }),
    () => rough([body[0], body[3], body[2], body[1]], T.line, 4.5, { closed: false }),
    () => rough(chim, T.line, 3.5, { closed: false }),
    () => rough(door, T.line, 3.5, { closed: false }),
    () => rough(win, T.line, 3.5),
  ];
  if (part < 1) {                                   // still being traced: roof, left wall, half the floor
    s.push(strokes[0]());
    s.push(rough([body[0], body[3], [(body[3][0] + body[2][0]) / 2, body[3][1] + jit(2)]], T.line, 4.5, { closed: false }));
  } else strokes.forEach(fn => s.push(fn()));
  return s.join('\n');
}

// ---------- three sheets, each laid a little further down and to the right ----------
const W = 380, Hh = 400;
function sheet(ox, oy, rot, { fill, op, label, content }) {
  const corners = [J([0, 0], 4), J([W, 0], 4), J([W, Hh], 4), J([0, Hh], 4)];
  const s = [];
  s.push(blob(corners, fill, op));
  if (op > 0.9) s.push(scribbleFill(corners, fill, { spill: 10, shade: shadeOf(fill, 0.06), loops: false }));
  else s.push(`<g opacity="0.35">${scribbleFill(corners, '#ffffff', { spill: 8, loops: false })}</g>`);
  s.push(rough(corners, T.line, 4));
  s.push(content);
  s.push(write(W - 24, 54, label, { size: 36, fill: T.soft, anchor: 'end' }));   // top-right: never under the house below
  return `<g transform="translate(${ox} ${oy}) rotate(${rot} ${W / 2} ${Hh / 2})">${s.join('\n')}</g>`;
}
const S = [[200, 560, -4], [350, 690, 2], [500, 820, -1.5]];
g(sheet(...S[0], { fill: T.paper, op: 1, label: 'kakek-nenek', content: house({ wob: 4 }) }));
g(sheet(...S[1], { fill: T.trace, op: 0.46, label: 'orang tua', content: house({ wob: 7 }) }));
// the newest sheet: only half traced, pencil still on it
const pencilAt = [-28 + 165 * 0.74, -6 + 421 * 0.74];
const pencil = (() => {
  const [px, py] = pencilAt, a = 145, L = 130, w = 20;
  const p = [];
  p.push(blob([[0, 0], [-w / 2, -40], [w / 2, -40]], T.wood));
  p.push(blob([[-4, -8], [4, -8], [0, 0]], T.lead));
  p.push(blob([[-w / 2, -40], [-w / 2, -L], [w / 2, -L], [w / 2, -40]], tint(T.pencil, 0.4)) + scribbleFill([[-w / 2, -40], [-w / 2, -L], [w / 2, -L], [w / 2, -40]], T.pencil, { spill: 4, loops: false }));
  p.push(blob([[-w / 2, -L], [-w / 2, -L - 30], [w / 2, -L - 30], [w / 2, -L]], tint(T.eraser, 0.3)) + scribbleFill([[-w / 2, -L], [-w / 2, -L - 30], [w / 2, -L - 30], [w / 2, -L]], T.eraser, { spill: 3, loops: false }));
  p.push(rough([[-w / 2, -40], [0, 0], [w / 2, -40]], T.line, 3.2, { closed: false }));
  p.push(rough([[-w / 2, -40], [-w / 2, -L - 30], [w / 2, -L - 30], [w / 2, -40]], T.line, 3.5));
  p.push(rule([[-w / 2, -L], [w / 2, -L]], T.line, 3));
  return `<g transform="translate(${px} ${py}) rotate(${a})">${p.join('')}</g>`;
})();
g(sheet(...S[2], { fill: T.trace, op: 0.46, label: 'kamu', content: house({ part: 0.4, colour: false, wob: 9 }) + pencil }));

// a note in the corner: understanding is not the same as excusing
g(write(300, 1150, 'memahami', { size: 34, anchor: 'middle', fill: T.soft }));
g(write(300, 1190, 'bukan berarti', { size: 34, anchor: 'middle', fill: T.soft }));
g(write(300, 1230, 'membenarkan', { size: 34, anchor: 'middle', fill: T.soft }));

// ---------- page ----------
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Tracing Story</title>
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
  <div class="line top">Your parents were<br>tracing too.</div>
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
    <defs>${defs(T)}
    </defs>
    <g id="art" transform="translate(540 935) scale(1.045) translate(-538 -901)">
${out.join('\n')}
    </g>
  </svg>
  <div class="line bottom">They learned from a drawing<br>they didn't choose either.</div>
  <div class="label">After Robert Sapolsky, Determined</div>
  <svg width="1080" height="1920" style="pointer-events:none" aria-hidden="true"><rect width="1080" height="1920" filter="url(#paper)"/></svg>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'story.html'), html);
console.log('story.html');
