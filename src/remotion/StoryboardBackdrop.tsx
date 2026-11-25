import { AbsoluteFill, Sequence } from 'remotion';
import { Backdrop, type BackdropId } from './showcase/backdrops';
import type { StoryboardScene } from './types';

/**
 * Story mode's "footage": each scene's backdrop for exactly its frames, cut on the scene change (the
 * style's transition covers the cut). A scene the style paints itself ('scene') falls back to the
 * abstract field, which only shows when the creator switches the painted scene off.
 */
export function StoryboardBackdrop({ scenes, accent }: { scenes: StoryboardScene[]; accent: string }) {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {scenes.map((s, k) => (
        <Sequence key={k} from={s.startFrame} durationInFrames={s.durationFrames} layout="none">
          <AbsoluteFill>
            <Backdrop id={(s.backdrop === 'scene' ? 'abstract' : s.backdrop) as BackdropId} accent={accent} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
