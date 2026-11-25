import { AbsoluteFill } from 'remotion';
import { rampFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringReticle, text, trScan } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { scanlines, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Hologram HUD: the footage scanned into a glowing cyan hologram. Orbiting arcs round the middle,
 * dashed scan lines, target brackets locking onto parts, readouts marked SIMULATED, and every graphic a
 * translucent HUD panel.
 */

const CYAN = '#3DF5FF';
const DEEP = '#021018';

function Hud({ c }: { c: Ctx }) {
  const a = c.frame * 0.8;
  const scanY = 300 + ((c.frame * 9) % 1300);
  return (
    <AbsoluteFill>
      {svgFrame(
        <g fill="none" stroke={CYAN} style={{ filter: `drop-shadow(0 0 6px ${CYAN})` }}>
          <circle cx={540} cy={880} r={420} strokeWidth={2} strokeDasharray="4 18" opacity={0.6} />
          <path d={`M ${540 + 460 * Math.cos((a * Math.PI) / 180)} ${880 + 460 * Math.sin((a * Math.PI) / 180)} A 460 460 0 0 1 ${540 + 460 * Math.cos(((a + 70) * Math.PI) / 180)} ${880 + 460 * Math.sin(((a + 70) * Math.PI) / 180)}`} strokeWidth={6} />
          <path d={`M ${540 + 500 * Math.cos((-a * 1.4 * Math.PI) / 180)} ${880 + 500 * Math.sin((-a * 1.4 * Math.PI) / 180)} A 500 500 0 0 1 ${540 + 500 * Math.cos(((-a * 1.4 + 40) * Math.PI) / 180)} ${880 + 500 * Math.sin(((-a * 1.4 + 40) * Math.PI) / 180)}`} strokeWidth={3} />
          <line x1={60} y1={scanY} x2={1020} y2={scanY} strokeWidth={3} strokeDasharray="12 8" opacity={0.7} />
          <g fontFamily={c.fonts.body} fontSize={24} fill={CYAN} stroke="none">
            <text x={70} y={250}>SCAN 0{(Math.floor(c.frame / 20) % 9) + 1} · MESH 12.4K</text>
            <text x={70} y={1650}>SIMULATED · NOT TELEMETRY</text>
            <text x={1010} y={250} textAnchor="end">
              ROT {Math.round(a % 360)}°
            </text>
          </g>
        </g>,
      )}
      {scanlines({ gap: 5, alpha: 0.18, color: '#003040' })}
      {vignette(0.7, DEEP)}
    </AbsoluteFill>
  );
}

export const hologramHud = defineStyle({
  id: 'hologram-hud',
  accent: CYAN,
  colors: ['#FF5BD1', '#FFFFFF'],
  entrance: 'flicker',
  footage: 'url(#hh-holo) contrast(1.05)',
  Defs: () => rampFilter('hh-holo', [DEEP, '#06394A', '#1AB8D4', '#C9FDFF'], { contrast: 1.2 }),
  Overlay: Hud,
  caption: caption({ size: 82, glyph: 0.58, color: '#E6FEFF', emph: CYAN, upper: true, letter: 3, glow: CYAN, shadow: `0 0 12px ${CYAN}`, entrance: 'flicker' }),
  hook: hook({ top: 0.08, entrance: 'flicker', color: '#E6FEFF', size: 60, upper: true, letter: 4, bg: 'rgba(2,16,24,0.6)', border: `2px solid ${CYAN}`, pad: '14px 28px', boxShadow: `0 0 20px ${CYAN}66, inset 0 0 20px ${CYAN}33`, glow: CYAN }),
  card: card({ bg: 'rgba(2,16,24,0.55)', border: `2px solid ${CYAN}`, shadow: `0 0 24px ${CYAN}55, inset 0 0 24px ${CYAN}22`, blur: 4 }),
  title: text({ color: '#E6FEFF', upper: true, letter: 3, glow: CYAN }),
  body: text({ font: 'body', color: '#9CEFF7' }),
  number: text({ color: CYAN, glow: CYAN }),
  slam: text({ color: '#E6FEFF', upper: true, letter: 6, glow: CYAN }),
  Marker: markerDash(CYAN, 32, 4),
  Ring: ringReticle(CYAN, 4),
  stage: { shape: 'circle', fill: ['#06394A', DEEP], ring: CYAN, ringWidth: 3, glow: CYAN },
  transition: trScan({ color: CYAN, dim: 0.4, height: 6 }),
  sample: { type: 'callout', text: 'Motor A' },
});
