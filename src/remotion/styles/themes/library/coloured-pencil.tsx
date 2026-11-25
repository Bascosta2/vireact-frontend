import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trTear } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Coloured Pencil: a cutaway world redrawn every frame as a coloured-pencil plate on toothed paper.
 * Ground cut open in soil layers with stones, roots and a burrow with a sleeping rabbit, a tree and sky
 * above; every area is filled with directional pencil hatching that re-strikes slightly each frame.
 */

const PAPER = '#F7F2E6';

/** Fill a rectangle-ish band with pencil hatching in a colour. */
function hatchBand(y0: number, y1: number, col: string, angle: number, seed: number, frame: number) {
  const f = Math.floor(frame / 3);
  return Array.from({ length: 70 }, (_, k) => {
    const x = (k / 70) * 1180 - 50 + (noise(f, seed + k) - 0.5) * 8;
    const len = (y1 - y0) / Math.cos((angle * Math.PI) / 180);
    return <line key={`${seed}-${k}`} x1={x} y1={y0} x2={x + Math.tan((angle * Math.PI) / 180) * (y1 - y0)} y2={y0 + len * Math.cos((angle * Math.PI) / 180)} stroke={col} strokeWidth={5 + noise(k, seed) * 4} opacity={0.55 + noise(k + f, seed) * 0.25} strokeLinecap="round" />;
  });
}

function Plate({ c }: { c: Ctx }) {
  const breathe = Math.sin(c.frame / 25) * 3;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g>
          <clipPath id="cp-sky"><rect x={0} y={0} width={1080} height={820} /></clipPath>
          <clipPath id="cp-top"><rect x={0} y={820} width={1080} height={260} /></clipPath>
          <clipPath id="cp-mid"><rect x={0} y={1080} width={1080} height={320} /></clipPath>
          <clipPath id="cp-deep"><rect x={0} y={1400} width={1080} height={520} /></clipPath>
          <g clipPath="url(#cp-sky)">{hatchBand(0, 820, '#9CC7E8', 20, 1, c.frame)}</g>
          <g clipPath="url(#cp-top)">{hatchBand(820, 1080, '#6B4A2E', -25, 2, c.frame)}</g>
          <g clipPath="url(#cp-mid)">{hatchBand(1080, 1400, '#A87A4E', 30, 3, c.frame)}</g>
          <g clipPath="url(#cp-deep)">{hatchBand(1400, 1920, '#C9A27A', -15, 4, c.frame)}</g>
          <path d="M 0 820 Q 540 790 1080 820" stroke="#4E8A3A" strokeWidth={22} fill="none" />
          {/* The tree with roots reaching down into the cutaway. */}
          <g stroke="#5A3A20" strokeLinecap="round" fill="none">
            <path d="M 760 820 V 520" strokeWidth={30} />
            <path d="M 760 840 Q 700 960 640 1040 M 760 840 Q 820 1000 900 1060 M 760 840 V 1100" strokeWidth={10} />
          </g>
          <circle cx={760} cy={440} r={170} fill="#5FA04A" opacity={0.85} />
          <circle cx={680} cy={500} r={110} fill="#4E8A3A" opacity={0.8} />
          {/* Stones and the burrow with a sleeping rabbit. */}
          {[[180, 1180, 40], [420, 1500, 56], [880, 1620, 46]].map(([x, y, r], k) => (
            <ellipse key={k} cx={x} cy={y} rx={r} ry={r * 0.7} fill="#8A8A8A" stroke="#4A4A4A" strokeWidth={4} />
          ))}
          <ellipse cx={360} cy={1260} rx={170} ry={90} fill="#3A2A1A" opacity={0.85} />
          <g transform={`translate(360 ${1270 + breathe})`}>
            <ellipse rx={80} ry={44} fill="#E8E0D0" />
            <ellipse cx={58} cy={-30} rx={34} ry={28} fill="#E8E0D0" />
            <ellipse cx={70} cy={-70} rx={12} ry={34} fill="#E8E0D0" transform="rotate(20 70 -70)" />
            <path d="M 66 -32 q 8 4 14 0" stroke="#4A3A2A" strokeWidth={4} fill="none" />
          </g>
          <circle cx={200} cy={200} r={80} fill="#FFD36E" opacity={0.85} />
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.35, freq: 1.1 })}
    </AbsoluteFill>
  );
}

export const colouredPencil = defineStyle({
  id: 'coloured-pencil',
  accent: '#D9643A',
  colors: ['#4E8A3A', '#9CC7E8'],
  entrance: 'write',
  step: 2,
  Scene: Plate,
  caption: caption({ size: 96, glyph: 0.46, color: '#3A2A1A', emph: '#D9643A', bg: 'rgba(247,242,230,0.92)', pad: '2px 22px', radius: 8, entrance: 'write' }),
  hook: hook({ top: 0.07, entrance: 'write', color: '#3A2A1A', size: 82, bg: 'rgba(247,242,230,0.92)', pad: '8px 26px', radius: 8 }),
  card: card({ bg: PAPER, border: '4px solid #5A3A20', radius: 10 }),
  title: text({ color: '#3A2A1A' }),
  body: text({ font: 'body', color: '#5A4A3A' }),
  number: text({ color: '#D9643A', stroke: [6, PAPER] }),
  slam: text({ color: '#3A2A1A', stroke: [8, PAPER] }),
  Marker: markerScribble('#4E8A3A'),
  Ring: ringScribble('#D9643A', 8, 21),
  stage: { shape: 'square', fill: [PAPER, '#ECE3CF'], ring: '#5A3A20', ringWidth: 5 },
  transition: trTear({ paper: PAPER }),
  sample: { type: 'pill', text: 'Under the meadow' },
});
