import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays } from 'lucide-react';
import { getAnalyticsOverview, getStrategy, type AnalyticsOverview, type StrategySlot } from '@/api/analytics';
import { cleanVideoTitle } from '@/lib/video-file';
import { PLATFORM_LABELS, WEEKDAYS } from '@/pages/User/Analytics/labels';

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Home: a compact read of the Analytics tab (score trend, results to log, next planned post).
 * Renders nothing until the creator has at least one analyzed video, and never blocks Home on errors.
 */
export default function ProgressCard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [nextSlot, setNextSlot] = useState<StrategySlot | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAnalyticsOverview('30d')
      .then((o) => !cancelled && setOverview(o))
      .catch(() => {});
    getStrategy()
      .then((s) => {
        if (cancelled || s.usage.locked) return;
        const today = todayLocal();
        const slot = s.strategy?.schedule?.slots.find((x) => x.status === 'planned' && x.date >= today) ?? null;
        setNextSlot(slot);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!overview || overview.totals.videos === 0) return null;
  const { kpis, needsResults } = overview;
  const delta = kpis.scoreDelta;
  const slotDay = nextSlot ? WEEKDAYS[new Date(`${nextSlot.date}T12:00:00`).getDay()] : null;

  return (
    <section aria-labelledby="progress-card-title" className="mb-10 rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="progress-card-title" className="flex items-center gap-2 text-lg font-semibold text-fg">
          <BarChart3 className="h-5 w-5 text-accent" aria-hidden="true" />
          Your progress
        </h2>
        <Link to="/analytics" className="app-focus rounded text-sm font-medium text-accent hover:underline">
          Open analytics
        </Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="app-label">Average score, 30 days</p>
          <p className="tabular mt-1 flex items-baseline gap-2 text-2xl font-semibold text-fg">
            {kpis.avgScore ?? '–'}
            {delta != null && delta !== 0 && (
              <span className={`inline-flex items-center text-xs font-medium ${delta > 0 ? 'text-success' : 'text-warning'}`}>
                {delta > 0 ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
                <span className="sr-only">{delta > 0 ? 'up' : 'down'} </span>
                {delta > 0 ? '+' : ''}
                {delta}
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="app-label">Real results</p>
          {needsResults.length > 0 ? (
            <Link to={`/analytics?tab=videos&log=${needsResults[0].videoId}`} className="app-focus mt-1 block rounded text-sm text-fg hover:underline">
              <span className="font-semibold">{needsResults.length}</span> video{needsResults.length === 1 ? '' : 's'} waiting for views. Start with “{cleanVideoTitle(needsResults[0].title)}”
            </Link>
          ) : (
            <p className="mt-1 text-sm text-fg-muted">All caught up. {overview.totals.withResults} videos have real views.</p>
          )}
        </div>
        <div>
          <p className="app-label">Next planned post</p>
          {nextSlot ? (
            <Link to="/analytics?tab=strategy" className="app-focus mt-1 block rounded text-sm text-fg hover:underline">
              <span className="inline-flex items-center gap-1 text-fg-muted">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {slotDay} {nextSlot.timeLocal} · {PLATFORM_LABELS[nextSlot.platform] ?? nextSlot.platform}
              </span>
              <span className="mt-0.5 block font-medium">{nextSlot.title}</span>
            </Link>
          ) : (
            <Link to="/analytics?tab=strategy" className="app-focus mt-1 block rounded text-sm text-fg-muted hover:text-fg hover:underline">
              Get a 2-week plan of what to post
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
