import Axios from '@/api';
import type { Attribution } from '@/funnel/attribution';
import type { QuizAnswers } from '@/funnel/quiz.config';

export interface LibraryHook {
  slug: string;
  type: 'hook' | 'structure' | 'insight';
  title: string | null;
  displayText: string;
  category: string | null;
}

export interface FunnelResults {
  sessionId: string;
  answers: Partial<QuizAnswers>;
  diagnosis: { headline: string; body: string; nextStep: string } | null;
  hooks: LibraryHook[];
  hooksHidden: boolean;
  highIntent: boolean;
  recommendedPlan: 'premium' | 'pro';
  emailCaptured: boolean;
  emailDelivery: boolean;
  rewritesUsed: number;
}

export interface HookRewriteResult {
  diagnosis: string;
  rewrites: Array<{ line: string; sourceItemSlug: string | null }>;
}

type Envelope<T> = { data: T };

export const createFunnelSession = async (body: { attribution?: Attribution | null; entryItemSlug?: string }) =>
  (await Axios.post<Envelope<{ sessionId: string }>>('/funnel/sessions', body)).data.data.sessionId;

export const patchFunnelSession = async (sessionId: string, body: { answers?: Partial<QuizAnswers>; step?: string }) =>
  (await Axios.patch(`/funnel/sessions/${sessionId}`, body)).data;

export const completeFunnelSession = async (sessionId: string) =>
  (await Axios.post<Envelope<FunnelResults>>(`/funnel/sessions/${sessionId}/complete`)).data.data;

export const fetchFunnelResults = async (sessionId: string) =>
  (await Axios.get<Envelope<FunnelResults>>(`/funnel/sessions/${sessionId}/results`)).data.data;

export const captureFunnelEmail = async (sessionId: string, email: string) =>
  (await Axios.post(`/funnel/sessions/${sessionId}/email`, { email })).data;

export const requestHookRewrite = async (body: { sessionId?: string | null; hookLine: string }) =>
  (await Axios.post<Envelope<HookRewriteResult>>('/funnel/hook-rewrite', body)).data.data;
