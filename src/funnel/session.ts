import { QUIZ_QUESTIONS, isValidAnswer, type QuizAnswers } from './quiz.config';

/** Local quiz progress so a refresh or the OAuth round-trip does not lose the session. */
export const FUNNEL_STORAGE_KEY = 'vireact_funnel_v2';
const ALIASED_KEY = 'vireact_funnel_aliased';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface FunnelLocalState {
  sessionId: string | null;
  answers: Partial<QuizAnswers>;
  completed: boolean;
}

const EMPTY: FunnelLocalState = { sessionId: null, answers: {}, completed: false };

export const isSessionId = (value: unknown): value is string => typeof value === 'string' && UUID_RE.test(value);

/** Drops unknown keys and values, so a tampered or stale entry cannot reach the API. */
export const parseFunnelState = (raw: string | null): FunnelLocalState => {
  if (!raw) return { ...EMPTY };
  try {
    const data = JSON.parse(raw);
    const answers: Partial<QuizAnswers> = {};
    for (const q of QUIZ_QUESTIONS) {
      if (isValidAnswer(q.key, data?.answers?.[q.key])) answers[q.key] = data.answers[q.key];
    }
    return {
      sessionId: isSessionId(data?.sessionId) ? data.sessionId : null,
      answers,
      completed: data?.completed === true,
    };
  } catch {
    return { ...EMPTY };
  }
};

export const loadFunnelState = (): FunnelLocalState => {
  try {
    return parseFunnelState(localStorage.getItem(FUNNEL_STORAGE_KEY));
  } catch {
    return { ...EMPTY };
  }
};

export const saveFunnelState = (state: FunnelLocalState): void => {
  try {
    localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode); the quiz still works for this page view.
  }
};

export const clearFunnelState = (): void => {
  try {
    localStorage.removeItem(FUNNEL_STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const getFunnelSessionId = (): string | null => loadFunnelState().sessionId;

/** PostHog alias runs once per session id. */
export const markAliased = (sessionId: string): boolean => {
  try {
    if (localStorage.getItem(ALIASED_KEY) === sessionId) return false;
    localStorage.setItem(ALIASED_KEY, sessionId);
    return true;
  } catch {
    return false;
  }
};
