import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trZoom } from '../../kit/presets';
import { drawCycle, label, ridge, svgFrame } from '../../kit/scenery';
import { grain, vignette } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Relief Map: a raised relief map with the vertical exaggerated, lit by one warm low sun. Hypsometric
 * bands from green lowland to snowy peaks, a river, a sea shaded by depth; the camera glides over it and
 * contour lines and place labels draw in.
 */

const SEA = ['#0E3A5B', '#16557F', '#2A77A5'];
const LAND = ['#7FAF6A', '#A9C47A', '#D8CF8E', '#C79C67', '#9C7452', '#F3F1EA'];
const AMBER = '#FFB347';

function Relief({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 120, 600);
  const glide = c.frame / 900;
  // Back to front: snowy peaks, rock, highland, lowland; each band lit from the right (a lighter rim).
  const bands = [
    { y: 560, amp: 170, col: LAND[5], rim: '#FFFFFF', seed: 1.3, sp: 0.2 },
    { y: 700, amp: 150, col: LAND[4], rim: '#C29A74', seed: 2.1, sp: 0.35 },
    { y: 840, amp: 120, col: LAND[3], rim: '#E2B98A', seed: 3.4, sp: 0.5 },
    { y: 980, amp: 90, col: LAND[2], rim: '#EEE3A8', seed: 4.2, sp: 0.7 },
    { y: 1110, amp: 60, col: LAND[1], rim: '#C8DC98', seed: 5.6, sp: 0.95 },
    { y: 1230, amp: 34, col: LAND[0], rim: '#9CC985', seed: 6.1, sp: 1.2 },
  ];
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#24324A 0%, #6E6A78 18%, #E8A66A 30%, #F3D2A2 34%)' }}>
      {svgFrame(
        <g>
          {/* The sea in front, darker with depth. */}
          <rect x={0} y={1250} width={1080} height={670} fill={SEA[2]} />
          <rect x={0} y={1420} width={1080} height={500} fill={SEA[1]} />
          <rect x={0} y={1640} width={1080} height={280} fill={SEA[0]} />
          {bands.map((b, k) => (
            <g key={k}>
              <polygon points={`-100,1500 ${ridge(b.y, b.amp, { freq: 1.8, seed: b.seed, peaks: 0.7, shift: glide * b.sp }).join(' ')} 1180,1500`} fill={b.col} />
              <polyline points={ridge(b.y, b.amp, { freq: 1.8, seed: b.seed, peaks: 0.7, shift: glide * b.sp }).join(' ')} fill="none" stroke={b.rim} strokeWidth={5} opacity={0.8} />
              {/* Contour lines draw in across each band. */}
              <polyline points={ridge(b.y + 40, b.amp * 0.8, { freq: 1.8, seed: b.seed, peaks: 0.7, shift: glide * b.sp }).join(' ')} fill="none" stroke="rgba(60,40,20,0.3)" strokeWidth={2} strokeDasharray="8 8" style={drawStroke(smooth(u, 0.3 + k * 0.08, 0.6 + k * 0.08), 1500)} />
            </g>
          ))}
          {/* The river from the high valley to the sea. */}
          <path d="M 600 700 C 560 800 660 880 590 980 S 440 1120 520 1260" fill="none" stroke="#5DB7E8" strokeWidth={12} strokeLinecap="round" style={drawStroke(smooth(u, 0.15, 0.55), 800)} />
          <path d="M 520 1250 Q 540 1290 600 1300" fill="none" stroke="#5DB7E8" strokeWidth={20} strokeLinecap="round" opacity={smooth(u, 0.5, 0.6)} />
        </g>,
      )}
      {svgFrame(
        <g style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))' }}>
          {[
            [610, 560, 'THE PEAKS', 0.5],
            [380, 1100, 'Delta', 0.65],
            [700, 1480, 'Open sea', 0.8],
          ].map(([x, y, n, at]) => (
            <g key={n as string} opacity={smooth(u, at as number, (at as number) + 0.12)}>
              <circle cx={x as number} cy={y as number} r={9} fill={AMBER} stroke="#fff" strokeWidth={3} />
              {label((x as number) + 20, (y as number) - 16, n as string, { size: 40, fill: '#fff', font: c.fonts.display, anchor: 'start' })}
            </g>
          ))}
        </g>,
      )}
      <AbsoluteFill style={{ background: 'linear-gradient(250deg, rgba(255,190,110,0.3), transparent 45%)', mixBlendMode: 'soft-light' }} />
      {vignette(0.5, '#08121C')}
      {grain({ color: '#000', alpha: 0.12, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const reliefMap = defineStyle({
  id: 'relief-map',
  accent: AMBER,
  colors: [LAND[0], SEA[2]],
  entrance: 'fade',
  Scene: Relief,
  caption: caption({ size: 90, glyph: 0.5, color: '#FFFFFF', emph: AMBER, upper: true, letter: 2, shadow: '0 4px 18px rgba(0,0,0,0.85)', entrance: 'fade' }),
  hook: hook({ top: 0.09, entrance: 'fade', color: '#FFFFFF', size: 80, upper: true, letter: 3, shadow: '0 6px 24px rgba(0,0,0,0.8)', Decor: ({ t }) => <div style={{ height: 3, margin: '14px auto 0', width: `${60 * t}%`, background: AMBER }} /> }),
  card: card({ bg: 'rgba(8,24,36,0.78)', border: `2px solid ${AMBER}`, radius: 6, blur: 6 }),
  title: text({ color: '#FFFFFF', upper: true, letter: 2 }),
  body: text({ font: 'body', color: '#E6E1D3' }),
  number: text({ color: AMBER, shadow: '0 6px 24px rgba(0,0,0,0.8)' }),
  slam: text({ color: '#fff', upper: true, letter: 4, shadow: '0 8px 30px rgba(0,0,0,0.9)' }),
  Marker: markerDot([AMBER, '#5DB7E8', LAND[0]], 30, '3px solid #fff'),
  Ring: ringCircle(AMBER, 6, { dash: '10 10' }),
  stage: { shape: 'circle', fill: [LAND[1], SEA[1]], ring: AMBER, ringWidth: 5 },
  transition: trZoom({ from: 1.25, blur: 10 }),
  sample: { type: 'counter', text: '6,650 km', subtext: 'the length of the Nile' },
});
