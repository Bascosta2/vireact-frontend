import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trFlash } from '../../kit/presets';
import { useVoice } from '../../pulse';
import { noise, type Ctx } from '../../theme';

/**
 * Audiogram: the podcast clip. The footage sits in a rounded card like an episode cover on a deep
 * purple ground; under it a spectrogram and a coral waveform move with the voice, beat dots mark each
 * line, a white playhead brightens the played part, and the show name and a tempo readout sit at the top.
 */

const PURPLE = '#1E1035';
const CORAL = '#FF6F61';
const ORANGE = '#FFB347';
const CARD = { x: 90, y: 300, w: 900, h: 900 };

function Studio({ c, total }: { c: Ctx; total: number }) {
  const voice = useVoice();
  const bars = voice.bars(c.frame, 60);
  const level = voice.level(c.frame);
  const play = c.frame / Math.max(1, total);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #3A1E66, ${PURPLE})` }}>
      <div style={{ position: 'absolute', left: 90, top: 140, fontFamily: c.fonts.display, fontSize: 40, color: '#FFFFFF' }}>The Long Talk · Ep. 42</div>
      <div style={{ position: 'absolute', right: 90, top: 150, fontFamily: c.fonts.body, fontSize: 28, color: ORANGE }}>{(112 + level * 12).toFixed(1)} bpm</div>
      <div style={{ position: 'absolute', left: CARD.x - 12, top: CARD.y - 12, width: CARD.w + 24, height: CARD.h + 24, borderRadius: 50, background: `linear-gradient(135deg, ${CORAL}, ${ORANGE})` }} />
      {/* The spectrogram: columns of soft cells coloured by energy. */}
      <svg width={1080} height={700} style={{ position: 'absolute', left: 0, top: 1240 }}>
        {Array.from({ length: 30 }, (_, x) =>
          Array.from({ length: 8 }, (_, y) => {
            const e = Math.max(0, bars[x * 2] * (1 - y / 9) + (noise(x * 8 + y, Math.floor(c.frame / 3)) - 0.5) * 0.2);
            return <rect key={`${x}-${y}`} x={90 + x * 30} y={200 - y * 24} width={26} height={20} rx={4} fill={e > 0.5 ? ORANGE : e > 0.25 ? '#B5489A' : '#3A2466'} opacity={0.4 + e} />;
          }),
        )}
        {/* The waveform, played part bright. */}
        {bars.map((b, j) => (
          <rect key={j} x={90 + j * 15} y={330 - b * 90} width={10} height={b * 180 + 4} rx={5} fill={j / bars.length < play ? CORAL : 'rgba(255,111,97,0.35)'} />
        ))}
        <rect x={90 + play * 900} y={220} width={4} height={220} fill="#FFFFFF" />
      </svg>
    </AbsoluteFill>
  );
}

export const audiogram = defineStyle({
  id: 'audiogram',
  accent: CORAL,
  colors: [ORANGE, '#B5489A'],
  entrance: 'fade',
  footage: 'contrast(1.05) saturate(1.05)',
  screen: { ...CARD, shape: 'rect', radius: 44 },
  Backdrop: Studio,
  caption: caption({ size: 84, glyph: 0.52, color: '#FFFFFF', emph: ORANGE, weight: 700, bg: 'rgba(30,16,53,0.8)', pad: '8px 26px', radius: 20, entrance: 'fade' }),
  hook: hook({ top: 0.17, entrance: 'fade', color: '#FFFFFF', size: 62, weight: 700, bg: 'rgba(30,16,53,0.85)', radius: 24, pad: '16px 30px' }),
  card: card({ bg: 'rgba(30,16,53,0.92)', border: `2px solid ${CORAL}`, radius: 26 }),
  title: text({ color: '#FFFFFF', weight: 700 }),
  body: text({ font: 'body', color: '#E6D6F2' }),
  number: text({ color: ORANGE, weight: 700 }),
  slam: text({ color: '#FFFFFF', weight: 700, extra: { background: CORAL, padding: '0 26px', borderRadius: 20 } }),
  Marker: markerDot([CORAL, ORANGE, '#B5489A'], 24),
  Ring: ringCircle(ORANGE, 7, { glow: true }),
  stage: { shape: 'circle', fill: ['#3A1E66', PURPLE], ring: CORAL, ringWidth: 5 },
  transition: trFlash({ color: CORAL, peak: 0.45 }),
  sample: { type: 'pill', text: 'Clip of the week' },
});
