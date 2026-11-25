import type { ReactNode } from 'react';
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SampleScreen } from '../showcase/screens';
import { TwoThirdsPanel } from '../skills/remotion-reel/parts';
import { SHOWCASE_FRAMES, SHOWCASE_SRC, ShowcaseSource, Take } from '../skills/remotion-reel/Showcase';
import type { CaptionPage, Graphic } from '../types';
import { styleCamera } from './camera';
import { STYLE_COVERS } from './covers';
import { styleFonts } from './fonts';
import type { StyleId } from './ids';
import { STYLE_THEMES } from './registry';
import { StyledGraphic } from './StyledGraphics';
import { PulseProvider, pulseFrom } from './pulse';
import { StyleStage } from './Stage';
import { StyleOverlay, StyleProgress, StyleTransitions } from './StyleLayers';
import { StyledCaptions, StyledHook } from './StyledText';

/**
 * The Skills library showcase of a style, drawn with the same components an edit uses (styles/), on the
 * kind of video the style is for (covers.ts): the talking-head take, a sample screen (gameplay, a product,
 * city b-roll, an app recording), or, for animated storytelling, the style's own painted scene. The hook
 * opens, the style's transition plays at a cut, then captions run (with the sample graphic, if any).
 */

const HOOK_FRAMES = 50;
const CUT = 52;
const GRAPHIC_FROM = 60;

/** Caption pages from the cover's lines ("every reel*": the starred word is emphasized). */
const pagesFor = (lines: string[]): CaptionPage[] => {
  const starts = [55, 70, 84, 100, SHOWCASE_FRAMES];
  let i = 0;
  return lines.slice(0, 4).map((line, k) => ({
    startFrame: starts[k],
    endFrame: starts[k + 1],
    words: line.split(' ').map((w) => ({ text: w.replace(/\*$/, ''), emphasis: w.endsWith('*'), i: i++, startFrame: 0, endFrame: 0 })),
  }));
};

/** A plain presentation slide above the take, for talking heads with slides. */
function Slide() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bars = [0.4, 0.62, 0.5, 0.85, 1];
  return (
    <AbsoluteFill style={{ background: '#F6F3EE' }}>
      <div style={{ position: 'absolute', left: 90, right: 90, top: 300, fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <div style={{ fontSize: 40, color: '#8A8F99', fontWeight: 600 }}>Hours saved per week</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30, height: 420, marginTop: 30 }}>
          {bars.map((b, k) => {
            const grow = spring({ frame: frame - 8 - k * 5, fps, config: { damping: 16, stiffness: 140 } });
            return <div key={k} style={{ flex: 1, height: `${b * 100 * grow}%`, borderRadius: 16, background: k === 4 ? '#2EC4B6' : '#D9DEE6' }} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function StyleShowcase({ style, src = SHOWCASE_SRC, still = null }: { style: StyleId; src?: string; still?: string | null }) {
  const frame = useCurrentFrame();
  const theme = STYLE_THEMES[style];
  const cover = STYLE_COVERS[style];
  const fonts = styleFonts(style);
  const accent = theme.accent;
  const cam = styleCamera(theme, frame, [CUT]);
  const scene = cover.base === 'scene' && Boolean(theme.Scene);
  // A slow push-in, as every edit has.
  const push = 1 + 0.035 * interpolate(frame, [0, SHOWCASE_FRAMES], [0, 1]);
  const camera = `translate(${cam.x}%, ${cam.y}%) rotate(${cam.rotate}deg) ${cam.rotateY ? `perspective(1800px) rotateY(${cam.rotateY}deg) ` : ''}scale(${cam.scale * push})`;
  const pages = pagesFor(cover.lines);

  // The footage the cover shows: the talking take (also in a scene's bubble), a slide deck, or a sample screen.
  let base: ReactNode;
  if (scene || cover.base === 'talking' || cover.base === 'scene') base = <Take />;
  else if (cover.base === 'talking-panel')
    base = (
      <AbsoluteFill>
        <Slide />
        <TwoThirdsPanel shiftY={505}>
          <Take />
        </TwoThirdsPanel>
      </AbsoluteFill>
    );
  else base = <SampleScreen id={cover.base} />;

  const sample: Graphic = { type: theme.sample.type, startFrame: GRAPHIC_FROM, durationFrames: SHOWCASE_FRAMES - GRAPHIC_FROM, text: theme.sample.text, subtext: theme.sample.subtext ?? '', items: theme.sample.items ?? [], focusX: 0.5, focusY: 0.5 };
  return (
    <ShowcaseSource src={src} still={still}>
      <PulseProvider value={pulseFrom(pages)}>
      <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
        <StyleStage theme={theme} accent={accent} fonts={fonts} total={SHOWCASE_FRAMES} scene={scene} footage={base} camera={{ transform: camera, blur: cam.blur }} />
        <StyleOverlay theme={theme} accent={accent} fonts={fonts} total={SHOWCASE_FRAMES} scene={scene} />
        <Sequence from={0} durationInFrames={HOOK_FRAMES} layout="none">
          <StyledHook lines={cover.hook} durationFrames={HOOK_FRAMES} theme={theme} accent={accent} fonts={fonts} />
        </Sequence>
        {cover.graphic && (
          <Sequence from={GRAPHIC_FROM} durationInFrames={sample.durationFrames} layout="none">
            <StyledGraphic g={sample} theme={theme} accent={accent} fonts={fonts} />
          </Sequence>
        )}
        <StyledCaptions pages={pages} theme={theme} accent={accent} fonts={fonts} />
        <StyleTransitions theme={theme} accent={accent} fonts={fonts} frames={[CUT]} />
        <StyleProgress theme={theme} accent={accent} fonts={fonts} total={SHOWCASE_FRAMES} />
      </AbsoluteFill>
      </PulseProvider>
    </ShowcaseSource>
  );
}
