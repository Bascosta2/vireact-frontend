import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Sparkles, UploadCloud, RotateCcw } from 'lucide-react';
const HOW_IT_WORKS_STEPS = [
  { title: 'Add your video', body: 'Upload a short video and pick what to analyze.', Icon: UploadCloud },
  { title: 'AI analyzes it', body: 'We score hook, captions, pacing, audio and predicted views. Usually 2 to 5 minutes.', Icon: Sparkles },
  { title: 'Review and chat', body: 'See what to fix, moment by moment, and ask the AI anything.', Icon: MessageSquare },
] as const;

const INTRO_KEY = 'vireact-home-intro-played';
const STEP_MS = 1200;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Three steps. With `animateIntro`, the first time they scroll into view in a session each step
 * highlights in turn (about 4 s total, opacity only) and then everything rests. Reduced motion
 * shows the resting state straight away.
 */
export function HowItWorks({
  animateIntro = false,
  headingId,
  headingLevel = 'h3',
}: {
  animateIntro?: boolean;
  headingId?: string;
  headingLevel?: 'h2' | 'h3';
}) {
  const StepHeading = headingLevel;
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [played, setPlayed] = useState(() => !animateIntro || sessionStorage.getItem(INTRO_KEY) === '1');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (prefersReducedMotion()) {
      setActive(null);
      return;
    }
    HOW_IT_WORKS_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setActive(i), i * STEP_MS));
    });
    timers.current.push(setTimeout(() => setActive(null), HOW_IT_WORKS_STEPS.length * STEP_MS));
  }, []);

  useEffect(() => {
    if (played || !listRef.current) return;
    const el = listRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        sessionStorage.setItem(INTRO_KEY, '1');
        setPlayed(true);
        play();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [played, play]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return (
    <div>
      <ol ref={listRef} className="grid gap-4 md:grid-cols-3" aria-labelledby={headingId}>
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <li
            key={step.title}
            data-active={active === i ? 'true' : undefined}
            className="intro-step relative rounded-xl border border-line bg-surface p-5"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent"
                aria-hidden="true"
              >
                <step.Icon className="h-5 w-5" />
              </span>
              <span className="tabular text-sm font-medium text-fg-muted">Step {i + 1}</span>
            </div>
            <StepHeading className="mt-4 text-base font-semibold text-fg">{step.title}</StepHeading>
            <p className="mt-1 max-w-[65ch] text-sm text-fg-muted">{step.body}</p>
          </li>
        ))}
      </ol>
      {animateIntro && (
        <button
          type="button"
          onClick={play}
          className="app-focus mt-3 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-fg-muted hover:text-fg motion-reduce:hidden"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Replay
        </button>
      )}
    </div>
  );
}
