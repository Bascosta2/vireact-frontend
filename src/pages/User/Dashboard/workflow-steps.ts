import type { EditorUsage } from '@/api/editor';
import type { AnalyticsOverview } from '@/api/analytics';
import { cleanVideoTitle } from '@/lib/video-file';

/** Copy and live status for the Home workflow map (WorkflowMap.tsx). */

export type WorkflowStepId = 'analyze' | 'fix' | 'edit' | 'grow';

export interface WorkflowData {
  /** Completed analyses. */
  analyzed: number;
  /** Latest completed analysis, for the Fix step. */
  latest: { id: string; title: string; score: number | null } | null;
  /** Undefined while loading; null when it could not load. */
  editor?: EditorUsage | null;
  overview?: AnalyticsOverview | null;
}

/** The one step to nudge toward. */
export const nextWorkflowStep = ({ analyzed, editor, overview }: WorkflowData): WorkflowStepId => {
  if (analyzed === 0) return 'analyze';
  if (editor?.available && editor.canStart && editor.used === 0) return 'edit';
  if ((overview?.needsResults.length ?? 0) > 0) return 'grow';
  return 'analyze';
};

const freeResetDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  title: string;
  body: string;
  status: string;
  cta: { label: string; to: string };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Copy, live status and link for each step. */
export const workflowSteps = (data: WorkflowData): WorkflowStep[] => {
  const { analyzed, latest, editor, overview } = data;
  const waiting = overview?.needsResults.length ?? 0;
  const withResults = overview?.totals.withResults ?? 0;

  const editStatus =
    editor === undefined
      ? 'Checking your edits…'
      : editor === null || !editor.available
        ? 'Opening soon'
        : editor.plan === 'free'
          ? editor.canStart
            ? 'Free AI edit ready to use'
            : `Next free edit on ${freeResetDate(editor.resetsOn)}`
          : `${editor.remaining} of ${editor.limit} AI edits left`;

  return [
    {
      id: 'analyze',
      label: 'Analyze',
      title: 'Score it before you post',
      body: 'Hook, pacing, audio and captions, each scored, plus a views prediction. Takes 2 to 5 minutes.',
      status: analyzed > 0 ? `${plural(analyzed, 'video')} scored so far` : 'Start with any short you have',
      cta: { label: 'New analysis', to: '/new' },
    },
    {
      id: 'fix',
      label: 'Fix',
      title: 'Know exactly what to change',
      body: 'Notes on the exact second to fix, a rewritten hook, and an AI coach to ask anything.',
      status: latest ? `Latest: ${cleanVideoTitle(latest.title)}${latest.score != null ? ` · ${latest.score}` : ''}` : 'Your notes appear after the first analysis',
      cta: latest ? { label: 'Open latest report', to: `/videos/${latest.id}` } : { label: 'See your library', to: '/videos' },
    },
    {
      id: 'edit',
      label: 'Edit',
      title: 'Let AI make the edit',
      body: 'Upload raw footage and get tighter cuts, captions, zooms, a stronger hook and music.',
      status: editStatus,
      cta: { label: 'Open editor', to: '/editor' },
    },
    {
      id: 'grow',
      label: 'Grow',
      title: 'Post, track, repeat',
      body: 'Log real views, see what is working for you and get a 2-week plan of what to post.',
      status:
        waiting > 0
          ? `${plural(waiting, 'video')} waiting for views`
          : withResults > 0
            ? `${plural(withResults, 'video')} with real views`
            : 'Log views after you post',
      cta: { label: 'Open analytics', to: '/analytics' },
    },
  ];
};
