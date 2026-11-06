import { useId, useState, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { reportActualViews } from '@/api/video';

const format = (n: number) => n.toLocaleString();

/**
 * "How many views did it get?" Saves the real result for this video. Each answer is used to make
 * future predictions fit real accounts.
 */
export function ActualViewsCard({ videoId, initialViews }: { videoId: string; initialViews?: number | null }) {
  const inputId = useId();
  const [saved, setSaved] = useState<number | null>(initialViews ?? null);
  const [editing, setEditing] = useState(initialViews == null);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const views = Number(value);
    if (!value || !Number.isFinite(views) || views < 0) {
      setError('Enter the view count as a whole number.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await reportActualViews(videoId, views);
      setSaved(result.actualViews);
      setEditing(false);
      setValue('');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || 'Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!editing && saved != null) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 text-fg">
          <Check className="h-4 w-4 text-success" aria-hidden />
          Real result logged: <span className="tabular font-semibold">{format(saved)} views</span>
        </p>
        <button type="button" onClick={() => setEditing(true)} className="app-focus rounded text-sm font-medium text-accent hover:underline">
          Update
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-3 rounded-xl border border-line bg-white/[0.02] p-4">
      <label htmlFor={inputId} className="text-sm font-semibold text-fg">
        Posted it? How many views did it get?
      </label>
      <p className="mt-0.5 text-xs text-fg-muted">Add the count about a week after posting. Real results make every prediction more accurate.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="e.g. 1840"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
          className="app-focus h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-base text-fg placeholder:text-fg-subtle md:text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="app-focus app-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />}
          Save views
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

export default ActualViewsCard;
