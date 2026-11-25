import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { roughFilter } from '../../painted';
import { noise, type Ctx } from '../../theme';

/**
 * Claymation: a stop-motion clay world animated on twos (12 fps). Lumpy plasticine shapes with
 * fingerprint texture and soft shadows: a clay sun with triangle rays turning in the corner, a rocket
 * with a smiling face in its porthole, clay clouds and hills; everything jitters a hair between frames.
 */

const SKY = '#8FD3F4';
const CORAL = '#FF6F59';
const CREAM = '#FFF3D6';
const BLUE = '#3A7BD5';
const GREEN = '#7BC96F';
const SUN = '#FFC93C';

function ClayWorld({ c }: { c: Ctx }) {
  const f = Math.floor(c.frame / 2) * 2;
  const j = (k: number) => (noise(Math.floor(f / 2), k) - 0.5) * 3;
  const lift = Math.min(1, (f % 300) / 300);
  const ry = 1250 - lift * 700;
  return (
    <AbsoluteFill style={{ background: SKY }}>
      {svgFrame(
        <g>
          <defs>{roughFilter('clay', { scale: 7, freq: 0.03, seed: 4 })}</defs>
          <g filter="url(#clay)">
            {/* Sun with turning triangle rays. */}
            <g transform={`translate(${880 + j(1)} ${300 + j(2)}) rotate(${f * 0.8})`}>
              {Array.from({ length: 10 }, (_, k) => (
                <polygon key={k} points="0,-150 26,-104 -26,-104" fill={SUN} transform={`rotate(${k * 36})`} />
              ))}
              <circle r={95} fill={SUN} />
              <circle cx={-30} cy={-14} r={10} fill="#5A3A00" />
              <circle cx={30} cy={-14} r={10} fill="#5A3A00" />
              <path d="M -32 24 Q 0 50 32 24" stroke="#5A3A00" strokeWidth={9} fill="none" strokeLinecap="round" />
            </g>
            {/* Clouds. */}
            {[[200, 380], [520, 260]].map(([x, y], k) => (
              <g key={k} transform={`translate(${x + j(10 + k)} ${y + j(20 + k)})`} fill={CREAM}>
                <circle r={60} />
                <circle cx={70} cy={10} r={50} />
                <circle cx={-70} cy={14} r={44} />
                <rect x={-110} y={10} width={220} height={50} rx={25} />
              </g>
            ))}
            {/* Hills. */}
            <ellipse cx={240} cy={1700} rx={520} ry={360} fill={GREEN} />
            <ellipse cx={900} cy={1760} rx={520} ry={330} fill="#5FB35A" />
            {/* The rocket with a smiling face in the porthole. */}
            <g transform={`translate(${540 + j(30)} ${ry + j(31)}) rotate(${j(32) * 0.6})`}>
              <path d="M 0 -200 C 90 -120 95 40 70 120 H -70 C -95 40 -90 -120 0 -200 Z" fill={CREAM} />
              <path d="M 0 -200 C 50 -160 66 -120 70 -96 H -70 C -66 -120 -50 -160 0 -200 Z" fill={CORAL} />
              <circle cy={-10} r={44} fill={BLUE} />
              <circle cy={-10} r={32} fill="#FFE0BD" />
              <circle cx={-10} cy={-16} r={5} fill="#3A2A20" />
              <circle cx={10} cy={-16} r={5} fill="#3A2A20" />
              <path d="M -12 0 Q 0 10 12 0" stroke="#3A2A20" strokeWidth={4} fill="none" />
              <path d="M -70 60 L -130 150 L -60 130 Z M 70 60 L 130 150 L 60 130 Z" fill={CORAL} />
              {/* Lumpy flame. */}
              {[0, 1, 2].map((k) => (
                <ellipse key={k} cx={j(40 + k) * 4} cy={150 + k * 34} rx={50 - k * 12} ry={36 - k * 6} fill={['#FFB703', '#FB8500', '#FFE066'][k]} />
              ))}
            </g>
          </g>
        </g>,
      )}
      {/* Fingerprint and modelling texture over everything. */}
      {grain({ color: '#5A3A20', alpha: 0.28, freq: 0.35, seed: Math.floor(f / 2) % 3 })}
    </AbsoluteFill>
  );
}

export const claymation = defineStyle({
  id: 'claymation',
  accent: CORAL,
  colors: [BLUE, SUN],
  entrance: 'bounce',
  step: 2,
  Scene: ClayWorld,
  caption: caption({ size: 92, glyph: 0.52, color: CREAM, emph: SUN, stroke: [12, '#5A3A20'], shadow: '0 8px 0 #5A3A20', entrance: 'bounce' }),
  hook: hook({ top: 0.07, entrance: 'bounce', color: '#5A3A20', size: 70, bg: CREAM, radius: 50, pad: '18px 40px', boxShadow: '0 10px 0 #C9A27A, 0 16px 20px rgba(0,0,0,0.25)' }),
  card: card({ bg: CREAM, radius: 40, shadow: '0 10px 0 #C9A27A, 0 16px 24px rgba(0,0,0,0.25)' }),
  title: text({ color: '#5A3A20' }),
  body: text({ font: 'body', color: '#7A5A3A' }),
  number: text({ color: CORAL, stroke: [10, '#5A3A20'] }),
  slam: text({ color: SUN, stroke: [12, '#5A3A20'] }),
  Marker: markerDot([CORAL, BLUE, SUN], 40, '5px solid #5A3A20'),
  Ring: ringCircle(CORAL, 12, { under: [20, '#5A3A20'] }),
  stage: { shape: 'circle', fill: [CREAM, '#F2DDB4'], ring: '#5A3A20', ringWidth: 8 },
  transition: trIris({ color: CORAL }),
  sample: { type: 'pill', text: 'Liftoff!' },
});
