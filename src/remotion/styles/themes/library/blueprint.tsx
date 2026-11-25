import { AbsoluteFill } from 'remotion';
import { rampFilter } from '../../kit/filters';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerNum, ringBrackets, text, trScan } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain, gridPaper, layer } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { ChartBar, Ctx } from '../../theme';

/**
 * Blueprint: engineering drawings on cyanotype paper. White line work on Prussian blue, drawn in
 * drafting order (construction circles, centre lines, then the part, then dimensions); a gear turns and
 * an arm flexes on the sheet while the creator explains from a bubble stamped like a detail view.
 */

const BLUE = '#0F3C78';
const DEEP = '#0A2C5C';
const LINE = '#EAF4FF';
const CYAN = '#9FD4FF';
const YELLOW = '#FFD166';

const gear = (teeth: number, r: number, inner: number) => {
  const pts: string[] = [];
  for (let k = 0; k < teeth; k += 1) {
    const a = (k / teeth) * Math.PI * 2;
    const p = (Math.PI * 2) / teeth;
    for (const [rr, da] of [[inner, -0.27], [r, -0.15], [r, 0.15], [inner, 0.27]] as const) pts.push(`${(Math.cos(a + da * p) * rr).toFixed(1)},${(Math.sin(a + da * p) * rr).toFixed(1)}`);
  }
  return pts.join(' ');
};

/** A dimension line with arrowheads and its value. */
const dim = (x1: number, y1: number, x2: number, y2: number, label: string, t: number, c: Ctx) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const head = (x: number, y: number, dir: number) => `M ${x} ${y} l ${Math.cos(a + dir + 0.4) * 16} ${Math.sin(a + dir + 0.4) * 16} M ${x} ${y} l ${Math.cos(a + dir - 0.4) * 16} ${Math.sin(a + dir - 0.4) * 16}`;
  return (
    <g opacity={t} stroke={CYAN} strokeWidth={2.5} fill="none">
      <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} />
      {t > 0.95 && <path d={`${head(x1, y1, 0)} ${head(x2, y2, Math.PI)}`} />}
      <text x={mx} y={my - 14} fill={CYAN} stroke="none" fontSize={30} textAnchor="middle" fontFamily={c.fonts.body}>
        {label}
      </text>
    </g>
  );
};

function Sheet({ c }: { c: Ctx }) {
  // Drafted in under 4 seconds, held, then redrawn every 12 seconds.
  const u = Math.min(1, (c.frame % 360) / 110);
  const step = (a: number, b: number) => smooth(u, a, b);
  const turn = c.frame * 0.6;
  const elbow = -28 + 14 * Math.sin(c.frame / 40);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${BLUE}, ${DEEP})` }}>
      {gridPaper({ color: LINE, size: 48, major: 5, alpha: 0.08, majorAlpha: 0.16 })}
      {svgFrame(
        <g fill="none" stroke={LINE} strokeLinecap="round">
          {/* Construction: centre lines and circles first. */}
          <g strokeWidth={2} strokeDasharray="26 10 4 10" opacity={0.55 * step(0, 0.08)}>
            <line x1={120} y1={640} x2={960} y2={640} />
            <line x1={330} y1={330} x2={330} y2={950} />
            <circle cx={330} cy={640} r={250} strokeDasharray="6 12" />
          </g>
          {/* The gear. */}
          <g transform={`translate(330 640) rotate(${turn})`} strokeWidth={4}>
            <polygon points={gear(16, 200, 170)} style={drawStroke(step(0.06, 0.3), 3200)} />
            <circle r={70} style={drawStroke(step(0.2, 0.32), 500)} />
            <circle r={26} style={drawStroke(step(0.25, 0.34), 200)} />
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <line key={a} x1={Math.cos((a * Math.PI) / 180) * 78} y1={Math.sin((a * Math.PI) / 180) * 78} x2={Math.cos((a * Math.PI) / 180) * 160} y2={Math.sin((a * Math.PI) / 180) * 160} strokeWidth={2} opacity={step(0.3, 0.38)} />
            ))}
          </g>
          {/* The arm: base, upper arm, forearm and gripper, the elbow flexing. */}
          <g strokeWidth={4} transform="translate(640 980)">
            <rect x={-90} y={-30} width={180} height={60} rx={10} style={drawStroke(step(0.34, 0.44), 600)} />
            <g transform="rotate(-62)">
              <rect x={0} y={-24} width={260} height={48} rx={24} style={drawStroke(step(0.4, 0.52), 700)} />
              <circle cx={0} cy={0} r={34} style={drawStroke(step(0.4, 0.5), 220)} />
              <g transform={`translate(260 0) rotate(${elbow})`}>
                <circle r={30} style={drawStroke(step(0.48, 0.56), 200)} />
                <rect x={0} y={-18} width={200} height={36} rx={18} style={drawStroke(step(0.5, 0.6), 520)} />
                <path d="M 200 -18 l 50 -30 M 200 18 l 50 30" style={drawStroke(step(0.56, 0.64), 200)} />
              </g>
            </g>
          </g>
          {/* Hatching on the base, then dimensions. */}
          <g strokeWidth={1.5} opacity={0.5 * step(0.6, 0.66)}>
            {Array.from({ length: 9 }, (_, k) => (
              <line key={k} x1={556 + k * 20} y1={1006} x2={576 + k * 20} y2={954} />
            ))}
          </g>
          {dim(80, 380, 80, 900, 'Ø 400', step(0.64, 0.74), c)}
          {dim(560, 1060, 720, 1060, '180 mm', step(0.7, 0.8), c)}
        </g>,
      )}
      {/* The title block in the corner of the sheet. */}
      <div style={{ position: 'absolute', left: 60, bottom: 230, border: `3px solid ${LINE}`, padding: '10px 16px', color: LINE, fontFamily: c.fonts.body, fontSize: 24, letterSpacing: 2, opacity: 0.8 }}>
        SHEET 1 / 1 · SCALE 1:5 · REV B
      </div>
      {grain({ color: '#ffffff', alpha: 0.12, freq: 0.9, blend: 'screen', opacity: 0.6 })}
    </AbsoluteFill>
  );
}

function BlueprintChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  return (
    <svg width="100%" height={460} viewBox="0 0 800 460" style={{ overflow: 'visible' }}>
      <line x1={0} y1={420} x2={800} y2={420} stroke={LINE} strokeWidth={3} />
      {bars.map((b, k) => {
        const w = 800 / bars.length;
        const h = (b.value / max) * 340 * b.grow;
        const x = k * w + w * 0.18;
        return (
          <g key={k}>
            <rect x={x} y={420 - h} width={w * 0.64} height={h} fill={`url(#bp-hatch)`} stroke={k === bars.length - 1 ? YELLOW : LINE} strokeWidth={3} />
            <text x={x + w * 0.32} y={410 - h} fill={YELLOW} fontSize={30} textAnchor="middle" fontFamily={c.fonts.display} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={x + w * 0.32} y={452} fill={CYAN} fontSize={24} textAnchor="middle" fontFamily={c.fonts.body}>
              {b.label}
            </text>
          </g>
        );
      })}
      <defs>
        <pattern id="bp-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={14} stroke={LINE} strokeWidth={2} opacity={0.45} />
        </pattern>
      </defs>
    </svg>
  );
}

const outline = { border: `3px solid ${LINE}`, boxShadow: `0 0 0 8px ${DEEP}, 0 0 0 10px ${CYAN}` };

export const blueprint = defineStyle({
  id: 'blueprint',
  accent: YELLOW,
  colors: [CYAN, LINE],
  footage: 'url(#bp-duo)',
  entrance: 'write',
  Defs: () => rampFilter('bp-duo', ['#06214A', '#2E6CB5', '#EAF4FF'], { contrast: 1.15 }),
  Scene: Sheet,
  pip: pipAt(outline, 'circle'),
  Overlay: ({ c, scene }) =>
    scene ? null : (
      <AbsoluteFill>
        {layer({ background: BLUE, mixBlendMode: 'color', opacity: 0.35 })}
        {gridPaper({ color: LINE, size: 48, alpha: 0.06, majorAlpha: 0.12 })}
        {layer({ inset: 28, border: `3px solid ${LINE}`, opacity: 0.7 })}
        <div style={{ position: 'absolute', left: 48, bottom: 48, color: LINE, fontFamily: c.fonts.body, fontSize: 22, letterSpacing: 2, opacity: 0.7 }}>DWG NO. 01 · REV B</div>
      </AbsoluteFill>
    ),
  caption: caption({ size: 96, glyph: 0.46, color: LINE, emph: YELLOW, upper: true, letter: 2, weight: 800, shadow: `0 0 18px ${DEEP}, 0 4px 0 ${DEEP}`, entrance: 'write' }),
  hook: hook({ top: 0.08, align: 'left', entrance: 'write', bg: DEEP, border: `3px solid ${LINE}`, color: LINE, size: 66, upper: true, letter: 3, weight: 800, boxShadow: '10px 10px 0 rgba(0,0,0,0.35)' }),
  card: card({ bg: 'rgba(10,44,92,0.92)', border: `3px solid ${LINE}`, shadow: `0 0 0 6px rgba(10,44,92,0.9), 0 0 0 8px ${CYAN}` }),
  title: text({ color: LINE, upper: true, letter: 2, weight: 800 }),
  body: text({ font: 'body', color: CYAN, weight: 500 }),
  number: text({ color: YELLOW, weight: 800, shadow: `0 0 20px ${DEEP}` }),
  slam: text({ color: YELLOW, upper: true, weight: 800, letter: 4, stroke: [6, DEEP] }),
  Marker: markerNum({ bg: 'transparent', fg: LINE, shape: 'square', border: `3px solid ${LINE}`, size: 52, font: 'body' }),
  Ring: ringBrackets(YELLOW, 6),
  stage: { shape: 'square', fill: [BLUE, DEEP], ring: LINE, ringWidth: 4 },
  transition: trScan({ color: LINE, dim: 0.35 }),
  Chart: BlueprintChart,
  sample: { type: 'list', text: 'The build', items: ['Measure', 'Draw', 'Make'] },
});

