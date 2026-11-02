import { cn } from '@/lib/utils';
import { scoreTone } from '@/lib/video-file';

const TONE_STROKE = { success: 'var(--app-success)', warning: 'var(--app-warning)', danger: 'var(--app-danger)' } as const;

/** Virality score as a ring with the number inside. Color follows the app thresholds; the number carries the meaning. */
export function ScoreRing({ score, size = 48, label = 'Virality score', className }: { score: number; size?: number; label?: string; className?: string }) {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      role="img"
      aria-label={`${label} ${value} out of 100`}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={TONE_STROKE[scoreTone(value)]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <span className="tabular absolute text-sm font-semibold text-fg" aria-hidden="true">
        {value}
      </span>
    </div>
  );
}
