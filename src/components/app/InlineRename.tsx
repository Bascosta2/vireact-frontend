import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { renameVideo } from '@/api/video';
import { patchVideoSummary } from '@/lib/video-summaries';
import { renameRecent } from '@/lib/recent-items';
import { ErrorNotification } from '@/utils/toast';
import { cn } from '@/lib/utils';

const MAX = 100;

/**
 * Rename a video in place: Enter saves, Escape cancels. An empty name goes back to the automatic one.
 * Calls `onDone` with the saved name (or null for the automatic name), or undefined when cancelled.
 */
export function InlineRename({ videoId, initial: shown, onDone, className }: { videoId: string; initial: string; onDone: (title: string | null | undefined) => void; className?: string }) {
  // Automatic names are shown in quotes (“first spoken words”); edit the words, not the quotes.
  const initial = shown.replace(/^“([\s\S]*)”$/, '$1');
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  const save = async () => {
    const next = value.replace(/\s+/g, ' ').trim();
    if (next === initial.trim()) {
      onDone(undefined);
      return;
    }
    setSaving(true);
    try {
      const saved = await renameVideo(videoId, next);
      patchVideoSummary(videoId, { title: saved });
      if (saved) renameRecent(`video-${videoId}`, saved);
      onDone(saved);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      ErrorNotification(msg || 'Could not rename the video. Try again.');
      setSaving(false);
    }
  };

  return (
    <form
      className={cn('flex min-w-0 items-center gap-1', className)}
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <label className="sr-only" htmlFor={`rename-${videoId}`}>
        Video name
      </label>
      <input
        id={`rename-${videoId}`}
        ref={ref}
        value={value}
        maxLength={MAX}
        disabled={saving}
        placeholder="Leave empty for the automatic name"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onDone(undefined);
          }
        }}
        className="app-focus h-8 min-w-0 flex-1 rounded-md border border-control bg-canvas px-2 text-sm text-fg placeholder:text-fg-subtle"
      />
      <button type="submit" disabled={saving} aria-label="Save name" className="app-focus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-success hover:bg-white/5">
        {saving ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
      </button>
      <button type="button" disabled={saving} onClick={() => onDone(undefined)} aria-label="Cancel rename" className="app-focus inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-white/5">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
