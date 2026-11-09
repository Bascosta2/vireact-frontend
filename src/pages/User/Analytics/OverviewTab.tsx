import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, BarChart3, ClipboardList, Lightbulb, Minus, Plus } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAnalyticsOverview, apiErrorMessage, type AnalyticsOverview, type AnalyticsRange, type CheckId } from '@/api/analytics';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { EmptyState } from '@/components/app/EmptyState';
import { Button, ButtonLink } from '@/components/app/Button';
import { ChartCard, LegendKey, TooltipBox } from '@/components/charts/ChartCard';
import { AXIS_PROPS, CHART, formatCompact, formatNumber, formatShortDate } from '@/components/charts/chart-theme';
import { cleanVideoTitle } from '@/lib/video-file';
import { cn } from '@/lib/utils';
import { CHECK_LABELS, OUTCOME_GLYPH, OUTCOME_META } from './labels';
import type { OpenLog } from './index';

const RANGE_OPTIONS = [
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const MIN_FOR_TRENDS = 3;

function Delta({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  if (value == null) return null;
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const word = value > 0 ? 'up' : value < 0 ? 'down' : 'no change';
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', value > 0 ? 'text-success' : value < 0 ? 'text-warning' : 'text-fg-muted')}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="sr-only">{word} </span>
      {value > 0 ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

function Kpi({ label, value, hint, delta }: { label: string; value: string; hint?: string; delta?: number | null }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <p className="app-label truncate">{label}</p>
      <p className="tabular mt-2 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold text-fg">
        {value}
        {delta !== undefined && <Delta value={delta ?? null} />}
      </p>
      {hint && <p className="mt-1 truncate text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}

const title = (t: string) => cleanVideoTitle(t);

/** Plain-language read of a rank correlation. */
const describeDriver = (metric: string, rho: number) => {
  const strength = Math.abs(rho) >= 0.6 ? 'strongly' : Math.abs(rho) >= 0.3 ? 'clearly' : 'slightly';
  const name = CHECK_LABELS[metric as CheckId] ?? metric;
  return rho >= 0
    ? `Your videos with a higher ${name.toLowerCase()} score ${strength} got more views.`
    : `A higher ${name.toLowerCase()} score has not meant more views for you yet.`;
};

export default function OverviewTab({ onLog, dataVersion, onShowVideos }: { onLog: OpenLog; dataVersion: number; onShowVideos: () => void }) {
  const navigate = useNavigate();
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logScale, setLogScale] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const request = useRef(0);

  useEffect(() => {
    const id = ++request.current;
    setLoading(true);
    setError(null);
    getAnalyticsOverview(range)
      .then((d) => id === request.current && setData(d))
      .catch((err) => id === request.current && setError(apiErrorMessage(err, 'Could not load your analytics. Try again.')))
      .finally(() => id === request.current && setLoading(false));
  }, [range, dataVersion]);

  const scorePoints = useMemo(
    () => (data?.scoreSeries ?? []).map((p, i) => ({ ...p, i, label: formatShortDate(p.date), title: title(p.title) })),
    [data]
  );
  const viewBars = useMemo(
    () => (data?.viewsSeries ?? []).map((r) => ({ ...r, label: formatShortDate(r.date), title: title(r.title), plotViews: Math.max(1, r.views) })),
    [data]
  );
  const selected = viewBars.find((r) => r.videoId === selectedPost) ?? null;

  if (!data && loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (!data) {
    return (
      <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        {error}
      </p>
    );
  }
  if (data.totals.videos === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-10 w-10" aria-hidden="true" />}
        title="Your progress shows up here"
        body="Analyze your first video. Every analysis adds a point to your score trend, and every result you log teaches your predictions and your plan what works for your account."
        action={
          <ButtonLink to="/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New analysis
          </ButtonLink>
        }
      />
    );
  }

  const { kpis, accuracy } = data;
  const fewVideos = data.scoreSeries.length < MIN_FOR_TRENDS;
  const predictionRows = data.predictions.slice(-10);
  const domainMin = Math.max(1, Math.min(...predictionRows.flatMap((r) => [r.low ?? r.actual, Math.max(1, r.actual)])) / 2);
  const domainMax = Math.max(10, ...predictionRows.flatMap((r) => [r.high ?? r.actual, r.actual])) * 2;
  const logPos = (v: number) => ((Math.log10(Math.max(v, domainMin)) - Math.log10(domainMin)) / (Math.log10(domainMax) - Math.log10(domainMin))) * 100;

  return (
    <div className={cn('space-y-6 transition-opacity duration-200', loading && 'opacity-60')} aria-busy={loading}>
      <div className="flex flex-wrap items-center gap-3">
        <Select id="analytics-range" label="Time range" value={range} options={RANGE_OPTIONS} onChange={(v) => setRange(v as AnalyticsRange)} className="w-48" />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi label="Average score" value={kpis.avgScore != null ? String(kpis.avgScore) : '–'} delta={kpis.scoreDelta} hint={kpis.prevAvgScore != null ? `vs ${kpis.prevAvgScore} the period before` : 'across this range'} />
        <Kpi label="Videos analyzed" value={formatNumber(kpis.videosAnalyzed)} hint={kpis.bestScore != null ? `best score ${kpis.bestScore}` : undefined} />
        <Kpi label="Views logged" value={formatCompact(kpis.viewsLogged)} hint={`from ${kpis.resultsLogged} post${kpis.resultsLogged === 1 ? '' : 's'}`} />
        <Kpi
          label="Prediction accuracy"
          value={accuracy.withinRate != null ? `${Math.round(accuracy.withinRate * 100)}%` : '–'}
          hint={accuracy.total ? `${accuracy.within} of ${accuracy.total} landed in range` : 'log results to measure'}
        />
        <Kpi label="Posts per week" value={kpis.postsPerWeek != null ? String(kpis.postsPerWeek) : '–'} hint={kpis.weeklyStreak ? `${kpis.weeklyStreak}-week analysis streak` : 'add post dates to track'} />
      </div>

      {data.needsResults.length > 0 && (
        <section className="rounded-xl border border-accent/30 bg-accent-tint p-4" aria-labelledby="needs-results-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <h2 id="needs-results-title" className="text-sm font-semibold text-fg">
                  Log your real views
                </h2>
                <p className="mt-0.5 text-sm text-fg-muted">
                  {data.needsResults.length === 1 ? 'One video is' : `${data.needsResults.length} videos are`} waiting for results. Real numbers are what make your predictions and your plan accurate.
                </p>
              </div>
            </div>
            {data.needsResults.length > 3 && (
              <Button size="sm" variant="ghost" onClick={onShowVideos}>
                See all
              </Button>
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.needsResults.slice(0, 3).map((v) => (
              <li key={v.videoId}>
                <Button size="sm" variant="secondary" onClick={() => onLog(v.videoId, title(v.title))} className="max-w-[16rem]">
                  <span className="truncate">{title(v.title)}</span>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ChartCard
        title="Virality score over time"
        subtitle={
          fewVideos
            ? `Trends appear after ${MIN_FOR_TRENDS} videos. You have ${data.scoreSeries.length} in this range.`
            : `Each dot is one video. The line is your average over the last 5.`
        }
        legend={
          <>
            <LegendKey color={CHART.series1} shape="dot" label="Video score" />
            <LegendKey color={CHART.series2} label="5-video average" />
          </>
        }
      >
        <div
          className="h-64"
          role="img"
          aria-label={`Score trend for ${scorePoints.length} videos. Average ${kpis.avgScore ?? 'not available'}${kpis.scoreDelta != null ? `, ${kpis.scoreDelta >= 0 ? 'up' : 'down'} ${Math.abs(kpis.scoreDelta)} from the period before` : ''}.`}
        >
          {scorePoints.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-fg-muted">No analyses in this range.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={scorePoints} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="i" type="number" domain={[-0.5, scorePoints.length - 0.5]} ticks={scorePoints.map((p) => p.i)} tickFormatter={(i: number) => scorePoints[i]?.label ?? ''} {...AXIS_PROPS} interval="preserveStartEnd" minTickGap={24} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} {...AXIS_PROPS} width={40} />
                <ReferenceLine y={75} stroke={CHART.grid} strokeDasharray="4 4" label={{ value: 'Strong', position: 'insideTopRight', fill: CHART.axis, fontSize: 10 }} />
                <ReferenceLine y={50} stroke={CHART.grid} strokeDasharray="4 4" label={{ value: 'Average', position: 'insideTopRight', fill: CHART.axis, fontSize: 10 }} />
                <Tooltip
                  cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    const p = active ? payload?.[0]?.payload : null;
                    return p ? (
                      <TooltipBox
                        title={`${p.title} · ${p.label}`}
                        rows={[
                          { label: 'score', value: String(p.score), color: CHART.series1 },
                          { label: '5-video average', value: String(p.rollingAvg ?? '–'), color: CHART.series2 },
                        ]}
                      />
                    ) : null;
                  }}
                />
                <Line dataKey="rollingAvg" stroke={CHART.series2} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Scatter
                  dataKey="score"
                  fill={CHART.series1}
                  stroke={CHART.surface}
                  strokeWidth={2}
                  isAnimationActive={false}
                  cursor="pointer"
                  onClick={(p: { videoId?: string; payload?: { videoId: string } }) => {
                    const id = p?.payload?.videoId ?? p?.videoId;
                    if (id) navigate(`/videos/${id}`);
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartCard>

      <section aria-labelledby="checks-title">
        <h2 id="checks-title" className="mb-3 text-sm font-semibold text-fg">
          What's improving
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {data.checkTrends.map((t) => {
            const series = data.checkSeries.map((w) => ({ week: w.week, v: w[t.check] })).filter((w) => w.v != null);
            return (
              <div key={t.check} className="min-w-0 rounded-xl border border-line bg-surface p-4">
                <p className="app-label">{CHECK_LABELS[t.check]}</p>
                <p className="tabular mt-1 flex items-baseline gap-2 text-xl font-semibold text-fg">
                  {t.average ?? '–'}
                  <Delta value={t.delta} />
                </p>
                <div className="mt-2 h-10" role="img" aria-label={`${CHECK_LABELS[t.check]} average ${t.average ?? 'not available'} by week`}>
                  {series.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <YAxis hide domain={[0, 100]} />
                        <Line dataKey="v" stroke={CHART.series1} strokeWidth={2} dot={false} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-fg-subtle">Needs 2+ weeks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Predicted vs real views"
          subtitle={
            accuracy.total
              ? `${accuracy.beat} beat, ${accuracy.within} within, ${accuracy.under} under the predicted range.`
              : 'Log real views to see how your videos did against their prediction.'
          }
          legend={
            predictionRows.length > 0 && (
              <>
                <LegendKey color={CHART.band} shape="block" label="Predicted range" />
                {(['beat', 'within', 'under'] as const).map((o) => (
                  <LegendKey key={o} color={OUTCOME_META[o].color} shape={OUTCOME_META[o].shape} label={OUTCOME_META[o].label} />
                ))}
              </>
            )
          }
        >
          {predictionRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-muted">No results logged in this range yet.</p>
          ) : (
            <ul className="space-y-3" aria-label="Predicted range and real views per video, log scale">
              {[...predictionRows].reverse().map((r) => {
                const meta = r.outcome ? OUTCOME_META[r.outcome] : OUTCOME_META.within;
                const left = r.low != null ? logPos(r.low) : null;
                const right = r.high != null ? logPos(r.high) : null;
                return (
                  <li key={r.videoId}>
                    <div className="flex items-baseline justify-between gap-3 text-xs">
                      <button type="button" onClick={() => navigate(`/videos/${r.videoId}`)} className="app-focus min-w-0 truncate rounded text-left text-fg hover:underline">
                        {title(r.title)}
                      </button>
                      <span className="tabular shrink-0 text-fg-muted">
                        <span className="font-semibold text-fg">{formatCompact(r.actual)}</span> real · {formatCompact(r.low)}–{formatCompact(r.high)} predicted
                        {r.outcome && <span className="sr-only">, {OUTCOME_META[r.outcome].label}</span>}
                      </span>
                    </div>
                    <div className="relative mt-1.5 h-3 rounded-full bg-white/[0.04]" aria-hidden="true">
                      {left != null && right != null && (
                        <div className="absolute inset-y-0 rounded-full" style={{ left: `${left}%`, width: `${Math.max(1.5, right - left)}%`, background: CHART.band }} />
                      )}
                      <span
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] leading-none"
                        style={{ left: `${logPos(Math.max(1, r.actual))}%`, color: meta.color, textShadow: '0 0 0 2px var(--app-surface)' }}
                      >
                        {OUTCOME_GLYPH[r.outcome ?? 'within']}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>

        <ChartCard
          title="Real views per post"
          subtitle={viewBars.length ? 'Tap a bar to see how that post grew.' : 'Log real views to chart them.'}
          actions={
            viewBars.length > 0 && (
              <label className="flex items-center gap-2 text-xs text-fg-muted">
                <input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} className="app-focus h-4 w-4 accent-[var(--app-accent)]" />
                Log scale
              </label>
            )
          }
        >
          {viewBars.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-muted">No results logged in this range yet.</p>
          ) : (
            <>
              <div className="h-56" role="img" aria-label={`Real views for ${viewBars.length} posts, highest ${formatNumber(Math.max(...viewBars.map((b) => b.views)))}.`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewBars} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap={2}>
                    <CartesianGrid stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="label" {...AXIS_PROPS} minTickGap={16} />
                    <YAxis
                      {...AXIS_PROPS}
                      width={48}
                      scale={logScale ? 'log' : 'auto'}
                      domain={logScale ? [1, 'auto'] : [0, 'auto']}
                      allowDataOverflow={logScale}
                      tickFormatter={formatCompact}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      content={({ active, payload }) => {
                        const b = active ? payload?.[0]?.payload : null;
                        return b ? <TooltipBox title={`${b.title} · ${b.label}`} rows={[{ label: 'views', value: formatNumber(b.views), color: CHART.series1 }, { label: 'score', value: String(b.score ?? '–') }]} /> : null;
                      }}
                    />
                    <Bar
                      dataKey={logScale ? 'plotViews' : 'views'}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={36}
                      isAnimationActive={false}
                      cursor="pointer"
                      onClick={(b: { videoId?: string; payload?: { videoId: string } }) => setSelectedPost(b?.payload?.videoId ?? b?.videoId ?? null)}
                    >
                      {viewBars.map((b) => (
                        <Cell key={b.videoId} fill={CHART.series1} fillOpacity={selectedPost && selectedPost !== b.videoId ? 0.4 : 1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {selected && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-xs text-fg-muted">
                    <span className="font-medium text-fg">{selected.title}</span> · {selected.snapshots.length} count{selected.snapshots.length === 1 ? '' : 's'}
                  </p>
                  {selected.snapshots.length >= 2 ? (
                    <div className="mt-2 h-28" role="img" aria-label={`Growth from ${formatNumber(selected.snapshots[0].views)} to ${formatNumber(selected.views)} views`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selected.snapshots.map((s) => ({ ...s, label: s.hoursSincePost != null ? (s.hoursSincePost < 48 ? `${Math.round(s.hoursSincePost)}h` : `d${Math.round(s.hoursSincePost / 24)}`) : formatShortDate(s.capturedAt) }))} margin={{ top: 6, right: 8, bottom: 0, left: -8 }}>
                          <CartesianGrid stroke={CHART.grid} vertical={false} />
                          <XAxis dataKey="label" {...AXIS_PROPS} />
                          <YAxis {...AXIS_PROPS} width={48} tickFormatter={formatCompact} />
                          <Tooltip
                            cursor={{ stroke: CHART.axis, strokeWidth: 1 }}
                            content={({ active, payload }) => {
                              const s = active ? payload?.[0]?.payload : null;
                              return s ? <TooltipBox title={s.label} rows={[{ label: 'views', value: formatNumber(s.views), color: CHART.series1 }]} /> : null;
                            }}
                          />
                          <Line dataKey="views" stroke={CHART.series1} strokeWidth={2} dot={{ r: 4, fill: CHART.series1, stroke: CHART.surface, strokeWidth: 2 }} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-fg-muted">
                      Log this post again in a few days to see its growth curve.{' '}
                      <button type="button" onClick={() => onLog(selected.videoId, selected.title)} className="app-focus rounded font-medium text-accent hover:underline">
                        Log a count
                      </button>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </ChartCard>
      </div>

      <section aria-labelledby="insights-title" className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <h2 id="insights-title" className="flex items-center gap-2 text-sm font-semibold text-fg">
          <Lightbulb className="h-4 w-4 text-accent" aria-hidden="true" />
          What drives your views
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <p className="app-label">Scores that matched real views</p>
            {data.drivers?.length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {data.drivers.slice(0, 3).map((d) => (
                  <li key={d.metric} className="flex gap-2">
                    <span className="tabular w-12 shrink-0 font-semibold text-fg">{d.rho > 0 ? '+' : ''}{d.rho.toFixed(2)}</span>
                    <span className="text-fg-muted">{describeDriver(d.metric, d.rho)}</span>
                  </li>
                ))}
                <li className="text-xs text-fg-subtle">Rank correlation across {data.drivers[0].n} videos with real views. +1 means they always moved together.</li>
              </ul>
            ) : (
              <p className="mt-2 text-sm text-fg-muted">Log real views for 5 videos to see which scores actually move your views. You have {data.totals.withResults}.</p>
            )}
          </div>
          <div>
            <p className="app-label">When your posts did best</p>
            {data.postingWindows ? (
              <>
                <p className="mt-2 text-sm text-fg-muted">
                  {data.postingWindows.bestDay ? (
                    <>
                      <span className="font-semibold text-fg">{data.postingWindows.bestDay.label}</span> (median {formatCompact(data.postingWindows.bestDay.medianViews)} views)
                    </>
                  ) : (
                    'No clear best day yet'
                  )}
                  {data.postingWindows.bestBlock && (
                    <>
                      , around{' '}
                      <span className="font-semibold text-fg">
                        {data.postingWindows.bestBlock.startHour}:00–{data.postingWindows.bestBlock.startHour + 3}:00
                      </span>{' '}
                      your time
                    </>
                  )}
                  . Based on {data.postingWindows.posts} posts.
                </p>
                <div className="mt-2 h-24" role="img" aria-label="Median views by weekday">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.postingWindows.days} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
                      <XAxis dataKey="label" {...AXIS_PROPS} tickFormatter={(l: string) => l.slice(0, 3)} />
                      <YAxis {...AXIS_PROPS} width={40} tickFormatter={formatCompact} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                        content={({ active, payload }) => {
                          const d = active ? payload?.[0]?.payload : null;
                          return d ? <TooltipBox title={d.label} rows={[{ label: 'median views', value: formatNumber(d.medianViews), color: CHART.series1 }, { label: 'posts', value: String(d.posts) }]} /> : null;
                        }}
                      />
                      <Bar dataKey="medianViews" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-fg-muted">Add the post date and views for 6 posts to find your best days and times.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
