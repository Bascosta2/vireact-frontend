import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Shadow Puppets: traditional shadow theatre. Translucent dyed-hide puppets carved like lace, pressed
 * against a cotton screen lit from behind by flickering oil lamps; jointed limbs swing on rods, and the
 * warm light breathes.
 */

const SCREEN = '#F3C98B';
const HIDE = ['#8E2C1E', '#2E5E4E', '#C8892E'];

function Theatre({ c }: { c: Ctx }) {
  const flicker = 0.85 + 0.15 * noise(Math.floor(c.frame / 3), 2);
  const sw = Math.sin(c.frame / 14);
  const lace = (cx: number, cy: number, r: number) => Array.from({ length: 7 }, (_, k) => <circle key={k} cx={cx + Math.cos(k) * r * 0.5} cy={cy + Math.sin(k) * r * 0.5} r={r * 0.15} fill={SCREEN} opacity={0.7} />);
  return (
    <AbsoluteFill style={{ background: '#1A0E08' }}>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 220, bottom: 260, background: `radial-gradient(ellipse at 50% 55%, #FFE2A8, ${SCREEN} 55%, #B97A3A)`, filter: `brightness(${flicker})`, boxShadow: 'inset 0 0 80px rgba(80,30,0,0.6)' }} />
      {svgFrame(
        <g style={{ mixBlendMode: 'multiply' }}>
          {/* A rider on a horse, jointed on rods. */}
          <g transform={`translate(${380 + Math.sin(c.frame / 60) * 60} 1180)`} opacity={0.88}>
            <path d="M -150 0 Q -160 -90 -60 -110 Q 60 -130 120 -80 L 170 -140 L 190 -110 L 150 -50 Q 140 0 100 10 Z" fill={HIDE[0]} />
            {lace(0, -60, 90)}
            <path d={`M -110 0 l ${-20 + sw * 20} 110 M -60 0 l ${10 - sw * 20} 110 M 60 0 l ${-10 + sw * 20} 110 M 100 0 l ${20 - sw * 20} 110`} stroke={HIDE[0]} strokeWidth={18} strokeLinecap="round" />
            <path d="M -20 -120 L 10 -260 L 50 -250 L 40 -120 Z" fill={HIDE[1]} />
            <circle cx={30} cy={-290} r={34} fill={HIDE[1]} />
            <path d={`M 30 -230 l ${80 + sw * 20} ${-40 - sw * 30}`} stroke={HIDE[1]} strokeWidth={14} strokeLinecap="round" />
            {lace(25, -190, 60)}
            <line x1={40} y1={-200} x2={160} y2={420} stroke="#3A2A1A" strokeWidth={4} />
          </g>
          {/* A tree and a pavilion carved in lace. */}
          <g transform="translate(860 1120)" opacity={0.85}>
            <path d="M -16 0 V -300 M -16 -200 Q -120 -260 -140 -340 M -16 -240 Q 90 -300 100 -380" stroke={HIDE[2]} strokeWidth={22} fill="none" strokeLinecap="round" />
            {[-140, 100, -20].map((x, k) => (
              <g key={k}>
                <circle cx={x} cy={-380 + k * 20} r={80} fill={HIDE[2]} />
                {lace(x, -380 + k * 20, 80)}
              </g>
            ))}
          </g>
        </g>,
      )}
      {/* The lamp glow from below. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: 'linear-gradient(transparent, rgba(255,150,40,0.25))' }} />
      {grain({ color: '#4A2A10', alpha: 0.3, freq: 0.6 })}
    </AbsoluteFill>
  );
}

export const shadowPuppets = defineStyle({
  id: 'shadow-puppets',
  accent: '#FFD27A',
  colors: [HIDE[0], HIDE[1]],
  entrance: 'fade',
  Scene: Theatre,
  caption: caption({ size: 92, glyph: 0.5, color: '#FFE9C2', emph: '#FFD27A', shadow: '0 0 16px #000, 0 4px 0 #2A1206', entrance: 'fade' }),
  hook: hook({ top: 0.035, entrance: 'fade', color: '#FFE9C2', size: 70, shadow: '0 0 20px #000' }),
  card: card({ bg: 'rgba(26,14,8,0.88)', border: '3px solid #C8892E', radius: 8 }),
  title: text({ color: '#FFE9C2' }),
  body: text({ font: 'body', color: '#F3C98B' }),
  number: text({ color: '#FFD27A', glow: '#C8892E' }),
  slam: text({ color: '#FFE9C2', glow: '#C8892E' }),
  Marker: markerDot(HIDE, 24),
  Ring: ringCircle('#FFD27A', 6),
  stage: { shape: 'circle', fill: [SCREEN, '#B97A3A'], ring: '#3A2A1A', ringWidth: 8 },
  transition: trIris({ color: '#1A0E08' }),
  sample: { type: 'headline', text: 'The rider at dawn', subtext: '' },
});
