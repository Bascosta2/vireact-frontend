import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/app/Button';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { apiErrorCode, apiErrorMessage } from '@/api/analytics';
import { createStoryboard, STORY_LENGTHS } from '@/api/editor';
import type { EditingSkill } from './catalog';

const MIN = 12;
const MAX = 1500;

const EXAMPLES = [
  'A tiny fox saves her forest from a wildfire by digging a firebreak, told like a bedtime story.',
  'Explain how compound interest turns $100 a month into a fortune, with the numbers.',
  'The history of coffee: from a goat herder in Ethiopia to the cup on your desk.',
];

/**
 * Story mode: describe an idea, pick a length, and the style animates it. Vireact writes three storyboards
 * first; the creator picks one and confirms on the next page before anything is made.
 */
export function StoryForm({ skill }: { skill: EditingSkill }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [lengthSec, setLengthSec] = useState<number>(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tooShort = prompt.trim().length < MIN;

  if (skill.kind !== 'animation') {
    return <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-fg-muted">Story mode animates in one of the styles. Pick any style from the library above to animate your idea.</p>;
  }

  const submit = async () => {
    if (tooShort || busy) return;
    setBusy(true);
    setError(null);
    try {
      const project = await createStoryboard(prompt.trim(), skill.id, lengthSec);
      track('storyboard_requested', { skill: skill.id, length_sec: lengthSec, prompt_chars: prompt.trim().length });
      navigate(`/skills/${project.id}`);
    } catch (err) {
      setError(apiErrorCode(err) === 'EDIT_IN_PROGRESS' ? 'You already have an edit in progress. Wait for it to finish, then start your story.' : apiErrorMessage(err, 'Could not start your story. Try again.'));
      setBusy(false);
    }
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-line bg-surface p-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <label className="block">
        <span className="text-sm font-medium text-fg">Describe your video</span>
        <span className="mt-0.5 block text-xs text-fg-muted">What happens, who it&rsquo;s for, and how it should feel. Vireact writes three storyboards for you to choose from, then animates the one you confirm in {skill.name}.</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, MAX))}
          rows={5}
          maxLength={MAX}
          placeholder={EXAMPLES[0]}
          className="app-focus mt-2 w-full resize-y rounded-lg border border-line bg-canvas p-3 text-sm text-fg placeholder:text-fg-subtle"
        />
        <span className="tabular mt-1 block text-right text-[11px] text-fg-subtle">
          {prompt.length} / {MAX}
        </span>
      </label>
      <div className="flex flex-wrap gap-2" aria-label="Ideas to try">
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" onClick={() => setPrompt(ex)} className="app-focus rounded-full border border-line px-3 py-1 text-left text-xs text-fg-muted hover:bg-surface-raised">
            {ex.length > 60 ? `${ex.slice(0, 58)}…` : ex}
          </button>
        ))}
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-fg">Length</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {STORY_LENGTHS.map((len) => (
            <button
              key={len}
              type="button"
              aria-pressed={lengthSec === len}
              onClick={() => setLengthSec(len)}
              className={cn('app-focus rounded-full border px-3 py-1.5 text-sm', lengthSec === len ? 'border-accent bg-accent-tint text-fg' : 'border-line text-fg-muted hover:bg-surface-raised')}
            >
              about {len}s
            </button>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={tooShort || busy}>
        {busy ? <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
        Write 3 storyboards
      </Button>
      <p className="text-xs text-fg-subtle">Choosing a storyboard uses one edit. Writing them and asking for new ones is free.</p>
    </form>
  );
}
