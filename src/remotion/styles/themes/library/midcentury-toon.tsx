import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerStar, ringCircle, text, trWipe } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Mid-Century Toon: 1950s flat colour and limited animation for "follow along" films. Colour printed a
 * few pixels off its broken ink line, boomerang shapes and starbursts, a stylised town with lollipop
 * trees; only a few things move at a time, held between poses.
 */

const TEAL = '#2A9D8F';
const MUSTARD = '#E9C46A';
const TOMATO = '#E76F51';
const CREAM = '#F4ECD8';
const INK = '#2B2B2B';

/** A shape filled with colour, its ink line drawn a few pixels off. */
const offset = (d: string, fill: string, key: string | number, dx = 6, dy = 4) => (
  <g key={key}>
    <path d={d} fill={fill} transform={`translate(${dx} ${dy})`} />
    <path d={d} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="60 8" />
  </g>
);

function Town({ c }: { c: Ctx }) {
  // Limited animation: poses change every 10 frames.
  const pose = Math.floor(c.frame / 10) % 4;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {svgFrame(
        <g>
          {offset('M 0 1300 H 1080 V 1920 H 0 Z', '#B5D3C4', 'g')}
          {offset('M 140 1300 V 980 H 360 V 1300 Z', TOMATO, 'h1')}
          {offset('M 110 990 L 250 860 L 390 990 Z', INK, 'r1', 4, 2)}
          {offset('M 460 1300 V 900 H 640 V 1300 Z', MUSTARD, 'h2')}
          {offset('M 720 1300 V 1040 H 960 V 1300 Z', TEAL, 'h3')}
          {[0, 1, 2].map((k) => offset(`M ${190 + k * 300} 1300 V 1150 M ${190 + k * 300 - 50} 1100 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0`, k === 1 ? TOMATO : TEAL, `t${k}`))}
          {/* Boomerangs and a starburst in the sky, holding poses. */}
          <g transform={`translate(260 420) rotate(${pose * 15})`}>{offset('M -90 0 Q 0 -70 90 0 Q 0 -30 -90 0 Z', TOMATO, 'b1')}</g>
          <g transform={`translate(780 330) rotate(${-pose * 12})`}>{offset('M -70 0 Q 0 -60 70 0 Q 0 -24 -70 0 Z', TEAL, 'b2')}</g>
          <g transform={`translate(640 620) scale(${1 + (pose % 2) * 0.1})`}>
            {offset(Array.from({ length: 16 }, (_, k) => `${k ? 'L' : 'M'} ${Math.cos((k * Math.PI) / 8) * (k % 2 ? 30 : 90)} ${Math.sin((k * Math.PI) / 8) * (k % 2 ? 30 : 90)}`).join(' ') + ' Z', MUSTARD, 'sb')}
          </g>
          {/* A walking figure that holds each pose. */}
          <g transform={`translate(${200 + Math.floor(c.frame / 10) * 18 % 700} 1280)`}>
            {offset('M -26 -140 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0', '#F2C6A0', 'head')}
            {offset('M -30 -110 H 30 L 24 -40 H -24 Z', TEAL, 'body')}
            <path d={pose % 2 ? 'M -14 -40 L -30 0 M 14 -40 L 30 0' : 'M -14 -40 L -4 0 M 14 -40 L 4 0'} stroke={INK} strokeWidth={7} />
          </g>
        </g>,
      )}
      {grain({ color: '#6E5A3E', alpha: 0.22, freq: 0.8 })}
    </AbsoluteFill>
  );
}

export const midcenturyToon = defineStyle({
  id: 'midcentury-toon',
  accent: TOMATO,
  colors: [TEAL, MUSTARD],
  entrance: 'step',
  step: 2,
  Scene: Town,
  caption: caption({ size: 90, glyph: 0.52, color: INK, emph: TOMATO, bg: CREAM, pad: '4px 24px', boxExtra: { boxShadow: `6px 4px 0 ${MUSTARD}`, border: `4px solid ${INK}` }, entrance: 'step' }),
  hook: hook({ top: 0.08, entrance: 'step', color: CREAM, size: 72, bg: TEAL, pad: '12px 30px', boxShadow: `8px 6px 0 ${TOMATO}`, rotate: -2 }),
  card: card({ bg: CREAM, border: `5px solid ${INK}`, shadow: `8px 6px 0 ${MUSTARD}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#4A4A4A' }),
  number: text({ color: TOMATO, shadow: `6px 4px 0 ${MUSTARD}` }),
  slam: text({ color: CREAM, extra: { background: TOMATO, padding: '0 26px', boxShadow: `8px 6px 0 ${INK}` } }),
  Marker: markerStar([TOMATO, TEAL, MUSTARD], 48, INK),
  Ring: ringCircle(TOMATO, 9, { dash: '50 8' }),
  stage: { shape: 'circle', fill: [CREAM, '#E9DFC4'], ring: INK, ringWidth: 6 },
  transition: trWipe({ color: MUSTARD, dir: 'left', angle: 8, content: () => <div style={{ position: 'absolute', inset: '40% 30%', borderRadius: '50%', background: TOMATO }} /> }),
  sample: { type: 'list', text: 'Follow along', items: ['Wash your hands', 'Dry them well', 'Smile!'] },
});
