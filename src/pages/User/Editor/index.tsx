import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clapperboard, Film, Loader2, Lock, Sparkles } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { ButtonLink } from '@/components/app/Button';
import { Dropzone } from '@/components/app/Dropzone';
import { Skeleton } from '@/components/app/Skeleton';
import { track } from '@/lib/analytics';
import { formatDuration } from '@/lib/video-file';
import { apiErrorCode, apiErrorMessage } from '@/api/analytics';
import {
  confirmEditUpload,
  createEditProject,
  getEditorUsage,
  listEditProjects,
  uploadToStorage,
  IN_PROGRESS,
  type EditorUsage,
  type EditProjectSummary,
} from '@/api/editor';
import { FootageDisclaimer } from './Disclaimer';

const ACCEPT = '.mp4,.mov,.webm,.mkv,.m4v';
const TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-m4v']);

const isFreePlan = (usage: EditorUsage) => usage.plan === 'free';

/** Free resets on the 1st of the month in UTC, so show that day in UTC (not the day before in the Americas). */
const resetDate = (usage: EditorUsage) =>
  new Date(usage.resetsOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(isFreePlan(usage) ? { timeZone: 'UTC' } : {}) });

function UsagePill({ usage }: { usage: EditorUsage }) {
  const text = isFreePlan(usage)
    ? usage.canStart
      ? 'One AI edit per month on the free plan'
      : `Free AI edit used · next on ${resetDate(usage)}`
    : `${usage.remaining} of ${usage.limit} AI edits left this period`;
  return (
    <span className="tabular inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent-tint px-4 py-2 text-sm font-semibold text-accent">
      <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
      {text}
    </span>
  );
}

function LockedCard({ usage }: { usage: EditorUsage }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
      <div aria-hidden="true" className="pointer-events-none grid select-none gap-4 p-6 blur-[6px] sm:grid-cols-2">
        <div className="aspect-[9/16] max-h-80 rounded-lg bg-gradient-to-b from-white/10 to-white/0" />
        <div className="space-y-3">
          {['Opened on the result', 'Removed 14 s of pauses and filler', 'Bold word captions', '3 punch-in zooms', 'Upbeat track under the voice'].map((t) => (
            <div key={t} className="rounded-lg border border-line p-3 text-sm text-fg">{t}</div>
          ))}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 p-4">
        <div className="max-w-md rounded-xl border border-line bg-surface-raised p-5 text-center shadow-xl">
          <Lock className="mx-auto h-6 w-6 text-accent" aria-hidden="true" />
          <h2 className="mt-2 text-base font-semibold text-fg">You&rsquo;ve used this month&rsquo;s free AI edit</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Your next free edit unlocks on {resetDate(usage)}. Premium and Pro include more AI edits every month: cuts, captions, zooms, a reworked hook, music and sound effects.
          </p>
          <ButtonLink to="/subscription-plans" className="mt-4" onClick={() => track('editor_upgrade_clicked', { from: 'editor_home' })}>
            See plans
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p }: { p: EditProjectSummary }) {
  const working = IN_PROGRESS.includes(p.status);
  return (
    <li>
      <Link to={`/editor/${p.id}`} className="app-focus group flex gap-3 rounded-xl border border-line bg-surface p-3 hover:bg-surface-raised">
        {p.thumbnailUrl ? (
          <img src={p.thumbnailUrl} alt="" loading="lazy" className="h-24 w-[54px] shrink-0 rounded-md bg-canvas object-cover" />
        ) : (
          <span className="flex h-24 w-[54px] shrink-0 items-center justify-center rounded-md bg-canvas text-fg-subtle">
            <Film className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-fg group-hover:underline">{p.title}</span>
          <span className="mt-1 block text-xs text-fg-muted">
            {working ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />
                {p.stage === 'uploading' ? 'Waiting for upload' : `${p.stage[0]?.toUpperCase()}${p.stage.slice(1)}`}
              </span>
            ) : p.status === 'failed' ? (
              <span className="text-danger">Didn&rsquo;t finish</span>
            ) : (
              <span className="tabular">
                {formatDuration(p.durationSec)} → {formatDuration(p.editedDurationSec)}
              </span>
            )}
          </span>
          {p.hasRender && <span className="mt-2 inline-block rounded-full border border-success/30 px-2 py-0.5 text-[11px] text-success">Exported</span>}
        </span>
      </Link>
    </li>
  );
}

/**
 * Editor tab: upload raw footage and get a full AI edit planned by Claude from Vireact's knowledge
 * base and real viral examples. Uploads go straight to storage with a signed URL.
 */
export default function Editor() {
  const navigate = useNavigate();
  const [usage, setUsage] = useState<EditorUsage | null>(null);
  const [projects, setProjects] = useState<EditProjectSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inProgressId, setInProgressId] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ name: string; pct: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, list] = await Promise.all([getEditorUsage(), listEditProjects()]);
      setUsage(u);
      setProjects(list);
      setLoadError(null);
    } catch (err) {
      setLoadError(apiErrorMessage(err, 'Could not load the editor. Try again.'));
    }
  }, []);

  useEffect(() => {
    track('editor_viewed', {});
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  // Keep the list fresh while an edit is being made.
  useEffect(() => {
    if (!projects?.some((p) => IN_PROGRESS.includes(p.status))) return;
    const t = setInterval(() => void listEditProjects().then(setProjects).catch(() => {}), 5000);
    return () => clearInterval(t);
  }, [projects]);

  const onFile = async (file: File) => {
    setUploadError(null);
    setInProgressId(null);
    if (!usage) return;
    if (!TYPES.has(file.type)) return setUploadError('Upload an MP4, MOV, WebM or MKV video.');
    if (file.size > usage.maxUploadBytes) return setUploadError('Videos can be up to 500 MB.');
    const controller = new AbortController();
    abortRef.current = controller;
    setUpload({ name: file.name, pct: 0 });
    try {
      const { project, upload: target } = await createEditProject(file);
      await uploadToStorage(target.url, file, target.headers, (pct) => setUpload({ name: file.name, pct }), controller.signal);
      await confirmEditUpload(project.id);
      navigate(`/editor/${project.id}`);
    } catch (err) {
      const code = apiErrorCode(err);
      if (code === 'EDIT_IN_PROGRESS') {
        const busy = projects?.find((p) => IN_PROGRESS.includes(p.status));
        if (busy) setInProgressId(busy.id);
      }
      if (code === 'UPGRADE_REQUIRED' || code === 'EDITOR_LIMIT') void load();
      setUploadError(apiErrorMessage(err, err instanceof Error && err.message ? err.message : 'Upload failed. Try again.'));
      setUpload(null);
    }
  };

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Editor"
          subtitle="Upload your raw footage and get a full edit: tighter cuts, captions, zooms, a stronger hook, music and sound effects, based on what works in real viral videos."
          actions={usage ? <UsagePill usage={usage} /> : null}
        />

        {loadError && (
          <p role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {loadError}
          </p>
        )}

        <div className="mb-8 space-y-4">
          <FootageDisclaimer />
          {!usage ? (
            <Skeleton className="h-48" />
          ) : !usage.available ? (
            <div className="rounded-xl border border-line bg-surface p-6 text-center">
              <Clapperboard className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
              <h2 className="mt-2 text-base font-semibold text-fg">The editor is almost ready</h2>
              <p className="mt-1 text-sm text-fg-muted">We&rsquo;re finishing the setup. Check back soon.</p>
            </div>
          ) : usage.locked || !usage.canStart ? (
            usage.locked ? (
              <LockedCard usage={usage} />
            ) : (
              <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">
                You&rsquo;ve used all {usage.limit} edits for this period. More unlock on {resetDate(usage)}.
              </div>
            )
          ) : upload ? (
            <div className="rounded-xl border border-line bg-surface p-6" aria-live="polite">
              <p className="truncate text-sm font-medium text-fg">Uploading {upload.name}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-valuenow={upload.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${upload.pct}%` }} />
              </div>
              <p className="tabular mt-2 text-xs text-fg-muted">{upload.pct}%. Keep this tab open until the upload finishes.</p>
            </div>
          ) : (
            <>
              <Dropzone
                onFile={(f) => void onFile(f)}
                error={uploadError}
                label={isFreePlan(usage) ? 'Drop your raw video here for your free AI edit' : 'Drop your raw video here'}
                hint="MP4, MOV, WebM or MKV. Up to 3 minutes and 500 MB."
                accept={ACCEPT}
              />
              {inProgressId && (
                <Link to={`/editor/${inProgressId}`} className="app-focus inline-block rounded text-sm font-medium text-accent hover:underline">
                  Open the edit in progress
                </Link>
              )}
            </>
          )}
        </div>

        <section aria-labelledby="edits-heading">
          <h2 id="edits-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold text-fg">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
            Your edits
          </h2>
          {!projects ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">Your edits will show up here.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </UserPage>
  );
}
