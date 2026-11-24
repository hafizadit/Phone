// Shared hand-drawn toolkit for the story series (same look as story/past-you).
// createHand(seed, idPrefix) gives seeded helpers; defs(theme) gives the SVG
// filters: "crayon" (lines), "wax" (colouring) and "paper" (page texture).

function createHand(seed = 1, idPrefix = 'h') {
  const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const jit = (a) => (rnd() * 2 - 1) * a;
  const f = (n) => n.toFixed(1);

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
      const ext = (a, b, k) => { const l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; return [a[0] + (a[0] - b[0]) / l * k, a[1] + (a[1] - b[1]) / l * k]; };
      p.unshift(ext(p[0], p[1], rnd() * over));
      p.push(ext(p[p.length - 1], p[p.length - 2], rnd() * over));
    }
    let d = `M${f(p[0][0])},${f(p[0][1])}`;
    for (let i = 1; i < p.length - 1; i++) d += ` Q${f(p[i][0])},${f(p[i][1])} ${f((p[i][0] + p[i + 1][0]) / 2)},${f((p[i][1] + p[i + 1][1]) / 2)}`;
    const L = p[p.length - 1]; return d + ` L${f(L[0])},${f(L[1])}`;
  }
  const pathEl = (d, color, w, op = 1, filter = 'crayon') =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"${filter ? ` filter="url(#${filter})"` : ''}/>`;

  // one stroke, sometimes gone over a second time (only part of it, slightly off)
  function line(pts, color, w, { amt = 3, over = 10, retrace = 0.55, op = 1, filter = 'crayon' } = {}) {
    let s = pathEl(handPath(pts, { amt, over }), color, w * (0.85 + rnd() * 0.3), op, filter);
    if (rnd() < retrace) {
      const r = resample(pts, 8), a = Math.floor(rnd() * r.length * 0.4), b = Math.floor(r.length * (0.6 + rnd() * 0.4));
      const part = r.slice(a, Math.max(a + 2, b)).map(([x, y]) => [x + jit(3), y + jit(3)]);
      s += pathEl(handPath(part, { amt, over: 6 }), color, w * (0.5 + rnd() * 0.3), op * 0.9, filter);
    }
    return s;
  }
  // shape outline drawn edge by edge, corners don't quite meet
  function outline(poly, color, w, { closed = true, amt = 3, over = 12, retrace = 0.55 } = {}) {
    const n = closed ? poly.length : poly.length - 1, out = [];
    for (let i = 0; i < n; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      out.push(line([[a[0] + jit(4), a[1] + jit(4)], [b[0] + jit(4), b[1] + jit(4)]], color, w, { amt, over, retrace }));
    }
    return out.join('\n');
  }
  // loose back-and-forth colouring, clipped to a wobbly version of the shape
  let clipN = 0;
  function colorIn(poly, color, { gap = 12, w = 10, angle = 0.6, op = 0.92, spill = 10, sparse = 0.08 } = {}) {
    const id = `${idPrefix}-c${clipN++}`;
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const grown = poly.map(([x, y]) => { const l = Math.hypot(x - cx, y - cy) || 1, e = spill * (0.2 + rnd()); return [x + (x - cx) / l * e, y + (y - cy) / l * e]; });
    const xs = grown.map(p => p[0]), ys = grown.map(p => p[1]);
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 30;
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const pts = []; let flip = false;
    for (let t = -R; t <= R; t += gap * (0.6 + rnd() * 0.9)) {
      if (rnd() < sparse) { t += gap * 1.5; continue; }
      const a = [-R + jit(30), t + jit(4)], b = [R + jit(30), t + gap * 0.6 + jit(5)];
      (flip ? [b, a] : [a, b]).forEach(([u, v]) => pts.push([cx + u * ca - v * sa, cy + u * sa + v * ca]));
      flip = !flip;
    }
    const d = 'M' + pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L');
    return `<clipPath id="${id}"><path d="${handPath(grown, { amt: 4, over: 0 })}Z"/></clipPath>
<g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linejoin="round" opacity="${op}" filter="url(#wax)"/></g>`;
  }
  // messy, kid-style colouring: several stroke layers at different angles, widths and
  // pressure, a darker "pressed harder" layer, loopy scribbles, strokes that stop short,
  // and a spill over the outline that is uneven (bulges on some sides, almost none on others)
  function scribbleFill(poly, color, { spill = 18, shade = null, base = 1, loops = true, density = 1 } = {}) {
    const id = `${idPrefix}-s${clipN++}`;
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const dense = resample([...poly, poly[0]], 22).slice(0, -1);
    let nz = 0;
    const region = dense.map(([x, y]) => {
      nz = nz * 0.8 + jit(0.9);
      const e = spill * Math.max(-0.35, 0.35 + nz), l = Math.hypot(x - cx, y - cy) || 1;
      return [x + (x - cx) / l * e, y + (y - cy) / l * e];
    });
    const xs = region.map(p => p[0]), ys = region.map(p => p[1]);
    const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 20;
    const layer = (angle, gap, w, op, col, skip) => {
      const ca = Math.cos(angle), sa = Math.sin(angle), els = [];
      let pts = [], flip = false;
      const flush = () => { if (pts.length > 1) els.push(`<path d="M${pts.map(p => `${f(p[0])},${f(p[1])}`).join(' L')}" fill="none" stroke="${col}" stroke-width="${f(w * (0.65 + rnd() * 0.7))}" stroke-linejoin="round" stroke-linecap="round" opacity="${f(op * (0.6 + rnd() * 0.4))}" filter="url(#wax)"/>`); pts = []; };
      for (let t = -R; t <= R; t += gap * (0.55 + rnd() * 1.1)) {
        if (rnd() < skip) { flush(); continue; }
        const a = [-R * (1 - rnd() * 0.3), t + jit(gap * 0.4)], b = [R * (1 - rnd() * 0.3), t + gap * 0.5 + jit(gap * 0.4)];
        (flip ? [b, a] : [a, b]).forEach(([u, v]) => pts.push([cx + u * ca - v * sa, cy + u * sa + v * ca]));
        flip = !flip;
        if (pts.length > 6 + rnd() * 8) flush();
      }
      flush();
      return els.join('');
    };
    const a0 = rnd() * Math.PI;
    let body = layer(a0, 9 / density, 11, 0.95, color, 0.06)
             + layer(a0 + 0.7 + jit(0.3), 14 / density, 9, 0.7, color, 0.25)
             + layer(a0 - 1.1 + jit(0.3), 22, 7, 0.45, color, 0.45);
    if (shade) body += layer(a0 + 0.3 + jit(0.4), 26, 6, 0.55, shade, 0.5);
    if (loops) {
      const n = 60, ph = rnd() * 6, k1 = 2 + rnd() * 2, k2 = 3 + rnd() * 2;
      const rx = (Math.max(...xs) - Math.min(...xs)) * 0.42, ry = (Math.max(...ys) - Math.min(...ys)) * 0.42;
      const lp = Array.from({ length: n }, (_, i) => { const t = i / n * Math.PI * 2; return [cx + rx * Math.sin(k1 * t + ph) + jit(12), cy + ry * Math.sin(k2 * t) + jit(12)]; });
      body += `<path d="${handPath(lp, { amt: 6, over: 0 })}" fill="none" stroke="${shade || color}" stroke-width="5" stroke-linecap="round" opacity=".35" filter="url(#wax)"/>`;
    }
    return `<clipPath id="${id}"><path d="${handPath([...region, region[0]], { amt: 3, over: 0 })}Z"/></clipPath><g clip-path="url(#${id})" opacity="${base}">${body}</g>`;
  }
  // a filled shape with a slightly wobbly edge (no outline)
  const blob = (poly, fill, op = 1) => `<path d="${handPath([...poly, poly[0]], { amt: 1.5, over: 0 })}Z" fill="${fill}" opacity="${op}"/>`;

  return { rnd, jit, f, resample, handPath, pathEl, line, outline, colorIn, scribbleFill, blob };
}

// Writing and line kit shared by the series (same as story/rapor):
//   write()  hand-lettered crayon text, each letter with its own size/tilt/height/spacing,
//            gone over twice; small words keep more control so they stay readable
//   rule()   a loose freehand line; rough() an outline drawn twice with overshooting corners
function createKit(H, T) {
  const { rnd, jit, f, line, outline } = H;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const J = (p, a = 8) => [p[0] + jit(a), p[1] + jit(a)];
  const shadeOf = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - k)).toString(16).padStart(2, '0')).join('');
  const tint = (hex, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - k) + 255 * k).toString(16).padStart(2, '0')).join('');
  const write = (x, y, s, { size = 40, fill = T.line, anchor = 'start', rot = 0, wob } = {}) => {
    const small = size < 42;
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
  const rule = (pts, color = T.line, w = 3.8) => line(pts, color, w, { amt: 4, over: 14, retrace: 0.65, op: 0.85 });
  const rough = (poly, color, w, { closed = true } = {}) => outline(poly, color, w, { closed, amt: 4.5, over: 16, retrace: 0.7 })
    + outline(poly.map(p => J(p, 5)), color, w * 0.55, { closed, amt: 4.5, over: 10, retrace: 0 });
  const arrow = (pts, color = T.line, w = 4.5) => {
    const e = pts[pts.length - 1], p = pts[pts.length - 2], ang = Math.atan2(e[1] - p[1], e[0] - p[0]);
    const head = (da, len) => [e[0] - len * Math.cos(ang + da), e[1] - len * Math.sin(ang + da)];
    return line(pts, color, w, { amt: 2.5, over: 4, retrace: 0.3 })
      + line([head(0.45 + jit(0.15), 20 + jit(5)), e], color, w, { amt: 1, over: 3, retrace: 0 })
      + line([head(-0.5 + jit(0.15), 18 + jit(5)), e], color, w, { amt: 1, over: 3, retrace: 0 });
  };
  return { esc, J, shadeOf, tint, write, rule, rough, arrow };
}

// SVG filter definitions; theme needs grainDark / grainLight (paper texture strength)
const defs = (T) => `
      <filter id="crayon" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="4" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.55 1.1" numOctaves="2" seed="11" result="grain"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="21" result="press"/>
        <feComposite in="grain" in2="press" operator="arithmetic" k2="1" k3="0.9" result="mix"/>
        <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.62" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <filter id="wax" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="7" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.7 1.3" numOctaves="3" seed="2" result="grain"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" seed="33" result="press"/>
        <feComposite in="grain" in2="press" operator="arithmetic" k2="1" k3="1" result="mix"/>
        <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.3 0 0 0 -0.72" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <filter id="scrawl" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="23" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="4.2" xChannelSelector="R" yChannelSelector="G" result="wob"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.6 1.2" numOctaves="2" seed="29" result="grain"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" seed="31" result="press"/>
        <feComposite in="grain" in2="press" operator="arithmetic" k2="1" k3="0.9" result="mix"/>
        <feColorMatrix in="mix" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.45" result="mask"/>
        <feComposite in="wob" in2="mask" operator="in"/>
      </filter>
      <filter id="ink" filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="2500">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="17" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="paper" filterUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="9" result="tooth"/>
        <feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2 0 0 0 1.25" result="dark"/>
        <feFlood flood-color="#000" flood-opacity="${T.grainDark}"/>
        <feComposite in2="dark" operator="in" result="darkSpecks"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves="3" seed="14" result="blot"/>
        <feColorMatrix in="blot" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.75" result="blotA"/>
        <feComponentTransfer in="blotA" result="blotSoft"><feFuncA type="linear" slope="${T.grainLight}"/></feComponentTransfer>
        <feMerge><feMergeNode in="blotSoft"/><feMergeNode in="darkSpecks"/></feMerge>
      </filter>`;

module.exports = { createHand, createKit, defs };
