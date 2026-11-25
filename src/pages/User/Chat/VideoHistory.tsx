import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2, Circle, Copy, Pencil } from 'lucide-react';
import { videoHistory, when, type HistoryVideo } from './video-history';
import { InlineRename } from '@/components/app/InlineRename';
import { formatDuration, videoName } from '@/lib/video-file';
import { PLATFORM_LABELS } from '@/pages/User/Analytics/labels';
import { cn } from '@/lib/utils';

/**
 * Stripe-style detail: a timeline of what happened to the video on the left, the technical details
 * (file name, length, id with a copy button) on the right, so raw names stay out of the title.
 */
export function VideoHistory({ video, onRenamed }: { video: HistoryVideo; onRenamed: (title: string | null) => void }) {
  const [renaming, setRenaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const steps = videoHistory(video);
  const name = videoName(video);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(video._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: the id is still visible to select
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,16rem)]">
      <ol className="app-panel relative p-5" aria-label="What happened to this video">
        {steps.map((s, i) => (
          <li key={s.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden="true" className={cn('absolute left-[9px] top-6 h-[calc(100%-16px)] w-px', s.done ? 'bg-accent/40' : 'bg-line')} />}
            {s.done ? <CheckCircle2 className="relative mt-0.5 h-[19px] w-[19px] shrink-0 text-accent" aria-hidden="true" /> : <Circle className="relative mt-0.5 h-[19px] w-[19px] shrink-0 text-fg-subtle" aria-hidden="true" />}
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-medium', s.done ? 'text-fg' : 'text-fg-muted')}>
                {s.label}
                <span className="sr-only">{s.done ? ', done' : ', not yet'}</span>
              </p>
              {(s.detail || when(s.at)) && <p className="tabular mt-0.5 text-xs text-fg-muted">{[when(s.at), s.detail].filter(Boolean).join(' · ')}</p>}
              {s.action && (
                <Link to={s.action.to} className="app-focus mt-1 inline-block rounded text-xs font-medium text-accent hover:underline">
                  {s.action.label}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <dl className="app-panel space-y-3 p-5 text-sm">
        <div>
          <dt className="app-label">Name</dt>
          <dd className="mt-1">
            {renaming ? (
              <InlineRename
                videoId={video._id}
                initial={video.title ?? name}
                onDone={(saved) => {
                  setRenaming(false);
                  if (saved !== undefined) onRenamed(saved);
                }}
              />
            ) : (
              <span className="flex items-start gap-1">
                <span className="min-w-0 flex-1 text-fg [overflow-wrap:anywhere]">{name}</span>
                <button type="button" onClick={() => setRenaming(true)} aria-label="Rename video" className="app-focus inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-fg-subtle hover:text-fg">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
          </dd>
        </div>
        {video.creatorPlatform && (
          <div>
            <dt className="app-label">Made for</dt>
            <dd className="mt-1 text-fg">{PLATFORM_LABELS[video.creatorPlatform] ?? video.creatorPlatform}</dd>
          </div>
        )}
        {video.duration != null && (
          <div>
            <dt className="app-label">Length</dt>
            <dd className="tabular mt-1 text-fg">{formatDuration(video.duration)}</dd>
          </div>
        )}
        <div>
          <dt className="app-label">File</dt>
          <dd className="mt-1 text-fg-muted [overflow-wrap:anywhere]">{video.filename || '–'}</dd>
        </div>
        <div>
          <dt className="app-label">Video ID</dt>
          <dd className="mt-1 flex items-center gap-1">
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-fg-muted">{video._id}</code>
            <button type="button" onClick={() => void copyId()} aria-label={copied ? 'Copied' : 'Copy video ID'} className="app-focus inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-fg-subtle hover:text-fg">
              {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </dd>
        </div>
      </dl>
    </div>
  );
}
