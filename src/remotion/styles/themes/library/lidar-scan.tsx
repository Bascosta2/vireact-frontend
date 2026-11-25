import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringBrackets, text, trScan } from '../../kit/presets';
import { layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Lidar Scan: the footage as a measured cloud of laser points floating in the dark. The picture is seen
 * only through a fine grid of dots, coloured by height (low cool, high warm); a cutting plane sweeps
 * through it and the points it passes flare white.
 */

const CYAN = '#3AF2FF';
const MAGENTA = '#FF4FD8';

function Cloud({ c }: { c: Ctx }) {
  const plane = ((c.frame * 8) % 2300) - 200;
  return (
    <AbsoluteFill>
      {/* Height colour: warm at the top, cool at the bottom, over the points. */}
      {layer({ background: `linear-gradient(180deg, ${MAGENTA}, #FFC14D 35%, ${CYAN} 75%, #2A5BFF)`, mixBlendMode: 'color', opacity: 0.75 })}
      {/* Black everywhere except a grid of dots: the picture shows only as points. */}
      {layer({ background: '#03040A', maskImage: 'radial-gradient(circle, transparent 2.6px, #000 3.6px)', WebkitMaskImage: 'radial-gradient(circle, transparent 2.6px, #000 3.6px)', maskSize: '11px 11px', WebkitMaskSize: '11px 11px' })}
      {/* The cutting plane. */}
      {layer({ top: plane, bottom: 'auto', height: 4, background: '#FFFFFF', boxShadow: `0 0 30px 8px ${CYAN}` })}
      {layer({ top: plane - 120, bottom: 'auto', height: 120, background: `linear-gradient(transparent, ${CYAN}33)` })}
      <div style={{ position: 'absolute', left: 60, bottom: 220, fontFamily: c.fonts.body, fontSize: 26, color: CYAN, lineHeight: 1.5 }}>
        <div>POINTS 2.41M · RES 0.05 m</div>
        <div>PLANE Z {(plane / 100).toFixed(2)}</div>
      </div>
    </AbsoluteFill>
  );
}

export const lidarScan = defineStyle({
  id: 'lidar-scan',
  accent: CYAN,
  colors: [MAGENTA, '#FFC14D'],
  entrance: 'fade',
  footage: 'contrast(1.4) brightness(1.25) grayscale(1)',
  Overlay: Cloud,
  caption: caption({ size: 82, glyph: 0.58, color: '#FFFFFF', emph: CYAN, upper: true, letter: 2, shadow: '0 0 6px #000, 0 0 18px #000', entrance: 'fade' }),
  hook: hook({ top: 0.08, entrance: 'fade', color: '#FFFFFF', size: 62, upper: true, letter: 5, bg: 'rgba(3,4,10,0.8)', border: `1px solid ${CYAN}`, pad: '14px 28px' }),
  card: card({ bg: 'rgba(3,4,10,0.86)', border: `1px solid ${CYAN}` }),
  title: text({ color: '#FFFFFF', upper: true, letter: 3 }),
  body: text({ font: 'body', color: '#9AE8F0' }),
  number: text({ color: CYAN, glow: CYAN }),
  slam: text({ color: '#FFFFFF', upper: true, letter: 6, glow: MAGENTA }),
  Marker: markerDash(CYAN, 30, 4),
  Ring: ringBrackets(CYAN, 4),
  stage: { shape: 'square', fill: ['#0A1020', '#03040A'], ring: CYAN, ringWidth: 2, glow: CYAN },
  transition: trScan({ color: '#FFFFFF', dim: 0.6, height: 4 }),
  sample: { type: 'counter', text: '2.4M', subtext: 'points in one scan' },
});
