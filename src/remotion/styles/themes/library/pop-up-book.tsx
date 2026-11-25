import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Pop-Up Book: a pop-up book on a wooden desk becomes the stage. The pages open and paper sets spring
 * up from the fold (a house with a red roof, trees, folded mountains, a paper sun that rises), each piece
 * with visible paper thickness and a soft shadow.
 */

const PAGE = '#FBF6EA';
const WOOD = '#8A5A34';

/** A paper piece that springs up from the fold. */
function Piece({ c, delay, x, y, w, h, color, shape, z }: { c: Ctx; delay: number; x: number; y: number; w: number; h: number; color: string; shape: 'house' | 'tree' | 'hill' | 'sun'; z: number }) {
  const t = spring({ frame: (c.frame % 450) - delay, fps: c.fps, config: { damping: 11, stiffness: 120 } });
  const clip = shape === 'house' ? 'polygon(0 35%, 50% 0, 100% 35%, 100% 100%, 0 100%)' : shape === 'tree' ? 'polygon(50% 0, 100% 70%, 60% 70%, 60% 100%, 40% 100%, 40% 70%, 0 70%)' : shape === 'hill' ? 'polygon(0 100%, 30% 20%, 50% 55%, 72% 0, 100% 100%)' : 'circle(50%)';
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transformOrigin: '50% 100%', transform: `perspective(900px) rotateX(${(1 - t) * 88}deg)`, zIndex: z, filter: 'drop-shadow(0 10px 6px rgba(60,30,10,0.3))' }}>
      <div style={{ position: 'absolute', inset: 0, background: color, clipPath: clip, borderBottom: '6px solid rgba(0,0,0,0.15)' }} />
      {shape === 'house' && <div style={{ position: 'absolute', left: '38%', width: '24%', top: '62%', bottom: 0, background: '#6B3A1E' }} />}
      {shape === 'house' && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '36%', background: '#D64545', clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} />}
    </div>
  );
}

function Book({ c }: { c: Ctx }) {
  const open = spring({ frame: c.frame % 450, fps: c.fps, config: { damping: 14, stiffness: 90 } });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${WOOD}, #5E3A1E)` }}>
      {layer({ backgroundImage: 'repeating-linear-gradient(95deg, rgba(0,0,0,0.07) 0 3px, transparent 3px 30px)' })}
      {/* The open pages, the fold down the middle of the back page. */}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 300, height: 760, background: PAGE, transformOrigin: '50% 100%', transform: `perspective(1400px) rotateX(${(1 - open) * 80}deg)`, boxShadow: '0 -6px 0 #E8E0CC', borderRadius: '10px 10px 0 0' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#BFE3F7, #F7F2E4)', borderRadius: '10px 10px 0 0', opacity: 0.8 }} />
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 1060, height: 520, background: PAGE, boxShadow: '0 20px 40px rgba(0,0,0,0.45)', borderTop: '4px solid #D9CFB8' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#D7ECC4, #B9DCA4)', opacity: 0.8 }} />
      </div>
      <Piece c={c} delay={10} x={620} y={420} w={180} h={180} color="#FFC93C" shape="sun" z={1} />
      <Piece c={c} delay={16} x={80} y={700} w={520} h={360} color="#8FA6C8" shape="hill" z={2} />
      <Piece c={c} delay={22} x={500} y={760} w={480} h={300} color="#7F98BE" shape="hill" z={2} />
      <Piece c={c} delay={30} x={330} y={700} w={330} h={360} color="#F2EEE4" shape="house" z={3} />
      <Piece c={c} delay={38} x={120} y={830} w={170} h={230} color="#4E9A47" shape="tree" z={4} />
      <Piece c={c} delay={44} x={760} y={850} w={150} h={210} color="#3E8A3A" shape="tree" z={4} />
      {grain({ color: '#5A3A20', alpha: 0.2, freq: 0.8 })}
    </AbsoluteFill>
  );
}

export const popUpBook = defineStyle({
  id: 'pop-up-book',
  accent: '#D64545',
  colors: ['#4E9A47', '#FFC93C'],
  entrance: 'swing',
  Scene: Book,
  caption: caption({ size: 92, glyph: 0.5, color: '#3A2A1A', emph: '#D64545', bg: PAGE, pad: '4px 24px', radius: 8, boxExtra: { boxShadow: '0 8px 14px rgba(0,0,0,0.25)' }, entrance: 'swing' }),
  hook: hook({ top: 0.06, entrance: 'swing', color: '#3A2A1A', size: 74, bg: PAGE, pad: '14px 30px', radius: 8, boxShadow: '0 12px 20px rgba(0,0,0,0.35)' }),
  card: card({ bg: PAGE, radius: 8, shadow: '0 14px 24px rgba(0,0,0,0.3)', extra: { borderBottom: '8px solid #D9CFB8' } }),
  title: text({ color: '#3A2A1A' }),
  body: text({ font: 'body', color: '#5A4A3A' }),
  number: text({ color: '#D64545', stroke: [8, PAGE] }),
  slam: text({ color: '#FFC93C', stroke: [10, '#3A2A1A'] }),
  Marker: markerDot(['#D64545', '#4E9A47', '#FFC93C'], 32, '4px solid #3A2A1A'),
  Ring: ringCircle('#D64545', 9, { under: [16, PAGE] }),
  stage: { shape: 'square', fill: [PAGE, '#EDE4CF'], ring: '#3A2A1A', ringWidth: 5 },
  transition: trWipe({ color: PAGE, dir: 'left', edge: '10px solid #D9CFB8' }),
  sample: { type: 'pill', text: 'Turn the page' },
});
