import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Bell, CheckCircle2, ClipboardPen } from 'lucide-react';
import { Popover } from '@/components/app/Popover';
import { useVideoSummaries } from '@/lib/video-summaries';
import { buildNotices, readSeenAt, writeSeenAt, type NoticeKind } from '@/lib/notifications';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const ICON: Record<NoticeKind, { Icon: typeof Bell; cls: string }> = {
  finished: { Icon: CheckCircle2, cls: 'text-success' },
  failed: { Icon: AlertCircle, cls: 'text-danger' },
  'log-views': { Icon: ClipboardPen, cls: 'text-accent' },
};

const ago = (at: number) => {
  const m = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
};

/** The bell: analyses finished or failed this week, and when it is time to log real views. */
export function NotificationsBell({
  side = 'bottom-end',
  className,
  buttonClassName = 'relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-white/5 hover:text-fg',
  renderTrigger,
}: {
  side?: 'bottom-start' | 'bottom-end' | 'right-start' | 'top-start';
  className?: string;
  buttonClassName?: string;
  /** Custom trigger (the sidebar row); gets the number of new notices. */
  renderTrigger?: (unread: number) => ReactNode;
}) {
  const { videos } = useVideoSummaries();
  const [seenAt, setSeenAt] = useState(readSeenAt);
  const notices = useMemo(() => buildNotices(videos ?? []), [videos]);
  const unread = notices.filter((n) => n.at > seenAt).length;

  const markRead = () => {
    const now = Date.now();
    writeSeenAt(now);
    setSeenAt(now);
  };

  return (
    <Popover
      side={side}
      className={className}
      label={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'}
      buttonClassName={buttonClassName}
      panelClassName="w-80 max-w-[calc(100vw-2rem)]"
      onOpenChange={(open) => {
        if (open) track('notifications_opened', { unread });
        // Reading the list counts as seeing it once it closes, so the dots stay visible while it is open.
        if (!open && unread > 0) markRead();
      }}
      trigger={() =>
        renderTrigger ? (
          renderTrigger(unread)
        ) : (
        <>
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          {unread > 0 && (
            <span aria-hidden="true" className="tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-on-brand">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </>
        )
      }
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold text-fg">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={markRead} className="app-focus rounded text-xs font-medium text-fg-muted hover:text-fg">
                Mark all read
              </button>
            )}
          </div>
          {notices.length === 0 ? (
            <p className="px-3 pb-4 pt-1 text-sm text-fg-muted">Nothing new. You will see finished analyses and reminders here.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notices.map((n) => {
                const { Icon, cls } = ICON[n.kind];
                const isNew = n.at > seenAt;
                return (
                  <li key={n.id}>
                    <Link to={n.href} onClick={close} className="app-focus flex gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5">
                      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', cls)} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-medium text-fg">
                          {n.title}
                          {isNew && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="new" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-fg-muted [overflow-wrap:anywhere]">{n.body}</span>
                        <span className="tabular mt-0.5 block text-[11px] text-fg-subtle">{ago(n.at)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
}
