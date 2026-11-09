import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { saveCreatorProfile, apiErrorMessage, type CreatorProfile, type Goal } from '@/api/analytics';
import { Select } from '@/components/app/Select';
import { Button } from '@/components/app/Button';
import { cn } from '@/lib/utils';
import { GOAL_OPTIONS, NICHE_OPTIONS, PLATFORM_LABELS, WEEKDAYS } from './labels';

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'facebook'];
const INPUT = 'app-focus h-10 w-full rounded-lg border border-line bg-canvas px-3 text-base text-fg placeholder:text-fg-subtle md:text-sm';

const browserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'app-focus h-9 rounded-full border px-3 text-sm transition-colors duration-100',
        pressed ? 'border-accent bg-accent-tint text-fg' : 'border-line text-fg-muted hover:bg-white/[0.04] hover:text-fg'
      )}
    >
      {children}
    </button>
  );
}

/** What the creator posts and how often. The plan's slots and advice are built from this. */
export default function CreatorProfileForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: CreatorProfile;
  onSaved: (profile: CreatorProfile) => void;
  onCancel?: () => void;
}) {
  const [niche, setNiche] = useState(initial.niche ?? '');
  const [platforms, setPlatforms] = useState<string[]>(initial.platforms.filter((p) => PLATFORMS.includes(p)));
  const [followers, setFollowers] = useState(initial.followers != null ? String(initial.followers) : '');
  const [goal, setGoal] = useState<Goal | ''>(initial.goal ?? '');
  const [postsPerWeek, setPostsPerWeek] = useState(String(initial.postsPerWeek ?? 3));
  const [days, setDays] = useState<number[]>(initial.preferredDays);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timezone = initial.source === 'saved' && initial.timezone ? initial.timezone : browserTimeZone();

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!niche || !platforms.length || !goal) {
      setError('Pick your niche, at least one platform and your main goal.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await saveCreatorProfile({
        niche,
        platforms,
        followers: followers ? Number(followers) : null,
        goal,
        postsPerWeek: Number(postsPerWeek),
        preferredDays: days,
        timezone: browserTimeZone(),
      });
      onSaved(saved);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save. Try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <h2 className="text-base font-semibold text-fg">About your content</h2>
      <p className="mt-1 text-sm text-fg-muted">
        {initial.source === 'quiz' ? 'We filled this in from your quiz answers. Check it and save.' : 'Your plan is built around this. It takes 30 seconds.'}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs text-fg-muted">Niche</p>
          <Select id="profile-niche" label="Niche" value={niche} options={[{ value: '', label: 'Pick your niche' }, ...NICHE_OPTIONS]} onChange={setNiche} />
        </div>
        <div>
          <p className="mb-1 text-xs text-fg-muted">Main goal</p>
          <Select id="profile-goal" label="Main goal" value={goal} options={[{ value: '', label: 'Pick a goal' }, ...GOAL_OPTIONS]} onChange={(v) => setGoal(v as Goal)} />
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-xs text-fg-muted">Where you post</legend>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <Chip key={p} pressed={platforms.includes(p)} onClick={() => setPlatforms((l) => toggle(l, p))}>
                {PLATFORM_LABELS[p]}
              </Chip>
            ))}
          </div>
        </fieldset>

        <label className="block text-xs text-fg-muted">
          Followers on your main account <span className="text-fg-subtle">(optional)</span>
          <input inputMode="numeric" autoComplete="off" placeholder="e.g. 2400" value={followers} onChange={(e) => setFollowers(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))} className={`${INPUT} mt-1`} />
        </label>
        <label className="block text-xs text-fg-muted">
          Posts you can make per week
          <input type="number" min={1} max={21} required value={postsPerWeek} onChange={(e) => setPostsPerWeek(e.target.value)} className={`${INPUT} tabular mt-1`} />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-xs text-fg-muted">
            Days you can post <span className="text-fg-subtle">(leave empty for any day)</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <Chip key={d} pressed={days.includes(d)} onClick={() => setDays((l) => toggle(l, d))}>
                {WEEKDAYS[d]}
              </Chip>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-subtle">Post times use your time zone: {timezone}.</p>
        </fieldset>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />}
          Save
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
