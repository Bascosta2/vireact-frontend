import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BarChart3, BookOpen, Brush, Check, Clock, Film, Gamepad2, GraduationCap, LayoutGrid, Music, Newspaper, Palette, Search, ShoppingBag, Smile, Sparkles, User, Wand2 } from 'lucide-react';
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
import type { StyleCategory } from '@/remotion/styles/covers';
import { FootageDisclaimer } from '../Editor/Disclaimer';
import { ACCEPT, TYPES, LockedCard, ProjectCard, UsagePill } from '../Editor/shared';
import { isFreePlan, resetDate } from '../Editor/usage';
import { SKILLS, skillById, type EditingSkill } from './catalog';
import { ShowcasePlayer, ShowcaseThumbnail } from './ShowcasePlayer';
import { StoryForm } from './StoryForm';

/**
 * Skills Editor: a library of editing skills (each ported from a Claude skill), every one with showcase
 * clips of what it does. Pick a skill, upload raw footage, and the AI edit follows that skill. Same plan
 * limits, upload flow and review page as the Editor.
 *
 * The library is grouped by what each skill is for (a primary category; a skill can also be tagged into
 * other sections): talking heads, looks for any footage, animated storytelling, explainers, data, product,
 * news, retro, 3D and motion, cartoon, gaming, art and print, and music. Chips filter it to one section and
 * a search box finds a skill by name or use. Covers are pre-rendered stills (public/skill-covers); only the
 * selected skill's showcase plays, so the page stays light.
 */

const SECTIONS: { id: StyleCategory; title: string; blurb: string; icon: typeof User }[] = [
  { id: 'talking-head', title: 'For talking-head videos', blurb: 'Made for you on camera: the hook above your head, captions under your chin, graphics around your face.', icon: User },
  { id: 'any-footage', title: 'Looks for any footage', blurb: 'Restyle whatever you filmed or recorded: gameplay, product shots, b-roll, app and screen recordings.', icon: Palette },
  { id: 'storytelling', title: 'Animated storytelling', blurb: 'No camera needed: the style draws a whole animated world and your voice tells the story.', icon: BookOpen },
  { id: 'explainer', title: 'Explainers and diagrams', blurb: 'You in a bubble while the idea is drawn around you: boards, blueprints, maps and machines.', icon: GraduationCap },
  { id: 'data', title: 'Data and numbers', blurb: 'Your numbers become things: coin stacks, pencil charts, spreadsheets and models.', icon: BarChart3 },
  { id: 'product', title: 'Product and ads', blurb: 'Launch films, packshots, teardowns, app demos and screencasts.', icon: ShoppingBag },
  { id: 'news', title: 'News and documentary', blurb: 'On-air packages, investigations, briefings, archives and countdowns.', icon: Newspaper },
  { id: 'retro', title: 'Retro, film and TV', blurb: 'Newsreels, silent film, camcorder tape, terminals, thermal and X-ray cameras.', icon: Film },
  { id: 'motion', title: '3D, neon and motion', blurb: 'Synthwave, neon, holograms, galaxies, glitch, chrome and point clouds.', icon: Sparkles },
  { id: 'cartoon', title: 'Cartoon and characters', blurb: 'Clay, doodles, toons, anime, manga, game shows and a mascot that reacts to you.', icon: Smile },
  { id: 'gaming', title: 'Gaming', blurb: 'Pixel effects, microgames and game-world looks for gameplay and streams.', icon: Gamepad2 },
  { id: 'art', title: 'Art and print', blurb: 'Real media drawn in code: woodcut, risograph, pop art, stained glass, paper-cuts and more.', icon: Brush },
  { id: 'music', title: 'Music and beat', blurb: 'Edits that move with your voice: beat cards, audiograms, kinetic type and city rhythms.', icon: Music },
];

/** What to upload, by how the skill lays out the picture. */
const UPLOAD_HINT = {
  'talking-head': 'A talking-head take works best.',
  'any-footage': 'Any footage works: you on camera, gameplay, a product, b-roll or a screen recording.',
  story: 'Record yourself telling the story: any video works, only your voice is used and the picture is drawn.',
  explainer: 'Record yourself explaining: you stay on screen in a bubble while the scene is drawn around you.',
} as const;

const hintFor = (skill: EditingSkill) =>
  skill.layout === 'story' ? UPLOAD_HINT.story : skill.layout === 'explainer' ? UPLOAD_HINT.explainer : skill.category === 'talking-head' ? UPLOAD_HINT['talking-head'] : UPLOAD_HINT['any-footage'];

/** Skills in a section: its own, then those tagged into it. */
const inSection = (id: StyleCategory) => [...SKILLS.filter((x) => x.category === id), ...SKILLS.filter((x) => x.category !== id && x.tags.includes(id))];

/** A chip's short label ("Talking-head videos", "Gaming"). */
const chipLabel = (title: string) => title.replace(/^For /, '').replace(/^./, (m) => m.toUpperCase());

function FeatureTile({ f, skill }: { f: EditingSkill['features'][number]; skill: EditingSkill }) {
  return (
    <li className="flex gap-4 rounded-xl border border-line bg-surface p-4">
      {f.showcase && <ShowcasePlayer showcase={f.showcase} label={`${skill.name}: ${f.title} showcase`} className="w-28 shrink-0 sm:w-32" />}
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

/** A skill in the library grid: its cover (the skill on the kind of video it is for), name and what it suits. */
function StyleTile({ skill, selected, onSelect }: { skill: EditingSkill; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn('app-focus flex w-full flex-col gap-2 rounded-xl border p-2 text-left', selected ? 'border-accent bg-accent-tint' : 'border-line bg-surface hover:bg-surface-raised')}
    >
      <span className="relative block">
        <ShowcaseThumbnail showcase={skill.hero} className="w-full" />
        <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-md bg-black/65 px-2 py-0.5 text-[11px] font-medium text-white">{skill.shown}</span>
      </span>
      <span className="min-w-0 px-1 pb-1">
        <span className="block text-sm font-semibold text-fg">{skill.name}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs text-fg-muted">{skill.bestFor}</span>
      </span>
    </button>
  );
}

export default function SkillsEditor() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // ?skill=<id> opens the library on that skill (links from elsewhere in the app, shared links).
  const [selectedId, setSelectedId] = useState(() => skillById(params.get('skill'))?.id ?? SKILLS[0].id);
  const skill = SKILLS.find((s) => s.id === selectedId) ?? SKILLS[0];
  const detailRef = useRef<HTMLElement | null>(null);
  const select = (id: EditingSkill['id']) => {
    setSelectedId(id);
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set('skill', id);
      return next;
    }, { replace: true });
    track('skill_selected', { skill: id });
    // On a phone the details are far below the grid: bring them into view.
    detailRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  };
  // Two ways to use a skill: edit an uploaded video, or animate a typed idea (?mode=story).
  const [mode, setMode] = useState<'upload' | 'story'>(() => (params.get('mode') === 'story' ? 'story' : 'upload'));
  const [filter, setFilter] = useState<StyleCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  // A search or a chip shows one flat grid; otherwise the library shows every section.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && filter === 'all') return null;
    const pool = filter === 'all' ? SKILLS : inSection(filter);
    return q ? pool.filter((x) => `${x.name} ${x.bestFor ?? ''} ${x.tagline} ${x.shown}`.toLowerCase().includes(q)) : pool;
  }, [filter, query]);
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="library-heading" className="text-lg font-semibold text-fg">
              Skill library <span className="text-sm font-normal text-fg-subtle">({SKILLS.length} skills)</span>
            </h2>
            <label className="relative w-full sm:w-72">
              <span className="sr-only">Search skills</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: neon, podcast, pixel, blueprint..."
                className="app-focus w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle"
              />
            </label>
          </div>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Skill categories">
            {[{ id: 'all' as const, title: 'All', icon: LayoutGrid }, ...SECTIONS].map((c) => {
              const n = c.id === 'all' ? SKILLS.length : inSection(c.id).length;
              const on = filter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(c.id)}
                  className={cn('app-focus inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium', on ? 'border-accent bg-accent-tint text-fg' : 'border-line bg-surface text-fg-muted hover:bg-surface-raised')}
                >
                  <c.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {chipLabel(c.title)}
                  <span className="text-fg-subtle">{n}</span>
                </button>
              );
            })}
          </div>
          {visible ? (
            visible.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {visible.map((x) => (
                  <StyleTile key={x.id} skill={x} selected={x.id === skill.id} onSelect={() => select(x.id)} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">
                No skill matches &ldquo;{query}&rdquo;. Try a medium (ink, neon, pixel) or a use (podcast, product, history).
              </p>
            )
          ) : SECTIONS.map((sec, k) => (
            <div key={sec.id} className={k ? 'mt-8' : ''}>
              <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                <h3 className="app-label flex items-center gap-2">
                  <sec.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                  {sec.title}
                </h3>
                <p className="text-xs text-fg-subtle">{sec.blurb}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {SKILLS.filter((x) => x.category === sec.id).map((x) => (
                  <StyleTile key={x.id} skill={x} selected={x.id === skill.id} onSelect={() => select(x.id)} />
                ))}
              </div>
            </div>
          ))}
        </section>

        <section ref={detailRef} aria-labelledby="skill-heading" className="mb-10 grid scroll-mt-6 gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div>
            {/* Keyed so switching skills starts the new showcase from its first frame. */}
            <ShowcasePlayer key={skill.id} showcase={skill.hero} label={`${skill.name}: everything together`} className="mx-auto w-full max-w-[320px]" />
            <p className="mt-2 text-center text-xs text-fg-subtle">Sample footage and sample captions.</p>
          </div>
          <div className="min-w-0">
            <h2 id="skill-heading" className="text-xl font-semibold text-fg">{skill.name}</h2>
            <p className="mt-1 text-sm text-fg-muted">{skill.tagline}</p>
            {skill.bestFor && (
              <p className="mt-2 text-sm text-fg">
                <span className="text-fg-subtle">Best for: </span>
                {skill.bestFor}
              </p>
            )}

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

            {skill.notYet && skill.notYet.length > 0 && <p className="mt-6 text-xs text-fg-subtle">Not in this version yet: {skill.notYet.join(' · ')}.</p>}
          </div>
        </section>

        <section aria-labelledby="use-heading" className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="use-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Wand2 className="h-5 w-5 text-accent" aria-hidden="true" />
              {mode === 'story' ? `Animate a story with ${skill.name}` : `Edit a video with ${skill.name}`}
            </h2>
            <div className="inline-flex rounded-lg border border-line p-0.5" role="group" aria-label="How to use this skill">
              {(
                [
                  ['upload', 'Upload a video'],
                  ['story', 'Type an idea'],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => {
                    setMode(m);
                    track('skills_mode_switched', { mode: m });
                  }}
                  className={cn('app-focus rounded-md px-3 py-1.5 text-sm', mode === m ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:text-fg')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {mode === 'upload' && <FootageDisclaimer />}
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
          ) : mode === 'story' ? (
            <StoryForm skill={skill} />
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
                label={`Drop your ${skill.layout === 'story' ? 'narration' : 'raw'} video here for a ${isFreePlan(usage) ? 'free ' : ''}${skill.name} ${skill.layout === 'story' ? 'story' : 'edit'}`}
                hint={`${hintFor(skill)} MP4, MOV, WebM or MKV. Up to 3 minutes and 500 MB.`}
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
