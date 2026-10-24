import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { QUIZ_QUESTIONS, firstUnanswered, isQuizComplete, type QuizAnswers } from '@/funnel/quiz.config';
import { loadFunnelState, saveFunnelState } from '@/funnel/session';
import { getAttribution } from '@/funnel/attribution';
import { createFunnelSession, patchFunnelSession, completeFunnelSession } from '@/api/funnel';
import { track } from '@/lib/analytics';

const ANALYZING_MIN_MS = 2500;
const ADVANCE_DELAY_MS = 180;
const TOTAL = QUIZ_QUESTIONS.length;

type Phase = 'quiz' | 'analyzing' | 'error';

const isNotFound = (error: unknown) => isAxiosError(error) && error.response?.status === 404;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retake = searchParams.get('retake') === '1';
  const entryItemSlug = searchParams.get('item') || undefined;

  const initial = useMemo(() => loadFunnelState(), []);
  const showSavedResults = Boolean(initial.completed && initial.sessionId && !retake);
  const resume = !retake && !initial.completed;
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(resume ? initial.answers : {});
  const [index, setIndex] = useState(() => (resume ? Math.min(firstUnanswered(initial.answers), TOTAL - 1) : 0));
  const [phase, setPhase] = useState<Phase>('quiz');
  const sessionRef = useRef<string | null>(resume ? initial.sessionId : null);
  const creatingRef = useRef<Promise<string> | null>(null);
  const syncRef = useRef<Promise<unknown>>(Promise.resolve());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionRef.current) return sessionRef.current;
    if (!creatingRef.current) {
      creatingRef.current = createFunnelSession({ attribution: getAttribution(), entryItemSlug })
        .then((id) => {
          sessionRef.current = id;
          saveFunnelState({ ...loadFunnelState(), sessionId: id, completed: false });
          track('quiz_started', { entry_item: entryItemSlug ?? null });
          return id;
        })
        .finally(() => {
          creatingRef.current = null;
        });
    }
    return creatingRef.current;
  }, [entryItemSlug]);

  /** Sends answers; a purged or foreign session (404) is replaced by a new one. */
  const syncAnswers = useCallback(
    async (next: Partial<QuizAnswers>, step: string) => {
      const sessionId = await ensureSession();
      try {
        await patchFunnelSession(sessionId, { answers: next, step });
        return sessionId;
      } catch (error) {
        if (!isNotFound(error)) throw error;
        sessionRef.current = null;
        const fresh = await ensureSession();
        await patchFunnelSession(fresh, { answers: next, step });
        return fresh;
      }
    },
    [ensureSession]
  );

  useEffect(() => {
    if (showSavedResults) {
      navigate('/start/results', { replace: true });
      return;
    }
    ensureSession().catch(() => undefined);
  }, [showSavedResults, navigate, ensureSession]);

  useEffect(() => {
    if (showSavedResults) return;
    saveFunnelState({ sessionId: sessionRef.current, answers, completed: false });
  }, [answers, showSavedResults]);

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const finish = useCallback(
    async (all: QuizAnswers) => {
      setPhase('analyzing');
      const startedAt = Date.now();
      try {
        await syncRef.current.catch(() => undefined);
        const sessionId = await syncAnswers(all, 'submit');
        const results = await completeFunnelSession(sessionId);
        await wait(Math.max(0, ANALYZING_MIN_MS - (Date.now() - startedAt)));
        saveFunnelState({ sessionId, answers: all, completed: true });
        track('quiz_completed', {
          ...all,
          high_intent: results.highIntent,
          recommended_plan: results.recommendedPlan,
          hooks_count: results.hooks.length,
        });
        navigate('/start/results', { replace: true, state: { results } });
      } catch {
        setPhase('error');
      }
    },
    [navigate, syncAnswers]
  );

  const select = (value: string) => {
    if (phase !== 'quiz') return;
    const question = QUIZ_QUESTIONS[index];
    const next = { ...answers, [question.key]: value };
    setAnswers(next);
    track('quiz_step_answered', { step: index + 1, question: question.key, answer: value });

    if (isQuizComplete(next) && index === TOTAL - 1) {
      finish(next);
      return;
    }
    syncRef.current = syncRef.current
      .catch(() => undefined)
      .then(() => syncAnswers({ [question.key]: value }, `q${index + 1}`))
      .catch(() => undefined);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => setIndex(Math.min(firstUnanswered(next), TOTAL - 1)), ADVANCE_DELAY_MS);
  };

  if (showSavedResults) return null;

  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]" role="status" aria-live="polite">
        <div className="h-14 w-14 rounded-full border-4 border-white/15 border-t-[#FF004F] animate-spin" />
        <p className="mt-6 text-lg font-semibold">Analyzing your answers…</p>
        <p className="mt-2 text-sm text-white/60">Matching hooks from the Vireact library to your niche and goal.</p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]" role="alert">
        <p className="text-lg font-semibold">We couldn't load your results.</p>
        <p className="mt-2 text-sm text-white/60">Your answers are saved. Check your connection and try again.</p>
        <button
          type="button"
          className="btn-primary mt-6 min-h-[48px] rounded-xl"
          onClick={() => isQuizComplete(answers) && finish(answers)}
        >
          Try again
        </button>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[index];
  const selected = answers[question.key];

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-white/60">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="min-h-[48px] min-w-[48px] -ml-2 px-2 inline-flex items-center gap-1 rounded-lg hover:text-white disabled:opacity-0 disabled:pointer-events-none"
          aria-label="Previous question"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <span>
          Question {index + 1} of {TOTAL}
        </span>
      </div>
      <div
        className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={index}
        aria-label="Quiz progress"
      >
        <div className="h-full bg-gradient-primary rounded-full transition-all duration-300" style={{ width: `${(index / TOTAL) * 100}%` }} />
      </div>

      <h1 className="mt-8 mb-6 !text-4xl sm:!text-5xl">{question.prompt}</h1>

      <div role="radiogroup" aria-label={question.prompt} className="grid gap-3">
        {question.options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => select(option.value)}
              className={`min-h-[52px] w-full text-left px-4 py-3 rounded-xl border text-base transition-colors ${
                isSelected
                  ? 'border-[#FF004F] bg-[#FF004F]/10 text-white'
                  : 'border-white/15 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuizPage;
