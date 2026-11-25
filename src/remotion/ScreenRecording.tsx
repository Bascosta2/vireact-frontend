import type { CSSProperties } from 'react';
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { focusTransform, screenBox, screenFocusAt } from './timeline-utils';
import type { ScreenShot } from './types';

const EDGE_FRAMES = 8;

interface ShotProps {
  shot: ScreenShot;
  videoUrl: string;
  accent: string;
}

/** One shot: the recording in a rounded card, its camera easing between two focus points. */
function Shot({ shot, videoUrl, accent }: ShotProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const focus = screenFocusAt(frame, shot.durationFrames, shot.from, shot.to);
  const box = screenBox(shot.layout, shot.aspect, width, height);
  // The card fades and settles in, and fades out at the end, so a cut to the screen never pops.
  const edge = Math.min(EDGE_FRAMES, Math.floor(shot.durationFrames / 3));
  const fade = interpolate(frame, [0, edge, shot.durationFrames - edge, shot.durationFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const card: CSSProperties = {
    position: 'absolute',
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    overflow: 'hidden',
    borderRadius: 28,
    border: `4px solid ${accent}`,
    boxShadow: '0 18px 54px rgba(0,0,0,0.55)',
    background: '#000',
    opacity: fade,
    transform: `scale(${(0.96 + 0.04 * fade).toFixed(4)})`,
  };
  const video: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', transformOrigin: '50% 50%', transform: focusTransform(focus) };
  return (
    <AbsoluteFill data-screen-recording={shot.layout}>
      {shot.layout === 'safe' && <AbsoluteFill style={{ background: `rgba(0,0,0,${(0.45 * fade).toFixed(3)})` }} />}
      <div style={card}>
        <OffthreadVideo src={videoUrl} muted trimBefore={Math.round(shot.recStartSec * fps)} style={video} />
      </div>
    </AbsoluteFill>
  );
}

interface ScreenRecordingProps {
  shots: ScreenShot[];
  videoUrl: string | undefined;
  accent: string;
}

/**
 * The creator's screen recording, cut in over the speaker (who keeps talking underneath). Split screen off: the
 * recording fills the 4:5 safe area. Split screen on: it takes the lower half and the speaker stays on top.
 * The accent is the brand (or style) accent, so the card matches the rest of the edit.
 */
export function ScreenRecording({ shots, videoUrl, accent }: ScreenRecordingProps) {
  if (!videoUrl || shots.length === 0) return null;
  return (
    <>
      {shots.map((s, k) => (
        <Sequence key={`screen${k}`} from={s.startFrame} durationInFrames={s.durationFrames} layout="none">
          <Shot shot={s} videoUrl={videoUrl} accent={accent} />
        </Sequence>
      ))}
    </>
  );
}
