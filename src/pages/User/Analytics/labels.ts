import { QUIZ_QUESTIONS } from '@/funnel/quiz.config';
import type { CheckId, Goal, Outcome } from '@/api/analytics';
import { CHART } from '@/components/charts/chart-theme';

export const CHECK_LABELS: Record<CheckId | 'virality', string> = {
  virality: 'Virality score',
  hook: 'Hook',
  pacing: 'Pacing',
  audio: 'Audio',
  caption: 'Caption',
};

/** Niche options shared with the funnel quiz (values match the backend NICHES list). */
export const NICHE_OPTIONS = QUIZ_QUESTIONS.find((q) => q.key === 'niche')?.options ?? [];

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'grow_followers', label: 'Grow followers' },
  { value: 'more_views', label: 'Get more views per post' },
  { value: 'monetize', label: 'Earn from my content' },
  { value: 'brand', label: 'Build my brand or business' },
];

export const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  other: 'Other',
};

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Outcome vs prediction. Color never stands alone: each has a shape and a word. */
export const OUTCOME_META: Record<Outcome, { label: string; color: string; shape: 'up' | 'dot' | 'down'; badge: string }> = {
  beat: { label: 'Beat prediction', color: CHART.good, shape: 'up', badge: 'border-success/30 bg-success/10 text-success' },
  within: { label: 'Within range', color: CHART.series1, shape: 'dot', badge: 'border-line bg-white/[0.04] text-fg-muted' },
  under: { label: 'Under prediction', color: CHART.serious, shape: 'down', badge: 'border-warning/30 bg-warning/10 text-warning' },
};

export const OUTCOME_GLYPH: Record<Outcome, string> = { beat: '▲', within: '●', under: '▼' };
