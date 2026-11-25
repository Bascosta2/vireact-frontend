import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, Film, Search } from 'lucide-react';
import type { Video } from '@/api/video';
import { formatDuration, scoreTone, videoName } from '@/lib/video-file';
import { cn } from '@/lib/utils';

const TONE_CLASS = {
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  danger: 'border-danger/40 bg-danger/10 text-danger',
} as const;

const shortDate = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
};

function Thumb({ video }: { video: Video }) {
  const [broken, setBroken] = useState(false);
  if (video.thumbnailUrl && !broken) {
    return (
      <img
        src={video.thumbnailUrl}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className="h-11 w-8 shrink-0 rounded-md border border-line object-cover"
      />
    );
  }
  return (
    <span aria-hidden="true" className="flex h-11 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-gradient-to-b from-accent/25 to-white/[0.02]">
      <Film className="h-3.5 w-3.5 text-accent" />
    </span>
  );
}

/**
 * The video title in the video page header, which opens a list of the person's analysed videos.
 * A listbox with search (from 7 videos), arrow keys, Enter and Escape.
 */
export function VideoSwitcher({ current, videos, onSelect }: { current: Video; videos: Video[]; onSelect: (videoId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const searchable = videos.length > 6;

  const items = useMemo(() => {
    const rows = videos.map((v) => ({ video: v, title: videoName(v) }));
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => r.title.toLowerCase().includes(q)) : rows;
  }, [videos, query]);

  const openList = () => {
    setQuery('');
    setActive(Math.max(0, videos.findIndex((v) => v._id === current._id)));
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (videoId: string) => {
    close();
    if (videoId !== current._id) onSelect(videoId);
  };

  // Focus the search (or the list) on open; close on a click outside.
  useEffect(() => {
    if (!open) return;
    (searchable ? searchRef.current : listRef.current)?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the highlighted row in view while moving with the keyboard.
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(items.length - 1);
    } else if (e.key === 'Enter' && items[active]) {
      e.preventDefault();
      choose(items[active].video._id);
    } else if (e.key === 'Tab') {
      close(false);
    }
  };

  const currentTitle = videoName(current);
  const activeId = items[active] ? `${listId}-${items[active].video._id}` : undefined;

  return (
    <div ref={rootRef} className="relative min-w-0 max-w-full">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Video: ${currentTitle}. Switch video`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            openList();
          }
        }}
        className={cn(
          'app-focus group -ml-2 flex min-w-0 max-w-full items-center gap-1.5 rounded-lg px-2 py-0.5 text-sm font-medium text-fg transition-colors',
          open ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
        )}
      >
        <span className="truncate">{currentTitle}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200 group-hover:text-accent', open && 'rotate-180 text-accent')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          onKeyDown={onKeyDown}
          className={cn(
            'z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e13] shadow-[0_24px_64px_rgba(0,0,0,0.7),0_0_0_1px_rgba(232,103,53,0.10),0_0_40px_rgba(232,103,53,0.10)]',
            'motion-safe:animate-[switcher-in_160ms_cubic-bezier(0.22,1,0.36,1)]',
            // Phones: full width under the header. Larger screens: anchored to the title.
            'fixed inset-x-3 top-[calc(env(safe-area-inset-top)+3.25rem)] sm:absolute sm:inset-x-auto sm:left-[-0.5rem] sm:top-full sm:mt-2 sm:w-[26rem]'
          )}
        >
          <style>{'@keyframes switcher-in{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}'}</style>
          <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <p className="app-label">Your analyzed videos</p>
            <span className="tabular text-[11px] text-fg-subtle">{videos.length}</span>
          </div>

          {searchable && (
            <div className="px-3 pb-2">
              <label className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-3 focus-within:border-accent/50">
                <Search className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder="Find a video"
                  aria-label="Find a video"
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
                />
              </label>
            </div>
          )}

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label="Switch video"
            aria-activedescendant={searchable ? undefined : activeId}
            className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain px-2 pb-2 outline-none [scrollbar-width:thin]"
          >
            {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-fg-subtle">No video matches "{query}"</li>}
            {items.map(({ video, title }, index) => {
              const selected = video._id === current._id;
              const highlighted = index === active;
              const score = video.viralityScore;
              const meta = [shortDate(video.createdAt), formatDuration(video.duration)].filter(Boolean).join(' · ');
              return (
                <li
                  key={video._id}
                  id={`${listId}-${video._id}`}
                  data-index={index}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(video._id)}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors duration-100',
                    highlighted ? 'bg-white/[0.06]' : '',
                    selected && 'bg-accent-tint'
                  )}
                >
                  {selected && <span aria-hidden="true" className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-accent" />}
                  <Thumb video={video} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-sm', selected ? 'font-semibold text-fg' : 'font-medium text-fg/90')}>{title}</span>
                    {meta && <span className="tabular block truncate text-xs text-fg-subtle">{meta}</span>}
                  </span>
                  {score != null && (
                    <span className={cn('tabular shrink-0 rounded-md border px-1.5 py-0.5 text-xs font-semibold', TONE_CLASS[scoreTone(score)])}>
                      {Math.round(score)}
                    </span>
                  )}
                  <Check className={cn('h-4 w-4 shrink-0 text-accent', selected ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
