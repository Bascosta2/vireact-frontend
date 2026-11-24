import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { apiErrorMessage } from '@/api/analytics';
import { listEditProjects, type EditProjectSummary } from '@/api/editor';
import {
  cancelScheduledPost,
  createScheduledPost,
  updateScheduledPost,
  type PostCapabilities,
  type PostMode,
  type PublishPlatform,
  type ScheduledPost,
} from '@/api/posts';
import { Button, IconButton } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { cleanVideoTitle } from '@/lib/video-file';
import { CAPTION_MAX, dateKeyInZone, dayHeading, defaultScheduleTime, isPostEditable, platformChoices, timeInZone, validateScheduleForm, zonedToUtcIso } from './schedule';

/** What the sheet opens with: an existing post to edit, or values for a new one (platforms already filtered to usable ones). */
export interface ScheduleDraft {
  post?: ScheduledPost;
  projectId?: string;
  caption?: string;
  platforms?: PublishPlatform[];
  date?: string;
  time?: string;
}

interface ScheduleSheetProps {
  open: boolean;
  draft: ScheduleDraft | null;
  timeZone: string;
  capabilities: PostCapabilities | null;
  onClose: () => void;
  onSaved: (post: ScheduledPost, message: string) => void;
}

const INPUT = 'app-focus h-10 w-full min-w-0 rounded-lg border border-line bg-canvas px-3 text-base text-fg placeholder:text-fg-subtle md:text-sm';

const MODE_OPTIONS: { value: PostMode; label: string; hint: string }[] = [
  { value: 'publish', label: 'Post it for me', hint: 'Goes live on each platform at the time you pick.' },
  { value: 'draft', label: 'Send as a draft', hint: 'Lands in the app’s drafts or inbox at that time, so you add sounds and press post yourself.' },
];

/**
 * "Schedule post" sheet: pick an exported edit, write the caption, choose platforms (ones that can't be
 * used say why), set the date and time in the creator's time zone, and post or send as a draft. Opened on
 * an existing post it reschedules or cancels it.
 */
export function ScheduleSheet({ open, draft, timeZone, capabilities, onClose, onSaved }: ScheduleSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const editing = draft?.post ?? null;
  const choices = useMemo(() => platformChoices(capabilities), [capabilities]);

  const [projects, setProjects] = useState<EditProjectSummary[] | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('');
  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<PublishPlatform[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<PostMode>('publish');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Reset the form each time the sheet opens.
  useEffect(() => {
    if (!open) return;
    const fallback = defaultScheduleTime(Date.now(), timeZone);
    setError(null);
    setConfirmCancel(false);
    setBusy(false);
    if (editing) {
      setProjectId(editing.projectId ?? '');
      setCaption(editing.caption);
      setPlatforms(editing.targets.map((t) => t.platform));
      setDate(dateKeyInZone(editing.scheduledAt, timeZone));
      setTime(timeInZone(editing.scheduledAt, timeZone));
      setMode(editing.mode);
      return;
    }
    setProjectId(draft?.projectId ?? '');
    setCaption(draft?.caption ?? '');
    setPlatforms(draft?.platforms ?? []);
    setDate(draft?.date ?? fallback.date);
    setTime(draft?.time ?? fallback.time);
    setMode('publish');
  }, [open, draft, editing, timeZone]);

  // Exported edits to pick from (new posts only).
  useEffect(() => {
    if (!open || editing) return;
    let cancelled = false;
    setProjectsError(null);
    listEditProjects()
      .then((list) => !cancelled && setProjects(list.filter((p) => p.hasRender)))
      .catch((err) => {
        if (cancelled) return;
        setProjects([]);
        setProjectsError(apiErrorMessage(err, 'Could not load your edits. Try again.'));
      });
    return () => {
      cancelled = true;
    };
  }, [open, editing]);

  const projectOptions = useMemo(
    () => [{ value: '', label: 'Pick an exported edit' }, ...(projects ?? []).map((p) => ({ value: p.id, label: cleanVideoTitle(p.title) }))],
    [projects]
  );

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose();
    },
    [onClose]
  );

  const handleCaption = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => setCaption(e.target.value), []);
  const handleDate = useCallback((e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value), []);
  const handleTime = useCallback((e: ChangeEvent<HTMLInputElement>) => setTime(e.target.value), []);
  const handleMode = useCallback((e: ChangeEvent<HTMLInputElement>) => setMode(e.target.value as PostMode), []);
  const handlePlatform = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const platform = e.target.value as PublishPlatform;
    const { checked } = e.target;
    setPlatforms((list) => (checked ? [...new Set([...list, platform])] : list.filter((p) => p !== platform)));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const problem = validateScheduleForm({ projectId, caption, platforms, date, time, editing: Boolean(editing) }, choices, Date.now(), timeZone);
      if (problem) {
        setError(problem);
        return;
      }
      const scheduledAt = zonedToUtcIso(date, time, timeZone);
      if (!scheduledAt) return;
      setBusy(true);
      setError(null);
      try {
        const post = editing
          ? await updateScheduledPost(editing.id, { caption, scheduledAt, platforms })
          : await createScheduledPost({ projectId, caption, platforms, scheduledAt, mode });
        onSaved(post, `${editing ? 'Rescheduled' : mode === 'draft' ? 'Draft scheduled' : 'Scheduled'} for ${dayHeading(date)} at ${time}.`);
      } catch (err) {
        setError(apiErrorMessage(err, editing ? 'Could not save your changes. Try again.' : 'Could not schedule this post. Try again.'));
      } finally {
        setBusy(false);
      }
    },
    [projectId, caption, platforms, date, time, editing, choices, timeZone, mode, onSaved]
  );

  const handleSubmitEvent = useCallback((e: FormEvent) => void handleSubmit(e), [handleSubmit]);
  const handleAskCancel = useCallback(() => setConfirmCancel(true), []);
  const handleKeepPost = useCallback(() => setConfirmCancel(false), []);

  const handleCancelPost = useCallback(async () => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      const post = await cancelScheduledPost(editing.id);
      onSaved(post, 'Post cancelled. Nothing will be published.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not cancel this post. Try again.'));
    } finally {
      setBusy(false);
    }
  }, [editing, onSaved]);

  const handleCancelPostClick = useCallback(() => void handleCancelPost(), [handleCancelPost]);

  const locked = Boolean(editing && !isPostEditable(editing, Date.now()));
  const noUsablePlatform = choices.every((c) => c.disabled);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${uid}-title`}
      onClose={onClose}
      onClick={handleBackdropClick}
      className="mx-0 mt-auto mb-0 max-h-[92vh] w-full max-w-none rounded-t-2xl border border-line bg-surface p-0 text-fg backdrop:bg-black/70 sm:m-auto sm:mr-0 sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none sm:rounded-l-2xl"
    >
      <form onSubmit={handleSubmitEvent} noValidate className="flex max-h-[92vh] flex-col sm:h-full sm:max-h-none">
        <header className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div className="min-w-0">
            <p className="app-label">{editing ? 'Scheduled post' : 'New post'}</p>
            <h2 id={`${uid}-title`} className="mt-1 text-lg font-semibold text-fg">
              {editing ? 'Reschedule or cancel' : 'Schedule post'}
            </h2>
          </div>
          <IconButton aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {locked && (
            <p className="rounded-lg border border-line bg-white/[0.03] p-3 text-sm text-fg-muted">
              This post is already going out or done, so it can’t be changed here.
            </p>
          )}

          {!editing && (
            <div>
              <p id={`${uid}-project-label`} className="text-sm font-medium text-fg">
                Video
              </p>
              {projects == null ? (
                <Skeleton className="mt-2 h-11" />
              ) : projects.length === 0 ? (
                <p className="mt-1 text-sm text-fg-muted">
                  {projectsError ?? 'Export an edit first, then come back to schedule it.'}{' '}
                  <Link to="/editor" className="app-focus rounded font-medium text-accent hover:underline">
                    Open the editor
                  </Link>
                </p>
              ) : (
                <Select id={`${uid}-project`} label="Exported edit to post" value={projectId} options={projectOptions} onChange={setProjectId} className="mt-2 w-full sm:w-full" />
              )}
            </div>
          )}

          <div>
            <label htmlFor={`${uid}-caption`} className="text-sm font-medium text-fg">
              Caption
            </label>
            <textarea
              id={`${uid}-caption`}
              value={caption}
              onChange={handleCaption}
              disabled={locked}
              rows={4}
              maxLength={CAPTION_MAX}
              aria-describedby={`${uid}-caption-count`}
              className="app-focus mt-2 w-full min-w-0 resize-y rounded-lg border border-line bg-canvas px-3 py-2 text-base text-fg placeholder:text-fg-subtle md:text-sm"
              placeholder="What you’d write under the video, with hashtags"
            />
            <p id={`${uid}-caption-count`} className="tabular mt-1 text-right text-xs text-fg-subtle">
              {caption.length.toLocaleString()} / {CAPTION_MAX.toLocaleString()}
            </p>
          </div>

          <fieldset disabled={locked}>
            <legend className="text-sm font-medium text-fg">Post to</legend>
            {noUsablePlatform && (
              <p className="mt-1 text-sm text-fg-muted">
                No platform is ready to post to yet.{' '}
                <Link to="/accounts" className="app-focus rounded font-medium text-accent hover:underline">
                  Connect an account
                </Link>
              </p>
            )}
            <ul className="mt-2 space-y-2">
              {choices.map((c) => {
                const checked = platforms.includes(c.platform);
                // An existing post may target a platform that has since become unavailable; let it be unticked.
                const disabled = c.disabled && !checked;
                return (
                  <li key={c.platform}>
                    <label className={`flex items-start gap-3 rounded-lg border border-line p-3 ${disabled ? 'opacity-60' : 'cursor-pointer hover:bg-white/[0.03]'}`}>
                      <input
                        type="checkbox"
                        value={c.platform}
                        checked={checked}
                        disabled={disabled}
                        onChange={handlePlatform}
                        aria-describedby={c.reason ? `${uid}-${c.platform}-why` : undefined}
                        className="app-focus mt-0.5 h-4 w-4 accent-[var(--app-accent)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm text-fg">{c.label}</span>
                        {c.reason && (
                          <span id={`${uid}-${c.platform}-why`} className="block text-xs text-fg-muted">
                            {c.reason}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <fieldset disabled={locked}>
            <legend className="text-sm font-medium text-fg">When</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="block text-xs text-fg-muted">
                Date
                <input type="date" value={date} onChange={handleDate} required className={`${INPUT} mt-1`} />
              </label>
              <label className="block text-xs text-fg-muted">
                Time
                <input type="time" value={time} onChange={handleTime} required step={60} className={`${INPUT} mt-1`} />
              </label>
            </div>
            <p className="mt-1 text-xs text-fg-subtle">Times are in {timeZone}.</p>
          </fieldset>

          <fieldset disabled={Boolean(editing)}>
            <legend className="text-sm font-medium text-fg">How</legend>
            <div className="mt-2 space-y-2">
              {MODE_OPTIONS.map((m) => (
                <label key={m.value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 hover:bg-white/[0.03]">
                  <input
                    type="radio"
                    name={`${uid}-mode`}
                    value={m.value}
                    checked={mode === m.value}
                    onChange={handleMode}
                    aria-describedby={`${uid}-mode-${m.value}`}
                    className="app-focus mt-0.5 h-4 w-4 accent-[var(--app-accent)]"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-fg">{m.label}</span>
                    <span id={`${uid}-mode-${m.value}`} className="block text-xs text-fg-muted">
                      {m.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {editing && <p className="mt-1 text-xs text-fg-subtle">To switch between posting and drafts, cancel this one and schedule it again.</p>}
          </fieldset>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-line p-5">
          {!locked && (
            <Button type="submit" disabled={busy || (!editing && !projects?.length)}>
              {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
              {editing ? 'Save changes' : mode === 'draft' ? 'Schedule draft' : 'Schedule post'}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {editing && !locked && (
            <div className="ml-auto flex items-center gap-2">
              {confirmCancel ? (
                <>
                  <span className="text-sm text-fg-muted">Cancel it?</span>
                  <Button size="sm" variant="danger" onClick={handleCancelPostClick} disabled={busy}>
                    Yes, cancel
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleKeepPost}>
                    Keep
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="danger" onClick={handleAskCancel} disabled={busy}>
                  Cancel post
                </Button>
              )}
            </div>
          )}
        </footer>
      </form>
    </dialog>
  );
}
