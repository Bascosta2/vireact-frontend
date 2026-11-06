import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Film, Plus } from 'lucide-react';
import { useUser } from '@/redux/hooks/use-user';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, type Video } from '@/api/video';
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
import { HowItWorks } from './HowItWorks';

const firstNameOf = (name?: string | null) => (name || '').trim().split(/\s+/)[0] || 'there';

function Dashboard() {
  const { name } = useUser();
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const showSkeleton = useDelayedFlag(videos === null && !loadError);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const list = await getUserVideos();
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
        <h1 className="app-title">Hi {firstName}</h1>
        <p id={stepsHeading} className="mt-2 text-base text-fg-muted">
          Here's how Vireact works.
        </p>
      </header>
      <HowItWorks animateIntro headingId={stepsHeading} headingLevel="h2" />
      <section className="mt-10" aria-label="Add your first video">
        <Dropzone
          onFile={(f) => void onFile(f)}
          error={error}
          disabled={checking}
          label={checking ? 'Checking your video' : 'Drop your first video here or choose a file'}
        />
      </section>
    </>
  );
}

function ReturningHome({ firstName, videos }: { firstName: string; videos: Video[] }) {
  const { job } = useActiveAnalyses();
  const recentHeading = useId();
  const sorted = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const inProgress = sorted.filter((v) => isInProgress(statusKind(v.analysisStatus, v.uploadStatus)));
  const recent = sorted.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED).slice(0, 3);
  const localUploading = job && (job.stage === 'uploading' || job.stage === 'preparing');

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

      <HowItWorksDisclosure />
    </>
  );
}

function RecentCard({ video }: { video: Video }) {
  const title = cleanVideoTitle(video.filename);
  const hasScore = typeof video.viralityScore === 'number' && !Number.isNaN(video.viralityScore);
                return (
    <Link
      to={`/videos/${video._id}`}
      className="app-focus flex h-full min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised"
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-canvas text-fg-subtle">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
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

function HowItWorksDisclosure() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
                return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="text-base">
                      <button
                        type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="app-focus inline-flex h-11 items-center gap-2 rounded-lg text-base font-medium text-fg"
        >
          How Vireact works
          <ChevronDown
            className={`h-4 w-4 text-fg-muted transition-transform duration-200 ease-app-out ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
                      </button>
      </h2>
      <div id={panelId} hidden={!open} className="mt-4">
        <HowItWorks />
                  </div>
    </section>
  );
}

export default Dashboard;
