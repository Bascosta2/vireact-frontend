import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trBurn } from '../../kit/presets';
import { filmDamage, layer } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Scratch Film: direct animation, as if scratched into black emulsion with a needle and tinted with
 * transparent dye, redrawn by hand fifteen times a second. The footage is darkened and dyed in shifting
 * colour fields; scratched lines, loops and sprockets boil over it.
 */

const DYES = ['#FF3D7F', '#FFD23F', '#3DDCFF', '#7CFF6B'];

function Emulsion({ c }: { c: Ctx }) {
  const f = Math.floor(c.frame / 2);
  const dye = DYES[Math.floor(c.frame / 30) % DYES.length];
  const dye2 = DYES[(Math.floor(c.frame / 30) + 2) % DYES.length];
  return (
    <AbsoluteFill>
      {layer({ background: `linear-gradient(${noise(f, 1) * 360}deg, ${dye}, ${dye2})`, mixBlendMode: 'color', opacity: 0.55 })}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 7 }, (_, k) => {
          const x = noise(f, k) * 1080;
          return <path key={k} d={`M ${x} 0 Q ${x + (noise(f, k + 9) - 0.5) * 200} 960 ${x + (noise(f, k + 19) - 0.5) * 80} 1920`} stroke="#fff" strokeWidth={2 + noise(f, k + 29) * 4} fill="none" opacity={0.7} />;
        })}
        {Array.from({ length: 3 }, (_, k) => (
          <ellipse key={`e${k}`} cx={200 + noise(f, k + 40) * 680} cy={300 + noise(f, k + 50) * 1300} rx={40 + noise(f, k + 60) * 90} ry={30 + noise(f, k + 70) * 60} stroke={DYES[k]} strokeWidth={5} fill="none" opacity={0.85} />
        ))}
        {/* Sprocket holes down both edges. */}
        {Array.from({ length: 16 }, (_, k) => (
          <g key={`s${k}`} fill="#000">
            <rect x={10} y={k * 124 + ((c.frame * 9) % 124) - 60} width={36} height={56} rx={8} />
            <rect x={1034} y={k * 124 + ((c.frame * 9) % 124) - 60} width={36} height={56} rx={8} />
          </g>
        ))}
      </svg>
      {filmDamage(c.frame, { step: 2, scratches: 4, dust: 20, flicker: 0.12, color: '#000', light: '#fff' })}
    </AbsoluteFill>
  );
}

export const scratchFilm = defineStyle({
  id: 'scratch-film',
  accent: '#FFD23F',
  colors: ['#FF3D7F', '#3DDCFF'],
  entrance: 'step',
  step: 2,
  footage: 'grayscale(1) contrast(1.6) brightness(0.75)',
  Overlay: Emulsion,
  caption: caption({ size: 98, glyph: 0.5, color: '#FFFFFF', emph: '#FFD23F', upper: true, letter: 2, shadow: '3px 3px 0 #FF3D7F, -3px -2px 0 #3DDCFF', entrance: 'step' }),
  hook: hook({ top: 0.1, entrance: 'step', color: '#FFFFFF', size: 82, upper: true, letter: 3, shadow: '4px 4px 0 #FF3D7F, -4px -3px 0 #3DDCFF', rotate: -2 }),
  card: card({ bg: 'rgba(0,0,0,0.82)', border: '4px solid #fff', radius: 30, extra: { borderRadius: '40% 12% 38% 16% / 14% 36% 12% 40%' } }),
  title: text({ color: '#FFFFFF', upper: true, letter: 2 }),
  body: text({ font: 'body', color: '#FFD23F' }),
  number: text({ color: '#FFFFFF', shadow: '6px 4px 0 #FF3D7F, -6px -4px 0 #3DDCFF' }),
  slam: text({ color: '#FFFFFF', upper: true, letter: 4, shadow: '8px 6px 0 #FF3D7F, -8px -6px 0 #3DDCFF' }),
  Marker: markerScribble('#FFD23F'),
  Ring: ringScribble('#FFFFFF', 6, 11),
  stage: { shape: 'circle', fill: ['#2A2A2A', '#000'], ring: '#FFFFFF', ringWidth: 5 },
  transition: trBurn(),
  sample: { type: 'slam', text: 'WAKE UP' },
});
