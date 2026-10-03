/**
 * Script diff: the original line struck through, the replacement line beneath it.
 *
 * Replaces the old "paragraph of advice" presentation — the creator reads the
 * bottom line straight off the screen.
 */

interface ScriptDiffProps {
  /** Verbatim existing content. Omit when the fix adds content where none existed. */
  before?: string | null;
  /** Literal replacement content. */
  after: string;
  /** Label for the replacement, e.g. 'Say this instead' or 'Add this overlay'. */
  afterLabel?: string;
  beforeLabel?: string;
}

function ScriptDiff({ before, after, beforeLabel = 'Currently', afterLabel = 'Say this instead' }: ScriptDiffProps) {
  if (!after) return null;

  return (
    <div className="mt-3 rounded-lg border border-white/[0.08] overflow-hidden">
      {before ? (
        <div className="px-3 py-2 bg-red-500/[0.07] border-b border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-wide text-red-300/70 mb-0.5">{beforeLabel}</p>
          <p className="text-sm text-zinc-400 line-through decoration-red-400/60">{before}</p>
        </div>
      ) : null}
      <div className="px-3 py-2 bg-emerald-500/[0.07]">
        <p className="text-[10px] uppercase tracking-wide text-emerald-300/70 mb-0.5">{afterLabel}</p>
        <p className="text-sm text-white font-medium">{after}</p>
      </div>
    </div>
  );
}

export default ScriptDiff;
