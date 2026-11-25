import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerNum, ringCircle, text, trScan } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain, gridPaper } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Technical Drawing: a mechanism traced in fine black line on warm white paper, then taken apart into
 * an exploded view along one axis, leaders pulling out to numbered balloons. One orange accent.
 */

const PAPER = '#FAF7F0';
const INK = '#16161A';
const ORANGE = '#E4572E';

const PARTS = [
  { name: 'Crystal', r: 150, ring: true },
  { name: 'Bezel', r: 160, ring: true },
  { name: 'Dial', r: 145, ring: false },
  { name: 'Hands', r: 0, ring: false },
  { name: 'Movement', r: 130, ring: false },
  { name: 'Case', r: 170, ring: true },
];

function Explode({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 130);
  const trace = smooth(u, 0, 0.3);
  const apart = smooth(u, 0.35, 0.75);
  const lead = smooth(u, 0.7, 0.95);
  const cx = 470;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {gridPaper({ color: '#9A8F7A', size: 30, major: 10, alpha: 0.08, majorAlpha: 0.14 })}
      {svgFrame(
        <g fill="none" stroke={INK} strokeLinecap="round">
          <line x1={cx} y1={260} x2={cx} y2={1330} strokeWidth={1.5} strokeDasharray="30 8 4 8" opacity={0.5} />
          {PARTS.map((p, k) => {
            // Parts spread evenly down the axis, each drawn as an ellipse (seen at an angle).
            const y = 780 + (k - 2.5) * 175 * apart;
            const ry = 0.34;
            return (
              <g key={p.name} transform={`translate(${cx} ${y})`}>
                {p.r > 0 && <ellipse rx={p.r} ry={p.r * ry} fill={k === 2 ? '#fff' : PAPER} strokeWidth={3} style={drawStroke(trace, 1200)} />}
                {p.ring && <ellipse rx={p.r - 16} ry={(p.r - 16) * ry} strokeWidth={1.5} style={drawStroke(trace, 1100)} />}
                {p.name === 'Movement' &&
                  [[-50, 0, 46], [40, 10, 34], [10, -20, 22]].map(([gx, gy, gr], j) => (
                    <g key={j} transform={`translate(${gx} ${gy}) scale(1 ${ry}) rotate(${c.frame * (j % 2 ? -3 : 2)})`}>
                      <circle r={gr} strokeWidth={2.5} strokeDasharray="7 5" />
                      <circle r={6} fill={ORANGE} stroke="none" />
                    </g>
                  ))}
                {p.name === 'Dial' && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => <line key={h} x1={Math.cos((h * Math.PI) / 6) * 120} y1={Math.sin((h * Math.PI) / 6) * 120 * ry} x2={Math.cos((h * Math.PI) / 6) * 135} y2={Math.sin((h * Math.PI) / 6) * 135 * ry} strokeWidth={3} />)}
                {p.name === 'Hands' && <path d="M 0 0 L 70 -14 M 0 0 L -30 -40" strokeWidth={6} stroke={ORANGE} />}
                {p.name === 'Case' && (
                  <g strokeWidth={1.4} opacity={0.5}>
                    {Array.from({ length: 10 }, (_, j) => (
                      <line key={j} x1={-150 + j * 30} y1={30} x2={-130 + j * 30} y2={50} />
                    ))}
                  </g>
                )}
                {/* Leader line to a numbered balloon on the right. */}
                <g opacity={lead}>
                  <line x1={(p.r || 70) * 0.7} y1={-6} x2={420} y2={-6} strokeWidth={2} style={drawStroke(lead, 450)} />
                  <circle cx={455} cy={-6} r={30} fill={PAPER} strokeWidth={3} />
                  {label(455, 5, String(k + 1), { size: 30, fill: INK, font: c.fonts.display })}
                </g>
              </g>
            );
          })}
        </g>,
      )}
      {/* The parts list in the corner. */}
      <div style={{ position: 'absolute', left: 56, top: 1340, fontFamily: c.fonts.body, fontSize: 24, color: INK, border: `2px solid ${INK}`, padding: '8px 14px', opacity: lead, lineHeight: 1.4 }}>
        {PARTS.map((p, k) => (
          <div key={p.name}>
            {k + 1}. {p.name.toUpperCase()}
          </div>
        ))}
      </div>
      {grain({ color: '#7A6E58', alpha: 0.12, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const technicalDrawing = defineStyle({
  id: 'technical-drawing',
  accent: ORANGE,
  colors: [INK, '#8A8478'],
  entrance: 'write',
  footage: 'grayscale(1) contrast(1.25) brightness(1.08) sepia(0.12)',
  Scene: Explode,
  pip: pipAt({ border: `3px solid ${INK}`, boxShadow: `0 0 0 10px ${PAPER}, 0 0 0 12px ${INK}` }, 'circle'),
  Overlay: ({ scene }) => (scene ? null : <AbsoluteFill>{gridPaper({ color: '#fff', size: 30, major: 10, alpha: 0.05, majorAlpha: 0.1 })}</AbsoluteFill>),
  caption: caption({ size: 82, glyph: 0.62, color: INK, emph: ORANGE, upper: true, weight: 700, bg: PAPER, pad: '6px 22px', boxExtra: { border: `3px solid ${INK}` }, entrance: 'write' }),
  hook: hook({ top: 0.08, align: 'left', entrance: 'write', color: INK, size: 60, upper: true, weight: 700, bg: PAPER, border: `3px solid ${INK}`, boxExtra: { boxShadow: `inset 0 -10px 0 ${ORANGE}` } }),
  card: card({ bg: PAPER, border: `3px solid ${INK}` }),
  title: text({ color: INK, upper: true, weight: 700 }),
  body: text({ font: 'body', color: '#33332F' }),
  number: text({ color: ORANGE, weight: 700, stroke: [8, PAPER] }),
  slam: text({ color: INK, upper: true, weight: 700, extra: { background: PAPER, border: `4px solid ${INK}`, padding: '0 26px' } }),
  Marker: markerNum({ bg: PAPER, fg: INK, border: `3px solid ${INK}`, size: 54, font: 'body' }),
  Ring: ringCircle(ORANGE, 5, { dash: '18 10' }),
  stage: { shape: 'circle', fill: ['#FFFFFF', PAPER], ring: INK, ringWidth: 4 },
  transition: trScan({ color: ORANGE, dim: 0.15, height: 6 }),
  sample: { type: 'list', text: 'Parts', items: ['Crystal', 'Dial', 'Movement'] },
});
