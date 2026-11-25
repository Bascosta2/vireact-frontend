import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, CornerDownLeft, Filter, Loader2, Pin, Search, X } from 'lucide-react';
import { APP_COMMANDS, matchCommands, type AppCommand } from '@/lib/app-commands';
import { useRecentItems } from '@/lib/recent-items';
import { useVideoSummaries } from '@/lib/video-summaries';
import { matchesVideoQuery, parseVideoQuery, QUERY_HINTS, removeQueryToken, videoState } from '@/lib/video-query';
import { formatVideoDate } from '@/lib/video-status';
import { scoreTone, videoName } from '@/lib/video-file';
import { VideoThumb } from '@/components/app/VideoThumb';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { Video } from '@/api/video';

interface Row {
  key: string;
  section: string;
  label: string;
  detail?: string;
  lead: ReactNode;
  trail?: ReactNode;
  run: () => void;
}

const MAX_VIDEOS = 8;

const STATE_TEXT = { ready: 'Ready', 'needs-views': 'Needs views', analyzing: 'Analyzing', failed: 'Failed' } as const;
const TONE_TEXT = { success: 'text-success', warning: 'text-warning', danger: 'text-danger' } as const;

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="tabular rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">{children}</kbd>
);

/** Ctrl+K / Cmd+K: find any video (with filters like score:<40), jump to a page, or start something. */
export default function CommandPalette({ initialQuery, onClose, allowed }: { initialQuery: string; onClose: () => void; allowed: (c: AppCommand) => boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null);
  const listId = useId();
  const recent = useRecentItems();
  const { videos } = useVideoSummaries();

  useEffect(() => {
    inputRef.current?.focus();
    const restore = restoreRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      restore?.focus?.();
    };
  }, []);

  const parsed = useMemo(() => parseVideoQuery(query), [query]);
  const go = (href: string, what: string) => {
    track('command_bar_selected', { kind: what });
    onClose();
    navigate(href);
  };

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const videoRow = (v: Video, section: string): Row => {
      const state = videoState(v);
      const score = typeof v.viralityScore === 'number' ? Math.round(v.viralityScore) : null;
      return {
        key: `v-${section}-${v._id}`,
        section,
        label: videoName(v),
        detail: `${STATE_TEXT[state]} · ${formatVideoDate(v.createdAt)}`,
        lead: <VideoThumb video={v} className="h-9 w-9 shrink-0 rounded-md" iconClassName="h-4 w-4" />,
        trail: score != null && state !== 'analyzing' ? <span className={cn('tabular text-sm font-semibold', TONE_TEXT[scoreTone(score)])}>{score}</span> : undefined,
        run: () => go(state === 'ready' || state === 'needs-views' ? `/videos/${v._id}` : '/videos', 'video'),
      };
    };
    const commandRow = (c: AppCommand, section: string): Row => {
      const Icon = c.icon;
      return {
        key: `c-${section}-${c.id}`,
        section,
        label: c.label,
        lead: (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-fg-muted">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ),
        trail: c.shortcut ? (
          <span className="hidden gap-1 sm:flex" aria-label={`Shortcut ${c.shortcut}`}>
            {c.shortcut.split(' ').map((k, i) => (
              <Kbd key={i}>{k.toUpperCase()}</Kbd>
            ))}
          </span>
        ) : undefined,
        run: () => go(c.href, c.group === 'create' ? 'create' : 'page'),
      };
    };

    if (!query.trim()) {
      for (const r of recent.slice(0, 5)) {
        out.push({
          key: `r-${r.id}`,
          section: 'Recently opened',
          label: r.title,
          lead: (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-fg-muted">
              {r.pinned ? <Pin className="h-4 w-4" aria-hidden="true" /> : <Clock className="h-4 w-4" aria-hidden="true" />}
            </span>
          ),
          run: () => go(r.href, 'recent'),
        });
      }
      APP_COMMANDS.filter((c) => c.group === 'create' && allowed(c)).forEach((c) => out.push(commandRow(c, 'Create')));
      APP_COMMANDS.filter((c) => c.group === 'page' && allowed(c) && !c.id.startsWith('analytics-'))
        .slice(0, 8)
        .forEach((c) => out.push(commandRow(c, 'Go to')));
      for (const h of QUERY_HINTS) {
        out.push({
          key: `h-${h.token}`,
          section: 'Search with filters',
          label: h.label,
          lead: (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-fg-muted">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </span>
          ),
          trail: <code className="font-mono text-xs text-fg-muted">{h.token}</code>,
          run: () => {
            setQuery(`${h.token} `);
            inputRef.current?.focus();
          },
        });
      }
      return out;
    }

    const matches = (videos ?? []).filter((v) => matchesVideoQuery(v, parsed));
    matches.slice(0, MAX_VIDEOS).forEach((v) => out.push(videoRow(v, 'Videos')));
    if (matches.length > 0) {
      out.push({
        key: 'library-all',
        section: 'Videos',
        label: matches.length > MAX_VIDEOS ? `See all ${matches.length} in the Library` : 'Open these in the Library',
        lead: (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-canvas text-fg-muted">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        ),
        run: () => go(`/videos?q=${encodeURIComponent(query.trim())}`, 'library'),
      });
    }
    if (parsed.tokens.length === 0) {
      matchCommands(parsed.text, allowed)
        .slice(0, 6)
        .forEach((c) => out.push(commandRow(c, c.group === 'create' ? 'Create' : 'Go to')));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, parsed, videos, recent, allowed]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      setActive((i) => (rows.length ? (i + 1) % rows.length : 0));
    } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      setActive((i) => (rows.length ? (i - 1 + rows.length) % rows.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      rows[active]?.run();
    }
  };

  const loading = videos === null && query.trim().length > 0;
  let lastSection = '';

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/60 px-4 pt-[10vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Search and jump" className="app-glass w-full max-w-xl overflow-hidden rounded-2xl border border-line shadow-2xl shadow-black/60" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 shrink-0 text-fg-subtle" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={rows[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search videos, pages and actions"
            placeholder="Search videos, pages and actions"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="app-focus rounded p-1 text-fg-subtle hover:text-fg">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <Kbd>Esc</Kbd>
        </div>

        {parsed.tokens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2" aria-label="Filters in use">
            {parsed.tokens.map((t) => (
              <button
                key={t.raw}
                type="button"
                onClick={() => setQuery(removeQueryToken(query, t.raw))}
                className="app-focus inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent-tint px-2.5 py-1 text-xs font-medium text-fg"
              >
                {t.label}
                <X className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
          </div>
        )}

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="max-h-[min(60vh,460px)] overflow-y-auto p-2">
          {loading ? (
            <p className="flex items-center gap-2 px-3 py-6 text-sm text-fg-muted">
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
              Loading your videos
            </p>
          ) : rows.length === 0 ? (
            <p className="px-3 py-6 text-sm text-fg-muted">
              Nothing matches “{query.trim()}”. Try fewer words, or a filter like <code className="font-mono text-fg">score:&lt;40</code>.
            </p>
          ) : (
            rows.map((row, i) => {
              const heading = row.section !== lastSection ? row.section : null;
              lastSection = row.section;
              return (
                <div key={row.key}>
                  {heading && (
                    <p className="app-label px-3 pb-1 pt-3" role="presentation">
                      {heading}
                    </p>
                  )}
                  <div
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={row.run}
                    className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2', i === active ? 'bg-white/[0.06]' : '')}
                  >
                    {row.lead}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg" title={row.label}>
                        {row.label}
                      </span>
                      {row.detail && <span className="tabular block truncate text-xs text-fg-muted">{row.detail}</span>}
                    </span>
                    {row.trail}
                    {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 text-fg-subtle" aria-hidden="true" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2 text-xs text-fg-subtle sm:flex">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> open
          </span>
          <span className="ml-auto">
            Try <code className="font-mono text-fg-muted">status:ready score:&lt;40</code>
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
