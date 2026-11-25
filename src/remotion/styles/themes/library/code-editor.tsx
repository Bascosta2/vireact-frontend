import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerArrow, ringBrackets, text, trGlitch } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Code Editor: the creator inside a dark code editor. The footage is the preview pane at the top; below
 * it, code types itself in a syntax-highlighted file as the creator talks (one line per caption beat),
 * with a tab bar, line numbers and a status bar. Captions read like comments.
 */

const BG = '#0F111A';
const PANEL = '#161925';
const GREEN = '#7EE787';
const BLUE = '#79C0FF';
const PINK = '#FF7B72';
const PURPLE = '#D2A8FF';
const SCREEN = { x: 40, y: 260, w: 1000, h: 820 };

const CODE: [string, string][][] = [
  [['const ', PINK], ['hook', BLUE], [' = ', '#C9D1D9'], ['"stop scrolling"', GREEN], [';', '#C9D1D9']],
  [['function ', PINK], ['edit', PURPLE], ['(take) {', '#C9D1D9']],
  [['  cut', PURPLE], ['(take.pauses);', '#C9D1D9']],
  [['  caption', PURPLE], ['(take, { words: ', '#C9D1D9'], ['3', BLUE], [' });', '#C9D1D9']],
  [['  return ', PINK], ['ship', PURPLE], ['(take);', '#C9D1D9']],
  [['}', '#C9D1D9']],
];

function Editor({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const shown = Math.max(1, ((k < 0 ? 0 : k) % CODE.length) + 1);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, height: 70, background: PANEL, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 30px', fontFamily: c.fonts.body, fontSize: 26 }}>
        {['preview.mp4', 'edit.ts', 'README.md'].map((t, j) => (
          <span key={t} style={{ padding: '12px 22px', background: j < 2 ? BG : 'transparent', color: j < 2 ? '#E6EDF3' : '#6E7681', borderTop: j === 1 ? `3px solid ${BLUE}` : '3px solid transparent' }}>
            {t}
          </span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 1110, bottom: 140, fontFamily: c.fonts.body, fontSize: 34, lineHeight: 1.55 }}>
        {CODE.slice(0, shown).map((line, j) => {
          const last = j === shown - 1;
          const typed = last ? Math.min(99, Math.floor((d === Infinity ? 99 : d) * 1.6)) : 99;
          let budget = typed;
          return (
            <div key={j} style={{ display: 'flex', whiteSpace: 'pre' }}>
              <span style={{ width: 60, color: '#484F58' }}>{j + 1}</span>
              {line.map(([s, col], q) => {
                const part = s.slice(0, Math.max(0, budget));
                budget -= s.length;
                return (
                  <span key={q} style={{ color: col }}>
                    {part}
                  </span>
                );
              })}
              {last && <span style={{ width: 16, background: '#E6EDF3', opacity: Math.floor(c.frame / 10) % 2 }} />}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, height: 44, background: '#1F6FEB', color: '#fff', fontFamily: c.fonts.body, fontSize: 22, display: 'flex', alignItems: 'center', gap: 30, padding: '0 30px' }}>
        <span>main</span>
        <span>TypeScript</span>
        <span>Ln {shown}, Col 1</span>
      </div>
    </AbsoluteFill>
  );
}

export const codeEditor = defineStyle({
  id: 'code-editor',
  accent: GREEN,
  colors: [BLUE, PURPLE],
  entrance: 'fade',
  screen: { ...SCREEN, shape: 'rect', radius: 12, style: { border: `2px solid #30363D` } },
  Backdrop: Editor,
  caption: caption({ size: 74, glyph: 0.6, color: '#8B949E', emph: GREEN, weight: 500, bg: 'rgba(15,17,26,0.9)', pad: '8px 22px', radius: 10, boxExtra: { border: '2px solid #30363D' }, entrance: 'fade' }),
  hook: hook({ top: 0.035, align: 'left', entrance: 'fade', typewriter: true, color: GREEN, size: 50, weight: 600, bg: 'transparent', pad: '0' }),
  card: card({ bg: 'rgba(22,25,37,0.96)', border: '2px solid #30363D', radius: 14, shadow: '0 20px 50px rgba(0,0,0,0.5)' }),
  title: text({ color: '#E6EDF3', weight: 600 }),
  body: text({ font: 'body', color: '#8B949E' }),
  number: text({ color: GREEN, weight: 700 }),
  slam: text({ color: PINK, weight: 700, upper: true }),
  Marker: markerArrow(GREEN, 40),
  Ring: ringBrackets(BLUE, 5),
  stage: { shape: 'square', fill: [PANEL, BG], ring: '#30363D', ringWidth: 3 },
  transition: trGlitch({ colors: [BLUE, PINK, GREEN] }),
  sample: { type: 'list', text: '// ship it', items: ['Write the hook', 'Cut the pauses', 'Caption 3 words'] },
});
