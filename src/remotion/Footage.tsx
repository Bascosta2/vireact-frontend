import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { AbsoluteFill, Internals, OffthreadVideo, Sequence, getRemotionEnvironment, useBufferState, useCurrentFrame } from 'remotion';
import type { EditProps, TimelinePiece } from './types';
import { pieceIndexAt, splitLayout } from './timeline-utils';

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
          {framing.mode === 'split' ? (
            <AbsoluteFill>
              <div style={splitLayout(framing).top}>
                <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} style={splitLayout(framing).topVideo} />
              </div>
              <div style={splitLayout(framing).bottom}>
                <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} muted style={splitLayout(framing).bottomVideo} />
              </div>
              <div style={splitLayout(framing).seam} />
            </AbsoluteFill>
          ) : framing.mode === 'fit_blur' ? (
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

/**
 * Sync rules while playing. The footage must never jump back (that replays what was just heard):
 *   - footage AHEAD of the timeline by more than AHEAD_HOLD: pause it until the timeline catches up;
 *   - footage BEHIND by more than BEHIND_SEEK: seek forward;
 *   - the timeline stalls (the Player waits for music or a sound effect to load) for longer than
 *     STALL_MS: pause the footage too, so it does not run on alone.
 * And while the footage itself is loading, the timeline waits for it (Remotion's buffer state).
 */
const AHEAD_HOLD = 0.12;
const RESUME_WITHIN = 0.04;
const BEHIND_SEEK = 0.3;
const STALL_MS = 120;
/** Further ahead than this, the timeline was moved back on purpose (a scrub), so the footage follows. */
const JUMPED_BACK = 1;

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
  const buffer = useBufferState();
  const fg = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const bg = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  // Bumped when a deck's metadata loads, so a seek requested before then is applied.
  const [loaded, setLoaded] = useState(0);
  // When the timeline last moved, and whether the active footage is held for it.
  const lastAdvance = useRef(0);
  const held = useRef(false);
  const block = useRef<{ unblock: () => void } | null>(null);

  const idx = pieceIndexAt(frame, timeline);
  const activeDeck = idx % 2;
  const pieceFor = (deck: number): TimelinePiece | undefined => (deck === activeDeck ? timeline[idx] : timeline[idx + 1]);

  useEffect(() => {
    lastAdvance.current = performance.now();
  }, [frame]);

  // Timeline stalled while the footage plays on: pause the footage (it resumes on the next frame).
  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => {
      if (performance.now() - lastAdvance.current < STALL_MS) return;
      for (const r of [fg[activeDeck], bg[activeDeck]]) if (r.current && !r.current.paused) r.current.pause();
      held.current = true;
    }, 40);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, activeDeck]);

  // The active footage is loading: hold the timeline until it can play.
  useEffect(() => {
    const v = fg[activeDeck].current;
    if (!v) return undefined;
    const release = () => {
      block.current?.unblock();
      block.current = null;
    };
    let safety: ReturnType<typeof setTimeout> | undefined;
    const hold = () => {
      if (block.current) return;
      block.current = buffer.delayPlayback();
      // Never hold the timeline for good if the browser does not report the video ready.
      clearTimeout(safety);
      safety = setTimeout(release, 4000);
    };
    if (playing && v.readyState < 3) hold();
    v.addEventListener('waiting', hold);
    v.addEventListener('seeking', hold);
    v.addEventListener('canplay', release);
    v.addEventListener('playing', release);
    v.addEventListener('seeked', release);
    return () => {
      v.removeEventListener('waiting', hold);
      v.removeEventListener('seeking', hold);
      v.removeEventListener('canplay', release);
      v.removeEventListener('playing', release);
      v.removeEventListener('seeked', release);
      clearTimeout(safety);
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeck, playing, buffer, loaded]);

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
            const drift = v.currentTime - target;
            if (drift > JUMPED_BACK) {
              // The viewer scrubbed back while playing: follow them.
              v.currentTime = target;
            } else if (drift > AHEAD_HOLD || (held.current && drift > RESUME_WITHIN)) {
              // Ahead of the timeline: wait for it. Seeking back would replay what was just heard.
              if (!v.paused) v.pause();
              held.current = true;
              continue;
            }
            held.current = false;
            if (drift < -BEHIND_SEEK) v.currentTime = target;
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
          {framing.mode === 'split' ? (
            <>
              {/* Both panes play the same take in step (bg is the muted detail pane). */}
              <div style={splitLayout(framing).top}>{video(fg[deck], splitLayout(framing).topVideo, true)}</div>
              <div style={splitLayout(framing).bottom}>{video(bg[deck], splitLayout(framing).bottomVideo, true)}</div>
              <div style={splitLayout(framing).seam} />
            </>
          ) : framing.mode === 'fit_blur' ? (
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
