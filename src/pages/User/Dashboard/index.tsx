import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Plus } from 'lucide-react';
import { useUser } from '@/redux/hooks/use-user';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, type Video } from '@/api/video';
import ProgressCard from './ProgressCard';
import { ANALYSIS_STATUS, UPLOAD_STATUS } from '@/constants';
import { Button, ButtonLink } from '@/components/app/Button';
import { Dropzone } from '@/components/app/Dropzone';
import { ScoreRing } from '@/components/app/ScoreRing';
import { Skeleton } from '@/components/app/Skeleton';
import { useDelayedFlag } from '@/hooks/useDelayedFlag';
import { StatusPill } from '@/components/app/StatusPill';
import { formatVideoDate, isInProgress, statusKind } from '@/lib/video-status';
import { usePendingUpload } from '@/contexts/PendingUploadContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { inspectVideoFile } from '@/lib/video-metadata';
import { cleanVideoTitle } from '@/lib/video-file';
import { getEditorUsage, type EditorUsage } from '@/api/editor';
import { getAnalyticsOverview, type AnalyticsOverview } from '@/api/analytics';
import { WorkflowMap } from './WorkflowMap';

/** Editor allowance for the workflow map; null when it can't load (Home never blocks on it). */
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

function Dashboard() {
  const { name } = useUser();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const showSkeleton = useDelayedFlag(videos === null && !loadError);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const list = await getUserVideos({ summary: true });
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
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
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
          showSkeleton ? (
            <div aria-busy="true" aria-label="Loading">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="mt-8 h-40 w-full" />
            </div>
          ) : null
        ) : videos.length === 0 ? (
          <NewUserHome firstName={firstName} />
        ) : (
          <ReturningHome firstName={firstName} videos={videos} />
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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-title break-words">Welcome, {firstName}</h1>
          <p className="mt-2 text-base text-fg-muted">Start with one short. Vireact takes it from there.</p>
        </div>
        <ButtonLink to="/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New analysis
        </ButtonLink>
      </header>
      <section className="mb-10" aria-label="Add your first video">
        <Dropzone
          onFile={(f) => void onFile(f)}
          error={error}
          disabled={checking}
          label={checking ? 'Checking your video' : 'Drop your first video here or choose a file'}
        />
      </section>
      {/* Same pipeline as returning creators, pointed at the first analysis. */}
      <WorkflowMap headingId={stepsHeading} data={{ analyzed: 0, latestId: null, editor }} />
    </>
  );
}

function ReturningHome({ firstName, videos }: { firstName: string; videos: Video[] }) {
  const { job } = useActiveAnalyses();
  const recentHeading = useId();
  const workflowHeading = useId();
  const editor = useEditorUsage();
  const [overview, setOverview] = useState<AnalyticsOverview | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getAnalyticsOverview('30d')
      .then((o) => !cancelled && setOverview(o))
      .catch(() => !cancelled && setOverview(null));
    return () => {
      cancelled = true;
    };
  }, []);
  const sorted = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const inProgress = sorted.filter((v) => isInProgress(statusKind(v.analysisStatus, v.uploadStatus)));
  const recent = sorted.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED).slice(0, 3);
  const localUploading = job && (job.stage === 'uploading' || job.stage === 'preparing');
  const analyzed = sorted.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED);

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="app-title min-w-0 break-words">Welcome back, {firstName}</h1>
        <ButtonLink to="/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New analysis
        </ButtonLink>
      </header>

      {(localUploading || inProgress.length > 0) && (
        <section aria-label="In progress" className="mb-10 min-w-0 space-y-2">
          {localUploading && job && (
            <Link
              to="/new"
              className="app-focus flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:bg-surface-raised"
            >
              <StatusPill kind="uploading" />
              <span className="min-w-0 flex-1 truncate text-sm text-fg">{cleanVideoTitle(job.fileName)}</span>
              <span className="tabular text-sm text-fg-muted">{Math.round(job.uploadPercent)}%</span>
            </Link>
          )}
          {inProgress.map((v) => (
            <Link
              key={v._id}
              to="/videos"
              className="app-focus flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:bg-surface-raised"
            >
              <StatusPill kind={statusKind(v.analysisStatus, v.uploadStatus)} />
              <span className="min-w-0 flex-1 truncate text-sm text-fg">{cleanVideoTitle(v.filename)}</span>
              <span className="hidden text-sm text-fg-muted sm:inline">Usually 2 to 5 minutes</span>
            </Link>
          ))}
          </section>
      )}

      {recent.length > 0 && overview && <ProgressCard overview={overview} />}

      <section aria-labelledby={recentHeading}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id={recentHeading} className="text-lg font-semibold text-fg">
            Recent results
          </h2>
          <Link to="/videos" className="app-focus rounded text-sm font-medium text-accent hover:underline">
            View all
          </Link>
                    </div>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-6 text-sm text-fg-muted">
            Your first results will show here when the analysis finishes.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {recent.map((v) => (
              <li key={v._id} className="min-w-0">
                <RecentCard video={v} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10">
        <WorkflowMap headingId={workflowHeading} data={{ analyzed: analyzed.length, latestId: analyzed[0]?._id ?? null, editor, overview }} />
      </div>

    </>
  );
}

function RecentCard({ video }: { video: Video }) {
  const title = cleanVideoTitle(video.filename);
  const hasScore = typeof video.viralityScore === 'number' && !Number.isNaN(video.viralityScore);
  // Thumbnail links can expire; fall back to the film icon instead of a broken image.
  const [thumbFailed, setThumbFailed] = useState(false);
                return (
    <Link
      to={`/videos/${video._id}`}
      className="app-focus flex h-full min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas text-fg-subtle">
        {video.thumbnailUrl && !thumbFailed ? (
          <img src={video.thumbnailUrl} alt="" loading="lazy" onError={() => setThumbFailed(true)} className="h-full w-full object-cover" />
        ) : (
          <Film className="h-6 w-6" aria-hidden="true" />
        )}
              </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">{title}</p>
        <p className="tabular mt-0.5 text-xs text-fg-muted">{formatVideoDate(video.createdAt)}</p>
              </div>
      {hasScore && <ScoreRing score={video.viralityScore as number} size={44} />}
    </Link>
  );
}

export default Dashboard;
