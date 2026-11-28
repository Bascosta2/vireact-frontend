import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import type { StyleFonts } from './fonts';
import { StyleBackdrop, StyleScene } from './StyleLayers';
import { windowStyle } from './stage-utils';
import type { StyleTheme } from './theme';

/**
 * The picture under a style's text and graphics, in one place for the edit and the library showcase:
 *   - footage filling the frame (most styles), in the style's grade;
 *   - footage inside a window (`theme.screen`) with the style's world around it (`theme.Backdrop`);
 *   - the style's animated scene in place of the camera (storytelling), the footage kept for its sound;
 *   - the scene with the creator in a bubble (`theme.pip`, explainers).
 * `camera` is the edit's camera (zooms, push-in, the style's transition moves); it moves the footage, or
 * the scene when one shows.
 */

export interface StageCamera {
  transform: string;
  transformOrigin?: string;
  blur: number;
}

export function StyleStage({
  theme,
  accent,
  fonts,
  total,
  scene,
  footage,
  camera,
  extraFilter = '',
  noPip = false,
  subject,
  subjectVisualId,
  subjectRole,
  subjectAssetUrl,
  action,
}: {
  theme: StyleTheme;
  accent: string;
  fonts: StyleFonts;
  total: number;
  scene: boolean;
  footage: ReactNode;
  camera: StageCamera;
  extraFilter?: string;
  /** Story mode: there is no creator to show in an explainer's bubble. */
  noPip?: boolean;
  subject?: string;
  subjectVisualId?: string;
  subjectRole?: string;
  subjectAssetUrl?: string;
  action?: string;
}) {
  const blur = camera.blur > 0.2 ? `blur(${camera.blur.toFixed(1)}px)` : '';
  const graded = [theme.footage, blur, extraFilter].filter((x) => x && x !== 'none').join(' ') || undefined;
  const moved: CSSProperties = { transform: camera.transform, transformOrigin: camera.transformOrigin };

  let picture: ReactNode;
  if (scene) {
    const pip = noPip ? undefined : theme.pip;
    picture = (
      <>
        {!pip && <AbsoluteFill style={{ opacity: 0 }}>{footage}</AbsoluteFill>}
        <AbsoluteFill style={{ ...moved, filter: blur || undefined }}>
          <StyleScene
            theme={theme}
            accent={accent}
            fonts={fonts}
            subject={subject}
            subjectVisualId={subjectVisualId}
            subjectRole={subjectRole}
            subjectAssetUrl={subjectAssetUrl}
            action={action}
          />
        </AbsoluteFill>
        {pip && (
          <div style={windowStyle(pip)}>
            <AbsoluteFill style={{ filter: theme.footage !== 'none' ? theme.footage : undefined }}>{footage}</AbsoluteFill>
          </div>
        )}
      </>
    );
  } else if (theme.screen) {
    picture = (
      <>
        {theme.Backdrop && <StyleBackdrop theme={theme} accent={accent} fonts={fonts} total={total} />}
        <div style={windowStyle(theme.screen)}>
          <AbsoluteFill style={{ ...moved, filter: graded }}>{footage}</AbsoluteFill>
        </div>
      </>
    );
  } else {
    picture = (
      <>
        {theme.Backdrop && <StyleBackdrop theme={theme} accent={accent} fonts={fonts} total={total} />}
        <AbsoluteFill style={{ ...moved, filter: graded }}>{footage}</AbsoluteFill>
      </>
    );
  }
  return (
    <>
      {theme.Defs && (
        <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true">
          <theme.Defs />
        </svg>
      )}
      {picture}
    </>
  );
}
