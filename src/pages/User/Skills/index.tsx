import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Clock, Sparkles, Wand2 } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { PageHeader } from '@/components/app/PageHeader';
import { Dropzone } from '@/components/app/Dropzone';
import { Skeleton } from '@/components/app/Skeleton';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { apiErrorCode, apiErrorMessage } from '@/api/analytics';
import {
  confirmEditUpload, createEditProject, getEditorUsage, listEditProjects, uploadToStorage, IN_PROGRESS,
  type EditorUsage, type EditProjectSummary,
} from '@/api/editor';
import { FootageDisclaimer } from '../Editor/Disclaimer';
import { ACCEPT, TYPES, LockedCard, ProjectCard, UsagePill } from '../Editor/shared';
import { isFreePlan, resetDate } from '../Editor/usage';
import { NOT_YET, SKILLS, type EditingSkill } from './catalog';
import { ShowcasePlayer } from './ShowcasePlayer';

/**
 * Skills Editor: a library of editing skills (each ported from a Claude skill), every one with showcase
 * clips of what it does. Pick a skill, upload raw footage, and the AI edit follows that skill. Same plan
 * limits, upload flow and review page as the Editor.
 */

function FeatureTile({ f, skill }: { f: EditingSkill['features'][number]; skill: EditingSkill }) {
  return (
    <li className="flex gap-4 rounded-xl border border-line bg-surface p-4">
      {f.showcase && <ShowcasePlayer feature={f.showcase} label={`${skill.name}: ${f.title} showcase`} className="w-28 shrink-0 sm:w-32" />}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold text-fg">{f.title}</h4>
          {f.status === 'live' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 px-2 py-0.5 text-[11px] text-success">
              <Check className="h-3 w-3" aria-hidden="true" /> In your edit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-subtle">
              <Clock className="h-3 w-3" aria-hidden="true" /> Preview only
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-fg-muted">{f.what}</p>
      </div>
    </li>
  );
}

function SkillCard({ skill, selected, onSelect }: { skill: EditingSkill; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn('app-focus flex w-full gap-4 rounded-xl border p-4 text-left', selected ? 'border-accent bg-accent-tint' : 'border-line bg-surface hover:bg-surface-raised')}
    >
      <ShowcasePlayer feature={skill.hero} label={`${skill.name} showcase`} className="w-24 shrink-0" />
      <span className="min-w-0">
        <span className="block text-base font-semibold text-fg">{skill.name}</span>
        <span className="mt-1 block text-xs text-fg-subtle">{skill.origin}</span>
        <span className="mt-2 block text-sm text-fg-muted">{skill.tagline}</span>
      </span>
    </button>
  );
}

export default function SkillsEditor() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(SKILLS[0].id);
  const skill = SKILLS.find((s) => s.id === selectedId) ?? SKILLS[0];
  const [usage, setUsage] = useState<EditorUsage | null>(null);
  const [projects, setProjects] = useState<EditProjectSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [inProgressId, setInProgressId] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ name: string; pct: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    try {
      const [u, list] = await Promise.all([getEditorUsage(), listEditProjects('any')]);
      setUsage(u);
      setProjects(list);
      setLoadError(null);
    } catch (err) {
      setLoadError(apiErrorMessage(err, 'Could not load the Skills Editor. Try again.'));
    }
  }, []);

  useEffect(() => {
    track('skills_viewed', {});
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  useEffect(() => {
    if (!projects?.some((p) => IN_PROGRESS.includes(p.status))) return;
    const t = setInterval(() => void listEditProjects('any').then(setProjects).catch(() => {}), 5000);
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
      const { project, upload: target } = await createEditProject(file, skill.id);
      track('skill_edit_started', { skill: skill.id });
      await uploadToStorage(target.url, file, target.headers, (pct) => setUpload({ name: file.name, pct }), controller.signal);
      await confirmEditUpload(project.id);
      navigate(`/skills/${project.id}`);
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
          title="Skills Editor"
          subtitle="Pick an editing skill, upload your raw footage, and the AI edit follows that skill's style. Watch what each skill does before you use it."
          actions={usage ? <UsagePill usage={usage} /> : null}
        />

        {loadError && (
          <p role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">{loadError}</p>
        )}

        <section aria-labelledby="library-heading" className="mb-10">
          <h2 id="library-heading" className="mb-4 text-lg font-semibold text-fg">Skill library</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {SKILLS.map((s) => (
              <SkillCard key={s.id} skill={s} selected={s.id === skill.id} onSelect={() => setSelectedId(s.id)} />
            ))}
            <div className="flex items-center justify-center rounded-xl border border-dashed border-line p-6 text-center text-sm text-fg-subtle">
              More skills are on the way.
            </div>
          </div>
        </section>

        <section aria-labelledby="skill-heading" className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div>
            <ShowcasePlayer feature={skill.hero} label={`${skill.name}: everything together`} className="mx-auto w-full max-w-[320px]" />
            <p className="mt-2 text-center text-xs text-fg-subtle">Sample footage and sample captions.</p>
          </div>
          <div className="min-w-0">
            <h2 id="skill-heading" className="text-xl font-semibold text-fg">{skill.name}</h2>
            <p className="mt-1 text-sm text-fg-muted">{skill.tagline}</p>

            <h3 className="app-label mb-2 mt-6">What it does</h3>
            <ol className="space-y-2">
              {skill.how.map((step, k) => (
                <li key={step} className="flex gap-3 text-sm text-fg">
                  <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-tint text-xs font-semibold text-accent">{k + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <h3 className="app-label mb-2 mt-6">What&rsquo;s in it</h3>
            <ul className="grid gap-3">
              {skill.features.map((f) => <FeatureTile key={f.id} f={f} skill={skill} />)}
            </ul>

            <h3 className="app-label mb-2 mt-6">Rules it edits by</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {skill.rules.map((r) => (
                <div key={r.title} className="rounded-lg border border-line p-3">
                  <dt className="text-sm font-medium text-fg">{r.title}</dt>
                  <dd className="mt-1 text-xs text-fg-muted">{r.what}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs text-fg-subtle">Not in this version yet: {NOT_YET.join(' · ')}.</p>
          </div>
        </section>

        <section aria-labelledby="use-heading" className="mb-10 space-y-4">
          <h2 id="use-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
            <Wand2 className="h-5 w-5 text-accent" aria-hidden="true" />
            Edit a video with {skill.name}
          </h2>
          <FootageDisclaimer />
          {!usage ? (
            <Skeleton className="h-48" />
          ) : !usage.available ? (
            <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">The editor is almost ready. Check back soon.</div>
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
                label={isFreePlan(usage) ? `Drop your raw video here for a free ${skill.name} edit` : `Drop your raw video here for a ${skill.name} edit`}
                hint="A talking-head take works best. MP4, MOV, WebM or MKV. Up to 3 minutes and 500 MB."
                accept={ACCEPT}
              />
              {inProgressId && (
                <Link to={`/skills/${inProgressId}`} className="app-focus inline-block rounded text-sm font-medium text-accent hover:underline">
                  Open the edit in progress
                </Link>
              )}
            </>
          )}
        </section>

        <section aria-labelledby="skill-edits-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2 id="skill-edits-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
              Your skill edits
            </h2>
            <Link to="/editor" className="app-focus rounded text-sm text-fg-muted hover:text-fg hover:underline">Open the classic editor</Link>
          </div>
          {!projects ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : projects.length === 0 ? (
            <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">Edits you make with a skill will show up here.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => <ProjectCard key={p.id} p={p} base="/skills" />)}
            </ul>
          )}
        </section>
      </div>
    </UserPage>
  );
}
