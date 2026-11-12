import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Download, Loader2, Trash2, Wand2 } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { Button, ButtonLink } from '@/components/app/Button';
import { Skeleton } from '@/components/app/Skeleton';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { apiErrorMessage } from '@/api/analytics';
import {
  deleteEditProject,
  getEditorUsage,
  getEditProject,
  getRender,
  regenerateEdit,
  saveEdits,
  scoreEdit,
  startRender,
  IN_PROGRESS,
  type EditProjectDetail,
  type Edits,
  type PreviewProps,
  type RenderInfo,
} from '@/api/editor';
import { FootageDisclaimer } from './Disclaimer';
import Preview from './Preview';
import ReviewPanel from './ReviewPanel';

const STEPS = ['Uploading', 'Preparing your footage', 'Transcribing every word', 'Studying viral patterns', 'Planning your edit'];

const stepFor = (stage: string): number => {
  if (stage === 'uploading') return 0;
  if (stage === 'transcribing') return 2;
  if (stage === 'studying viral patterns') return 3;
  if (stage === 'planning your edit') return 4;
  return 1;
};

function ProcessingSteps({ project }: { project: EditProjectDetail }) {
  const current = stepFor(project.stage);
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-6" aria-live="polite">
      <h1 className="text-lg font-semibold text-fg">Editing “{project.title}”</h1>
      <p className="mt-1 text-sm text-fg-muted">This takes about a minute or two. You can leave this page; your edit keeps going.</p>
      <ol className="mt-5 space-y-3">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                i < current ? 'border-success/40 bg-success/10 text-success' : i === current ? 'border-accent text-accent' : 'border-line text-fg-subtle'
              )}
            >
              {i < current ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i === current ? <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" /> : i + 1}
            </span>
            <span className={i <= current ? 'text-fg' : 'text-fg-subtle'}>{label}</span>
            {i === current && <span className="sr-only">(in progress)</span>}
          </li>
        ))}
      </ol>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(5, project.progress)}%` }} />
      </div>
      <div className="mt-5">
        <FootageDisclaimer compact />
      </div>
    </div>
  );
}

function ExportCard({ project, renderAvailable }: { project: EditProjectDetail; renderAvailable: boolean }) {
  const navigate = useNavigate();
  const latest = project.renders.at(-1) ?? null;
  const [render, setRender] = useState<RenderInfo | null>(latest);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkedVideoId, setLinkedVideoId] = useState(project.linkedVideoId);

  // Poll an export in progress.
  useEffect(() => {
    if (render?.status !== 'rendering') return;
    const t = setInterval(() => {
      getRender(project.id, render.id)
        .then(setRender)
        .catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, [project.id, render?.id, render?.status]);

  const exportNow = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = await startRender(project.id);
      setRender({ id, status: 'rendering', progress: 0, error: null });
      track('edit_export_clicked', { project_id: project.id });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not start the export. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!render) return;
    try {
      const fresh = await getRender(project.id, render.id);
      if (fresh.downloadUrl) window.location.assign(fresh.downloadUrl);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not get the download. Try again.'));
    }
  };

  const score = async () => {
    setBusy(true);
    setError(null);
    try {
      const videoId = await scoreEdit(project.id);
      setLinkedVideoId(videoId);
      navigate(`/videos/${videoId}`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not start scoring. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h2 className="text-base font-semibold text-fg">Export</h2>
      {!renderAvailable ? (
        <p className="mt-1 text-sm text-fg-muted">Export is being set up. Your edit is saved, so you can export it as soon as it&rsquo;s ready.</p>
      ) : render?.status === 'rendering' ? (
        <div className="mt-2" aria-live="polite">
          <p className="tabular text-sm text-fg-muted">Rendering your MP4… {render.progress}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(4, render.progress)}%` }} />
          </div>
        </div>
      ) : render?.status === 'done' ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => void download()}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download MP4
          </Button>
          {linkedVideoId ? (
            <ButtonLink to={`/videos/${linkedVideoId}`} variant="secondary">
              See the new score
            </ButtonLink>
          ) : (
            <Button variant="secondary" onClick={() => void score()} disabled={busy}>
              Score this edit
            </Button>
          )}
          <Button variant="ghost" onClick={() => void exportNow()} disabled={busy}>
            Export again
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-fg-muted">Renders a 1080×1920 MP4 with every change you made here.</p>
          {render?.status === 'failed' && <p className="mt-2 text-sm text-danger">{render.error ?? 'The last export failed.'}</p>}
          <Button className="mt-3" onClick={() => void exportNow()} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
            Export MP4
          </Button>
        </>
      )}
      {render?.status === 'done' && !linkedVideoId && <p className="mt-2 text-xs text-fg-subtle">Scoring runs a normal analysis and uses one from your plan.</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/** One edit: progress while it's being made, then the live preview, review controls and export. */
export default function EditProjectPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<EditProjectDetail | null>(null);
  const [props, setProps] = useState<PreviewProps | null>(null);
  const [edits, setEdits] = useState<Edits>({});
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'error'>('idle');
  const [renderAvailable, setRenderAvailable] = useState(true);
  const saveSeq = useRef(0);

  const load = useCallback(async () => {
    try {
      const p = await getEditProject(projectId);
      setProject(p);
      setProps(p.props);
      setEdits(p.edits ?? {});
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load this edit.'));
    }
  }, [projectId]);

  useEffect(() => {
    void load();
    getEditorUsage()
      .then((u) => setRenderAvailable(u.renderAvailable))
      .catch(() => {});
  }, [load]);

  // Poll while the edit is being made.
  const working = project ? IN_PROGRESS.includes(project.status) : false;
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => void load(), 3000);
    return () => clearInterval(t);
  }, [working, load]);

  const persist = useCallback(
    async (patch: Edits) => {
      const seq = ++saveSeq.current;
      setSaveState('saving');
      try {
        const res = await saveEdits(projectId, patch);
        if (seq !== saveSeq.current) return;
        setEdits(res.edits);
        setProps(res.props);
        setSaveState('idle');
      } catch (err) {
        if (seq !== saveSeq.current) return;
        setSaveState('error');
        setError(apiErrorMessage(err, 'Could not save that change.'));
      }
    },
    [projectId]
  );

  const onEdit = (patch: Edits) => {
    setEdits((e) => ({ ...e, ...patch }));
    track('edit_change_toggled', { project_id: projectId, change: Object.keys(patch)[0] ?? 'unknown' });
    void persist(patch);
  };
  const onEditText = (i: number, text: string) => void persist({ captionText: { [i]: text } });

  const onRegenerate = async (note: string) => {
    try {
      await regenerateEdit(projectId, note);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not redo the edit. Try again.'));
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this edit and its files? This cannot be undone.')) return;
    try {
      await deleteEditProject(projectId);
      navigate('/editor');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete this edit.'));
    }
  };

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link to="/editor" className="app-focus inline-flex items-center gap-1 rounded text-sm text-fg-muted hover:text-fg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All edits
          </Link>
          {project && !working && (
            <Button variant="ghost" size="sm" onClick={() => void onDelete()}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        )}

        {!project ? (
          !error && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
              <Skeleton className="aspect-[9/16] w-full max-w-[360px]" />
              <Skeleton className="h-96" />
            </div>
          )
        ) : working ? (
          <ProcessingSteps project={project} />
        ) : project.status === 'failed' ? (
          <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-6 text-center">
            <h1 className="text-lg font-semibold text-fg">This edit didn&rsquo;t finish</h1>
            <p className="mt-1 text-sm text-fg-muted">{project.error ?? 'Something went wrong. This did not use up an edit.'}</p>
            <ButtonLink to="/editor" className="mt-4">
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Start a new edit
            </ButtonLink>
          </div>
        ) : project.plan && props && project.proxyUrl ? (
          <>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="truncate text-xl font-semibold text-fg">{project.title}</h1>
              <span className="text-xs text-fg-subtle" aria-live="polite">
                {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Not saved' : 'All changes saved'}
              </span>
            </div>
            {project.error && <p className="mb-4 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">{project.error}</p>}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
              <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                <Preview props={props} proxyUrl={project.proxyUrl} originalSec={project.source?.durationSec ?? null} />
                <ExportCard project={project} renderAvailable={renderAvailable} />
                <FootageDisclaimer compact />
              </div>
              <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
                <ReviewPanel project={project} props={props} edits={edits} onEdit={onEdit} onEditText={onEditText} onRegenerate={onRegenerate} />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-fg-muted">This edit is no longer available.</p>
        )}
      </div>
    </UserPage>
  );
}
