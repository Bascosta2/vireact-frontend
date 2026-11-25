import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text, trFlash } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Double Exposure: a silhouette is a window. A forest-and-mountain landscape (the second exposure)
 * fills the frame in soft fog, and the footage shows through the silhouette of a great deer's head
 * against it, the two images blending at the edges like two exposures on one frame of film.
 */

const FOG = '#E9EDF0';
const PINE = '#2F3E46';

/** The deer's head silhouette (the footage window), as a polygon in frame pixels. */
const DEER = 'M 420 1520 C 380 1380 360 1260 400 1140 C 330 1110 300 1060 310 1000 C 250 990 220 940 250 900 C 300 860 360 880 400 900 C 420 840 450 800 500 780 C 480 700 420 620 330 560 C 280 520 260 460 300 420 C 340 400 360 460 380 500 C 400 430 380 360 420 320 C 450 360 440 440 460 500 C 500 460 520 400 560 380 C 580 420 560 480 540 540 C 600 560 640 620 660 700 C 720 680 780 620 820 560 C 860 500 840 440 880 410 C 900 460 890 520 870 580 C 920 560 960 500 990 470 C 1000 520 970 590 920 640 C 860 700 800 760 760 800 C 800 860 820 940 800 1020 C 780 1140 740 1260 700 1380 C 680 1460 660 1520 640 1560 Z';

function Landscape({ c }: { c: Ctx }) {
  const drift = Math.sin(c.frame / 120) * 20;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(#C9D3DA, ${FOG} 40%, #F4F1EA)` }}>
      {svgFrame(
        <g>
          <path d={`M -40 1180 L 200 820 L 360 1000 L 560 700 L 760 980 L 920 820 L 1120 1100 V 1920 H -40 Z`} fill="#AAB6BE" transform={`translate(${drift} 0)`} />
          {Array.from({ length: 18 }, (_, k) => (
            <path key={k} d={`M ${k * 64 - 20} 1500 l 40 -${180 + (k % 3) * 60} l 40 ${180 + (k % 3) * 60} z`} fill={PINE} opacity={0.85} transform={`translate(${-drift * 1.6} 0)`} />
          ))}
          <rect x={0} y={1480} width={1080} height={440} fill={PINE} />
        </g>,
      )}
    </AbsoluteFill>
  );
}

function Blend() {
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="de-soft"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        {/* A soft fog edge where the two exposures meet. */}
        <path d={DEER} fill="none" stroke={FOG} strokeWidth={60} opacity={0.55} filter="url(#de-soft)" />
      </svg>
      {grain({ color: '#3A3A3A', alpha: 0.2, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const doubleExposure = defineStyle({
  id: 'double-exposure',
  accent: '#C97B4A',
  colors: [PINE, '#AAB6BE'],
  entrance: 'fade',
  footage: 'grayscale(0.35) contrast(1.15) brightness(1.05)',
  screen: { x: 0, y: 0, w: 1080, h: 1920, shape: 'rect', style: { clipPath: `path('${DEER}')` } },
  Backdrop: Landscape,
  Overlay: Blend,
  caption: caption({ size: 86, glyph: 0.5, color: PINE, emph: '#C97B4A', weight: 300, letter: 3, upper: true, bg: 'rgba(244,241,234,0.85)', pad: '4px 24px', entrance: 'fade' }),
  hook: hook({ top: 0.035, entrance: 'fade', color: PINE, size: 70, weight: 300, letter: 8, upper: true }),
  card: card({ bg: 'rgba(244,241,234,0.9)', border: `1px solid ${PINE}` }),
  title: text({ color: PINE, weight: 300, letter: 3, upper: true }),
  body: text({ font: 'body', color: '#5A6A72' }),
  number: text({ color: '#C97B4A', weight: 300 }),
  slam: text({ color: PINE, weight: 300, letter: 10, upper: true }),
  Marker: markerDash('#C97B4A', 30, 3),
  Ring: ringCircle('#C97B4A', 3),
  stage: { shape: 'circle', fill: [FOG, '#C9D3DA'], ring: PINE, ringWidth: 3 },
  transition: trFlash({ color: FOG, peak: 0.85 }),
  sample: { type: 'headline', text: 'What the forest remembers', subtext: '' },
});
