import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { StrategySlot } from '@/api/analytics';
import { listScheduledPosts, type PostCapabilities, type PublishPlatform, type ScheduledPost } from '@/api/posts';
import { Button, IconButton } from '@/components/app/Button';
import { useToast } from '@/components/app/Toast';
import { cn } from '@/lib/utils';
import { ScheduleSheet, type ScheduleDraft } from './ScheduleSheet';
import {
  addDays,
  buildAgenda,
  dateKeyInZone,
  dayHeading,
  initialWeekStart,
  isPostEditable,
  platformChoices,
  platformName,
  POST_STATUS_META,
  targetErrorMessage,
  targetStatusMeta,
  weekDays,
  weekRange,
  type AgendaDay,
  type AgendaItem,
  type Tone,
} from './schedule';

interface ScheduleViewProps {
  slots: StrategySlot[];
  planStart: string | null;
  timeZone: string;
  capabilities: PostCapabilities | null;
}

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'border-line text-fg-muted',
  progress: 'border-accent/50 text-accent',
  success: 'border-emerald-500/40 text-emerald-400',
  warning: 'border-amber-500/40 text-amber-400',
  danger: 'border-danger/50 text-danger',
};

function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs', TONE_CLASS[tone])}>{label}</span>;
}

interface PostBlockProps {
  post: ScheduledPost;
  time: string;
  onOpen: (post: ScheduledPost) => void;
}

function PostBlock({ post, time, onOpen }: PostBlockProps) {
  const handleOpen = useCallback(() => onOpen(post), [onOpen, post]);
  const meta = POST_STATUS_META[post.status];
  const failed = post.targets.filter((t) => t.status === 'failed' || t.error);
  return (
    <div className="mt-2 rounded-lg border border-line bg-canvas p-2 text-sm">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="tabular text-xs text-fg-muted">{time}</span>
        <StatusChip label={post.mode === 'draft' ? `${meta.label} · draft` : meta.label} tone={meta.tone} />
      </div>
      {post.caption && <p className="mt-1 line-clamp-2 text-fg">{post.caption}</p>}
      <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Platforms">
        {post.targets.map((t) => {
          const m = targetStatusMeta(t.status);
          return (
            <li key={t.platform}>
              <StatusChip label={`${platformName(t.platform)}: ${m.label}`} tone={m.tone} />
            </li>
          );
        })}
      </ul>
      {failed.map((t) => (
        <p key={t.platform} className="mt-1.5 text-xs text-danger">
          {targetErrorMessage(t.platform, t.error)}
        </p>
      ))}
      <Button size="sm" variant="ghost" className="mt-1.5" onClick={handleOpen}>
        {isPostEditable(post, Date.now()) ? 'Reschedule or cancel' : 'Details'}
      </Button>
    </div>
  );
}

interface AgendaCardProps {
  item: AgendaItem;
  canSchedule: boolean;
  onSchedule: (slot: StrategySlot) => void;
  onOpen: (post: ScheduledPost) => void;
}

function AgendaCard({ item, canSchedule, onSchedule, onOpen }: AgendaCardProps) {
  const slot = item.kind === 'slot' ? item.slot : null;
  const handleSchedule = useCallback(() => slot && onSchedule(slot), [slot, onSchedule]);
  if (item.kind === 'post') {
    return (
      <li className="rounded-lg border border-line bg-surface p-2">
        <p className="app-label">Scheduled post</p>
        <PostBlock post={item.post} time={item.time} onOpen={onOpen} />
      </li>
    );
  }
  const { slot: s, post } = item;
  return (
    <li className={cn('rounded-lg border border-line bg-surface p-2', s.status === 'skipped' && 'opacity-60')}>
      <p className="tabular text-xs text-fg-muted">
        {s.timeLocal} · {platformName(s.platform)}
        {s.status === 'posted' && ' · posted'}
        {s.status === 'skipped' && ' · skipped'}
      </p>
      <p className="mt-0.5 text-sm font-medium text-fg">{s.title}</p>
      {post ? (
        <PostBlock post={post} time={item.time} onOpen={onOpen} />
      ) : (
        canSchedule &&
        s.status === 'planned' && (
          <Button size="sm" variant="secondary" className="mt-2" onClick={handleSchedule}>
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Schedule this
          </Button>
        )
      )}
    </li>
  );
}

interface DayColumnProps {
  day: AgendaDay;
  today: string;
  canSchedule: boolean;
  onSchedule: (slot: StrategySlot) => void;
  onOpen: (post: ScheduledPost) => void;
}

function DayColumn({ day, today, canSchedule, onSchedule, onOpen }: DayColumnProps) {
  return (
    <section aria-label={dayHeading(day.date, { weekday: 'long', month: 'long', day: 'numeric' })} className="min-w-0">
      <h4 className={cn('mb-2 text-sm font-semibold', day.date === today ? 'text-accent' : 'text-fg')}>
        {dayHeading(day.date)}
        {day.date === today && <span className="ml-1 text-xs font-normal">Today</span>}
      </h4>
      {day.items.length === 0 ? (
        <p className="text-xs text-fg-subtle">Nothing planned</p>
      ) : (
        <ul className="space-y-2">
          {day.items.map((item) => (
            <AgendaCard key={item.key} item={item} canSchedule={canSchedule} onSchedule={onSchedule} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Week calendar (columns on desktop, a stacked list on mobile) that merges the Strategy plan's slots with
 * scheduled posts. Only rendered when publishing is available (see usePublishingAccess).
 */
export default function ScheduleView({ slots, planStart, timeZone, capabilities }: ScheduleViewProps) {
  const toast = useToast();
  const today = dateKeyInZone(Date.now(), timeZone);
  const [weekStart, setWeekStart] = useState(() => initialWeekStart(today, planStart));
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState<ScheduleDraft | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    const { from, to } = weekRange(weekStart, timeZone);
    listScheduledPosts(from, to)
      .then((list) => !cancelled && setPosts(list))
      .catch(() => !cancelled && (setPosts([]), setLoadError(true)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [weekStart, timeZone, reload]);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const agenda = useMemo(() => buildAgenda(days, slots, posts, timeZone), [days, slots, posts, timeZone]);
  const usable = useMemo(() => platformChoices(capabilities).some((c) => !c.disabled), [capabilities]);

  const handlePrev = useCallback(() => setWeekStart((w) => addDays(w, -7)), []);
  const handleNext = useCallback(() => setWeekStart((w) => addDays(w, 7)), []);
  const handleToday = useCallback(() => setWeekStart(initialWeekStart(dateKeyInZone(Date.now(), timeZone), null)), [timeZone]);
  const handleNew = useCallback(() => {
    setDraft({});
    setSheetOpen(true);
  }, []);
  const handleSchedule = useCallback(
    (slot: StrategySlot) => {
      const usableIds = platformChoices(capabilities).filter((c) => !c.disabled).map((c) => c.platform);
      const platform = slot.platform as PublishPlatform;
      setDraft({
        caption: slot.hook ? `${slot.hook}\n\n${slot.cta ?? ''}`.trim() : '',
        platforms: usableIds.includes(platform) ? [platform] : [],
        date: slot.date,
        time: slot.timeLocal,
      });
      setSheetOpen(true);
    },
    [capabilities]
  );
  const handleOpenPost = useCallback((post: ScheduledPost) => {
    setDraft({ post });
    setSheetOpen(true);
  }, []);
  const handleClose = useCallback(() => setSheetOpen(false), []);
  const handleSaved = useCallback(
    (_post: ScheduledPost, message: string) => {
      setSheetOpen(false);
      setReload((n) => n + 1);
      toast.show({ message });
    },
    [toast]
  );

  const rangeLabel = `${dayHeading(days[0], { month: 'short', day: 'numeric' })} to ${dayHeading(days[6], { month: 'short', day: 'numeric' })}`;

  return (
    <section aria-labelledby="calendar-title" className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="calendar-title" className="flex items-center gap-2 text-base font-semibold text-fg">
            <CalendarClock className="h-4 w-4 text-accent" aria-hidden="true" />
            Posting calendar
          </h3>
          <p className="tabular text-xs text-fg-muted">
            {rangeLabel} · times in {timeZone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton aria-label="Previous week" onClick={handlePrev}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <Button size="sm" variant="ghost" onClick={handleToday}>
            This week
          </Button>
          <IconButton aria-label="Next week" onClick={handleNext}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </IconButton>
          <Button size="sm" onClick={handleNew}>
            Schedule post
          </Button>
        </div>
      </div>
      {!usable && <p className="mb-3 text-sm text-fg-muted">Connect an account on the Accounts page to schedule posts.</p>}
      <div aria-live="polite">
        {loading && (
          <p className="mb-3 flex items-center gap-2 text-sm text-fg-muted">
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> Loading this week…
          </p>
        )}
        {loadError && <p className="mb-3 text-sm text-fg-muted">Couldn't load scheduled posts. Your planned slots are still shown.</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        {agenda.map((day) => (
          <DayColumn key={day.date} day={day} today={today} canSchedule={usable} onSchedule={handleSchedule} onOpen={handleOpenPost} />
        ))}
      </div>
      <ScheduleSheet open={sheetOpen} draft={draft} timeZone={timeZone} capabilities={capabilities} onClose={handleClose} onSaved={handleSaved} />
    </section>
  );
}
