import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { StyleFonts } from './fonts';
import type { Ctx, StyleTheme } from './theme';

/**
 * The style's own full-frame layers in an edit: the ambient decoration, the transition at each jump,
 * and the progress indicator. All are pure functions of the frame, so preview and render match.
 */

const useCtx = (accent: string, fonts: StyleFonts): Ctx => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return { frame, fps, accent, fonts, width, height };
};

export function StyleOverlay({ theme, accent, fonts, total }: { theme: StyleTheme; accent: string; fonts: StyleFonts; total: number }) {
  const c = useCtx(accent, fonts);
  return <theme.Overlay c={c} total={total} />;
}

/** The transition layer for every cut in `frames` that is close enough to the current frame. */
export function StyleTransitions({ theme, accent, fonts, frames }: { theme: StyleTheme; accent: string; fonts: StyleFonts; frames: number[] }) {
  const c = useCtx(accent, fonts);
  const { before, after, Draw } = theme.transition;
  const near = frames.filter((t) => c.frame - t >= -before && c.frame - t < after);
  if (!near.length) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {near.map((t) => <Draw key={t} c={c} d={c.frame - t} />)}
    </AbsoluteFill>
  );
}

export function StyleProgress({ theme, accent, fonts, total }: { theme: StyleTheme; accent: string; fonts: StyleFonts; total: number }) {
  const c = useCtx(accent, fonts);
  return theme.Progress ? <theme.Progress c={c} total={total} /> : null;
}
