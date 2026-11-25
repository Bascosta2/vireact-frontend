import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, Check, EyeOff, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useUser } from '@/redux/hooks/use-user';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, type Video } from '@/api/video';
import { ANALYSIS_STATUS, UPLOAD_STATUS } from '@/constants';
import { Button } from '@/components/app/Button';
import { Dropzone } from '@/components/app/Dropzone';
import { Skeleton } from '@/components/app/Skeleton';
import { isInProgress, statusKind } from '@/lib/video-status';
import { usePendingUpload } from '@/contexts/PendingUploadContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { inspectVideoFile } from '@/lib/video-metadata';
import { primeVideoSummaries } from '@/lib/video-summaries';
import { getEditorUsage, type EditorUsage } from '@/api/editor';
import { getAnalyticsOverview, type AnalyticsOverview, type AnalyticsRange } from '@/api/analytics';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { WorkflowMap } from './WorkflowMap';
import { workflowSpotlight } from './workflow-steps';
import { MetricsWidget, NextStepCard, PlanWidget, RecentWidget } from './HomeWidgets';
import { DEFAULT_HOME_LAYOUT, HOME_WIDGETS, isDefaultLayout, moveWidget, readHomeLayout, setWidgetHidden, writeHomeLayout, type HomeLayout, type HomeWidgetId } from './home-layout';
import { TrialBanner } from '@/components/app/TrialBanner';

/** Editor allowance for the workflow; null when it can't load (Home never blocks on it). */
function useEditorUsage() {
  const [usage, setUsage] = useState<EditorUsage | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    getEditorUsage()
      .then((u) => !cancelled && setUsage(u))
      .catch(() => !cancelled && setUsage(null));
    return () => {
      cancelled = true;
    };
  }, []);
  return usage;
}

const firstNameOf = (name?: string | null) => (name || '').trim().split(/\s+/)[0] || 'there';

/** The shape of Home while it loads, so the page is never blank. */
function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your home page">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-8 h-28 w-full rounded-xl" />
      <Skeleton className="mt-8 h-5 w-32" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-8 h-5 w-40" />
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const { name } = useUser();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const list = await getUserVideos({ summary: true });
      primeVideoSummaries(list);
      setVideos(list.filter((v) => v.uploadStatus !== UPLOAD_STATUS.FAILED));
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const firstName = firstNameOf(name);

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
        {loadError ? (
          <>
            <h1 className="app-title">Hi {firstName}</h1>
            <div role="alert" className="mt-8 rounded-xl border border-danger/40 bg-surface p-6">
              <p className="text-base font-medium text-fg">We couldn't load your videos.</p>
              <Button variant="secondary" className="mt-4" onClick={() => void load()}>
                Try again
              </Button>
            </div>
          </>
        ) : videos === null ? (
          <HomeSkeleton />
        ) : videos.length === 0 ? (
          <NewUserHome firstName={firstName} />
        ) : (
          <>
            <ReturningHome firstName={firstName} videos={videos} />
            {/* Free accounts that can still take the trial; nothing for everyone else. */}
            <TrialBanner className="mt-8" />
          </>
        )}
      </div>
    </UserPage>
  );
}

function NewUserHome({ firstName }: { firstName: string }) {
  const navigate = useNavigate();
  const { setPending } = usePendingUpload();
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const stepsHeading = useId();
  const editor = useEditorUsage();

  const onFile = async (file: File) => {
    setChecking(true);
    setError(null);
    const result = await inspectVideoFile(file);
    setChecking(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setPending({ file, displayName: file.name, videoMetadata: result.metadata });
    navigate('/new');
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="app-title break-words">Welcome, {firstName}</h1>
        <p className="mt-2 text-base text-fg-muted">Start with one short. Vireact takes it from there.</p>
      </header>
      <section className="mb-10" aria-label="Add your first video">
        <Dropzone onFile={(f) => void onFile(f)} error={error} disabled={checking} label={checking ? 'Checking your video' : 'Drop your first video here or choose a file'} />
      </section>
      {/* Same pipeline as returning creators, pointed at the first analysis. */}
      <WorkflowMap headingId={stepsHeading} data={{ analyzed: 0, latestId: null, editor }} />
    </>
  );
}

/** Wraps a Home card with move and hide controls while the creator is customizing. */
function WidgetFrame({
  id,
  editing,
  first,
  last,
  onMove,
  onHide,
  children,
}: {
  id: HomeWidgetId;
  editing: boolean;
  first: boolean;
  last: boolean;
  onMove: (dir: -1 | 1) => void;
  onHide: () => void;
  children: ReactNode;
}) {
  const name = HOME_WIDGETS.find((w) => w.id === id)?.name ?? id;
  if (!editing) return <>{children}</>;
  return (
    <div className="rounded-2xl border border-dashed border-line p-2">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="app-label">{name}</span>
        <span className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onMove(-1)} disabled={first} aria-label={`Move ${name} up`}>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onMove(1)} disabled={last} aria-label={`Move ${name} down`}>
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onHide} aria-label={`Hide ${name}`}>
            <EyeOff className="h-4 w-4" aria-hidden="true" />
            Hide
          </Button>
        </span>
      </div>
      <div className="pointer-events-none select-none opacity-90">{children}</div>
    </div>
  );
}

function ReturningHome({ firstName, videos }: { firstName: string; videos: Video[] }) {
  const { job } = useActiveAnalyses();
  const workflowHeading = useId();
  const editor = useEditorUsage();
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null | undefined>(undefined);
  const [overviewAt, setOverviewAt] = useState<number | null>(null);
  const [layout, setLayout] = useState<HomeLayout>(readHomeLayout);
  const [editing, setEditing] = useState(false);

  const loadOverview = useCallback((r: AnalyticsRange) => {
    let cancelled = false;
    setOverview(undefined);
    getAnalyticsOverview(r)
      .then((o) => {
        if (cancelled) return;
        setOverview(o);
        setOverviewAt(Date.now());
      })
      .catch(() => !cancelled && setOverview(null));
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => loadOverview(range), [range, loadOverview]);

  const saveLayout = (next: HomeLayout) => {
    setLayout(next);
    writeHomeLayout(next);
  };

  const sorted = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const inProgress = sorted.filter((v) => isInProgress(statusKind(v.analysisStatus, v.uploadStatus)));
  const analyzed = sorted.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED);
  const workflowData = { analyzed: analyzed.length, latestId: analyzed[0]?._id ?? null, editor, overview };
  const spotlight = workflowSpotlight(workflowData);

  const visible = layout.order.filter((id) => !layout.hidden.includes(id));
  const render = (id: HomeWidgetId): ReactNode => {
    switch (id) {
      case 'next':
        return <NextStepCard spotlight={spotlight} inProgress={inProgress} job={job} />;
      case 'metrics':
        return analyzed.length > 0 ? <MetricsWidget overview={overview} range={range} onRange={setRange} loadedAt={overviewAt} onRetry={() => loadOverview(range)} /> : null;
      case 'recent':
        return <RecentWidget recent={analyzed.slice(0, 3)} hasInProgress={inProgress.length > 0 || Boolean(job)} />;
      case 'plan':
        return analyzed.length > 0 ? <PlanWidget /> : null;
      case 'guide':
        return <WorkflowMap headingId={workflowHeading} data={workflowData} showSpotlight={false} />;
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="app-title min-w-0 break-words">Welcome back, {firstName}</h1>
        <div className="flex items-center gap-2">
          {editing && !isDefaultLayout(layout) && (
            <Button size="sm" variant="ghost" onClick={() => saveLayout({ ...DEFAULT_HOME_LAYOUT, order: [...DEFAULT_HOME_LAYOUT.order] })}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset layout
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            aria-pressed={editing}
            onClick={() => {
              setEditing((v) => !v);
              if (!editing) track('home_customize_opened', {});
            }}
          >
            {editing ? <Check className="h-4 w-4" aria-hidden="true" /> : <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
            {editing ? 'Done' : 'Customize'}
          </Button>
        </div>
      </header>

      <div className="space-y-10">
        {visible.map((id, i) => {
          const node = render(id);
          if (!node) return null;
          return (
            <WidgetFrame
              key={id}
              id={id}
              editing={editing}
              first={i === 0}
              last={i === visible.length - 1}
              onMove={(dir) => saveLayout(moveWidget(layout, id, dir))}
              onHide={() => saveLayout(setWidgetHidden(layout, id, true))}
            >
              {node}
            </WidgetFrame>
          );
        })}
      </div>

      {editing && layout.hidden.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3">
          <span className="text-sm text-fg-muted">Hidden:</span>
          {layout.hidden.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => saveLayout(setWidgetHidden(layout, id, false))}
              className={cn('app-focus inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs text-fg hover:bg-white/5')}
            >
              Show {HOME_WIDGETS.find((w) => w.id === id)?.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default Dashboard;
