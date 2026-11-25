import { ArrowLeftRight, Check, Loader2, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/app/Button';
import { cn } from '@/lib/utils';
import type { Storyboard as StoryboardData, StoryboardBeat } from '@/api/editor';

const ROLE_LABEL: Record<string, string> = { hook: 'Hook', setup: 'Setup', body: 'Turn', payoff: 'Payoff', cta: 'Call to action' };
const FRAMING_LABEL: Record<StoryboardBeat['framing'], string> = { fill: 'Full frame', fit_blur: 'Whole shot, blurred sides', split: 'Split screen' };

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const word = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

interface BeatCardProps {
  beat: StoryboardBeat;
  dropped: boolean;
  /** This beat is being swapped. */
  busy: boolean;
  /** Some beat is being swapped: every control waits. */
  locked: boolean;
  /** 1-based position, so each button has a unique name. */
  number: number;
  onDrop: (id: string, dropped: boolean) => void;
  onSwap: (id: string) => void;
}

export function BeatCard({ beat, dropped, busy, locked, number, onDrop, onSwap }: BeatCardProps) {
  const name = `beat ${number}, ${ROLE_LABEL[beat.role] ?? 'beat'}, ${mmss(beat.start)} to ${mmss(beat.end)}`;
  const handleDrop = () => onDrop(beat.id, !dropped);
  const handleSwap = () => onSwap(beat.id);
  return (
    <li className={cn('rounded-lg border border-line p-3', dropped && 'opacity-60')} data-beat={beat.id}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-fg">
          {ROLE_LABEL[beat.role] ?? 'Beat'}
          <span className="tabular ml-2 text-xs font-normal text-fg-muted">
            {mmss(beat.start)} to {mmss(beat.end)}
          </span>
          {beat.swapped && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] font-normal text-fg-muted">Swapped</span>}
          {dropped && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[11px] font-normal text-fg-muted">Dropped</span>}
        </p>
        <div className="flex gap-1">
          {!dropped && (
            <Button variant="ghost" size="sm" onClick={handleSwap} disabled={locked} aria-label={`Swap ${name}`}>
              {busy ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}
              Swap
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDrop} disabled={locked} aria-label={`${dropped ? 'Bring back' : 'Drop'} ${name}`}>
            {dropped ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
            {dropped ? 'Bring back' : 'Drop'}
          </Button>
        </div>
      </div>
      {beat.reason && <p className="mt-1 text-sm text-fg-muted">{beat.reason}</p>}
      {!dropped && (
        <dl className={cn('mt-2 grid gap-1 text-xs text-fg-muted', beat.screens?.length ? 'sm:grid-cols-4' : 'sm:grid-cols-3')}>
          <div>
            <dt className="app-label">Graphics</dt>
            <dd>{beat.graphics.length ? beat.graphics.map((g) => `${g.type}${g.text ? `: ${g.text}` : ''}`).join('; ') : 'None'}</dd>
          </div>
          <div>
            <dt className="app-label">Sounds</dt>
            <dd>{[...beat.sounds, ...beat.effects].length ? [...beat.sounds, ...beat.effects].map((x) => x.type).join(', ') : 'Automatic only'}</dd>
          </div>
          {beat.screens && beat.screens.length > 0 && (
            <div>
              <dt className="app-label">Screen recording</dt>
              <dd>{beat.screens.map((x) => `${mmss(x.start)} to ${mmss(x.end)}${x.zoom > 1.05 ? `, zooms in ${x.zoom.toFixed(1)}x` : ''}`).join('; ')}</dd>
            </div>
          )}
          <div>
            <dt className="app-label">Framing</dt>
            <dd>
              {FRAMING_LABEL[beat.framing]}
              {beat.zooms > 0 ? `, ${word(beat.zooms, 'zoom', 'zooms')}` : ''}
            </dd>
          </div>
        </dl>
      )}
    </li>
  );
}

interface StoryboardProps {
  storyboard: StoryboardData;
  /** Segment ids the creator dropped (live, so a click shows at once). */
  dropped: string[];
  approved: boolean;
  busyBeat: string | null;
  onDrop: (id: string, dropped: boolean) => void;
  onSwap: (id: string) => void;
  onApprove: () => void;
}

/** Beat-by-beat review before exporting: the hook, the turns and the payoff, each with its graphics, sounds and framing. */
export function StoryboardPanel({ storyboard, dropped, approved, busyBeat, onDrop, onSwap, onApprove }: StoryboardProps) {
  const kept = storyboard.beats.filter((b) => !dropped.includes(b.id)).length;
  return (
    <section aria-labelledby="storyboard-title" className="rounded-xl border border-line bg-surface p-4">
      <h2 id="storyboard-title" className="text-base font-semibold text-fg">
        Storyboard
      </h2>
      <p className="mt-1 text-sm text-fg-muted">Check each beat before you export. Drop one you do not want, or swap it for another take on its graphics and sounds.</p>
      <ol className="mt-3 space-y-2">
        {storyboard.beats.map((b, k) => (
          <BeatCard key={b.id} beat={b} number={k + 1} dropped={dropped.includes(b.id)} busy={busyBeat === b.id} locked={busyBeat !== null} onDrop={onDrop} onSwap={onSwap} />
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={onApprove} disabled={approved || kept === 0 || busyBeat !== null}>
          <Check className="h-4 w-4" aria-hidden="true" />
          {approved ? 'Storyboard approved' : 'Approve storyboard'}
        </Button>
        <span className="text-xs text-fg-subtle" aria-live="polite">
          {approved ? 'Exports use this storyboard.' : 'Approve to unlock export.'}
        </span>
      </div>
    </section>
  );
}
