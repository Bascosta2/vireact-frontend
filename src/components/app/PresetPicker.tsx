import { useId } from 'react';
import { cn } from '@/lib/utils';
import type { PresetId } from '@/lib/analysis-presets';

const OPTIONS: { id: PresetId; label: string; description: (canUsePro: boolean) => string }[] = [
  {
    id: 'full',
    label: 'Full analysis',
    description: (pro) =>
      pro ? 'Recommended. All six checks, including advanced analytics.' : 'Recommended. Hook, captions, pacing, audio and views prediction. Advanced analytics is Pro.',
  },
  { id: 'hook', label: 'Hook check', description: () => 'Just the first seconds. Fastest.' },
  { id: 'custom', label: 'Custom', description: () => 'Pick the checks yourself' },
];

export function PresetPicker({
  value,
  onChange,
  canUsePro,
  labelledBy,
}: {
  value: PresetId;
  onChange: (preset: PresetId) => void;
  canUsePro: boolean;
  labelledBy: string;
}) {
  const name = useId();
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="grid gap-2 sm:grid-cols-3">
      {OPTIONS.map((opt) => (
        <label
          key={opt.id}
          className={cn(
            'relative flex min-h-11 cursor-pointer flex-col rounded-lg border px-4 py-3 transition-colors duration-100 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--app-accent)]',
            value === opt.id ? 'border-accent bg-accent-tint' : 'border-line bg-surface hover:bg-surface-raised'
          )}
        >
          <input
            type="radio"
            name={name}
            value={opt.id}
            checked={value === opt.id}
            onChange={() => onChange(opt.id)}
            className="sr-only"
          />
          <span className="flex items-center gap-2 text-sm font-semibold text-fg">
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex h-4 w-4 items-center justify-center rounded-full border-2',
                value === opt.id ? 'border-accent' : 'border-control'
              )}
            >
              {value === opt.id && <span className="h-2 w-2 rounded-full bg-accent" />}
            </span>
            {opt.label}
          </span>
          <span className="mt-1 text-xs text-fg-muted">{opt.description(canUsePro)}</span>
        </label>
      ))}
    </div>
  );
}
