import type { StrategySlot } from '@/api/analytics';
import type { PlatformCapability, PostCapabilities, PostStatus, PublishPlatform, ScheduledPost, TikTokCreatorInfo, TikTokPostSettings } from '@/api/posts';
import { PLATFORM_LABELS } from './labels';

/**
 * Pure logic for the posting calendar (ScheduleView): time zones, week bucketing, matching planned
 * Strategy slots with scheduled posts, capability gating and plain-English status copy.
 * Dates are 'YYYY-MM-DD' keys in the creator's time zone; instants are ISO strings.
 */

export const PUBLISH_PLATFORMS: PublishPlatform[] = ['tiktok', 'instagram', 'youtube', 'facebook'];

/** Longest caption every platform accepts (TikTok and Instagram stop at 2,200 characters). */
export const CAPTION_MAX = 2200;

/** A post can be scheduled no sooner than this from now, so the server has time to pick it up. */
export const MIN_LEAD_MS = 5 * 60_000;

/** A post this close to a planned slot (same day and platform) fills that slot. */
export const SLOT_MATCH_WINDOW_MS = 90 * 60_000;

// ── Platform choices ──────────────────────────────────────────────────────────

const REASON_COPY: Record<string, (name: string) => string> = {
  not_connected: (name) => `Connect your ${name} account on the Accounts page first.`,
  needs_reauth: (name) => `Your ${name} connection expired. Reconnect it on the Accounts page.`,
  reauth_required: (name) => `Your ${name} connection expired. Reconnect it on the Accounts page.`,
  missing_scope: (name) => `Reconnect ${name} and allow posting when it asks.`,
  not_configured: (name) => `Posting to ${name} isn't switched on yet.`,
  not_enabled: (name) => `Posting to ${name} isn't switched on yet.`,
  pending_review: (name) => `${name} is still reviewing our app, so posting isn't open yet.`,
  app_review: (name) => `${name} is still reviewing our app, so posting isn't open yet.`,
  unsupported: (name) => `${name} doesn't let apps post this kind of video.`,
  business_account_required: (name) => `${name} only lets apps post to business or creator accounts.`,
};

export const platformName = (platform: string): string => PLATFORM_LABELS[platform] ?? platform;

/** Plain-English reason a platform can't be picked, or null when it can. */
export const capabilityReason = (cap: PlatformCapability | undefined, platform: PublishPlatform): string | null => {
  const name = platformName(platform);
  if (!cap) return `Posting to ${name} isn't available yet.`;
  if (cap.connected && cap.canPublish) return null;
  const code = cap.reason?.trim();
  if (code && REASON_COPY[code.toLowerCase()]) return REASON_COPY[code.toLowerCase()](name);
  // The server may already send a sentence; show it as-is when it reads like one.
  if (code && /\s/.test(code)) return code;
  if (!cap.connected) return REASON_COPY.not_connected(name);
  return `Posting to ${name} isn't available for your account yet.`;
};

export interface PlatformChoice {
  platform: PublishPlatform;
  label: string;
  disabled: boolean;
  reason: string | null;
}

/** Every publishable platform, in a fixed order, with why it's disabled when it is. */
export const platformChoices = (caps: PostCapabilities | null | undefined): PlatformChoice[] =>
  PUBLISH_PLATFORMS.map((platform) => {
    const reason = capabilityReason(
      caps?.platforms.find((p) => p.platform === platform),
      platform
    );
    return { platform, label: platformName(platform), disabled: reason !== null, reason };
  });

// ── Time zones ────────────────────────────────────────────────────────────────

export const browserTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/** The zone to show and enter times in: the plan's, then the saved profile's, then the browser's. */
export const scheduleTimeZone = (...candidates: (string | null | undefined)[]): string => {
  for (const tz of candidates) {
    if (!tz) continue;
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return tz;
    } catch {
      // Unknown zone; try the next one.
    }
  }
  return browserTimeZone();
};

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
const zonedParts = (ms: number, tz: string): ZonedParts => {
  let fmt = formatters.get(tz);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(tz, fmt);
  }
  const parts: Record<string, number> = {};
  for (const p of fmt.formatToParts(new Date(ms))) if (p.type !== 'literal') parts[p.type] = Number(p.value);
  return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour % 24, minute: parts.minute, second: parts.second };
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Offset of `tz` from UTC at that instant, in ms (positive east of Greenwich). */
const zoneOffsetMs = (ms: number, tz: string): number => {
  const p = zonedParts(ms, tz);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - (ms - (ms % 1000));
};

/** 'YYYY-MM-DD' of an instant in `tz`. */
export const dateKeyInZone = (iso: string | number | Date, tz: string): string => {
  const p = zonedParts(new Date(iso).getTime(), tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

/** 'HH:mm' (24 h) of an instant in `tz`. */
export const timeInZone = (iso: string | number | Date, tz: string): string => {
  const p = zonedParts(new Date(iso).getTime(), tz);
  return `${pad(p.hour)}:${pad(p.minute)}`;
};

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

/** Wall-clock date and time in `tz` -> ISO instant, or null when either is malformed. */
export const zonedToUtcIso = (date: string, time: string, tz: string): string | null => {
  const d = DATE_RE.exec(date);
  const t = TIME_RE.exec(time);
  if (!d || !t) return null;
  const [y, mo, da, h, mi] = [Number(d[1]), Number(d[2]), Number(d[3]), Number(t[1]), Number(t[2])];
  if (mo < 1 || mo > 12 || da < 1 || da > 31 || h > 23 || mi > 59) return null;
  const wall = Date.UTC(y, mo - 1, da, h, mi);
  // Two passes settle the offset across a daylight-saving change.
  let ms = wall - zoneOffsetMs(wall, tz);
  ms = wall - zoneOffsetMs(ms, tz);
  return new Date(ms).toISOString();
};

/** Add days to a 'YYYY-MM-DD' key (calendar arithmetic, no time zone involved). */
export const addDays = (key: string, days: number): string => {
  const m = DATE_RE.exec(key);
  if (!m) return key;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/** Day of week of a date key, 0 = Sunday. */
export const weekdayOf = (key: string): number => {
  const m = DATE_RE.exec(key);
  if (!m) return 0;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
};

/** The Sunday that starts the week holding `key`. */
export const startOfWeek = (key: string): string => addDays(key, -weekdayOf(key));

/** 'Tue, Nov 24' for a date key (formatted as a calendar date, so no zone shift). */
export const dayHeading = (key: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string => {
  const m = DATE_RE.exec(key);
  if (!m) return key;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12)).toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' });
};

/** The 7 date keys of the week starting at `start`. */
export const weekDays = (start: string): string[] => Array.from({ length: 7 }, (_, i) => addDays(start, i));

/** UTC range of a week in `tz`, for GET /posts?from&to (`to` exclusive). */
export const weekRange = (start: string, tz: string): { from: string; to: string } => ({
  from: zonedToUtcIso(start, '00:00', tz) ?? `${start}T00:00:00.000Z`,
  to: zonedToUtcIso(addDays(start, 7), '00:00', tz) ?? `${addDays(start, 7)}T00:00:00.000Z`,
});

/** Next half hour at least an hour from now, as { date, time } in `tz`: the sheet's default. */
export const defaultScheduleTime = (now: number, tz: string): { date: string; time: string } => {
  const halfHour = 30 * 60_000;
  const at = Math.ceil((now + 60 * 60_000) / halfHour) * halfHour;
  return { date: dateKeyInZone(at, tz), time: timeInZone(at, tz) };
};

// ── Agenda: slots + posts by day ─────────────────────────────────────────────

export type AgendaItem =
  | { kind: 'slot'; key: string; time: string; at: number; slot: StrategySlot; post: ScheduledPost | null }
  | { kind: 'post'; key: string; time: string; at: number; post: ScheduledPost };

export interface AgendaDay {
  date: string;
  items: AgendaItem[];
}

const slotInstant = (slot: StrategySlot, tz: string): number => {
  const iso = zonedToUtcIso(slot.date, slot.timeLocal, tz);
  return iso ? new Date(iso).getTime() : Number.NaN;
};

/**
 * Pairs each planned slot with the scheduled post that fills it: same day, the slot's platform among
 * the post's targets, and within SLOT_MATCH_WINDOW_MS. Closest pairs win; each post fills one slot.
 * Returns slotId -> postId.
 */
export const matchSlotsToPosts = (slots: StrategySlot[], posts: ScheduledPost[], tz: string): Map<string, string> => {
  const candidates: { slotId: string; postId: string; gap: number }[] = [];
  for (const slot of slots) {
    if (slot.status === 'skipped') continue;
    const slotAt = slotInstant(slot, tz);
    if (Number.isNaN(slotAt)) continue;
    for (const post of posts) {
      if (post.status === 'cancelled') continue;
      if (!post.targets.some((t) => t.platform === slot.platform)) continue;
      const postAt = new Date(post.scheduledAt).getTime();
      if (dateKeyInZone(postAt, tz) !== slot.date) continue;
      const gap = Math.abs(postAt - slotAt);
      if (gap <= SLOT_MATCH_WINDOW_MS) candidates.push({ slotId: slot.id, postId: post.id, gap });
    }
  }
  candidates.sort((a, b) => a.gap - b.gap);
  const bySlot = new Map<string, string>();
  const usedPosts = new Set<string>();
  for (const c of candidates) {
    if (bySlot.has(c.slotId) || usedPosts.has(c.postId)) continue;
    bySlot.set(c.slotId, c.postId);
    usedPosts.add(c.postId);
  }
  return bySlot;
};

/**
 * One entry per day in `days`, each holding that day's slots and posts in time order. A post that fills
 * a slot is shown on the slot (not twice); cancelled posts are left out.
 */
export const buildAgenda = (days: string[], slots: StrategySlot[], posts: ScheduledPost[], tz: string): AgendaDay[] => {
  const live = posts.filter((p) => p.status !== 'cancelled');
  const matches = matchSlotsToPosts(slots, live, tz);
  const postById = new Map(live.map((p) => [p.id, p]));
  const matched = new Set(matches.values());
  const byDay = new Map<string, AgendaItem[]>(days.map((d) => [d, []]));

  for (const slot of slots) {
    const items = byDay.get(slot.date);
    if (!items) continue;
    const postId = matches.get(slot.id);
    items.push({ kind: 'slot', key: `slot-${slot.id}`, time: slot.timeLocal, at: slotInstant(slot, tz), slot, post: postId ? postById.get(postId) ?? null : null });
  }
  for (const post of live) {
    if (matched.has(post.id)) continue;
    const items = byDay.get(dateKeyInZone(post.scheduledAt, tz));
    if (!items) continue;
    items.push({ kind: 'post', key: `post-${post.id}`, time: timeInZone(post.scheduledAt, tz), at: new Date(post.scheduledAt).getTime(), post });
  }
  return days.map((date) => ({
    date,
    items: (byDay.get(date) ?? []).sort((a, b) => (a.at || 0) - (b.at || 0) || a.key.localeCompare(b.key)),
  }));
};

/** The week the calendar opens on: this week, unless the whole plan is still ahead. */
export const initialWeekStart = (todayKey: string, planStart: string | null | undefined): string =>
  planStart && DATE_RE.test(planStart) && planStart > todayKey ? startOfWeek(planStart) : startOfWeek(todayKey);

// ── Status copy ──────────────────────────────────────────────────────────────

export type Tone = 'neutral' | 'progress' | 'success' | 'warning' | 'danger';

export const POST_STATUS_META: Record<PostStatus, { label: string; tone: Tone }> = {
  scheduled: { label: 'Scheduled', tone: 'neutral' },
  publishing: { label: 'Posting now', tone: 'progress' },
  published: { label: 'Posted', tone: 'success' },
  partially_published: { label: 'Partly posted', tone: 'warning' },
  failed: { label: "Didn't post", tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

const TARGET_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Waiting', tone: 'neutral' },
  scheduled: { label: 'Waiting', tone: 'neutral' },
  queued: { label: 'Waiting', tone: 'neutral' },
  publishing: { label: 'Posting', tone: 'progress' },
  processing: { label: 'Posting', tone: 'progress' },
  published: { label: 'Posted', tone: 'success' },
  drafted: { label: 'In drafts', tone: 'success' },
  draft: { label: 'In drafts', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  skipped: { label: 'Skipped', tone: 'neutral' },
};

export const targetStatusMeta = (status: string): { label: string; tone: Tone } =>
  TARGET_STATUS_META[status] ?? { label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : 'Waiting', tone: 'neutral' };

const ERROR_COPY: { test: RegExp; text: (name: string) => string }[] = [
  { test: /token|expired|unauthori[sz]ed|reauth|invalid[_ ]grant|401/i, text: (n) => `Your ${n} connection expired. Reconnect it on the Accounts page, then schedule again.` },
  { test: /scope|permission|forbidden|403/i, text: (n) => `${n} didn't give us permission to post. Reconnect it and allow posting.` },
  { test: /rate|limit|too many|429|spam/i, text: (n) => `${n} is limiting how often you can post right now. Try again in a few hours.` },
  { test: /duration|too long|too short|length/i, text: (n) => `${n} didn't accept the video's length.` },
  { test: /format|codec|resolution|aspect|file|media/i, text: (n) => `${n} couldn't read the video file. Export it again and reschedule.` },
  { test: /duplicate|already/i, text: (n) => `${n} says this video was already posted.` },
  { test: /private|privacy|audience/i, text: (n) => `${n} blocked the post because of your account's privacy settings.` },
  { test: /timeout|network|unavailable|5\d\d/i, text: (n) => `${n} didn't respond. We'll show it here if it posts; otherwise try again.` },
];

/** Plain-English reason a platform rejected a post. */
export const targetErrorMessage = (platform: string, error: string | null | undefined): string => {
  const name = platformName(platform);
  const raw = error?.trim();
  if (!raw) return `${name} didn't accept the post.`;
  const hit = ERROR_COPY.find((e) => e.test.test(raw));
  if (hit) return hit.text(name);
  // Short, human-looking messages are shown as the platform said them.
  if (raw.length <= 140 && !/[{}<>[\]]/.test(raw)) return `${name} said: ${raw}`;
  return `${name} didn't accept the post.`;
};

/** Reschedule and cancel only make sense before the post goes out. */
export const isPostEditable = (post: ScheduledPost, now: number): boolean =>
  post.status === 'scheduled' && new Date(post.scheduledAt).getTime() > now;

// ── Sheet validation ─────────────────────────────────────────────────────────

export interface ScheduleFormValues {
  projectId: string;
  caption: string;
  platforms: PublishPlatform[];
  date: string;
  time: string;
  /** True when editing an existing post (its video can't change). */
  editing: boolean;
}

/** First problem with the form in plain English, or null when it can be sent. */
export const validateScheduleForm = (v: ScheduleFormValues, choices: PlatformChoice[], now: number, tz: string): string | null => {
  if (!v.editing && !v.projectId) return 'Pick the exported edit to post.';
  if (!v.platforms.length) return 'Pick at least one platform.';
  const blocked = v.platforms.find((p) => choices.find((c) => c.platform === p)?.disabled ?? true);
  if (blocked) return `${platformName(blocked)} can't be used right now.`;
  if (v.caption.length > CAPTION_MAX) return `Captions can be up to ${CAPTION_MAX.toLocaleString()} characters.`;
  const at = zonedToUtcIso(v.date, v.time, tz);
  if (!at) return 'Pick a date and time.';
  if (new Date(at).getTime() < now + MIN_LEAD_MS) return 'Pick a time at least 5 minutes from now.';
  return null;
};

/** 'Tue, Nov 24 at 09:30' for the instant a form's date and time resolve to in `tz` (shows a daylight-saving shift), or null if malformed. */
export const resolvedScheduleLabel = (date: string, time: string, tz: string): string | null => {
  const iso = zonedToUtcIso(date, time, tz);
  return iso ? `${dayHeading(dateKeyInZone(iso, tz))} at ${timeInZone(iso, tz)}` : null;
};

// ── TikTok Direct Post (TikTok content sharing guidelines) ───────────────────

export const TIKTOK_MUSIC_URL = 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en';
export const TIKTOK_BRANDED_POLICY_URL = 'https://www.tiktok.com/legal/page/global/bc-policy/en';
export const TIKTOK_SELF_ONLY = 'SELF_ONLY';

const TIKTOK_PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Public to everyone',
  MUTUAL_FOLLOW_FRIENDS: 'Mutual follow friends',
  FOLLOWER_OF_CREATOR: 'Followers',
  [TIKTOK_SELF_ONLY]: 'Only me',
};

export const tiktokPrivacyLabel = (value: string): string => TIKTOK_PRIVACY_LABELS[value] ?? value;

export interface TikTokPrivacyChoice {
  value: string;
  label: string;
  disabled: boolean;
  reason?: string;
}

/** Options straight from creator-info (no default is picked); "Only me" is off while the post is branded content. */
export const tiktokPrivacyChoices = (options: string[], brandedContent: boolean): TikTokPrivacyChoice[] =>
  options.map((value) => {
    const blocked = brandedContent && value === TIKTOK_SELF_ONLY;
    return { value, label: tiktokPrivacyLabel(value), disabled: blocked, reason: blocked ? 'Branded content visibility cannot be set to private.' : undefined };
  });

/** What the creator has chosen on the TikTok section (all off / empty until they act). */
export interface TikTokFormValues {
  privacyLevel: string;
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  disclose: boolean;
  yourBrand: boolean;
  brandedContent: boolean;
}

export const EMPTY_TIKTOK_FORM: TikTokFormValues = {
  privacyLevel: '',
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  disclose: false,
  yourBrand: false,
  brandedContent: false,
};

export type TikTokField = 'privacy' | 'interactions' | 'commercial' | 'general';

export type TikTokErrors = Partial<Record<TikTokField, string>>;

/** Rule check before sending; messages sit next to the control they belong to. */
export const validateTikTokForm = (v: TikTokFormValues, info: TikTokCreatorInfo | null): TikTokErrors => {
  const errors: TikTokErrors = {};
  if (!info?.canPost) {
    errors.general = info?.reason || "TikTok can't be used right now.";
    return errors;
  }
  if (!v.privacyLevel) errors.privacy = 'Choose who can view this video.';
  else if (!info.privacyLevelOptions.includes(v.privacyLevel)) errors.privacy = 'That visibility is not available for your account.';
  else if (v.disclose && v.brandedContent && v.privacyLevel === TIKTOK_SELF_ONLY) errors.privacy = 'Branded content visibility cannot be set to private.';
  if ((v.allowComment && info.commentDisabled) || (v.allowDuet && info.duetDisabled) || (v.allowStitch && info.stitchDisabled)) {
    errors.interactions = 'One of these is turned off in your TikTok settings.';
  }
  if (v.disclose && !v.yourBrand && !v.brandedContent) errors.commercial = 'Select at least one option to say what you are promoting.';
  return errors;
};

/** The request body for the backend; disclosure choices are dropped while the toggle is off. */
export const buildTikTokSettings = (v: TikTokFormValues): TikTokPostSettings => ({
  privacyLevel: v.privacyLevel,
  allowComment: v.allowComment,
  allowDuet: v.allowDuet,
  allowStitch: v.allowStitch,
  commercial: { enabled: v.disclose, yourBrand: v.disclose && v.yourBrand, brandedContent: v.disclose && v.brandedContent },
  musicConfirmed: true,
});

/** Which control a 400 message from the server belongs to. */
export const tiktokFieldForMessage = (message: string): TikTokField => {
  const m = message.toLowerCase();
  if (/privacy|visib|only me|private/.test(m)) return 'privacy';
  if (/brand|commercial|promot|partnership/.test(m)) return 'commercial';
  if (/comment|duet|stitch/.test(m)) return 'interactions';
  return 'general';
};

/** Shown when the video is longer than the account may post, else null. */
export const tiktokDurationWarning = (durationSec: number | null | undefined, maxSec: number | null | undefined): string | null => {
  if (!durationSec || !maxSec || durationSec <= maxSec) return null;
  const fmt = (s: number) => (s >= 120 && s % 60 === 0 ? `${s / 60} minutes` : `${Math.round(s)} seconds`);
  return `This video is ${fmt(durationSec)} long, but your TikTok account can post up to ${fmt(maxSec)}. TikTok may reject it.`;
};
