import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text, trInk } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Flow Field: an invisible flow (wind, current, traffic, money) made visible as thousands of thin ink
 * streamlines engraved on warm paper, darker where the flow is strong, with particles riding along them.
 * The field slowly changes, so the lines breathe.
 */

const PAPER = '#F3EBDD';
const INK = '#1F2A36';
const RUST = '#C2552B';

/** The field's direction at a point (radians), slowly changing with time. */
const angleAt = (x: number, y: number, t: number) => Math.sin(x / 260 + t) * 1.4 + Math.cos(y / 300 - t * 0.7) * 1.2 + Math.sin((x + y) / 500) * 0.6;

const SEEDS = Array.from({ length: 150 }, (_, k) => [noise(k, 1) * 1080, 160 + noise(k, 2) * 1300] as [number, number]);

function Streams({ c }: { c: Ctx }) {
  const t = c.frame / 200;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g fill="none" strokeLinecap="round">
          {SEEDS.map(([sx, sy], k) => {
            let x = sx;
            let y = sy;
            const pts: string[] = [`${x.toFixed(1)},${y.toFixed(1)}`];
            for (let i = 0; i < 26; i += 1) {
              const a = angleAt(x, y, t);
              x += Math.cos(a) * 14;
              y += Math.sin(a) * 14;
              pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            const strong = Math.abs(Math.sin(sx / 200 + t)) > 0.7;
            const ride = Math.floor(((c.frame + k * 7) % 60) / 60 * 26);
            const [rx, ry] = pts[ride].split(',').map(Number);
            return (
              <g key={k}>
                <polyline points={pts.join(' ')} stroke={INK} strokeWidth={strong ? 2.6 : 1.2} opacity={strong ? 0.85 : 0.45} />
                {k % 4 === 0 && <circle cx={rx} cy={ry} r={4} fill={RUST} />}
              </g>
            );
          })}
        </g>,
      )}
      {grain({ color: '#6E5A3E', alpha: 0.22, freq: 0.85 })}
    </AbsoluteFill>
  );
}

export const flowField = defineStyle({
  id: 'flow-field',
  accent: RUST,
  colors: [INK, '#8A8070'],
  entrance: 'fade',
  Scene: Streams,
  pip: pipAt({ border: `3px solid ${INK}`, boxShadow: `0 0 0 10px ${PAPER}, 0 0 0 12px ${INK}` }, 'circle'),
  caption: caption({ size: 90, glyph: 0.5, color: INK, emph: RUST, bg: 'rgba(243,235,221,0.92)', pad: '4px 22px', entrance: 'fade' }),
  hook: hook({ top: 0.08, entrance: 'fade', color: INK, size: 76, bg: PAPER, pad: '12px 28px', boxShadow: `0 0 0 3px ${INK}` }),
  card: card({ bg: PAPER, border: `3px solid ${INK}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#4A4F55', italic: true }),
  number: text({ color: RUST, stroke: [6, PAPER] }),
  slam: text({ color: INK, extra: { background: PAPER, padding: '0 24px', border: `3px solid ${INK}` } }),
  Marker: markerDash(RUST, 34, 4),
  Ring: ringCircle(RUST, 4, { dash: '3 8' }),
  stage: { shape: 'circle', fill: [PAPER, '#E6DCC8'], ring: INK, ringWidth: 3 },
  transition: trInk({ color: INK }),
  sample: { type: 'headline', text: 'Where the wind goes', subtext: 'Every line, one breath of air' },
});
