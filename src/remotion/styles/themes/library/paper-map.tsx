import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringScribble, text, trTear } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain, vignette } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Paper Map: history told on a printed paper map. Lands are cut-paper puppet pieces held by brass
 * split pins, so they wobble on their pins; red string runs between places; an engraved compass rose.
 */

const PAPER = '#EADCB8';
const INK = '#3B2A1A';
const RED = '#B23A48';
const SEA = '#C9D8CF';
const BRASS = '#C9A227';

/** A land as a lumpy closed shape around (x, y). */
const land = (x: number, y: number, r: number, seed: number) => {
  const pts = Array.from({ length: 14 }, (_, k) => {
    const a = (k / 14) * Math.PI * 2;
    const rr = r * (0.75 + 0.35 * Math.abs(Math.sin(k * 1.7 + seed)));
    return `${(x + Math.cos(a) * rr * 1.2).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  });
  return pts.join(' ');
};

const PIECES = [
  { x: 330, y: 560, r: 170, fill: '#D9C08C', seed: 1 },
  { x: 760, y: 520, r: 150, fill: '#C7B07A', seed: 2 },
  { x: 560, y: 980, r: 190, fill: '#D6BC86', seed: 3 },
  { x: 250, y: 1180, r: 110, fill: '#CDB27C', seed: 4 },
];

function MapTable({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 110);
  return (
    <AbsoluteFill style={{ background: '#5B3E28' }}>
      <div style={{ position: 'absolute', left: 36, right: 36, top: 140, bottom: 160, background: SEA, boxShadow: '0 22px 40px rgba(0,0,0,0.45)' }} />
      {svgFrame(
        <g>
          {/* Wavy sea lines engraved on the map. */}
          {Array.from({ length: 14 }, (_, k) => (
            <path key={k} d={`M 60 ${200 + k * 110} q 40 -12 80 0 t 80 0 t 80 0`} fill="none" stroke="#8FA89A" strokeWidth={2} opacity={0.6} transform={`translate(${(k % 3) * 300} 0)`} />
          ))}
          {PIECES.map((p, k) => {
            const wob = Math.sin(c.frame / 25 + k) * 3 * smooth(u, 0.2, 0.4);
            return (
              <g key={k} transform={`rotate(${wob} ${p.x} ${p.y - p.r * 0.6})`} opacity={smooth(u, k * 0.08, k * 0.08 + 0.2)}>
                <polygon points={land(p.x + 8, p.y + 10, p.r, p.seed)} fill="rgba(0,0,0,0.25)" />
                <polygon points={land(p.x, p.y, p.r, p.seed)} fill={p.fill} stroke={INK} strokeWidth={3} />
                <circle cx={p.x} cy={p.y - p.r * 0.6} r={11} fill={BRASS} stroke={INK} strokeWidth={2} />
              </g>
            );
          })}
          {/* Red string between pins. */}
          <path d={`M 330 458 L 760 430 L 560 866 L 250 1114`} fill="none" stroke={RED} strokeWidth={5} style={drawStroke(smooth(u, 0.45, 0.85), 1500)} />
          {/* The compass rose. */}
          <g transform="translate(900 1220)" opacity={smooth(u, 0.3, 0.5)}>
            <circle r={70} fill="none" stroke={INK} strokeWidth={3} />
            <path d="M 0 -90 L 14 0 L 0 90 L -14 0 Z M -90 0 L 0 14 L 90 0 L 0 -14 Z" fill={INK} opacity={0.85} />
            {label(0, -100, 'N', { size: 34, fill: INK, font: c.fonts.display })}
          </g>
          {label(330, 580, 'Northmark', { size: 36, fill: INK, font: c.fonts.display, opacity: smooth(u, 0.3, 0.5) })}
          {label(760, 540, 'Eastreach', { size: 36, fill: INK, font: c.fonts.display, opacity: smooth(u, 0.35, 0.55) })}
          {label(560, 1000, 'The Old Empire', { size: 40, fill: INK, font: c.fonts.display, opacity: smooth(u, 0.4, 0.6) })}
        </g>,
      )}
      {grain({ color: '#5A4026', alpha: 0.3, freq: 0.7 })}
      {vignette(0.5, '#2A1A0E')}
    </AbsoluteFill>
  );
}

export const paperMap = defineStyle({
  id: 'paper-map',
  accent: RED,
  colors: [BRASS, INK],
  entrance: 'fade',
  footage: 'sepia(0.35) saturate(0.85) contrast(1.05)',
  Scene: MapTable,
  pip: pipAt({ border: `10px solid ${PAPER}`, boxShadow: `0 0 0 3px ${INK}, 0 14px 26px rgba(0,0,0,0.45)` }, 'circle'),
  caption: caption({ size: 96, glyph: 0.46, color: INK, emph: RED, bg: 'rgba(234,220,184,0.96)', pad: '4px 24px', radius: 4, boxExtra: { border: `3px solid ${INK}` }, entrance: 'fade' }),
  hook: hook({ top: 0.08, entrance: 'fade', color: INK, size: 74, bg: PAPER, border: `4px double ${INK}`, pad: '16px 36px', boxShadow: '0 12px 24px rgba(0,0,0,0.4)' }),
  card: card({ bg: PAPER, border: `3px solid ${INK}`, radius: 4, shadow: '0 12px 24px rgba(0,0,0,0.35)' }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#4A3826' }),
  number: text({ color: RED, stroke: [6, PAPER] }),
  slam: text({ color: RED, upper: true, stroke: [8, PAPER] }),
  Marker: markerDot([BRASS], 30, `3px solid ${INK}`),
  Ring: ringScribble(RED, 6, 9),
  stage: { shape: 'circle', fill: [PAPER, '#D7C496'], ring: INK, ringWidth: 5 },
  transition: trTear({ paper: PAPER }),
  sample: { type: 'list', text: 'The fall', items: ['1402: the split', '1451: the siege', '1453: the end'] },
});
