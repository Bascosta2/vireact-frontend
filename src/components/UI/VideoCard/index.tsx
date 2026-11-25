import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardPen, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { ANALYSIS_STATUS } from '@/constants';
import { getVideoStatus, type Video } from '@/api/video';
import { Button } from '@/components/app/Button';
import { MoreActionsMenu } from '@/components/app/Menu';
import { ScoreRing } from '@/components/app/ScoreRing';
import { StatusPill } from '@/components/app/StatusPill';
import { formatVideoDate, isInProgress, statusKind } from '@/lib/video-status';
import { Tooltip } from '@/components/app/Tooltip';
import { featureLabel } from '@/data/analysis-features';
import { videoName } from '@/lib/video-file';
import { VideoThumb } from '@/components/app/VideoThumb';
import { InlineRename } from '@/components/app/InlineRename';
import { InfoTip } from '@/components/app/InfoTip';
import { cn } from '@/lib/utils';

const RESULTS_NUDGE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

interface VideoCardProps {
  // `thumbnailUrl` is nullable on `Video` (Twelve Labs returns null until the
  // stream encode finishes).
  video: Video & { thumbnailUrl?: string | null };
  onDelete: (videoId: string) => void;
  onReanalyze: (videoId: string) => void | Promise<void>;
  /** Opens the report; the caller guards against unfinished analyses. */
  onChatClick: (videoId: string) => void;
  deletingVideoId?: string | null;
  reanalyzingVideoId?: string | null;
  /** Bulk selection (Library). */
  selected?: boolean;
  onToggleSelect?: (videoId: string) => void;
  /** Called after an inline rename with the saved name (null: back to the automatic name). */
  onRenamed?: (videoId: string, title: string | null) => void;
}

export default function VideoCard({ video, onDelete, onReanalyze, onChatClick, deletingVideoId = null, reanalyzingVideoId = null, selected = false, onToggleSelect, onRenamed }: VideoCardProps) {
  const [fetchedErrorSummary, setFetchedErrorSummary] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const kind = statusKind(video.analysisStatus, video.uploadStatus);
  const listErrorSummary = typeof video.errorSummary === 'string' && video.errorSummary.trim() ? video.errorSummary.trim() : null;

  useEffect(() => {
    if (video.analysisStatus !== ANALYSIS_STATUS.FAILED || listErrorSummary) {
      setFetchedErrorSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const st = await getVideoStatus(video._id);
        if (!cancelled) setFetchedErrorSummary(typeof st.errorSummary === 'string' && st.errorSummary.trim() ? st.errorSummary.trim() : null);
      } catch {
        if (!cancelled) setFetchedErrorSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [video.analysisStatus, video._id, listErrorSummary]);

  const title = videoName(video);
  const features = video.selectedFeatures ?? [];
  const hasScore = kind === 'complete' && typeof video.viralityScore === 'number' && !Number.isNaN(video.viralityScore);
  const errorSummary = listErrorSummary || fetchedErrorSummary;
  const isDeleting = deletingVideoId === video._id;
  const isReanalyzing = reanalyzingVideoId === video._id;
  // Nudge for real results once a finished video is a few days old (Analytics tab).
  const needsResults = hasScore && video.actualViews == null && Date.now() - new Date(video.createdAt).getTime() > RESULTS_NUDGE_AFTER_MS;

  return (
    <article
      aria-labelledby={`video-title-${video._id}`}
      className={cn('app-glass group/card relative flex h-full gap-4 rounded-xl p-3', selected && 'ring-2 ring-accent/60')}
    >
      <div className="relative shrink-0">
        <VideoThumb video={video} className="h-[136px] w-[76px] rounded-lg" />
        {onToggleSelect && (
          <label
            className={cn(
              'absolute left-1.5 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-black/60 transition-opacity focus-within:opacity-100 group-hover/card:opacity-100',
              selected ? 'opacity-100' : 'opacity-0 [@media(hover:none)]:opacity-100'
            )}
          >
            <input type="checkbox" checked={selected} onChange={() => onToggleSelect(video._id)} className="h-4 w-4 accent-[#E86735]" />
            <span className="sr-only">Select {title}</span>
          </label>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <StatusPill kind={kind} className="self-start" />
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {renaming ? (
              <InlineRename
                videoId={video._id}
                initial={video.title ?? title}
                onDone={(saved) => {
                  setRenaming(false);
                  if (saved !== undefined) onRenamed?.(video._id, saved);
                }}
              />
            ) : (
              <h2 id={`video-title-${video._id}`} className="line-clamp-2 text-base font-medium leading-snug text-fg [overflow-wrap:anywhere]" title={video.filename && video.filename !== title ? `${title}
File: ${video.filename}` : title}>
                {title}
              </h2>
            )}
            <p className="tabular mt-1 text-sm text-fg-muted">
              {formatVideoDate(video.createdAt)}
              {features.length > 0 && (
                <>
                  {' · '}
                  <Tooltip content={features.map(featureLabel).join(', ')}>
                    <span className="underline decoration-dotted underline-offset-4">
                      {features.length} {features.length === 1 ? 'check' : 'checks'}
                    </span>
                  </Tooltip>
                </>
              )}
            </p>
          </div>
          {hasScore && (
            <span className="flex shrink-0 items-start">
              <ScoreRing score={video.viralityScore as number} size={48} />
              <InfoTip term="viralityScore" label="the virality score" className="-ml-1" />
            </span>
          )}
        </div>

        {needsResults && (
          <Link
            to={`/analytics?tab=videos&log=${video._id}`}
            className="app-focus inline-flex items-center gap-1.5 self-start rounded-full border border-accent/30 bg-accent-tint px-2.5 py-1 text-xs font-medium text-fg hover:border-accent/60"
          >
            <ClipboardPen className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Log real views
            <span className="sr-only"> for {title}</span>
          </Link>
        )}

        {kind === 'failed' && (
          <p className="text-sm text-danger">{errorSummary || 'The analysis failed. Try re-analyzing.'}</p>
        )}
        {isInProgress(kind) && <p className="text-sm text-fg-muted">Usually 2 to 5 minutes.</p>}

        <div className="mt-auto flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="secondary"
            aria-disabled={kind !== 'complete' || undefined}
            onClick={() => onChatClick(video._id)}
            className="h-11 px-4"
          >
            Open
            <span className="sr-only"> {title}</span>
          </Button>
          <MoreActionsMenu
            label={`More actions for ${title}`}
            items={[
              {
                id: 'rename',
                label: 'Rename',
                icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
                onSelect: () => setRenaming(true),
              },
              {
                id: 'reanalyze',
                label: isReanalyzing ? 'Re-analyzing' : 'Re-analyze',
                icon: <RefreshCw className="h-4 w-4" aria-hidden="true" />,
                onSelect: () => void onReanalyze(video._id),
                disabled: isReanalyzing,
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
                onSelect: () => onDelete(video._id),
                danger: true,
                disabled: isDeleting,
              },
            ]}
          />
        </div>
      </div>
    </article>
  );
}
