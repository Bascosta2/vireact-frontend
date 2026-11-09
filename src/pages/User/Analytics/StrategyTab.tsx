import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, ChevronDown, FlaskConical, Loader2, Lock, Pencil, Sparkles, Target, ThumbsDown, ThumbsUp, Wand2 } from 'lucide-react';
import {
  generateStrategy,
  getAnalyticsVideos,
  getStrategy,
  updateStrategySlot,
  apiErrorCode,
  apiErrorMessage,
  type AnalyticsVideoRow,
  type CreatorProfile,
  type EvidenceItem,
  type Strategy,
  type StrategySlot,
  type StrategyState,
} from '@/api/analytics';
import { Button, ButtonLink } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { formatNumber } from '@/components/charts/chart-theme';
import { cleanVideoTitle } from '@/lib/video-file';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import CreatorProfileForm from './CreatorProfileForm';
import { GOAL_OPTIONS, NICHE_OPTIONS, PLATFORM_LABELS, WEEKDAYS } from './labels';
import type { OpenLog } from './index';

const PROGRESS_STEPS = [
  'Reading your videos and scores…',
  'Comparing predictions with your real views…',
  'Finding what works in your niche…',
  'Building your content pillars…',
  'Scheduling your next two weeks…',
  'Checking every claim against your data…',
];

const CONFIDENCE_COPY: Record<Strategy['confidence'], { label: string; body: string }> = {
  low: { label: 'Early plan', body: 'Built mostly from your scores and what works in your niche. Log real views for 3+ posts and the next plan will be built from your own results.' },
  medium: { label: 'Growing confidence', body: 'Built from a handful of your real results. More logged posts make it sharper.' },
  high: { label: 'High confidence', body: 'Built from plenty of your own real results.' },
};

const dayLabel = (date: string) => {
  const d = new Date(`${date}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

const optionLabel = (options: { value: string; label: string }[], value: string | null) => options.find((o) => o.value === value)?.label ?? value ?? '–';

function EvidenceChips({ ids, videos }: { ids: string[]; videos: Strategy['videos'] }) {
  const known = ids.filter((id) => videos[id]);
  if (!known.length) return null;
  return (
    <span className="mt-1.5 flex flex-wrap gap-1.5">
      {known.map((id) => (
        <Link key={id} to={`/videos/${id}`} className="app-focus inline-flex max-w-[14rem] items-center gap-1 rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-xs text-fg-muted hover:text-fg">
          <span className="truncate">{cleanVideoTitle(videos[id].title)}</span>
          {videos[id].score != null && <span className="tabular text-fg-subtle">· {videos[id].score}</span>}
        </Link>
      ))}
    </span>
  );
}

function EvidenceList({ items, videos, icon }: { items: EvidenceItem[]; videos: Strategy['videos']; icon: 'up' | 'down' }) {
  const Icon = icon === 'up' ? ThumbsUp : ThumbsDown;
  return (
    <ul className="mt-2 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-sm">
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon === 'up' ? 'text-success' : 'text-warning')} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-fg">{item.point}</p>
            {item.metric && <p className="tabular text-xs text-fg-muted">{item.metric}</p>}
            <EvidenceChips ids={item.evidenceVideoIds} videos={videos} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Blurred sample shown to Free users, so they can see what a plan contains. */
function LockedPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
      <div aria-hidden="true" className="pointer-events-none select-none space-y-4 p-6 blur-[6px]">
        <p className="text-lg font-semibold text-fg">Your openings lose people before the first cut.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {['Form fixes', 'No-gym routines', 'Myth busting'].map((p) => (
            <div key={p} className="rounded-lg border border-line p-3 text-sm text-fg">{p}</div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {['Mon · "Stop doing squats like this"', 'Wed · "3 moves, no gym, 10 minutes"', 'Fri · "The stretch nobody does"', 'Sun · "I tried this for 30 days"'].map((s) => (
            <div key={s} className="rounded-lg border border-line p-3 text-sm text-fg-muted">{s}</div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 p-4">
        <div className="max-w-md rounded-xl border border-line bg-surface-raised p-5 text-center shadow-xl">
          <Lock className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
          <h2 className="mt-2 text-base font-semibold text-fg">Your content plan is on Premium and Pro</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Get a 2-week posting schedule built from your own videos and real views: what to post, the exact hook, when to post it, and why.
          </p>
          <ButtonLink to="/subscription-plans" className="mt-4" onClick={() => track('strategy_upgrade_clicked', { from: 'analytics_strategy' })}>
            See plans
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function SlotCard({
  slot,
  strategy,
  videos,
  onUpdate,
  onLog,
  loadVideos,
}: {
  slot: StrategySlot;
  strategy: Strategy;
  videos: AnalyticsVideoRow[] | null;
  onUpdate: (slotId: string, body: { status?: StrategySlot['status']; linkedVideoId?: string | null }) => Promise<void>;
  onLog: OpenLog;
  loadVideos: () => void;
}) {
  const [picking, setPicking] = useState(false);
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const linked = slot.linkedVideoId ? strategy.videos[slot.linkedVideoId] : null;

  const update = async (body: Parameters<typeof onUpdate>[1]) => {
    setBusy(true);
    try {
      await onUpdate(slot.id, body);
      setPicking(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={cn('rounded-xl border bg-surface p-4', slot.status === 'posted' ? 'border-success/30' : 'border-line', slot.status === 'skipped' && 'opacity-60')}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
        <span className="tabular font-medium text-fg">{slot.timeLocal}</span>
        <span>· {PLATFORM_LABELS[slot.platform] ?? slot.platform}</span>
        <span className="rounded-full border border-line bg-white/[0.03] px-2 py-0.5">{slot.pillar}</span>
        {slot.status === 'posted' && (
          <span className="inline-flex items-center gap-1 text-success">
            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Posted
          </span>
        )}
        {slot.status === 'skipped' && <span>Skipped</span>}
      </div>
      <h4 className="mt-2 font-semibold text-fg">{slot.title}</h4>
      <p className="mt-1 text-sm text-fg">
        <span className="text-fg-muted">Hook: </span>“{slot.hook}”
      </p>

      <details className="group mt-2">
        <summary className="app-focus inline-flex cursor-pointer list-none items-center gap-1 rounded text-sm font-medium text-accent">
          How to make it
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-2 space-y-2 text-sm text-fg-muted">
          <p>{slot.concept}</p>
          {slot.beats.length > 0 && (
            <ol className="list-decimal space-y-1 pl-5">
              {slot.beats.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ol>
          )}
          <p>
            <span className="text-fg">About {slot.lengthSec}s.</span> Close with: “{slot.cta}”
          </p>
          <p className="text-xs text-fg-subtle">Why: {slot.rationale}</p>
        </div>
      </details>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {slot.status === 'posted' ? (
          <>
            {linked && slot.linkedVideoId ? (
              <Button size="sm" variant="secondary" onClick={() => onLog(slot.linkedVideoId!, cleanVideoTitle(linked.title))}>
                {linked.actualViews != null ? `${formatNumber(linked.actualViews)} views · update` : 'Log its views'}
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => { setPicking(true); loadVideos(); }}>
                Link the video
              </Button>
            )}
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void update({ status: 'planned', linkedVideoId: null })}>
              Undo
            </Button>
          </>
        ) : slot.status === 'skipped' ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void update({ status: 'planned' })}>
            Undo skip
          </Button>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => { setPicking(true); loadVideos(); }}>
              Mark posted
            </Button>
            <ButtonLink to="/new" size="sm" variant="ghost">
              Analyze my cut
            </ButtonLink>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void update({ status: 'skipped' })}>
              Skip
            </Button>
          </>
        )}
      </div>

      {picking && (
        <div className="mt-3 rounded-lg border border-line bg-white/[0.02] p-3">
          <p className="mb-2 text-xs text-fg-muted">Which analyzed video did you post? Linking it tracks this slot's real views.</p>
          {videos == null ? (
            <Skeleton className="h-10" />
          ) : (
            <Select
              id={`slot-${slot.id}-video`}
              label="Video you posted"
              value={pick}
              onChange={setPick}
              options={[{ value: '', label: 'Not analyzed / skip linking' }, ...videos.slice(0, 30).map((v) => ({ value: v.videoId, label: cleanVideoTitle(v.title) }))]}
            />
          )}
          <div className="mt-2 flex gap-2">
            <Button size="sm" disabled={busy} onClick={() => void update({ status: 'posted', linkedVideoId: pick || null })}>
              {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPicking(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function ProfileSummary({ profile, onEdit }: { profile: CreatorProfile; onEdit: () => void }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
      <span>
        {optionLabel(NICHE_OPTIONS, profile.niche)} · {profile.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(', ')} · {profile.postsPerWeek}/week ·{' '}
        {optionLabel(GOAL_OPTIONS, profile.goal)}
      </span>
      <button type="button" onClick={onEdit} className="app-focus inline-flex items-center gap-1 rounded font-medium text-accent hover:underline">
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
      </button>
    </p>
  );
}

export default function StrategyTab({ onLog, dataVersion }: { onLog: OpenLog; dataVersion: number }) {
  const [state, setState] = useState<StrategyState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [videos, setVideos] = useState<AnalyticsVideoRow[] | null>(null);
  const [historyId, setHistoryId] = useState('');
  const loadingVideos = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getStrategy(historyId || undefined)
      .then((s) => !cancelled && setState(s))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Could not load your plan. Try again.')));
    return () => {
      cancelled = true;
    };
  }, [dataVersion, historyId]);

  useEffect(() => {
    if (!generating) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(PROGRESS_STEPS.length - 1, s + 1)), 6000);
    return () => clearInterval(t);
  }, [generating]);

  const loadVideos = () => {
    if (videos || loadingVideos.current) return;
    loadingVideos.current = true;
    getAnalyticsVideos()
      .then(setVideos)
      .catch(() => setVideos([]))
      .finally(() => (loadingVideos.current = false));
  };

  const strategy = state?.strategy ?? null;
  const days = useMemo(() => {
    const map = new Map<string, StrategySlot[]>();
    for (const slot of strategy?.schedule?.slots ?? []) {
      if (!map.has(slot.date)) map.set(slot.date, []);
      map.get(slot.date)!.push(slot);
    }
    return [...map.entries()];
  }, [strategy]);

  if (!state && !error) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-28" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!state) {
    return (
      <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        {error}
      </p>
    );
  }
  if (state.usage.locked) return <LockedPreview />;

  if (!state.profile.complete || editingProfile) {
    return (
      <CreatorProfileForm
        initial={state.profile}
        onCancel={state.profile.complete ? () => setEditingProfile(false) : undefined}
        onSaved={(profile) => {
          setState((s) => (s ? { ...s, profile } : s));
          setEditingProfile(false);
        }}
      />
    );
  }

  const generate = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const { strategy: next, usage } = await generateStrategy();
      setHistoryId('');
      setState((s) => (s ? { ...s, strategy: next, usage, history: [{ id: next.id, generatedAt: next.generatedAt, confidence: next.confidence }, ...s.history] } : s));
    } catch (err) {
      const code = apiErrorCode(err);
      if (code === 'PROFILE_INCOMPLETE') setEditingProfile(true);
      setGenError(apiErrorMessage(err, 'We could not write your plan right now. Try again in a moment.'));
    } finally {
      setGenerating(false);
    }
  };

  const updateSlot = async (slotId: string, body: { status?: StrategySlot['status']; linkedVideoId?: string | null }) => {
    if (!strategy) return;
    try {
      const next = await updateStrategySlot(strategy.id, slotId, body);
      setState((s) => (s ? { ...s, strategy: next } : s));
    } catch (err) {
      setGenError(apiErrorMessage(err, 'Could not update that slot.'));
    }
  };

  const { usage } = state;
  const resets = new Date(usage.resetsOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const posted = strategy?.schedule?.slots.filter((s) => s.status === 'posted').length ?? 0;
  const total = strategy?.schedule?.slots.length ?? 0;
  const milestone = strategy?.nextMilestone;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
              Your content plan
            </h2>
            <div className="mt-1">
              <ProfileSummary profile={state.profile} onEdit={() => setEditingProfile(true)} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button onClick={() => void generate()} disabled={generating || usage.remaining <= 0 || state.generating}>
              {generating ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4" aria-hidden="true" />}
              {strategy ? 'Write a new plan' : 'Write my plan'}
            </Button>
            <p className="tabular text-xs text-fg-muted">
              {usage.remaining} of {usage.limit} plans left · resets {resets}
            </p>
          </div>
        </div>
        {generating && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm text-fg-muted">
            <Loader2 className="h-4 w-4 shrink-0 text-accent motion-safe:animate-spin" aria-hidden="true" />
            {PROGRESS_STEPS[step]} This takes about a minute.
          </p>
        )}
        {state.generating && !generating && <p className="mt-4 text-sm text-fg-muted">A plan is already being written. Refresh in a minute.</p>}
        {usage.remaining <= 0 && !generating && (
          <p className="mt-4 text-sm text-fg-muted">
            You've used this period's plans. {usage.plan !== 'pro' && usage.plan !== 'enterprise' && <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent hover:underline">Pro includes 10 a month.</Link>}
          </p>
        )}
        {genError && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {genError}
          </p>
        )}
        {state.history.length > 1 && (
          <div className="mt-4 max-w-xs">
            <Select
              id="strategy-history"
              label="Plan version"
              value={historyId || strategy?.id || ''}
              onChange={(v) => setHistoryId(v === state.history[0]?.id ? '' : v)}
              options={state.history.map((h, i) => ({
                value: h.id,
                label: `${i === 0 ? 'Latest' : 'Earlier'} plan · ${new Date(h.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
              }))}
            />
          </div>
        )}
      </section>

      {!strategy ? (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-fg-subtle" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-fg">No plan yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-fg-muted">
            Your plan looks at every video you've analyzed and every real result you've logged, then tells you exactly what to post for the next two weeks, when, and why.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface p-4 md:col-span-2">
              <p className="app-label">{CONFIDENCE_COPY[strategy.confidence].label}</p>
              <p className="mt-1 text-sm text-fg-muted">{CONFIDENCE_COPY[strategy.confidence].body}</p>
              {strategy.inputSummary && (
                <p className="tabular mt-2 text-xs text-fg-subtle">
                  Built from {strategy.inputSummary.videos} videos, {strategy.inputSummary.withResults} with real views · {new Date(strategy.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
            {milestone && (
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="app-label flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" aria-hidden="true" /> Next milestone
                </p>
                <p className="tabular mt-1 text-xl font-semibold text-fg">
                  {formatNumber(milestone.current)} → {formatNumber(milestone.target)}
                  <span className="ml-1 text-sm font-normal text-fg-muted">{milestone.metric === 'median_views' ? 'median views' : 'posts logged'}</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuemin={0} aria-valuemax={milestone.target} aria-valuenow={milestone.current} aria-label="Milestone progress">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, (milestone.current / Math.max(1, milestone.target)) * 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-fg-muted">{milestone.basis}</p>
              </div>
            )}
          </div>

          {strategy.diagnosis && (
            <section className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="diagnosis-title">
              <p className="app-label">Diagnosis</p>
              <h3 id="diagnosis-title" className="mt-1 text-lg font-semibold text-fg">
                {strategy.diagnosis.headline}
              </h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-fg">Keep doing</p>
                  <EvidenceList items={strategy.diagnosis.strengths} videos={strategy.videos} icon="up" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-fg">Fix next</p>
                  <EvidenceList items={strategy.diagnosis.weaknesses} videos={strategy.videos} icon="down" />
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="pillars-title">
              <h3 id="pillars-title" className="app-label">Content pillars</h3>
              <ul className="mt-3 space-y-4">
                {strategy.pillars.map((p) => (
                  <li key={p.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-semibold text-fg">{p.name}</p>
                      <p className="tabular text-sm text-fg-muted">{p.targetShare}% of posts</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
                      <div className="h-full rounded-full" style={{ width: `${p.targetShare}%`, background: 'var(--app-chart-1)' }} />
                    </div>
                    <p className="mt-1.5 text-sm text-fg-muted">{p.why}</p>
                    <EvidenceChips ids={p.evidenceVideoIds} videos={strategy.videos} />
                  </li>
                ))}
              </ul>
            </section>

            {strategy.formula && (
              <section className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="formula-title">
                <h3 id="formula-title" className="app-label">Your winning formula</h3>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-fg">Hooks that fit you</dt>
                    <dd>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-fg-muted">
                        {strategy.formula.hookPatterns.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-fg">Length</dt>
                    <dd className="tabular text-fg-muted">about {strategy.formula.idealLengthSec}s</dd>
                  </div>
                  {(
                    [
                      ['Pacing', strategy.formula.pacing],
                      ['On-screen text', strategy.formula.captionStyle],
                      ['Ending', strategy.formula.ctaStyle],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-semibold text-fg">{label}</dt>
                      <dd className="text-fg-muted">{value}</dd>
                    </div>
                  ))}
                  {strategy.formula.avoid.length > 0 && (
                    <div>
                      <dt className="font-semibold text-fg">Stop doing</dt>
                      <dd>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-fg-muted">
                          {strategy.formula.avoid.map((a, i) => (
                            <li key={i}>{a}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}
          </div>

          {strategy.schedule && (
            <section aria-labelledby="schedule-title">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="schedule-title" className="flex items-center gap-2 text-base font-semibold text-fg">
                  <CalendarDays className="h-4 w-4 text-accent" aria-hidden="true" />
                  Your next two weeks
                </h3>
                <p className="tabular text-sm text-fg-muted">
                  {posted} of {total} posted · times in {strategy.schedule.timezone}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {days.map(([date, slots]) => (
                  <div key={date}>
                    <p className="mb-2 text-sm font-semibold text-fg">{dayLabel(date)}</p>
                    <ul className="space-y-3">
                      {slots.map((slot) => (
                        <SlotCard key={slot.id} slot={slot} strategy={strategy} videos={videos} onUpdate={updateSlot} onLog={onLog} loadVideos={loadVideos} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {strategy.experiments.length > 0 && (
            <section className="rounded-xl border border-line bg-surface p-4 sm:p-5" aria-labelledby="experiments-title">
              <h3 id="experiments-title" className="flex items-center gap-2 app-label">
                <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Experiments to run
              </h3>
              <ul className="mt-3 grid gap-4 md:grid-cols-2">
                {strategy.experiments.map((e, i) => (
                  <li key={i} className="rounded-lg border border-line bg-white/[0.02] p-3 text-sm">
                    <p className="font-semibold text-fg">{e.hypothesis}</p>
                    <p className="mt-1 text-fg-muted">{e.howToTest}</p>
                    <p className="mt-1 text-xs text-fg-subtle">Decided by: {e.successMetric}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-xs text-fg-subtle">
            Plans suggest what's most likely to work based on your data. No one can promise a video will go viral, and every result you log makes the next plan more accurate.
          </p>
        </>
      )}
    </div>
  );
}
