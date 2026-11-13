import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { AbsoluteFill, Internals, OffthreadVideo, Sequence, getRemotionEnvironment, useCurrentFrame } from 'remotion';
import type { EditProps, TimelinePiece } from './types';
import { pieceIndexAt } from './timeline-utils';

type FootageProps = Pick<EditProps, 'videoUrl' | 'timeline' | 'framing' | 'fps'>;

const BLUR_BG: CSSProperties = { filter: 'blur(40px) brightness(0.6)', transform: 'scale(1.15)' };
const COVER: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };

/**
 * Final render (Lambda): each kept piece is its own OffthreadVideo, which extracts exact frames, so
 * cuts are frame-accurate and never show a gap.
 */
function RenderFootage({ videoUrl, timeline, framing, fps }: FootageProps) {
  const fill: CSSProperties = { ...COVER, objectPosition: `${framing.focusX * 100}% 50%` };
  return (
    <>
      {timeline.map((p) => (
        <Sequence key={p.id} from={p.outStartFrame} durationInFrames={p.durationFrames} layout="none">
          {framing.mode === 'fit_blur' ? (
            <AbsoluteFill>
              <AbsoluteFill style={BLUR_BG}>
                <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} muted style={COVER} />
              </AbsoluteFill>
              <AbsoluteFill>
                <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </AbsoluteFill>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} style={fill} />
            </AbsoluteFill>
          )}
        </Sequence>
      ))}
    </>
  );
}

/** How far a playing deck may drift from the timeline before it is re-seeked (seconds). */
const DRIFT_TOLERANCE = 0.25;

/**
 * Browser preview: two persistent video "decks" alternate between pieces. While deck A plays the
 * current piece, deck B is already loaded and paused on the first frame of the next one; at the cut
 * they swap. Mounting a fresh <video> per piece (the old way) had to load and seek on every cut,
 * which played as black, silent gaps every couple of seconds on real networks.
 */
function PreviewFootage({ videoUrl, timeline, framing, fps }: FootageProps) {
  const frame = useCurrentFrame();
  const playing = Internals.usePlaying();
  const { playbackRate: rate } = Internals.usePlaybackRate();
  const [volume] = Internals.useMediaVolumeState();
  const [playerMuted] = Internals.usePlayerMutedState();
  const fg = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const bg = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  // Bumped when a deck's metadata loads, so a seek requested before then is applied.
  const [loaded, setLoaded] = useState(0);

  const idx = pieceIndexAt(frame, timeline);
  const activeDeck = idx % 2;
  const pieceFor = (deck: number): TimelinePiece | undefined => (deck === activeDeck ? timeline[idx] : timeline[idx + 1]);

  useEffect(() => {
    for (const deck of [0, 1]) {
      const els = [fg[deck].current, bg[deck].current].filter((v): v is HTMLVideoElement => Boolean(v));
      const piece = pieceFor(deck);
      const main = fg[deck].current;
      if (!main || !piece) {
        els.forEach((v) => !v.paused && v.pause());
        continue;
      }
      if (deck === activeDeck) {
        const target = piece.srcStart + (frame - piece.outStartFrame) / fps;
        for (const v of els) {
          v.playbackRate = rate;
          if (playing) {
            if (Math.abs(v.currentTime - target) > DRIFT_TOLERANCE) v.currentTime = target;
            if (v.paused) void v.play().catch(() => {});
          } else {
            if (!v.paused) v.pause();
            if (Math.abs(v.currentTime - target) > 0.5 / fps) v.currentTime = target;
          }
        }
        main.muted = playerMuted || volume <= 0;
        main.volume = Math.min(1, Math.max(0, volume));
      } else {
        // Standby: parked on the first frame of the next piece, silent.
        main.muted = true;
        for (const v of els) {
          if (!v.paused) v.pause();
          if (Math.abs(v.currentTime - piece.srcStart) > 0.02) v.currentTime = piece.srcStart;
        }
      }
    }
    // fg/bg are stable refs; pieceFor derives from idx/timeline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, idx, playing, rate, volume, playerMuted, timeline, fps, loaded]);

  // Pause both decks when the preview unmounts.
  useEffect(() => () => [...fg, ...bg].forEach((r) => r.current?.pause()), []); // eslint-disable-line react-hooks/exhaustive-deps

  const video = (ref: RefObject<HTMLVideoElement | null>, style: CSSProperties, muted: boolean) => (
    <video ref={ref} src={videoUrl} style={style} muted={muted} playsInline preload="auto" onLoadedMetadata={() => setLoaded((n) => n + 1)} />
  );

  return (
    <AbsoluteFill>
      {[0, 1].map((deck) => (
        <AbsoluteFill key={deck} style={{ opacity: deck === activeDeck ? 1 : 0 }}>
          {framing.mode === 'fit_blur' ? (
            <>
              <AbsoluteFill style={BLUR_BG}>{video(bg[deck], COVER, true)}</AbsoluteFill>
              <AbsoluteFill>{video(fg[deck], { width: '100%', height: '100%', objectFit: 'contain' }, true)}</AbsoluteFill>
            </>
          ) : (
            video(fg[deck], { ...COVER, objectPosition: `${framing.focusX * 100}% 50%` }, true)
          )}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
}

/** The creator's footage, cut to the timeline. Same visual result in the preview and the render. */
export function Footage(props: FootageProps) {
  if (props.timeline.length === 0) return null;
  return getRemotionEnvironment().isRendering ? <RenderFootage {...props} /> : <PreviewFootage {...props} />;
}
