import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerStar, ringCircle, text, trWipe } from '../../kit/presets';
import { rays, svgFrame } from '../../kit/scenery';
import { useVoice } from '../../pulse';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Game Show: a rhythm-game variety show in flat vector. Candy stripes and a spinning sunburst frame the
 * footage like a TV studio set, marquee bulbs chase round the frame, a score counter pops on every beat
 * of the talk, and everything lands with a bounce and thick ink outlines.
 */

const PINK = '#FF3E8A';
const YELLOW = '#FFD23F';
const BLUE = '#3A86FF';
const INK = '#14112B';

function Studio({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const pop = d === Infinity ? 0 : spring({ frame: d, fps: c.fps, config: { damping: 8, stiffness: 220 } });
  const score = Math.max(0, k + 1) * 100;
  const bulbs = 34;
  return (
    <AbsoluteFill>
      {svgFrame(
        <g>
          <g opacity={0.35} style={{ mixBlendMode: 'screen' }}>{rays(540, 2100, { n: 20, colors: [YELLOW, PINK], spin: c.frame * 0.4, r: 1800 })}</g>
          {/* Marquee bulbs chasing round the frame. */}
          {Array.from({ length: bulbs }, (_, i) => {
            const t = i / bulbs;
            const per = 2 * (1080 + 1920);
            let p = t * per;
            const pos = p < 1080 ? [p, 24] : (p -= 1080) < 1920 ? [1056, p] : (p -= 1920) < 1080 ? [1080 - p, 1896] : [24, 1920 - (p - 1080)];
            const on = (i + Math.floor(c.frame / 4)) % 3 === 0;
            return <circle key={i} cx={pos[0]} cy={pos[1]} r={14} fill={on ? '#FFF7C2' : '#8A6A1A'} stroke={INK} strokeWidth={4} style={on ? { filter: 'drop-shadow(0 0 8px #FFE14D)' } : undefined} />;
          })}
        </g>,
      )}
      <div style={{ position: 'absolute', right: 60, top: 120, padding: '6px 22px', background: INK, color: YELLOW, fontFamily: c.fonts.display, fontSize: 52, borderRadius: 16, border: `5px solid ${YELLOW}`, transform: `scale(${1 + 0.25 * (1 - Math.min(1, pop))})` }}>{score}</div>
    </AbsoluteFill>
  );
}

const stripes: StyleTheme['transition'] = trWipe({ color: PINK, dir: 'right', angle: -10, before: 4, after: 8, content: () => <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, ${PINK} 0 80px, ${YELLOW} 80px 160px)` }} /> });

export const gameShow = defineStyle({
  id: 'game-show',
  accent: YELLOW,
  colors: [PINK, BLUE],
  entrance: 'bounce',
  footage: 'saturate(1.25) contrast(1.06) brightness(1.04)',
  Overlay: Studio,
  caption: caption({ size: 96, glyph: 0.52, color: '#FFFFFF', emph: YELLOW, stroke: [12, INK], shadow: `0 8px 0 ${INK}`, entrance: 'bounce' }),
  hook: hook({ top: 0.11, color: INK, size: 74, bg: YELLOW, border: `7px solid ${INK}`, radius: 30, boxShadow: `0 10px 0 ${PINK}`, entrance: 'bounce' }),
  card: card({ bg: '#FFFFFF', border: `7px solid ${INK}`, radius: 30, shadow: `0 10px 0 ${BLUE}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#3A3560' }),
  number: text({ color: YELLOW, stroke: [12, INK], shadow: `0 10px 0 ${PINK}` }),
  slam: text({ color: '#FFFFFF', stroke: [14, INK], shadow: `0 12px 0 ${PINK}` }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', left: '50%', top: '50%', width: 700, height: 700, transform: `translate(-50%, -50%) scale(${t}) rotate(${t * 30}deg)`, background: `repeating-conic-gradient(${YELLOW} 0 10deg, ${PINK} 10deg 20deg)`, borderRadius: '50%', border: `8px solid ${INK}` }} />,
  Marker: markerStar([YELLOW, PINK, BLUE], 52, INK),
  Ring: ringCircle(YELLOW, 12, { under: [20, INK] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#FFF1C2'], ring: INK, ringWidth: 8 },
  transition: stripes,
  sample: { type: 'slam', text: 'CORRECT!' },
});
