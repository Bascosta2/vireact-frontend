import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text, trFlash } from '../../kit/presets';
import { useVoice } from '../../pulse';
import { layer, vignette } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * City Symphony: a city film cut like minimalist music. Time-lapse light trails stream along the bottom
 * of the picture (red tail lights, white headlights), clouds race over the top, a time-lapse clock runs
 * fast in the corner, and a thin white pulse flashes on every beat of the talk.
 */

const AMBER = '#FFB347';

function Trails({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d } = voice.sinceBeat(c.frame);
  const minutes = Math.floor(c.frame * 4) % 1440;
  return (
    <AbsoluteFill>
      {/* Clouds racing (time-lapse). */}
      {layer({ bottom: '70%', background: 'radial-gradient(ellipse at 20% 40%, rgba(255,255,255,0.25), transparent 30%), radial-gradient(ellipse at 70% 60%, rgba(255,255,255,0.18), transparent 30%)', backgroundSize: '200% 100%', backgroundPosition: `${(c.frame * 1.6) % 200}% 0`, filter: 'blur(8px)', mixBlendMode: 'screen' })}
      {/* Light trails along the bottom. */}
      <svg width={1080} height={700} style={{ position: 'absolute', left: 0, bottom: 0, mixBlendMode: 'screen' }}>
        {Array.from({ length: 14 }, (_, k) => {
          const y = 300 + k * 26 + noise(k, 1) * 10;
          const red = k % 2 === 0;
          return <path key={k} d={`M -50 ${y} C 300 ${y - 40} 700 ${y + 40} 1130 ${y - 10}`} fill="none" stroke={red ? '#FF3B3B' : '#FFF4D6'} strokeWidth={3 + noise(k, 2) * 4} strokeDasharray={`${160 + noise(k, 3) * 200} ${80 + noise(k, 4) * 120}`} strokeDashoffset={(red ? 1 : -1) * c.frame * (30 + k * 3)} opacity={0.75} style={{ filter: `drop-shadow(0 0 6px ${red ? '#FF3B3B' : '#FFF4D6'})` }} />;
        })}
      </svg>
      {vignette(0.5)}
      {d < 3 && layer({ border: '6px solid rgba(255,255,255,0.8)' })}
      <div style={{ position: 'absolute', right: 60, top: 130, fontFamily: c.fonts.body, fontSize: 34, color: '#FFFFFF', letterSpacing: 3 }}>
        {String(Math.floor(minutes / 60)).padStart(2, '0')}:{String(minutes % 60).padStart(2, '0')}
      </div>
    </AbsoluteFill>
  );
}

export const citySymphony = defineStyle({
  id: 'city-symphony',
  accent: AMBER,
  colors: ['#FF3B3B', '#FFF4D6'],
  entrance: 'fade',
  footage: 'contrast(1.15) saturate(1.1) brightness(0.95)',
  Overlay: Trails,
  caption: caption({ size: 84, glyph: 0.5, color: '#FFFFFF', emph: AMBER, weight: 300, letter: 4, upper: true, shadow: '0 2px 16px rgba(0,0,0,0.7)', entrance: 'fade' }),
  hook: hook({ top: 0.12, entrance: 'fade', color: '#FFFFFF', size: 72, weight: 300, letter: 10, upper: true, shadow: '0 4px 24px rgba(0,0,0,0.7)' }),
  card: card({ bg: 'rgba(10,12,18,0.75)', border: '1px solid rgba(255,255,255,0.3)', blur: 8 }),
  title: text({ color: '#FFFFFF', weight: 300, letter: 4, upper: true }),
  body: text({ font: 'body', color: '#D6D9E0' }),
  number: text({ color: AMBER, weight: 300 }),
  slam: text({ color: '#FFFFFF', weight: 300, letter: 12, upper: true }),
  Marker: markerDash(AMBER, 30, 3),
  Ring: ringCircle(AMBER, 3),
  stage: { shape: 'circle', fill: ['#2A2E38', '#0A0C12'], ring: AMBER, ringWidth: 2 },
  transition: trFlash({ color: '#FFFFFF', peak: 0.7, after: 5 }),
  sample: { type: 'headline', text: '24 hours, one street', subtext: '' },
});
