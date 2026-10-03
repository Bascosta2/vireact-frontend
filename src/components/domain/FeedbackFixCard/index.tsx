import ScriptDiff from '@/components/domain/ScriptDiff';
import type { FrameFeedback, ScriptRewrite } from '@/types/video-feedback';

/**
 * One actionable feedback item: timestamp chip (click to seek the player), what was
 * observed, why it costs retention, and the literal fix as a diff.
 */

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300',
  important: 'bg-orange-500/20 text-orange-300',
  minor: 'bg-zinc-500/20 text-zinc-300',
};

/** Label for the replacement side, matched to what the fix actually changes. */
const AFTER_LABELS: Record<string, string> = {
  replace_line: 'Say this instead',
  cut: 'Make this cut',
  trim: 'Trim to this',
  add_text_overlay: 'Add this overlay',
  add_sound: 'Add this sound',
  reshoot_note: 'Reshoot like this',
};

const formatRange = (item: FrameFeedback): string => {
  const toMmSs = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };
  const start = toMmSs(item.tStart);
  const end = toMmSs(item.tEnd);
  return start === end ? start : `${start} – ${end}`;
};

interface FeedbackFixCardProps {
  item: FrameFeedback;
  /** Seek the player to a time in seconds. Omitted when no stream is available. */
  onSeek?: (seconds: number) => void;
  /** Highlight state, used when a chat reply cites this item. */
  isHighlighted?: boolean;
}

export function FeedbackFixCard({ item, onSeek, isHighlighted = false }: FeedbackFixCardProps) {
  const severityClass = SEVERITY_STYLES[item.severityLabel] ?? SEVERITY_STYLES.minor;
  const afterLabel = AFTER_LABELS[item.fix?.type ?? ''] ?? 'Use this';

  return (
    <div
      id={`feedback-${item.id}`}
      className={`rounded-xl p-4 border bg-white/[0.03] transition-colors ${
        isHighlighted ? 'border-[#FF3CAC]/60 bg-[#FF3CAC]/[0.06]' : 'border-white/[0.08]'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {onSeek ? (
          <button
            type="button"
            onClick={() => onSeek(item.tStart)}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-200 hover:bg-[#FF3CAC]/30 hover:text-white transition-colors cursor-pointer"
            title="Jump to this moment"
          >
            {formatRange(item)}
          </button>
        ) : (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
            {formatRange(item)}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-white/15 text-zinc-400">
          {item.category}
        </span>
        <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${severityClass}`}>
          {item.severityLabel}
        </span>
        {item.isLegacy ? (
          <span
            className="text-[10px] uppercase px-2 py-0.5 rounded border border-white/15 text-zinc-500"
            title="Generated before frame-level fixes shipped. Re-analyze for a literal fix."
          >
            directional
          </span>
        ) : null}
      </div>

      {item.observed ? <p className="text-sm text-white font-semibold">{item.observed}</p> : null}
      {item.issue ? <p className="text-sm text-zinc-300 mt-1">{item.issue}</p> : null}

      <ScriptDiff before={item.fix?.before} after={item.fix?.after ?? ''} afterLabel={afterLabel} />

      {item.expectedImpact ? (
        <p className="text-xs text-emerald-300/80 mt-2">Expected: {item.expectedImpact}</p>
      ) : null}
    </div>
  );
}

interface ScriptRewriteCardProps {
  rewrite: ScriptRewrite;
  onSeek?: (seconds: number) => void;
}

/** A dedicated line rewrite: verbatim original struck through, new line beneath. */
export function ScriptRewriteCard({ rewrite, onSeek }: ScriptRewriteCardProps) {
  const toMmSs = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  return (
    <div
      id={`rewrite-${rewrite.lineId}`}
      className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.03]"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {onSeek ? (
          <button
            type="button"
            onClick={() => onSeek(rewrite.timestamp)}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-200 hover:bg-[#FF3CAC]/30 hover:text-white transition-colors cursor-pointer"
            title="Jump to this line"
          >
            {toMmSs(rewrite.timestamp)}
          </button>
        ) : (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
            {toMmSs(rewrite.timestamp)}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-white/15 text-zinc-400">
          script
        </span>
      </div>

      <ScriptDiff before={rewrite.originalTranscript} after={rewrite.rewrittenLine} />

      {rewrite.rationale ? <p className="text-xs text-zinc-400 mt-2">{rewrite.rationale}</p> : null}
      {rewrite.deliveryNote ? (
        <p className="text-xs text-zinc-500 mt-1">Delivery: {rewrite.deliveryNote}</p>
      ) : null}
    </div>
  );
}

export default FeedbackFixCard;
