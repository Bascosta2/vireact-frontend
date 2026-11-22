/** The text hook's outline (from the skill's TextHook.tsx). Kept apart from the components for fast refresh. */

export const HOOK_LINE_H = 105;
const RADIUS = 12;

/** Stacked, centred line boxes as one outline with every vertex rounded (from the skill's TextHook.tsx). */
export const hookPath = (widths: number[], cx: number, top: number, lh = HOOK_LINE_H, r = RADIUS) => {
  const ws = widths.map((w, i) => {
    const near = widths.filter((v, j) => Math.abs(j - i) === 1 && Math.abs(v - w) < 4 * r);
    return Math.max(w, ...near);
  });
  const right: [number, number][] = [];
  ws.forEach((w, i) => {
    const y0 = top + i * lh;
    right.push([cx + w / 2, y0], [cx + w / 2, y0 + lh]);
  });
  const pts: [number, number][] = [];
  for (const p of right) {
    const last = pts[pts.length - 1];
    if (last && last[0] === p[0] && last[1] === p[1]) continue;
    pts.push(p);
  }
  const clean = pts.filter((p, i) => {
    const a = pts[i - 1];
    const b = pts[i + 1];
    return !(a && b && a[0] === p[0] && b[0] === p[0]);
  });
  const left = clean.map(([x, y]) => [2 * cx - x, y] as [number, number]).reverse();
  const poly = [...clean, ...left];
  const n = poly.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = poly[i];
    const a = poly[(i - 1 + n) % n];
    const b = poly[(i + 1) % n];
    const la = Math.hypot(p[0] - a[0], p[1] - a[1]);
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const rr = Math.min(r, la / 2, lb / 2);
    const ix = p[0] + ((a[0] - p[0]) / la) * rr;
    const iy = p[1] + ((a[1] - p[1]) / la) * rr;
    const ox = p[0] + ((b[0] - p[0]) / lb) * rr;
    const oy = p[1] + ((b[1] - p[1]) / lb) * rr;
    d += `${i === 0 ? 'M' : 'L'}${ix},${iy} Q${p[0]},${p[1]} ${ox},${oy} `;
  }
  return `${d}Z`;
};

