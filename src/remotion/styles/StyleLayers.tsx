import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import type { StyleFonts } from './fonts';
import { inVocabulary, subjectMatchesMascot } from './subject-fit';
import type { Ctx, SceneCtx, StyleTheme } from './theme';

/**
 * The style's own full-frame layers in an edit: the ambient decoration, the transition at each jump,
 * and the progress indicator. All are pure functions of the frame, so preview and render match.
 */

const useCtx = (accent: string, fonts: StyleFonts): Ctx => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return { frame, fps, accent, fonts, width, height };
};

export function StyleOverlay({ theme, accent, fonts, total, scene = false }: { theme: StyleTheme; accent: string; fonts: StyleFonts; total: number; scene?: boolean }) {
  const c = useCtx(accent, fonts);
  return <theme.Overlay c={c} total={total} scene={scene} />;
}

export type StyleSceneProps = {
  theme: StyleTheme;
  accent: string;
  fonts: StyleFonts;
  subject?: string;
  subjectVisualId?: string;
  subjectRole?: string;
  subjectAssetUrl?: string;
  action?: string;
};

/**
 * An animated storytelling style's painted world. Prefers Atmosphere + SubjectDraw/Mascot when the
 * theme has been migrated (Stage 2); falls back to the legacy Scene for unmigrated themes.
 */
export function StyleScene({ theme, accent, fonts, subject, subjectVisualId, subjectRole, subjectAssetUrl, action }: StyleSceneProps) {
  const c = useCtx(accent, fonts);
  const ctx: SceneCtx = { c, subject, subjectVisualId, subjectRole, subjectAssetUrl, action };

  const key = subjectVisualId || subject || '';
  const canDrawSubject = inVocabulary(key, theme.subjectVocabulary) || inVocabulary(subject, theme.subjectVocabulary);
  const subjectNode = canDrawSubject && theme.SubjectDraw ? theme.SubjectDraw(ctx) : null;
  const hasLayeredContract = Boolean(theme.Atmosphere || theme.Mascot || theme.SubjectDraw);

  if (hasLayeredContract) {
    const showMascot = !subjectNode && theme.Mascot && (!subject || subjectMatchesMascot(subject, theme.mascotSubjects));
    const showAsset = !subjectNode && Boolean(subjectAssetUrl);
    // Atmosphere preferred (no mascot). Unmigrated themes fall back to legacy Scene as the base.
    const base = theme.Atmosphere
      ? <theme.Atmosphere {...ctx} />
      : theme.Scene
        ? <theme.Scene c={c} />
        : null;
    return (
      <AbsoluteFill>
        {base}
        {subjectNode}
        {showMascot && theme.Mascot ? <theme.Mascot {...ctx} /> : null}
        {showAsset && subjectAssetUrl ? (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <Img
              src={subjectAssetUrl}
              style={{
                width: '72%',
                height: 'auto',
                maxHeight: '55%',
                objectFit: 'contain',
                opacity: 0.92,
                filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.45))',
              }}
            />
          </AbsoluteFill>
        ) : null}
      </AbsoluteFill>
    );
  }

  return theme.Scene ? <theme.Scene c={c} /> : null;
}

/** The world around a style's footage window (desk, board, room), under the footage. */
export function StyleBackdrop({ theme, accent, fonts, total }: { theme: StyleTheme; accent: string; fonts: StyleFonts; total: number }) {
  const c = useCtx(accent, fonts);
  return theme.Backdrop ? <theme.Backdrop c={c} total={total} /> : null;
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
