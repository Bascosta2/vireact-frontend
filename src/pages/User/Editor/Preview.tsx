import { useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { EditComposition } from '@/remotion/EditComposition';
import type { EditProps } from '@/remotion/types';
import type { PreviewProps } from '@/api/editor';
import { formatDuration } from '@/lib/video-file';
import { cn } from '@/lib/utils';

/**
 * Live preview of the edit: the same Remotion composition the export renders, played on the 720p
 * proxy, so every toggle shows up immediately. "Original" plays the raw upload for comparison.
 */
export default function Preview({ props, proxyUrl, originalSec }: { props: PreviewProps; proxyUrl: string; originalSec: number | null }) {
  const [view, setView] = useState<'edit' | 'original'>('edit');
  const inputProps = useMemo<EditProps>(() => ({ ...props, videoUrl: proxyUrl }), [props, proxyUrl]);
  const editedSec = props.durationInFrames / props.fps;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-line p-0.5" role="group" aria-label="Preview">
          {(['edit', 'original'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn('app-focus rounded-md px-3 py-1.5 text-sm', view === v ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:text-fg')}
            >
              {v === 'edit' ? 'Edited' : 'Original'}
            </button>
          ))}
        </div>
        <p className="tabular text-xs text-fg-muted">
          {formatDuration(originalSec)} → <span className="font-semibold text-fg">{formatDuration(editedSec)}</span>
        </p>
      </div>
      <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-xl border border-line bg-black">
        {view === 'edit' ? (
          <Player
            component={EditComposition}
            inputProps={inputProps}
            durationInFrames={Math.max(1, props.durationInFrames)}
            compositionWidth={props.width}
            compositionHeight={props.height}
            fps={props.fps}
            controls
            clickToPlay
            doubleClickToFullscreen
            acknowledgeRemotionLicense
            // Dense sound design overlaps several effects; the default of 5 shared tags errors out.
            numberOfSharedAudioTags={20}
            style={{ width: '100%', aspectRatio: `${props.width} / ${props.height}` }}
          />
        ) : (
          <video src={proxyUrl} controls playsInline preload="metadata" className="aspect-[9/16] w-full bg-black object-contain">
            <track kind="captions" />
          </video>
        )}
      </div>
    </div>
  );
}
