import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, Film, Loader2, Pin } from 'lucide-react';
import { getStrategy, type AnalyticsOverview, type AnalyticsRange, type StrategySlot } from '@/api/analytics';
import type { Video } from '@/api/video';
import { ButtonLink, Button } from '@/components/app/Button';
import { EmptyState } from '@/components/app/EmptyState';
import { InfoTip } from '@/components/app/InfoTip';
import { MetricCard } from '@/components/app/MetricCard';
import { updatedLabel } from '@/lib/updated-label';
import { Skeleton } from '@/components/app/Skeleton';
import { StatusPill } from '@/components/app/StatusPill';
import { VideoThumb } from '@/components/app/VideoThumb';
import { formatCompact } from '@/components/charts/chart-theme';
import type { AnalysisJob } from '@/contexts/ActiveAnalysesContext';
import { useRecentItems } from '@/lib/recent-items';
import { cleanVideoTitle, scoreTone, scoreWord, videoName } from '@/lib/video-file';
import { formatVideoDate, statusKind } from '@/lib/video-status';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { PLATFORM_LABELS, WEEKDAYS } from '@/pages/User/Analytics/labels';
import type { Spotlight } from './workflow-steps';

const TONE = {
  success: 'text-success bg-success/10 border-success/30',
  warning: 'text-warning bg-warning/10 border-warning/30',
  danger: 'text-danger bg-danger/10 border-danger/30',
} as const;

/** "44 · Fair" in the score's color. */
export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const s = Math.round(score);
  return (
    <span className={cn('tabular inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold', TONE[scoreTone(s)], className)}>
      {s}
      <span className="font-medium opacity-80">· {scoreWord(s)}</span>
    </span>
  );
}

/** The one thing to do now, at the top of Home. Uploads and analyses that are running come first. */
export function NextStepCard({ spotlight, inProgress, job }: { spotlight: Spotlight; inProgress: Video[]; job: AnalysisJob | null }) {
  const uploading = job && (job.stage === 'uploading' || job.stage === 'preparing');
  return (
    <section aria-label="Next step" className="space-y-2">
      {(uploading || inProgress.length > 0) && (
        <ul className="space-y-2">
          {uploading && job && (
            <li>
              <Link to="/new" className="app-focus flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised">
                <StatusPill kind="uploading" />
                <span className="min-w-0 flex-1 truncate text-sm text-fg">{cleanVideoTitle(job.fileName)}</span>
                <span className="tabular text-sm text-fg-muted">{Math.round(job.uploadPercent)}%</span>
              </Link>
            </li>
          )}
          {inProgress.map((v) => (
            <li key={v._id}>
              <Link to="/videos" className="app-focus flex items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised">
                <StatusPill kind={statusKind(v.analysisStatus, v.uploadStatus)} />
                <span className="min-w-0 flex-1 truncate text-sm text-fg" title={videoName(v)}>
                  {videoName(v)}
                </span>
                <span className="hidden text-sm text-fg-muted sm:inline">Usually 2 to 5 minutes</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-xl border border-accent/30 bg-surface p-5 sm:flex-row sm:items-center">
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{spotlight.eyebrow}</p>
          <p className="mt-1 text-lg font-semibold text-fg">{spotlight.title}</p>
          <p className="mt-0.5 text-sm text-fg-muted">{spotlight.body}</p>
        </div>
        <ButtonLink to={spotlight.cta.to} className="shrink-0 self-start sm:self-auto" onClick={() => track('cta_clicked', { location: 'home_next_step' })}>
          {spotlight.cta.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}

const RANGES: { id: AnalyticsRange; label: string; previous: string }[] = [
  { id: '30d', label: '30 days', previous: 'previous 30 days' },
  { id: '90d', label: '90 days', previous: 'previous 90 days' },
  { id: 'all', label: 'All time', previous: '' },
];

/** Stripe-style numbers with a range filter. Loading shows the cards' shapes; errors offer a retry. */
export function MetricsWidget({
  overview,
  range,
  onRange,
  loadedAt,
  onRetry,
}: {
  overview: AnalyticsOverview | null | undefined;
  range: AnalyticsRange;
  onRange: (r: AnalyticsRange) => void;
  loadedAt: number | null;
  onRetry: () => void;
}) {
  // Re-render now and then so "Updated 3 min ago" stays true.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  const meta = RANGES.find((r) => r.id === range) ?? RANGES[0];
  const updated = updatedLabel(loadedAt);

  return (
    <section aria-labelledby="home-metrics" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="home-metrics" className="text-lg font-semibold text-fg">
          Your numbers
        </h2>
        <div role="group" aria-label="Date range" className="inline-flex rounded-lg border border-line p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={range === r.id}
              onClick={() => onRange(r.id)}
              className={cn('app-focus rounded-md px-3 py-1 text-xs font-medium', range === r.id ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:text-fg')}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {overview === undefined ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading your numbers">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-8 w-16" />
              <Skeleton className="mt-4 h-10 w-full" />
            </div>
          ))}
        </div>
      ) : overview === null ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
          <p className="text-sm text-fg-muted">We couldn't load your numbers.</p>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Average score"
            term="viralityScore"
            value={overview.kpis.avgScore ?? '–'}
            delta={range === 'all' ? null : overview.kpis.scoreDelta}
            caption={
              range === 'all'
                ? `${overview.kpis.videosAnalyzed} videos`
                : overview.kpis.prevAvgScore != null
                  ? `${overview.kpis.prevAvgScore} in the ${meta.previous}`
                  : `No videos in the ${meta.previous}`
            }
            series={overview.scoreSeries.slice(-14).map((p) => p.score)}
            updated={updated}
            href="/analytics"
          />
          <MetricCard
            label="Videos analyzed"
            value={overview.kpis.videosAnalyzed}
            caption={overview.kpis.postsPerWeek != null ? `${overview.kpis.postsPerWeek} a week` : meta.label.toLowerCase()}
            updated={updated}
            href="/videos"
            hrefLabel="Library"
          />
          <MetricCard
            label="Real views logged"
            term="realViews"
            value={formatCompact(overview.kpis.viewsLogged)}
            caption={`${overview.totals.withResults} of ${overview.totals.videos} videos have results`}
            updated={updated}
            href="/analytics?tab=videos"
          />
          <MetricCard
            label="Best score"
            value={overview.kpis.bestScore ?? '–'}
            caption={overview.kpis.weeklyStreak > 0 ? `${overview.kpis.weeklyStreak}-week posting streak` : 'Your highest in this range'}
            updated={updated}
            href="/videos?sort=score"
            hrefLabel="See it"
          />
        </div>
      )}
    </section>
  );
}

/** Latest finished analyses, with names you can tell apart, plus what was opened recently. */
export function RecentWidget({ recent, hasInProgress }: { recent: Video[]; hasInProgress: boolean }) {
  const opened = useRecentItems().slice(0, 4);
  return (
    <section aria-labelledby="home-recent" className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 id="home-recent" className="text-lg font-semibold text-fg">
          Recent results
        </h2>
        <Link to="/videos" className="app-focus rounded text-sm font-medium text-fg-muted hover:text-fg">
          View all
        </Link>
      </div>
      {opened.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Recently opened">
          <span className="text-xs text-fg-subtle">Jump back in</span>
          {opened.map((o) => (
            <Link key={o.id} to={o.href} title={o.title} className="app-focus inline-flex max-w-[16rem] items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs text-fg-muted hover:text-fg">
              {o.pinned ? <Pin className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" /> : <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />}
              <span className="truncate">{o.title}</span>
            </Link>
          ))}
        </div>
      )}
      {recent.length === 0 ? (
        <EmptyState
          icon={hasInProgress ? <Loader2 className="h-9 w-9 motion-safe:animate-spin" aria-hidden="true" /> : <Film className="h-9 w-9" aria-hidden="true" />}
          title={hasInProgress ? 'Your first result is on its way' : 'No results yet'}
          body={hasInProgress ? 'It usually takes 2 to 5 minutes. It will show up here.' : 'Analyze a video to see its score and what to fix.'}
          action={
            hasInProgress ? undefined : (
              <ButtonLink to="/new" variant="secondary">
                Analyze a video
              </ButtonLink>
            )
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {recent.map((v) => (
            <li key={v._id} className="min-w-0">
              <Link to={`/videos/${v._id}`} className="app-focus flex h-full min-w-0 gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised">
                <VideoThumb video={v} className="h-[72px] w-14 shrink-0 rounded-lg" iconClassName="h-5 w-5" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-fg [overflow-wrap:anywhere]" title={videoName(v)}>
                    {videoName(v)}
                  </span>
                  <span className="tabular mt-1 text-xs text-fg-muted">{formatVideoDate(v.createdAt)}</span>
                  {typeof v.viralityScore === 'number' && <ScoreBadge score={v.viralityScore} className="mt-auto self-start" />}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** The next planned post from the 2-week plan, or how to get one. */
export function PlanWidget() {
  const [state, setState] = useState<{ slot: StrategySlot | null; locked: boolean } | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    getStrategy()
      .then((s) => {
        if (cancelled) return;
        const today = todayLocal();
        const slot = s.usage.locked ? null : (s.strategy?.schedule?.slots.find((x) => x.status === 'planned' && x.date >= today) ?? null);
        setState({ slot, locked: Boolean(s.usage.locked) });
      })
      .catch(() => !cancelled && setState(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const slot = state?.slot ?? null;
  const day = slot ? WEEKDAYS[new Date(`${slot.date}T12:00:00`).getDay()] : null;
  return (
    <section aria-labelledby="home-plan" className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-plan" className="flex items-center gap-1.5 text-lg font-semibold text-fg">
          Posting plan
          <InfoTip term="postingPlan" label="the posting plan" />
        </h2>
        <Link to="/analytics?tab=strategy" className="app-focus rounded text-sm font-medium text-fg-muted hover:text-fg">
          Open plan
        </Link>
      </div>
      {state === undefined ? (
        <Skeleton className="mt-3 h-12 w-full" />
      ) : slot ? (
        <Link to="/analytics?tab=strategy" className="app-focus mt-3 flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-white/[0.03]">
          <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-canvas text-[10px] uppercase text-fg-muted">
            <CalendarDays className="h-4 w-4 text-accent" aria-hidden="true" />
            {day}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-fg">{slot.title}</span>
            <span className="tabular mt-0.5 block text-xs text-fg-muted">
              {day} {slot.timeLocal} · {PLATFORM_LABELS[slot.platform] ?? slot.platform}
            </span>
          </span>
        </Link>
      ) : (
        <p className="mt-2 text-sm text-fg-muted">
          {state?.locked ? 'Posting plans come with Pro.' : 'No post planned yet.'}{' '}
          <Link to="/analytics?tab=strategy" className="app-focus rounded font-medium text-fg underline underline-offset-2">
            {state?.locked ? 'See the plan' : 'Get a 2-week plan of what to post'}
          </Link>
        </p>
      )}
    </section>
  );
}
