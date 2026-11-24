import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SHOWCASE_FRAMES, SHOWCASE_SRC, ShowcaseSource, Take } from '../skills/remotion-reel/Showcase';
import type { CaptionPage, Graphic } from '../types';
import { styleFonts } from './fonts';
import type { StyleId } from './ids';
import { STYLE_THEMES } from './registry';
import { StyledGraphic } from './StyledGraphics';
import { styleCamera } from './camera';
import { StyleOverlay, StyleProgress, StyleTransitions } from './StyleLayers';
import { StyledCaptions, StyledHook } from './StyledText';

/**
 * The Skills library showcase of an animation style: the demo take drawn with the same components an
 * edit uses (styles/), so what the card shows is what the edit gets. The hook opens, the style's
 * transition plays at a cut, then captions run with the style's sample graphic on top.
 */

/** A frame where the captions and the sample graphic are both on screen (for still thumbnails). */
export const STYLE_THUMBNAIL_FRAME = 104;

const HOOK_FRAMES = 50;
const CUT = 52;
const GRAPHIC_FROM = 60;

const word = (text: string, i: number, emphasis = false) => ({ text, i, emphasis, startFrame: 0, endFrame: 0 });
const PAGES: CaptionPage[] = [
  { startFrame: 55, endFrame: 70, words: [word('this', 0), word('is', 1), word('how', 2)] },
  { startFrame: 70, endFrame: 84, words: [word('I', 3), word('edit', 4)] },
  { startFrame: 84, endFrame: 100, words: [word('every', 5), word('reel', 6, true)] },
  { startFrame: 100, endFrame: SHOWCASE_FRAMES, words: [word('frame', 7), word('by', 8), word('frame', 9, true)] },
];

export function StyleShowcase({ style, src = SHOWCASE_SRC, still = null }: { style: StyleId; src?: string; still?: string | null }) {
  const frame = useCurrentFrame();
  const theme = STYLE_THEMES[style];
  const fonts = styleFonts(style);
  const accent = theme.accent;
  const cam = styleCamera(theme, frame, [CUT]);
  const sample: Graphic = { type: theme.sample.type, startFrame: GRAPHIC_FROM, durationFrames: SHOWCASE_FRAMES - GRAPHIC_FROM, text: theme.sample.text, subtext: theme.sample.subtext ?? '', items: theme.sample.items ?? [], focusX: 0.5, focusY: 0.5 };
  return (
    <ShowcaseSource src={src} still={still}>
      <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
        <AbsoluteFill
          style={{
            transform: `translate(${cam.x}%, ${cam.y}%) rotate(${cam.rotate}deg) ${cam.rotateY ? `perspective(1800px) rotateY(${cam.rotateY}deg) ` : ''}scale(${cam.scale})`,
            filter: `${theme.footage}${cam.blur > 0.2 ? ` blur(${cam.blur.toFixed(1)}px)` : ''}`,
          }}
        >
          <Take />
        </AbsoluteFill>
        <StyleOverlay theme={theme} accent={accent} fonts={fonts} total={SHOWCASE_FRAMES} />
        <Sequence from={0} durationInFrames={HOOK_FRAMES} layout="none">
          <StyledHook lines={['How I edit reels', 'without an editor']} durationFrames={HOOK_FRAMES} theme={theme} accent={accent} fonts={fonts} />
        </Sequence>
        <Sequence from={GRAPHIC_FROM} durationInFrames={sample.durationFrames} layout="none">
          <StyledGraphic g={sample} theme={theme} accent={accent} fonts={fonts} />
        </Sequence>
        <StyledCaptions pages={PAGES} theme={theme} accent={accent} fonts={fonts} />
        <StyleTransitions theme={theme} accent={accent} fonts={fonts} frames={[CUT]} />
        <StyleProgress theme={theme} accent={accent} fonts={fonts} total={SHOWCASE_FRAMES} />
      </AbsoluteFill>
    </ShowcaseSource>
  );
}
