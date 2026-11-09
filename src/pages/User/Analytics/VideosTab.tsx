import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardPen, Film, Plus } from 'lucide-react';
import { getAnalyticsVideos, apiErrorMessage, type AnalyticsVideoRow } from '@/api/analytics';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { EmptyState } from '@/components/app/EmptyState';
import { Button, ButtonLink } from '@/components/app/Button';
import { ScoreRing } from '@/components/app/ScoreRing';
import { formatCompact, formatShortDate } from '@/components/charts/chart-theme';
import { cleanVideoTitle } from '@/lib/video-file';
import { cn } from '@/lib/utils';
import { OUTCOME_GLYPH, OUTCOME_META, PLATFORM_LABELS } from './labels';
import type { OpenLog } from './index';

const FILTERS = [
  { value: 'all', label: 'All videos' },
  { value: 'needs', label: 'Needs results' },
  { value: 'logged', label: 'Results logged' },
];

function OutcomeBadge({ row }: { row: AnalyticsVideoRow }) {
  if (!row.outcome) return <span className="text-xs text-fg-subtle">–</span>;
  const meta = OUTCOME_META[row.outcome];
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium', meta.badge)}>
      <span aria-hidden="true">{OUTCOME_GLYPH[row.outcome]}</span>
      {meta.label}
    </span>
  );
}

function Thumb({ row }: { row: AnalyticsVideoRow }) {
  return row.thumbnailUrl ? (
    <img src={row.thumbnailUrl} alt="" loading="lazy" className="h-14 w-10 shrink-0 rounded-md bg-canvas object-cover" />
  ) : (
    <span className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-canvas text-fg-subtle">
      <Film className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

const predicted = (r: AnalyticsVideoRow) => (r.predicted.low != null ? `${formatCompact(r.predicted.low)}–${formatCompact(r.predicted.high)}` : '–');

export default function VideosTab({ onLog, dataVersion }: { onLog: OpenLog; dataVersion: number }) {
  const [rows, setRows] = useState<AnalyticsVideoRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const request = useRef(0);

  useEffect(() => {
    const id = ++request.current;
    setError(null);
    getAnalyticsVideos()
      .then((r) => id === request.current && setRows(r))
      .catch((err) => id === request.current && setError(apiErrorMessage(err, 'Could not load your videos. Try again.')));
  }, [dataVersion]);

  const visible = useMemo(
    () => (rows ?? []).filter((r) => (filter === 'needs' ? r.latestViews == null : filter === 'logged' ? r.latestViews != null : true)),
    [rows, filter]
  );

  if (!rows && !error) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }
  if (!rows) {
    return (
      <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        {error}
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardPen className="h-10 w-10" aria-hidden="true" />}
        title="No analyzed videos yet"
        body="Once a video is analyzed, it shows up here so you can log its real views after you post it."
        action={
          <ButtonLink to="/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New analysis
          </ButtonLink>
        }
      />
    );
  }

  const needs = rows.filter((r) => r.latestViews == null).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select id="analytics-video-filter" label="Show" value={filter} options={FILTERS} onChange={setFilter} className="w-52" />
        <p className="text-sm text-fg-muted">
          {rows.length - needs} of {rows.length} videos have real results.
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">Nothing matches this filter.</p>
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-xl border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Your analyzed videos with predicted and real views</caption>
              <thead className="border-b border-line text-xs text-fg-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Video</th>
                  <th scope="col" className="px-3 py-3 font-medium">Score</th>
                  <th scope="col" className="px-3 py-3 font-medium">Predicted</th>
                  <th scope="col" className="px-3 py-3 font-medium">Posted</th>
                  <th scope="col" className="px-3 py-3 font-medium">Real views</th>
                  <th scope="col" className="px-3 py-3 font-medium">Result</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((r) => (
                  <tr key={r.videoId} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Thumb row={r} />
                        <div className="min-w-0">
                          <Link to={`/videos/${r.videoId}`} className="app-focus block max-w-[22rem] truncate rounded font-medium text-fg hover:underline">
                            {cleanVideoTitle(r.title)}
                          </Link>
                          <p className="text-xs text-fg-muted">Analyzed {formatShortDate(r.createdAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <ScoreRing score={r.score} size={36} />
                    </td>
                    <td className="tabular px-3 py-3 text-fg-muted">{predicted(r)}</td>
                    <td className="px-3 py-3 text-fg-muted">
                      {r.postedAt ? formatShortDate(r.postedAt) : '–'}
                      {r.platform && <span className="block text-xs text-fg-subtle">{PLATFORM_LABELS[r.platform] ?? r.platform}</span>}
                    </td>
                    <td className="tabular px-3 py-3">
                      {r.latestViews != null ? (
                        <>
                          <span className="font-semibold text-fg">{formatCompact(r.latestViews)}</span>
                          <span className="block text-xs text-fg-subtle">
                            {r.snapshotCount} count{r.snapshotCount === 1 ? '' : 's'}
                          </span>
                        </>
                      ) : (
                        <span className="text-fg-subtle">Not logged</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <OutcomeBadge row={r} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant={r.latestViews == null ? 'primary' : 'secondary'} onClick={() => onLog(r.videoId, cleanVideoTitle(r.title))}>
                        {r.latestViews == null ? 'Log results' : 'Update'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <ul className="space-y-3 md:hidden">
            {visible.map((r) => (
              <li key={r.videoId} className="rounded-xl border border-line bg-surface p-3">
                <div className="flex items-start gap-3">
                  <Thumb row={r} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/videos/${r.videoId}`} className="app-focus block truncate rounded font-medium text-fg">
                      {cleanVideoTitle(r.title)}
                    </Link>
                    <p className="text-xs text-fg-muted">
                      Analyzed {formatShortDate(r.createdAt)}
                      {r.postedAt && ` · posted ${formatShortDate(r.postedAt)}`}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <OutcomeBadge row={r} />
                    </div>
                  </div>
                  <ScoreRing score={r.score} size={36} />
                </div>
                <dl className="tabular mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-fg-subtle">Predicted</dt>
                    <dd className="text-fg-muted">{predicted(r)}</dd>
                  </div>
                  <div>
                    <dt className="text-fg-subtle">Real views</dt>
                    <dd className="font-semibold text-fg">{r.latestViews != null ? formatCompact(r.latestViews) : 'Not logged'}</dd>
                  </div>
                </dl>
                <Button size="sm" fullWidth className="mt-3" variant={r.latestViews == null ? 'primary' : 'secondary'} onClick={() => onLog(r.videoId, cleanVideoTitle(r.title))}>
                  {r.latestViews == null ? 'Log results' : 'Update results'}
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
