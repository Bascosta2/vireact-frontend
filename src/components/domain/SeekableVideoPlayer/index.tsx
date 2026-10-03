import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * Report video player with imperative seeking, so feedback timestamps can jump the
 * playhead to the exact moment they describe.
 *
 * Source is the Twelve Labs HLS stream (`Video.streamUrl`). Safari plays HLS
 * natively; every other browser needs `hls.js`, which is imported lazily so the
 * bundle only pays for it on report pages that actually have a stream.
 */

export interface SeekableVideoPlayerHandle {
  /** Seek to a time in seconds and start playback. */
  seekTo: (seconds: number) => void;
}

interface SeekableVideoPlayerProps {
  streamUrl: string;
  poster?: string | null;
  className?: string;
}

const SeekableVideoPlayer = forwardRef<SeekableVideoPlayerHandle, SeekableVideoPlayerProps>(
  ({ streamUrl, poster, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        const element = videoRef.current;
        if (!element) return;
        element.currentTime = Math.max(0, seconds);
        void element.play().catch(() => {
          /* autoplay can be blocked; the seek still landed */
        });
      },
    }));

    useEffect(() => {
      const element = videoRef.current;
      if (!element || !streamUrl) return;

      setLoadError(null);

      const isHls = streamUrl.includes('.m3u8');
      const canPlayNatively = element.canPlayType('application/vnd.apple.mpegurl') !== '';

      if (!isHls || canPlayNatively) {
        element.src = streamUrl;
        return;
      }

      let destroy: (() => void) | undefined;
      let cancelled = false;

      void import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) {
            setLoadError('This browser cannot play the video stream.');
            return;
          }
          const hls = new Hls({ enableWorker: false });
          hls.loadSource(streamUrl);
          hls.attachMedia(element);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) setLoadError('The video stream could not be loaded.');
          });
          destroy = () => hls.destroy();
        })
        .catch(() => {
          if (!cancelled) setLoadError('The video player failed to load.');
        });

      return () => {
        cancelled = true;
        destroy?.();
      };
    }, [streamUrl]);

    return (
      <div className={className}>
        <video
          ref={videoRef}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="w-full rounded-xl border border-white/[0.08] bg-black max-h-[420px]"
        />
        {loadError ? <p className="text-xs text-zinc-500 mt-2">{loadError}</p> : null}
      </div>
    );
  }
);

SeekableVideoPlayer.displayName = 'SeekableVideoPlayer';

export default SeekableVideoPlayer;
