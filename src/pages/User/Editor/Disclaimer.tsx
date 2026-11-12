import { Info } from 'lucide-react';

/** Shown on upload and on the review screen: the editor never adds footage. */
export function FootageDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <p className={compact ? 'text-xs text-fg-subtle' : 'flex gap-2 rounded-xl border border-line bg-surface p-4 text-sm text-fg-muted'}>
      {!compact && <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />}
      <span>
        The editor works only with the footage you upload. It cuts, reorders, captions, zooms, and adds music and sound effects, but it can&rsquo;t film or create
        new clips.
      </span>
    </p>
  );
}
