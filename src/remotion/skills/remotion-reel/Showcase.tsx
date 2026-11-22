import { createContext, useContext } from 'react';
import { AbsoluteFill, Sequence, Video, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { INTER, PANEL_CAPTION_Y, ReelCaptionLine, TextHook, TwoThirdsPanel, type HookVariant } from './parts';

/**
 * Showcase clips for the Skills library: each one shows a feature of the Remotion Reel skill on real
 * talking-head footage (the landing page's demo clip, which has no sound). That clip is already edited:
 * a title card until its cut at 2.21 s (measured with ffmpeg at the skill's 0.05 scene threshold) and
 * its own captions under the mic. So the showcase starts after the cut and crops the bottom of the frame
 * off, so nothing is drawn over the clip's own edits. The caption lines are sample text.
 */

export type ShowcaseId = 'reel' | 'hook' | 'captions' | 'panel';
export const SHOWCASE_FPS = 30;
export const SHOWCASE_FRAMES = 125; // the clip from 2.25 s to its end (6.58 s)
export const SHOWCASE_SRC = '/demo/cedlom-hook.mp4';

const s = (sec: number) => Math.round(sec * SHOWCASE_FPS);

/** Sample lines in the skill's chunking: 1-3 words, at most ~17 characters, casual lowercase. */
const LINES: { from: number; to: number; words: { text: string; emphasis?: boolean }[] }[] = [
  { from: 0.1, to: 0.6, words: [{ text: 'this' }, { text: 'is' }, { text: 'how' }] },
  { from: 0.65, to: 1.1, words: [{ text: 'I' }, { text: 'edit' }] },
  { from: 1.15, to: 1.7, words: [{ text: 'every' }, { text: 'reel', emphasis: true }] },
  { from: 1.8, to: 2.3, words: [{ text: 'with' }, { text: 'no' }] },
  { from: 2.35, to: 2.9, words: [{ text: 'video' }, { text: 'editor' }] },
  { from: 3.0, to: 3.5, words: [{ text: 'just' }, { text: 'code.' }] },
  { from: 3.6, to: 4.1, words: [{ text: 'frame' }, { text: 'by' }, { text: 'frame', emphasis: true }] },
];
/** Where the clip starts (after its own title card) and how much it is enlarged from the top. */
const CLIP_FROM_SEC = 2.25;
const CROP_SCALE = 1.45;
/** On the fuzzy top of the mic in this take (the skill's placement for a talking head with a mic). */
const SHOWCASE_CAPTION_Y = 1460;

const SrcContext = createContext(SHOWCASE_SRC);

function Take({ style }: { style?: React.CSSProperties }) {
  const src = useContext(SrcContext);
  return (
    <AbsoluteFill style={{ transform: `scale(${CROP_SCALE})`, transformOrigin: '50% 0%' }}>
      <Video src={src} muted trimBefore={s(CLIP_FROM_SEC)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }} />
    </AbsoluteFill>
  );
}

function SampleCaptions({ from = 0, y = SHOWCASE_CAPTION_Y, accent = '#FFD43B' }: { from?: number; y?: number; accent?: string }) {
  const frame = useCurrentFrame();
  const line = LINES.find((l) => frame >= s(l.from) && frame < s(l.to) && s(l.from) >= from);
  return line ? <ReelCaptionLine words={line.words} y={y} accent={accent} /> : null;
}

/** A small label naming what is on screen (showcase only, never in an edit). */
function Label({ text }: { text: string }) {
  return (
    <div style={{ position: 'absolute', left: 48, bottom: 64, padding: '12px 26px', borderRadius: 999, background: 'rgba(10,10,15,0.72)', color: '#fff', fontFamily: INTER, fontWeight: 600, fontSize: 40 }}>
      {text}
    </div>
  );
}

/** Hook variants, one after another. */
function HookShowcase() {
  const third = Math.floor(SHOWCASE_FRAMES / 3);
  const variants: HookVariant[] = ['white', 'black', 'plain'];
  return (
    <AbsoluteFill>
      <Take />
      {variants.map((v, k) => (
        <Sequence key={v} from={k * third} durationInFrames={k === 2 ? SHOWCASE_FRAMES - 2 * third : third} layout="none">
          <TextHook lines={['How I edit reels', 'without an editor']} variant={v} />
          <Label text={`${v} hook`} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

/** The two-thirds layout: a graphic full-bleed on top, the take in the rounded panel below. */
function PanelShowcase() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const land = spring({ frame: frame - 6, fps, config: { damping: 16, stiffness: 140 } });
  const count = Math.round(interpolate(frame, [6, 70], [0, 4.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * 10) / 10;
  const bars = [0.35, 0.5, 0.42, 0.7, 1];
  return (
    <AbsoluteFill style={{ background: '#0d1117' }}>
      {/* The graphic area (y0-1400): every second moves, key content inside y300-875. */}
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 330 }}>
        <div style={{ transform: `translateY(${(1 - land) * 60}px) scale(${0.92 + 0.08 * land})`, width: 760, borderRadius: 28, background: '#161b22', boxShadow: '0 18px 46px rgba(0,0,0,0.45)', padding: '44px 54px', fontFamily: INTER, color: '#fff' }}>
          <div style={{ fontWeight: 600, fontSize: 38, color: '#8b949e' }}>Views this month</div>
          <div style={{ fontWeight: 800, fontSize: 150, letterSpacing: -4, lineHeight: 1.05 }}>{count.toFixed(1)}M</div>
          <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end', height: 190, marginTop: 18 }}>
            {bars.map((b, k) => {
              const grow = spring({ frame: frame - 14 - k * 5, fps, config: { damping: 14, stiffness: 160 } });
              return <div key={k} style={{ flex: 1, height: `${b * 100 * grow}%`, borderRadius: 12, background: k === bars.length - 1 ? '#3fb950' : '#30363d' }} />;
            })}
          </div>
        </div>
      </AbsoluteFill>
      <TwoThirdsPanel shiftY={505}>
        <Take />
      </TwoThirdsPanel>
      <SampleCaptions y={PANEL_CAPTION_Y} />
    </AbsoluteFill>
  );
}

/** Everything together: the text hook until the first cut, then captions. */
function ReelShowcase() {
  return (
    <AbsoluteFill>
      <Take />
      <Sequence from={0} durationInFrames={s(1.75)} layout="none">
        <TextHook lines={['How I edit reels', 'without an editor']} variant="white" />
      </Sequence>
      <SampleCaptions from={s(1.75)} />
    </AbsoluteFill>
  );
}

function CaptionsShowcase() {
  return (
    <AbsoluteFill>
      <Take />
      <SampleCaptions />
    </AbsoluteFill>
  );
}

/** `src` overrides the demo clip (the render check passes a staticFile URL). */
export function RemotionReelShowcase({ feature, src = SHOWCASE_SRC }: { feature: ShowcaseId; src?: string }) {
  return (
    <SrcContext.Provider value={src}>
      <AbsoluteFill style={{ background: '#000' }}>
        {feature === 'hook' ? <HookShowcase /> : feature === 'panel' ? <PanelShowcase /> : feature === 'captions' ? <CaptionsShowcase /> : <ReelShowcase />}
      </AbsoluteFill>
    </SrcContext.Provider>
  );
}
