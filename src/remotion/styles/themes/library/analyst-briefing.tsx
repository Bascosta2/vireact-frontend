import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringBrackets, text, trScan } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { layer, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Analyst Briefing: the footage graded down to an analyst's grey, with thin white measurement lines
 * drawn on it: a lock-on reticle that drifts and settles, distance lines with values, coordinates, a
 * scale bar and a north arrow.
 */

const WHITE = '#F5F7FA';
const AMBER = '#FFB000';

function Measure({ c }: { c: Ctx }) {
  const lock = 540 + Math.sin(c.frame / 45) * 40;
  const lockY = 820 + Math.cos(c.frame / 55) * 30;
  return (
    <AbsoluteFill>
      {layer({ background: 'rgba(20,24,30,0.18)' })}
      {svgFrame(
        <g stroke={WHITE} fill="none" strokeWidth={2.5} fontFamily={c.fonts.body}>
          <rect x={lock - 110} y={lockY - 110} width={220} height={220} strokeDasharray="30 160 30 0" />
          <line x1={lock} y1={lockY - 160} x2={lock} y2={lockY - 120} />
          <line x1={lock} y1={lockY + 120} x2={lock} y2={lockY + 160} />
          <line x1={lock - 160} y1={lockY} x2={lock - 120} y2={lockY} />
          <line x1={lock + 120} y1={lockY} x2={lock + 160} y2={lockY} />
          <line x1={160} y1={1260} x2={lock - 40} y2={lockY + 60} strokeDasharray="10 8" />
          <text x={240} y={1150} fill={WHITE} stroke="none" fontSize={30} transform="rotate(-38 240 1150)">
            412 m
          </text>
          <text x={lock + 130} y={lockY - 130} fill={AMBER} stroke="none" fontSize={28}>
            TGT-01 · LOCK
          </text>
          <text x={60} y={300} fill={WHITE} stroke="none" fontSize={28}>
            41°24'12.2&quot;N 2°10'26.5&quot;E
          </text>
          <text x={60} y={340} fill={WHITE} stroke="none" fontSize={24} opacity={0.7}>
            ALT 3,200 FT · {String(Math.floor(c.frame / 30)).padStart(2, '0')}s
          </text>
          <g transform="translate(940 300)">
            <path d="M 0 -50 L 16 10 L 0 0 L -16 10 Z" fill={WHITE} />
            <text y={40} textAnchor="middle" fill={WHITE} stroke="none" fontSize={28}>
              N
            </text>
          </g>
          <g transform="translate(700 1500)">
            <line x1={0} y1={0} x2={240} y2={0} strokeWidth={4} />
            <line x1={0} y1={-12} x2={0} y2={12} />
            <line x1={240} y1={-12} x2={240} y2={12} />
            <text x={120} y={-18} textAnchor="middle" fill={WHITE} stroke="none" fontSize={26}>
              100 m
            </text>
          </g>
        </g>,
      )}
      {vignette(0.5, '#0B0E12')}
    </AbsoluteFill>
  );
}

export const analystBriefing = defineStyle({
  id: 'analyst-briefing',
  accent: AMBER,
  colors: [WHITE, '#8C96A3'],
  entrance: 'fade',
  footage: 'grayscale(0.88) contrast(1.15) brightness(0.95)',
  Overlay: Measure,
  caption: caption({ size: 80, glyph: 0.6, color: WHITE, emph: AMBER, weight: 600, upper: true, letter: 2, bg: 'rgba(12,15,20,0.82)', pad: '6px 22px', entrance: 'fade' }),
  hook: hook({ top: 0.065, align: 'left', entrance: 'fade', typewriter: true, color: WHITE, size: 52, weight: 600, upper: true, letter: 3, bg: 'rgba(12,15,20,0.85)', border: `2px solid ${WHITE}`, pad: '14px 22px' }),
  card: card({ bg: 'rgba(12,15,20,0.88)', border: `2px solid ${WHITE}` }),
  title: text({ color: WHITE, weight: 600, upper: true, letter: 2 }),
  body: text({ font: 'body', color: '#B8C2CF' }),
  number: text({ color: AMBER, weight: 600 }),
  slam: text({ color: WHITE, weight: 700, upper: true, letter: 6, extra: { border: `3px solid ${WHITE}`, padding: '0 24px', background: 'rgba(12,15,20,0.7)' } }),
  Marker: markerDash(AMBER, 34, 5),
  Ring: ringBrackets(AMBER, 4, 30),
  stage: { shape: 'square', fill: ['#2A3038', '#0B0E12'], ring: WHITE, ringWidth: 3 },
  transition: trScan({ color: WHITE, dim: 0.4, height: 4 }),
  sample: { type: 'callout', text: 'Site A' },
});
