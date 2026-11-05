import { useEffect, useId, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ANALYSIS_FEATURES_UI, type AnalysisFeatureUi } from '@/data/analysis-features';
import { cn } from '@/lib/utils';

type FeatureChecklistProps = {
  selected: string[];
  onChange: (ids: string[]) => void;
  canUsePro: boolean;
  legend?: string;
  error?: string | null;
};

/** Native checkbox list. Locked (Pro) items stay focusable and explain how to unlock them. */
export function FeatureChecklist({ selected, onChange, canUsePro, legend = 'Checks to run', error }: FeatureChecklistProps) {
  const errorId = useId();
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-2 text-sm font-medium text-fg-muted">{legend}</legend>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ANALYSIS_FEATURES_UI.map((f) =>
          f.tier === 'pro' && !canUsePro ? (
            <LockedFeature key={f.id} feature={f} />
          ) : (
            <li key={f.id}>
              <label
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors duration-100',
                  selected.includes(f.id) ? 'border-accent/70 bg-accent-tint' : 'border-line bg-surface hover:bg-surface-raised'
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--app-accent)]"
                  checked={selected.includes(f.id)}
                  onChange={() => toggle(f.id)}
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-fg">
                    <f.Icon size={16} aria-hidden={true} className="text-fg-muted" />
                    {f.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">{f.description}</span>
                </span>
              </label>
            </li>
          )
        )}
      </ul>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function LockedFeature({ feature }: { feature: AnalysisFeatureUi }) {
  const [open, setOpen] = useState(false);
  const popId = useId();
  const wrapRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <li ref={wrapRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((v) => !v)}
        className="app-focus flex min-h-11 w-full items-start gap-3 rounded-lg border border-line bg-surface px-3 py-3 text-left hover:bg-surface-raised"
      >
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-fg-subtle" aria-hidden="true" />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-medium text-fg">
            {feature.label}
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-fg-muted">Pro</span>
          </span>
          <span className="mt-0.5 block text-xs text-fg-muted">{feature.description}</span>
        </span>
      </button>
      {open && (
        <div
          id={popId}
          role="dialog"
          aria-label={`${feature.label} is a Pro check`}
          className="app-glass absolute left-0 right-0 top-full z-20 mt-2 rounded-xl p-4"
        >
          <p className="text-sm text-fg">{feature.label} is part of Pro.</p>
          <Link
            to="/subscription-plans"
            className="app-focus app-primary mt-3 inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}
    </li>
  );
}
