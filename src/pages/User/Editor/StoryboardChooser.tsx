import { useState } from 'react';
import { ArrowLeft, Check, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/app/Button';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { apiErrorMessage } from '@/api/analytics';
import { chooseStoryboard, regenerateStoryboards, type EditProjectDetail, type StoryboardGraphic, type StoryboardOption } from '@/api/editor';
import { skillById } from '../Skills/catalog';

const BACKDROP_LABEL: Record<string, string> = {
  'city-night': 'City at night',
  'city-day': 'City by day',
  nature: 'Mountains and lake',
  ocean: 'Open sea',
  space: 'Outer space',
  room: 'Cosy room',
  'product-dark': 'Product studio',
  'toy-box': 'Toy box',
  game: 'Video game',
  race: 'Racing game',
  app: 'Phone app',
  abstract: 'Abstract colour',
};

const GRAPHIC_LABEL: Record<StoryboardGraphic['type'], string> = {
  headline: 'Title card',
  list: 'List',
  counter: 'Number',
  chart: 'Bar chart',
  visual: 'Illustration',
  slam: 'Big word',
  pill: 'Label',
  cta: 'Closing ask',
};

const graphicSummary = (g: StoryboardGraphic) => {
  const what = g.type === 'visual' ? (g.visual ?? '').replace(/_/g, ' ') : g.type === 'list' || g.type === 'chart' ? `${g.text ? `${g.text}: ` : ''}${g.items.join(', ')}` : `${g.text}${g.subtext ? ` (${g.subtext})` : ''}`;
  return `${GRAPHIC_LABEL[g.type]}: ${what}`;
};

/** Reading time of a storyboard, roughly as the video will time it. */
const estimateSec = (o: StoryboardOption) => Math.round(o.scenes.reduce((n, s) => n + Math.max(3.2, 1.3 + s.narration.split(/\s+/).filter(Boolean).length * 0.42), 0) + 2.7);

function OptionCard({ o, k, selected, onSelect }: { o: StoryboardOption; k: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn('app-focus flex h-full w-full flex-col rounded-xl border p-4 text-left', selected ? 'border-accent bg-accent-tint' : 'border-line bg-surface hover:bg-surface-raised')}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Storyboard {k + 1}</span>
        {selected && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
      </span>
      <span className="mt-1 block text-base font-semibold text-fg">{o.title}</span>
      {o.angle && <span className="mt-1 inline-block w-fit rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-muted">{o.angle}</span>}
      <span className="mt-2 block text-sm text-fg-muted">{o.logline}</span>
      <ol className="mt-3 space-y-2">
        {o.scenes.map((sc, j) => (
          <li key={j} className="rounded-lg border border-line bg-canvas/40 p-2">
            <span className="block text-sm text-fg">
              <span className="tabular mr-1 text-fg-subtle">{j + 1}.</span>
              {sc.narration}
            </span>
            <span className="mt-1 flex flex-wrap gap-1">
              {sc.backdrop !== 'scene' && <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] text-fg-subtle">{BACKDROP_LABEL[sc.backdrop] ?? sc.backdrop}</span>}
              {sc.graphic && <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] text-fg-subtle">{graphicSummary(sc.graphic)}</span>}
            </span>
          </li>
        ))}
      </ol>
      <span className="tabular mt-3 block text-xs text-fg-subtle">
        {o.scenes.length} scenes · about {estimateSec(o)}s · {o.mood} music
      </span>
    </button>
  );
}

/**
 * Story mode, step two: three storyboards for the creator's idea. They pick one, can rewrite its words,
 * then confirm before the video is made (that is when it uses an edit). Or they ask for three new ones.
 */
export default function StoryboardChooser({ project, onDone, onRegenerated }: { project: EditProjectDetail; onDone: (p: EditProjectDetail) => void; onRegenerated: () => Promise<void> }) {
  const sb = project.storyboard!;
  const style = skillById(project.skill);
  const [selected, setSelected] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [step, setStep] = useState<'pick' | 'confirm'>('pick');
  const [busy, setBusy] = useState<'make' | 'new' | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const pick = (k: number) => {
    setSelected(k);
    setTitle(sb.options[k].title);
    setWords(sb.options[k].scenes.map((s) => s.narration));
    track('storyboard_option_selected', { project_id: project.id, option: k });
  };

  const make = async () => {
    if (selected === null) return;
    setBusy('make');
    setError(null);
    try {
      const done = await chooseStoryboard(project.id, selected, title, words);
      track('storyboard_confirmed_clicked', { project_id: project.id, option: selected });
      onDone(done);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not make your video. Try again.'));
      setBusy(null);
    }
  };

  const newOnes = async () => {
    setBusy('new');
    setError(null);
    try {
      await regenerateStoryboards(project.id, note.trim());
      track('storyboard_regenerate_clicked', { project_id: project.id });
      await onRegenerated();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not write new storyboards. Try again.'));
    } finally {
      setBusy(null);
    }
  };

  const chosen = selected === null ? null : sb.options[selected];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">{step === 'pick' ? 'Pick your storyboard' : 'Confirm your storyboard'}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Your idea: &ldquo;{sb.prompt}&rdquo; · {style?.name ?? 'Animated'} · about {sb.lengthSec}s
        </p>
      </div>
      {project.error && <p className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">{project.error}</p>}
      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      {step === 'pick' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {sb.options.map((o, k) => (
              <OptionCard key={k} o={o} k={k} selected={selected === k} onSelect={() => pick(k)} />
            ))}
          </div>

          {chosen && (
            <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
              <h2 className="text-base font-semibold text-fg">Make it yours (optional)</h2>
              <p className="text-sm text-fg-muted">Change any words before it is animated. The scenes, graphics and timing follow your words.</p>
              <label className="block">
                <span className="text-xs font-medium text-fg-muted">Title</span>
                <input value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} className="app-focus mt-1 w-full rounded-lg border border-line bg-canvas p-2 text-sm text-fg" />
              </label>
              {chosen.scenes.map((_, j) => (
                <label key={j} className="block">
                  <span className="text-xs font-medium text-fg-muted">Scene {j + 1}</span>
                  <textarea value={words[j] ?? ''} maxLength={260} rows={2} onChange={(e) => setWords((w) => w.map((x, i) => (i === j ? e.target.value : x)))} className="app-focus mt-1 w-full resize-y rounded-lg border border-line bg-canvas p-2 text-sm text-fg" />
                </label>
              ))}
              <Button onClick={() => setStep('confirm')} disabled={!title.trim() || words.filter((w) => w.trim().split(/\s+/).length >= 3).length < 2}>
                <Check className="h-4 w-4" aria-hidden="true" />
                Use this storyboard
              </Button>
            </div>
          )}

          <form
            className="space-y-3 rounded-xl border border-line bg-surface p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void newOnes();
            }}
          >
            <h2 className="text-base font-semibold text-fg">None of these?</h2>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Optional: what to change, e.g. funnier, more facts, a happier ending" className="app-focus w-full rounded-lg border border-line bg-canvas p-2 text-sm text-fg placeholder:text-fg-subtle" />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="secondary" disabled={busy !== null || sb.roundsLeft === 0}>
                {busy === 'new' ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                Write 3 new storyboards
              </Button>
              <span className="text-xs text-fg-muted">{sb.roundsLeft === 0 ? 'No new rounds left for this story.' : `${sb.roundsLeft} new round${sb.roundsLeft === 1 ? '' : 's'} left. Free.`}</span>
            </div>
          </form>
        </>
      ) : (
        chosen && (
          <div className="space-y-4 rounded-xl border border-accent/40 bg-surface p-5">
            <p className="text-sm text-fg-muted">This is the video Vireact will animate in {style?.name ?? 'your style'}. Check it reads the way you want.</p>
            <h2 className="text-lg font-semibold text-fg">{title}</h2>
            <ol className="space-y-2">
              {chosen.scenes.map((sc, j) => (
                <li key={j} className="rounded-lg border border-line p-3 text-sm text-fg">
                  <span className="tabular mr-1 text-fg-subtle">{j + 1}.</span>
                  {words[j]?.trim() || sc.narration}
                  {sc.graphic && <span className="mt-1 block text-xs text-fg-subtle">{graphicSummary(sc.graphic)}</span>}
                </li>
              ))}
            </ol>
            <p className="text-xs text-fg-subtle">Making the video uses one edit. You can still change captions, the hook, music and style afterwards.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void make()} disabled={busy !== null}>
                {busy === 'make' ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                Confirm and animate
              </Button>
              <Button variant="ghost" onClick={() => setStep('pick')} disabled={busy !== null}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to the storyboards
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
