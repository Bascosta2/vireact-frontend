import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clapperboard, Sparkles } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { Dropzone } from '@/components/app/Dropzone';
import { Skeleton } from '@/components/app/Skeleton';
import { track } from '@/lib/analytics';
import { apiErrorCode, apiErrorMessage } from '@/api/analytics';
import {
  confirmEditUpload,
  editorFeaturesV2,
  createEditProject,
  getEditorUsage,
  listEditProjects,
  uploadToStorage,
  IN_PROGRESS,
  type EditorUsage,
  type EditProjectSummary,
} from '@/api/editor';
import { FootageDisclaimer } from './Disclaimer';
import { ACCEPT, TYPES, BrandSheet, LockedCard, ProjectCard, UsagePill } from './shared';
import { isFreePlan, resetDate } from './usage';

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
      const [u, list] = await Promise.all([getEditorUsage(), listEditProjects('none')]);
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
    const t = setInterval(() => void listEditProjects('none').then(setProjects).catch(() => {}), 5000);
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

        {editorFeaturesV2() && usage?.available && <div className="mb-8"><BrandSheet /></div>}

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
