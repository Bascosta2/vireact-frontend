import Axios from './index';

export type AnalyticsRange = '30d' | '90d' | 'all';
export type Outcome = 'beat' | 'within' | 'under';
export type CheckId = 'hook' | 'pacing' | 'audio' | 'caption';

export interface ScorePoint {
  videoId: string;
  title: string;
  date: string;
  score: number;
  rollingAvg: number | null;
}

export interface CheckTrend {
  check: CheckId;
  average: number | null;
  delta: number | null;
  count: number;
}

export type CheckWeek = { week: string } & Record<CheckId, number | null>;

export interface PredictionRow {
  videoId: string;
  title: string;
  date: string;
  low: number | null;
  expected: number | null;
  high: number | null;
  actual: number;
  outcome: Outcome | null;
}

export interface ViewsRow {
  videoId: string;
  title: string;
  date: string;
  posted: boolean;
  views: number;
  score: number | null;
  snapshots: { capturedAt: string; hoursSincePost: number | null; views: number }[];
}

export interface Driver {
  metric: 'virality' | CheckId;
  rho: number;
  n: number;
}

export interface PostingWindows {
  timeZone: string;
  days: { day: number; label: string; medianViews: number; posts: number }[];
  blocks: { startHour: number; medianViews: number; posts: number }[];
  bestDay: { day: number; label: string; medianViews: number; posts: number } | null;
  bestBlock: { startHour: number; medianViews: number; posts: number } | null;
  posts: number;
}

export interface NeedsResultsItem {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  createdAt: string;
  postedAt: string | null;
  score: number;
}

export interface AnalyticsOverview {
  range: AnalyticsRange;
  totals: { videos: number; withResults: number };
  kpis: {
    avgScore: number | null;
    prevAvgScore: number | null;
    scoreDelta: number | null;
    bestScore: number | null;
    videosAnalyzed: number;
    viewsLogged: number;
    resultsLogged: number;
    postsPerWeek: number | null;
    weeklyStreak: number;
  };
  scoreSeries: ScorePoint[];
  checkSeries: CheckWeek[];
  checkTrends: CheckTrend[];
  predictions: PredictionRow[];
  accuracy: { total: number; beat: number; within: number; under: number; withinRate: number | null; medianRatio: number | null };
  viewsSeries: ViewsRow[];
  drivers: Driver[] | null;
  postingWindows: PostingWindows | null;
  needsResults: NeedsResultsItem[];
}

export interface AnalyticsVideoRow {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  createdAt: string;
  score: number;
  checks: Record<CheckId, number | null>;
  predicted: { low: number | null; expected: number | null; high: number | null };
  postedAt: string | null;
  postUrl: string | null;
  platform: string | null;
  latestViews: number | null;
  latestCapturedAt: string | null;
  snapshotCount: number;
  outcome: Outcome | null;
}

export type Goal = 'grow_followers' | 'more_views' | 'monetize' | 'brand';

export interface CreatorProfile {
  niche: string | null;
  platforms: string[];
  followers: number | null;
  goal: Goal | null;
  postsPerWeek: number | null;
  preferredDays: number[];
  timezone: string | null;
  updatedAt: string | null;
  source: 'saved' | 'quiz' | 'empty';
  complete: boolean;
}

export type CreatorProfileInput = {
  niche: string;
  platforms: string[];
  followers: number | null;
  goal: Goal;
  postsPerWeek: number;
  preferredDays: number[];
  timezone: string;
};

export interface EvidenceItem {
  point: string;
  metric: string;
  evidenceVideoIds: string[];
}

export type SlotStatus = 'planned' | 'posted' | 'skipped';

export interface StrategySlot {
  id: string;
  date: string;
  timeLocal: string;
  platform: string;
  pillar: string;
  title: string;
  concept: string;
  hook: string;
  beats: string[];
  lengthSec: number;
  cta: string;
  rationale: string;
  status: SlotStatus;
  linkedVideoId: string | null;
}

export interface Strategy {
  id: string;
  status: string;
  generatedAt: string;
  confidence: 'low' | 'medium' | 'high';
  inputSummary: { videos: number; withResults: number; avgScore: number | null; medianViews: number | null } | null;
  diagnosis: { headline: string; strengths: EvidenceItem[]; weaknesses: EvidenceItem[] } | null;
  pillars: { name: string; why: string; targetShare: number; evidenceVideoIds: string[] }[];
  formula: { hookPatterns: string[]; idealLengthSec: number; pacing: string; captionStyle: string; ctaStyle: string; avoid: string[] } | null;
  schedule: { startDate: string; endDate: string; timezone: string; slots: StrategySlot[] } | null;
  experiments: { hypothesis: string; howToTest: string; successMetric: string }[];
  nextMilestone: { metric: 'results_logged' | 'median_views'; target: number; current: number; basis: string } | null;
  videos: Record<string, { title: string; thumbnailUrl: string | null; score: number | null; actualViews: number | null }>;
}

export interface StrategyUsage {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  resetsOn: string;
  locked: boolean;
}

export interface StrategyState {
  strategy: Strategy | null;
  generating: boolean;
  usage: StrategyUsage;
  profile: CreatorProfile;
  history: { id: string; generatedAt: string; confidence: string }[];
}

/** Writing a plan takes one or two model calls; give it well over the default 30 s. */
const STRATEGY_TIMEOUT_MS = 150_000;

export const getAnalyticsOverview = async (range: AnalyticsRange): Promise<AnalyticsOverview> => {
  const response = await Axios.get<{ data: AnalyticsOverview }>('/analytics/overview', { params: { range } });
  return response.data.data;
};

export const getAnalyticsVideos = async (): Promise<AnalyticsVideoRow[]> => {
  const response = await Axios.get<{ data: { videos: AnalyticsVideoRow[] } }>('/analytics/videos');
  return response.data.data.videos;
};

export const getCreatorProfile = async (): Promise<CreatorProfile> => {
  const response = await Axios.get<{ data: CreatorProfile }>('/analytics/profile');
  return response.data.data;
};

export const saveCreatorProfile = async (input: CreatorProfileInput): Promise<CreatorProfile> => {
  const response = await Axios.put<{ data: CreatorProfile }>('/analytics/profile', input);
  return response.data.data;
};

export const getStrategy = async (id?: string): Promise<StrategyState> => {
  const response = await Axios.get<{ data: StrategyState }>('/analytics/strategy', { params: id ? { id } : undefined });
  return response.data.data;
};

export const generateStrategy = async (): Promise<{ strategy: Strategy; usage: StrategyUsage }> => {
  const response = await Axios.post<{ data: { strategy: Strategy; usage: StrategyUsage } }>('/analytics/strategy', {}, { timeout: STRATEGY_TIMEOUT_MS });
  return response.data.data;
};

export const updateStrategySlot = async (
  strategyId: string,
  slotId: string,
  body: { status?: SlotStatus; linkedVideoId?: string | null }
): Promise<Strategy> => {
  const response = await Axios.patch<{ data: { strategy: Strategy } }>(`/analytics/strategy/${strategyId}/slots/${slotId}`, body);
  return response.data.data.strategy;
};

/** Server message from an axios error, or a fallback. */
export const apiErrorMessage = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

/** Machine-readable code the server attached (e.g. UPGRADE_REQUIRED). */
export const apiErrorCode = (err: unknown): string | null =>
  (err as { response?: { data?: { data?: { code?: string } } } })?.response?.data?.data?.code ?? null;
