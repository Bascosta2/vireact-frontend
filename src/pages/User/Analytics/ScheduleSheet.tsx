import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { apiErrorField, apiErrorMessage } from '@/api/analytics';
import { getEditProject, listEditProjects, type EditProjectSummary } from '@/api/editor';
import {
  cancelScheduledPost,
  createScheduledPost,
  getTikTokCreatorInfo,
  updateScheduledPost,
  type PostCapabilities,
  type TikTokCreatorInfo,
  type PostMode,
  type PublishPlatform,
  type ScheduledPost,
} from '@/api/posts';
import { Button, IconButton } from '@/components/app/Button';
import { Select } from '@/components/app/Select';
import { Skeleton } from '@/components/app/Skeleton';
import { cleanVideoTitle } from '@/lib/video-file';
import {
  CAPTION_MAX,
  EMPTY_TIKTOK_FORM,
  TIKTOK_BRANDED_POLICY_URL,
  TIKTOK_MUSIC_URL,
  TIKTOK_DISCLOSURE_PROMPT,
  TIKTOK_SELF_ONLY,
  buildTikTokSettings,
  dateKeyInZone,
  dayHeading,
  defaultScheduleTime,
  isPostEditable,
  platformChoices,
  resolvedScheduleLabel,
  tiktokDurationWarning,
  tiktokFieldForServerField,
  tiktokFormFromSettings,
  tiktokNeedsDisclosureChoice,
  tiktokPrivacyChoices,
  tiktokPrivacyLabel,
  timeInZone,
  validateScheduleForm,
  validateTikTokForm,
  zonedToUtcIso,
  type TikTokErrors,
  type TikTokFormValues,
} from './schedule';

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

interface TikTokSectionProps {
  uid: string;
  loading: boolean;
  loadError: string | null;
  info: TikTokCreatorInfo | null;
  values: TikTokFormValues;
  errors: TikTokErrors;
  previewUrl: string | null;
  posterUrl: string | null;
  durationWarning: string | null;
  onToggle: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrivacy: (e: ChangeEvent<HTMLSelectElement>) => void;
  onRetry: () => void;
}

/** TikTok's required posting screen (content sharing guidelines): account, visibility, interactions, disclosure, preview. */
function TikTokSection({ uid, loading, loadError, info, values, errors, previewUrl, posterUrl, durationWarning, onToggle, onPrivacy, onRetry }: TikTokSectionProps) {
  const privacyChoices = useMemo(() => tiktokPrivacyChoices(info?.privacyLevelOptions ?? [], values.disclose && values.brandedContent), [info, values.disclose, values.brandedContent]);

  const blockedReason = privacyChoices.find((c) => c.disabled)?.reason;
  const storedInvalid = Boolean(values.privacyLevel) && !privacyChoices.some((c) => c.value === values.privacyLevel);
  const needsChoice = tiktokNeedsDisclosureChoice(values);

  if (loading) {
    return (
      <section aria-label="TikTok settings" aria-busy="true">
        <Skeleton className="h-24" />
      </section>
    );
  }
  if (loadError || !info) {
    return (
      <section aria-label="TikTok settings" className="rounded-lg border border-line p-3">
        <p role="alert" className="text-sm text-danger">
          {loadError ?? 'Could not load your TikTok account details.'}
        </p>
        <Button size="sm" variant="ghost" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      </section>
    );
  }
  if (!info.canPost) {
    return (
      <section aria-label="TikTok settings" className="rounded-lg border border-line p-3">
        <p role="alert" className="text-sm text-danger">
          {info.reason || 'This TikTok account cannot post right now. Try again later.'}
        </p>
      </section>
    );
  }

  const interactions = [
    { name: 'allowComment', label: 'Comment', off: info.commentDisabled, why: 'Comments are turned off in your TikTok settings.' },
    { name: 'allowDuet', label: 'Duet', off: info.duetDisabled, why: 'Duet is turned off in your TikTok settings.' },
    { name: 'allowStitch', label: 'Stitch', off: info.stitchDisabled, why: 'Stitch is turned off in your TikTok settings.' },
  ] as const;

  return (
    <section aria-label="TikTok settings" className="space-y-4 rounded-lg border border-line p-3">
      <div className="flex items-center gap-3">
        {info.avatarUrl && <img src={info.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
        <p className="min-w-0 truncate text-sm text-fg">
          <span className="text-fg-muted">Posting to TikTok as </span>
          <span className="font-medium">{info.nickname || 'your account'}</span>
        </p>
      </div>

      {previewUrl ? (
        <video src={previewUrl} poster={posterUrl ?? undefined} controls preload="metadata" aria-label="Preview of the video you are posting" className="max-h-64 w-full rounded-lg bg-black" />
      ) : (
        <p className="text-xs text-fg-subtle">Video preview is not available for this edit.</p>
      )}
      {durationWarning && (
        <p role="alert" className="text-sm text-warning">
          {durationWarning}
        </p>
      )}

      <div>
        <label htmlFor={`${uid}-tt-privacy`} className="block text-sm font-medium text-fg">
          Who can view this video
        </label>
        <select
          id={`${uid}-tt-privacy`}
          value={values.privacyLevel}
          onChange={onPrivacy}
          required
          aria-invalid={Boolean(errors.privacy)}
          aria-describedby={[errors.privacy ? `${uid}-tt-privacy-err` : '', blockedReason ? `${uid}-tt-privacy-why` : ''].filter(Boolean).join(' ') || undefined}
          className={`${INPUT} mt-2`}
        >
          <option value="">Select who can view</option>
          {storedInvalid && (
            <option value={values.privacyLevel} disabled>
              {tiktokPrivacyLabel(values.privacyLevel)} (no longer available, choose another)
            </option>
          )}
          {privacyChoices.map((c) => (
            <option key={c.value} value={c.value} disabled={c.disabled} title={c.reason}>
              {c.label}
              {c.disabled ? ' (not available for branded content)' : ''}
            </option>
          ))}
        </select>
        {blockedReason && (
          <p id={`${uid}-tt-privacy-why`} className="mt-1 text-xs text-fg-muted">
            &ldquo;Only me&rdquo; is unavailable: {blockedReason}
          </p>
        )}
        {errors.privacy && (
          <p id={`${uid}-tt-privacy-err`} role="alert" className="mt-1 text-sm text-danger">
            {errors.privacy}
          </p>
        )}
      </div>

      <fieldset aria-describedby={errors.interactions ? `${uid}-tt-int-err` : undefined}>
        <legend className="text-sm font-medium text-fg">Allow users to</legend>
        <div className="mt-2 space-y-2">
          {interactions.map((i) => (
            <label key={i.name} className={`flex items-start gap-3 text-sm text-fg ${i.off ? 'opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                name={i.name}
                checked={values[i.name] && !i.off}
                disabled={i.off}
                onChange={onToggle}
                aria-describedby={i.off ? `${uid}-tt-${i.name}-why` : undefined}
                className="app-focus mt-0.5 h-4 w-4 accent-[var(--app-accent)]"
              />
              <span className="min-w-0">
                {i.label}
                {i.off && (
                  <span id={`${uid}-tt-${i.name}-why`} className="block text-xs text-fg-muted">
                    {i.why}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        {errors.interactions && (
          <p id={`${uid}-tt-int-err`} role="alert" className="mt-1 text-sm text-danger">
            {errors.interactions}
          </p>
        )}
      </fieldset>

      <fieldset aria-describedby={needsChoice || errors.commercial ? `${uid}-tt-com-err` : undefined}>
        <legend className="text-sm font-medium text-fg">Disclose video content</legend>
        <label className="mt-2 flex cursor-pointer items-start gap-3 text-sm text-fg">
          <input type="checkbox" name="disclose" checked={values.disclose} onChange={onToggle} aria-describedby={`${uid}-tt-disclose-hint`} className="app-focus mt-0.5 h-4 w-4 accent-[var(--app-accent)]" />
          <span id={`${uid}-tt-disclose-hint`} className="min-w-0 text-xs text-fg-muted">
            Turn on to disclose that this video promotes goods or services in exchange for something of value.
          </span>
        </label>
        {values.disclose && (
          <div className="mt-3 space-y-2 border-l border-line pl-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-fg">
              <input type="checkbox" name="yourBrand" checked={values.yourBrand} onChange={onToggle} aria-describedby={`${uid}-tt-brand-hint`} className="app-focus mt-0.5 h-4 w-4 accent-[var(--app-accent)]" />
              <span className="min-w-0">
                Your brand
                <span id={`${uid}-tt-brand-hint`} className="block text-xs text-fg-muted">
                  Your photo/video will be labeled as &lsquo;Promotional content&rsquo;
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm text-fg">
              <input type="checkbox" name="brandedContent" checked={values.brandedContent} onChange={onToggle} aria-describedby={`${uid}-tt-bc-hint`} className="app-focus mt-0.5 h-4 w-4 accent-[var(--app-accent)]" />
              <span className="min-w-0">
                Branded content
                <span id={`${uid}-tt-bc-hint`} className="block text-xs text-fg-muted">
                  Your photo/video will be labeled as &lsquo;Paid partnership&rsquo;
                </span>
              </span>
            </label>
          </div>
        )}
        {(needsChoice || errors.commercial) && (
          <p id={`${uid}-tt-com-err`} role={errors.commercial ? 'alert' : undefined} className={`mt-1 text-sm ${errors.commercial ? 'text-danger' : 'text-fg-muted'}`}>
            {errors.commercial ?? TIKTOK_DISCLOSURE_PROMPT}
          </p>
        )}
      </fieldset>

      <p className="text-xs text-fg-subtle">After you post, it can take a few minutes for the video to finish processing and show on your profile.</p>
      {errors.general && (
        <p role="alert" className="text-sm text-danger">
          {errors.general}
        </p>
      )}
    </section>
  );
}

/**
 * "Schedule post" sheet: pick an exported edit, write the caption, choose platforms (ones that can't be
 * used say why), set the date and time in the creator's time zone, and post or send as a draft. Opened on
 * an existing post it reschedules or cancels it.
 */
export function ScheduleSheet({ open, draft, timeZone, capabilities, onClose, onSaved }: ScheduleSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const editing = draft?.post ?? null;

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
  const [tiktok, setTiktok] = useState<TikTokFormValues>(EMPTY_TIKTOK_FORM);
  const [tiktokInfo, setTiktokInfo] = useState<TikTokCreatorInfo | null>(null);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [tiktokLoadError, setTiktokLoadError] = useState<string | null>(null);
  const [tiktokErrors, setTiktokErrors] = useState<TikTokErrors>({});
  const [tiktokReload, setTiktokReload] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const tiktokActive = mode === 'publish' && platforms.includes('tiktok') && !(editing && !isPostEditable(editing, Date.now()));
  const choices = useMemo(
    () =>
      platformChoices(capabilities).map((c) =>
        c.platform === 'tiktok' && mode === 'publish' && tiktokInfo && !tiktokInfo.canPost
          ? { ...c, disabled: true, reason: tiktokInfo.reason || 'TikTok cannot post for this account right now.' }
          : c
      ),
    [capabilities, mode, tiktokInfo]
  );

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
    setTiktok(EMPTY_TIKTOK_FORM);
    setTiktokErrors({});
    if (editing) {
      setProjectId(editing.projectId ?? '');
      setCaption(editing.caption);
      setPlatforms(editing.targets.map((t) => t.platform));
      setDate(dateKeyInZone(editing.scheduledAt, timeZone));
      setTime(timeInZone(editing.scheduledAt, timeZone));
      setMode(editing.mode);
      setTiktok(tiktokFormFromSettings(editing.targets.find((t) => t.platform === 'tiktok')?.tiktok));
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

  // TikTok requires fresh creator info every time the posting screen is shown.
  useEffect(() => {
    if (!open || !tiktokActive) return;
    let cancelled = false;
    setTiktokLoading(true);
    setTiktokLoadError(null);
    setTiktokInfo(null);
    getTikTokCreatorInfo()
      .then((info) => {
        if (cancelled) return;
        setTiktokInfo(info);
        setTiktok((v) => ({ ...v, allowComment: v.allowComment && !info.commentDisabled, allowDuet: v.allowDuet && !info.duetDisabled, allowStitch: v.allowStitch && !info.stitchDisabled }));
      })
      .catch((err) => {
        if (!cancelled) setTiktokLoadError(apiErrorMessage(err, 'Could not load your TikTok account details. Try again.'));
      })
      .finally(() => !cancelled && setTiktokLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, tiktokActive, tiktokReload]);

  // Video preview for the TikTok section (latest finished render of the chosen edit).
  useEffect(() => {
    setPreviewUrl(null);
    if (!open || !tiktokActive || !projectId) return;
    let cancelled = false;
    getEditProject(projectId)
      .then((detail) => {
        if (cancelled) return;
        const done = [...detail.renders].reverse().find((r) => r.status === 'done' && r.downloadUrl);
        setPreviewUrl(done?.downloadUrl ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, tiktokActive, projectId]);

  const selectedProject = useMemo(() => projects?.find((p) => p.id === projectId) ?? null, [projects, projectId]);
  const durationWarning = useMemo(
    () => (tiktokInfo ? tiktokDurationWarning(selectedProject?.editedDurationSec ?? selectedProject?.durationSec, tiktokInfo.maxVideoPostDurationSec) : null),
    [selectedProject, tiktokInfo]
  );

  const projectOptions = useMemo(
    () => {
      const list = (projects ?? []).map((p) => ({ value: p.id, label: cleanVideoTitle(p.title) }));
      if (projectId && !list.some((o) => o.value === projectId)) list.unshift({ value: projectId, label: 'Selected edit' });
      return [{ value: '', label: 'Pick an exported edit' }, ...list];
    },
    [projects, projectId]
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
  const handleTikTokToggle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTiktokErrors({});
    setTiktok((v) => {
      const next = { ...v, [name]: checked };
      if (name === 'disclose' && !checked) return { ...next, yourBrand: false, brandedContent: false };
      // Branded content can't be private, so clear "Only me" rather than leave a hidden conflict.
      if (name === 'brandedContent' && checked && v.privacyLevel === TIKTOK_SELF_ONLY) return { ...next, privacyLevel: '' };
      return next;
    });
  }, []);
  const handleTikTokPrivacy = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setTiktokErrors({});
    setTiktok((v) => ({ ...v, privacyLevel: e.target.value }));
  }, []);
  const handleTikTokRetry = useCallback(() => setTiktokReload((n) => n + 1), []);
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
      if (tiktokActive) {
        const problems = validateTikTokForm(tiktok, tiktokInfo);
        setTiktokErrors(problems);
        if (Object.keys(problems).length) return;
      }
      setBusy(true);
      setError(null);
      try {
        const post = editing
          ? await updateScheduledPost(editing.id, { caption, scheduledAt, platforms, ...(tiktokActive ? { tiktok: buildTikTokSettings(tiktok) } : {}) })
          : await createScheduledPost({ projectId, caption, platforms, scheduledAt, mode, ...(tiktokActive ? { tiktok: buildTikTokSettings(tiktok) } : {}) });
        onSaved(post, `${editing ? 'Rescheduled' : mode === 'draft' ? 'Draft scheduled' : 'Scheduled'} for ${resolvedScheduleLabel(date, time, timeZone) ?? `${dayHeading(date)} at ${time}`}.`);
      } catch (err) {
        const message = apiErrorMessage(err, editing ? 'Could not save your changes. Try again.' : 'Could not schedule this post. Try again.');
        const field = tiktokActive ? tiktokFieldForServerField(apiErrorField(err)) : 'general';
        if (field === 'general') setError(message);
        else setTiktokErrors({ [field]: message });
      } finally {
        setBusy(false);
      }
    },
    [projectId, caption, platforms, date, time, editing, choices, timeZone, mode, onSaved, tiktokActive, tiktok, tiktokInfo]
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
  const resolved = resolvedScheduleLabel(date, time, timeZone);
  const typed = date && time ? `${dayHeading(date)} at ${time.padStart(5, '0')}` : null;
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
              <label htmlFor={`${uid}-project`} className="block text-sm font-medium text-fg">
                Video
              </label>
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
            <p className="mt-1 text-xs text-fg-subtle">
              Times are in {timeZone}.
              {resolved && resolved !== typed && <span className="block text-fg-muted"> That time doesn’t exist that day (clocks change), so it will go out at {resolved}.</span>}
            </p>
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

          {tiktokActive && (
            <TikTokSection
              uid={uid}
              loading={tiktokLoading}
              loadError={tiktokLoadError}
              info={tiktokInfo}
              values={tiktok}
              errors={tiktokErrors}
              previewUrl={previewUrl}
              posterUrl={selectedProject?.thumbnailUrl ?? null}
              durationWarning={durationWarning}
              onToggle={handleTikTokToggle}
              onPrivacy={handleTikTokPrivacy}
              onRetry={handleTikTokRetry}
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-line p-5">
          {tiktokActive && !locked && (
            <p className="basis-full text-xs text-fg-muted">
              By posting, you agree to TikTok&rsquo;s{' '}
              {tiktok.disclose && tiktok.brandedContent && (
                <>
                  <a href={TIKTOK_BRANDED_POLICY_URL} target="_blank" rel="noopener noreferrer" className="app-focus rounded font-medium text-accent hover:underline">
                    Branded Content Policy
                  </a>{' '}
                  and{' '}
                </>
              )}
              <a href={TIKTOK_MUSIC_URL} target="_blank" rel="noopener noreferrer" className="app-focus rounded font-medium text-accent hover:underline">
                Music Usage Confirmation
              </a>
              .
            </p>
          )}
          {!locked && (
            <Button type="submit" disabled={busy || (!editing && !projects?.length) || (tiktokActive && (tiktokLoading || tiktokNeedsDisclosureChoice(tiktok)))}>
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
