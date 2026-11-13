import type { EditorUsage } from '@/api/editor';
import type { AnalyticsOverview } from '@/api/analytics';

/** Copy and state for the Home workflow pipeline (WorkflowMap.tsx). */

export type WorkflowStepId = 'analyze' | 'fix' | 'edit' | 'grow';

export interface WorkflowData {
  /** Completed analyses. */
  analyzed: number;
  /** Latest completed analysis id, for the Fix step's link. */
  latestId: string | null;
  /** Undefined while loading; null when it could not load. */
  editor?: EditorUsage | null;
  overview?: AnalyticsOverview | null;
}

export interface WorkflowStep {
  id: WorkflowStepId;
  name: string;
  /** One short line: what the step does. */
  line: string;
  to: string;
}

export const workflowSteps = ({ latestId }: Pick<WorkflowData, 'latestId'>): WorkflowStep[] => [
  { id: 'analyze', name: 'Analyze', line: 'Score your hook, pacing, audio and captions', to: '/new' },
  { id: 'fix', name: 'Fix', line: 'See what to change, second by second', to: latestId ? `/videos/${latestId}` : '/videos' },
  { id: 'edit', name: 'Edit', line: 'AI cuts, captions, zooms and music', to: '/editor' },
  { id: 'grow', name: 'Grow', line: 'Track real views, get a posting plan', to: '/analytics' },
];

const ORDER: WorkflowStepId[] = ['analyze', 'fix', 'edit', 'grow'];

/** The one step to nudge toward. */
export const nextWorkflowStep = ({ analyzed, editor, overview }: WorkflowData): WorkflowStepId => {
  if (analyzed === 0) return 'analyze';
  if (editor?.available && editor.canStart && editor.used === 0) return 'edit';
  if ((overview?.needsResults.length ?? 0) > 0) return 'grow';
  return 'analyze';
};

/**
 * How far the trail is lit: steps before the next one are done. A creator who has been through the loop
 * and is back at Analyze has every step lit.
 */
export const workflowProgress = (data: WorkflowData): { next: WorkflowStepId; done: Set<WorkflowStepId> } => {
  const next = nextWorkflowStep(data);
  if (next === 'analyze' && data.analyzed > 0) return { next, done: new Set(ORDER) };
  return { next, done: new Set(ORDER.slice(0, ORDER.indexOf(next))) };
};

export interface Spotlight {
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; to: string };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The single call to action under the pipeline. */
export const workflowSpotlight = (data: WorkflowData): Spotlight => {
  const next = nextWorkflowStep(data);
  if (next === 'edit') {
    const editor = data.editor as EditorUsage;
    return {
      eyebrow: 'Next step',
      title: editor.plan === 'free' ? 'Your free AI edit is ready' : `${editor.remaining} AI edits ready to use`,
      body: 'Drop in raw footage and get back a tighter, captioned edit with a stronger hook.',
      cta: { label: 'Open the editor', to: '/editor' },
    };
  }
  if (next === 'grow') {
    const waiting = data.overview?.needsResults ?? [];
    return {
      eyebrow: 'Next step',
      title: `${plural(waiting.length, 'video')} waiting for views`,
      body: 'Log how they did so Vireact learns what works for you and plans your next posts.',
      cta: { label: 'Log views', to: waiting[0] ? `/analytics?tab=videos&log=${waiting[0].videoId}` : '/analytics' },
    };
  }
  if (data.analyzed === 0) {
    return {
      eyebrow: 'Start here',
      title: 'Analyze your first video',
      body: 'Upload any short. You get a score and exactly what to fix in 2 to 5 minutes.',
      cta: { label: 'Analyze a video', to: '/new' },
    };
  }
  return {
    eyebrow: 'Next step',
    title: 'Score your next video before you post',
    body: 'Every analysis sharpens your plan. Run your next short through Vireact.',
    cta: { label: 'New analysis', to: '/new' },
  };
};
