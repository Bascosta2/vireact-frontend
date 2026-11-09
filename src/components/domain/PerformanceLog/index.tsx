import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ExternalLink, Loader2, Trash2, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  addPerformanceSnapshot,
  deletePerformanceSnapshot,
  getVideoPerformance,
  updateVideoPost,
  type VideoPerformance,
} from '@/api/video';
import { apiErrorMessage } from '@/api/analytics';
import { Button, IconButton } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { AXIS_PROPS, CHART, formatCompact, formatNumber, formatShortDate } from '@/components/charts/chart-theme';
import { TooltipBox } from '@/components/charts/ChartCard';

const PLATFORM_OPTIONS = [
  { value: '', label: 'Pick a platform' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'other', label: 'Other' },
];

const COUNT_FIELDS = [
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'shares', label: 'Shares' },
  { key: 'saves', label: 'Saves' },
] as const;
type CountKey = (typeof COUNT_FIELDS)[number]['key'];

const INPUT = 'app-focus h-10 w-full min-w-0 rounded-lg border border-line bg-canvas px-3 text-base text-fg placeholder:text-fg-subtle md:text-sm';
const digits = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 11);

/** ISO -> value for <input type="datetime-local"> in the viewer's local time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const hoursAfter = (postedAt: string | null, capturedAt: string) => {
  if (!postedAt) return null;
  const h = (new Date(capturedAt).getTime() - new Date(postedAt).getTime()) / 3_600_000;
  if (h < 0) return null;
  return h < 48 ? `${Math.round(h)}h after posting` : `day ${Math.round(h / 24)}`;
};

/**
 * "Log results" dialog: where and when the video was posted, and view counts over time
 * (24h, 7d, 30d...). Each save calls onChanged so the page behind it can refresh.
 */
export function PerformanceLogDialog({
  videoId,
  title,
  open,
  onClose,
  onChanged,
}: {
  videoId: string | null;
  title: string;
  open: boolean;
  onClose: () => void;
  onChanged?: (perf: VideoPerformance) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [perf, setPerf] = useState<VideoPerformance | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [postedAt, setPostedAt] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [savingPost, setSavingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSaved, setPostSaved] = useState(false);

  const [views, setViews] = useState('');
  const [counts, setCounts] = useState<Record<CountKey, string>>({ likes: '', comments: '', shares: '', saves: '' });
  const [capturedAt, setCapturedAt] = useState('');
  const [savingSnap, setSavingSnap] = useState(false);
  const [snapError, setSnapError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const applyPerf = useCallback((p: VideoPerformance) => {
    setPerf(p);
    setPostedAt(toLocalInput(p.postedAt));
    setPostUrl(p.postUrl ?? '');
    setPlatform(p.creatorPlatform ?? '');
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open || !videoId) return;
    let cancelled = false;
    setPerf(null);
    setLoadError(null);
    setViews('');
    setCounts({ likes: '', comments: '', shares: '', saves: '' });
    setCapturedAt('');
    setSnapError(null);
    setPostError(null);
    setPostSaved(false);
    getVideoPerformance(videoId)
      .then((p) => !cancelled && applyPerf(p))
      .catch((err) => !cancelled && setLoadError(apiErrorMessage(err, 'Could not load this video. Try again.')));
    return () => {
      cancelled = true;
    };
  }, [open, videoId, applyPerf]);

  const changed = (p: VideoPerformance) => {
    applyPerf(p);
    onChanged?.(p);
  };

  const savePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoId) return;
    setSavingPost(true);
    setPostError(null);
    setPostSaved(false);
    try {
      const p = await updateVideoPost(videoId, {
        postedAt: postedAt ? new Date(postedAt).toISOString() : null,
        postUrl: postUrl.trim() || null,
        platform: platform || null,
      });
      changed(p);
      setPostSaved(true);
    } catch (err) {
      setPostError(apiErrorMessage(err, 'Could not save. Try again.'));
    } finally {
      setSavingPost(false);
    }
  };

  const saveSnapshot = async (e: FormEvent) => {
    e.preventDefault();
    if (!videoId) return;
    if (!views) {
      setSnapError('Enter the view count.');
      return;
    }
    setSavingSnap(true);
    setSnapError(null);
    try {
      const body: Parameters<typeof addPerformanceSnapshot>[1] = { views: Number(views) };
      for (const { key } of COUNT_FIELDS) if (counts[key]) body[key] = Number(counts[key]);
      if (capturedAt) body.capturedAt = new Date(capturedAt).toISOString();
      const p = await addPerformanceSnapshot(videoId, body);
      changed(p);
      setViews('');
      setCounts({ likes: '', comments: '', shares: '', saves: '' });
      setCapturedAt('');
    } catch (err) {
      setSnapError(apiErrorMessage(err, 'Could not save. Try again.'));
    } finally {
      setSavingSnap(false);
    }
  };

  const removeSnapshot = async (snapshotId: string) => {
    if (!videoId) return;
    setDeletingId(snapshotId);
    try {
      changed(await deletePerformanceSnapshot(videoId, snapshotId));
    } catch (err) {
      setSnapError(apiErrorMessage(err, 'Could not remove that entry.'));
    } finally {
      setDeletingId(null);
    }
  };

  const snapshots = perf?.snapshots ?? [];
  const growth = snapshots.map((s) => ({ t: new Date(s.capturedAt).getTime(), views: s.views, label: formatShortDate(s.capturedAt) }));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70"
    >
      <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="app-label">Log results</p>
            <h2 id={headingId} className="mt-1 truncate text-lg font-semibold text-fg">
              {title}
            </h2>
          </div>
          <IconButton aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>

        {loadError && (
          <p role="alert" className="text-sm text-danger">
            {loadError}
          </p>
        )}
        {!perf && !loadError && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {perf && (
          <div className="space-y-6">
            <form onSubmit={(e) => void savePost(e)} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-fg">Where and when you posted it</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-fg-muted">
                  Posted at
                  <input type="datetime-local" value={postedAt} max={toLocalInput(new Date().toISOString())} onChange={(e) => setPostedAt(e.target.value)} className={`${INPUT} mt-1 [color-scheme:dark]`} />
                </label>
                <div className="text-xs text-fg-muted">
                  <Select id={`${headingId}-platform`} label="Platform" value={platform} options={PLATFORM_OPTIONS} onChange={setPlatform} className="mt-1" />
                </div>
                <label className="block text-xs text-fg-muted sm:col-span-2">
                  Link to the post (optional)
                  <input type="url" inputMode="url" placeholder="https://www.tiktok.com/@you/video/..." value={postUrl} onChange={(e) => setPostUrl(e.target.value)} className={`${INPUT} mt-1`} />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" variant="secondary" disabled={savingPost}>
                  {savingPost && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
                  Save post details
                </Button>
                {postSaved && <span className="text-sm text-success">Saved</span>}
                {perf.postUrl && (
                  <a href={perf.postUrl} target="_blank" rel="noopener noreferrer" className="app-focus inline-flex items-center gap-1 rounded text-sm text-accent hover:underline">
                    Open post <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
              {postError && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {postError}
                </p>
              )}
            </form>

            <form onSubmit={(e) => void saveSnapshot(e)} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold text-fg">Add a result</h3>
              <p className="mt-0.5 text-xs text-fg-muted">Log it a few times: after a day, a week and a month. Each count teaches your predictions and your plan what works.</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label className="col-span-2 block text-xs text-fg-muted sm:col-span-1">
                  Views
                  <input inputMode="numeric" autoComplete="off" placeholder="e.g. 1840" value={views} onChange={(e) => setViews(digits(e.target.value))} className={`${INPUT} mt-1`} required />
                </label>
                {COUNT_FIELDS.map(({ key, label }) => (
                  <label key={key} className="block text-xs text-fg-muted">
                    {label} <span className="text-fg-subtle">(optional)</span>
                    <input inputMode="numeric" autoComplete="off" value={counts[key]} onChange={(e) => setCounts((c) => ({ ...c, [key]: digits(e.target.value) }))} className={`${INPUT} mt-1`} />
                  </label>
                ))}
                <label className="col-span-2 block text-xs text-fg-muted sm:col-span-3">
                  Counted at <span className="text-fg-subtle">(leave empty for now)</span>
                  <input type="datetime-local" value={capturedAt} max={toLocalInput(new Date().toISOString())} onChange={(e) => setCapturedAt(e.target.value)} className={`${INPUT} mt-1 [color-scheme:dark]`} />
                </label>
              </div>
              <div className="mt-3">
                <Button type="submit" size="sm" disabled={savingSnap}>
                  {savingSnap && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
                  Save result
                </Button>
              </div>
              {snapError && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {snapError}
                </p>
              )}
            </form>

            <section>
              <h3 className="text-sm font-semibold text-fg">History</h3>
              {snapshots.length === 0 ? (
                <p className="mt-1 text-sm text-fg-muted">No results logged yet.</p>
              ) : (
                <>
                  {growth.length >= 2 && (
                    <div className="mt-3 h-32" role="img" aria-label={`Views grew from ${formatNumber(growth[0].views)} to ${formatNumber(growth[growth.length - 1].views)} across ${growth.length} counts.`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={growth} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
                          <CartesianGrid stroke={CHART.grid} vertical={false} />
                          <XAxis dataKey="label" {...AXIS_PROPS} />
                          <YAxis {...AXIS_PROPS} tickFormatter={formatCompact} width={44} />
                          <Tooltip
                            cursor={{ stroke: CHART.grid }}
                            content={({ active, payload }) =>
                              active && payload?.[0] ? (
                                <TooltipBox title={String(payload[0].payload.label)} rows={[{ label: 'views', value: formatNumber(payload[0].payload.views), color: CHART.series1 }]} />
                              ) : null
                            }
                          />
                          <Line type="monotone" dataKey="views" stroke={CHART.series1} strokeWidth={2} dot={{ r: 4, fill: CHART.series1, stroke: CHART.surface, strokeWidth: 2 }} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                    {[...snapshots].reverse().map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <p className="tabular font-semibold text-fg">{formatNumber(s.views)} views</p>
                          <p className="truncate text-xs text-fg-muted">
                            {new Date(s.capturedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            {hoursAfter(perf.postedAt, s.capturedAt) && ` · ${hoursAfter(perf.postedAt, s.capturedAt)}`}
                            {COUNT_FIELDS.filter(({ key }) => s[key] != null).map(({ key, label }) => ` · ${formatCompact(s[key])} ${label.toLowerCase()}`).join('')}
                          </p>
                        </div>
                        <IconButton aria-label={`Remove the ${formatNumber(s.views)} views entry`} onClick={() => void removeSnapshot(s.id)} disabled={deletingId === s.id}>
                          {deletingId === s.id ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </dialog>
  );
}

export default PerformanceLogDialog;
