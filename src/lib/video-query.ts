import { ANALYSIS_STATUS } from '@/constants';
import { videoName, type NameableVideo } from '@/lib/video-file';

/** A video as the search sees it (the Library summary list). */
export interface SearchableVideo extends NameableVideo {
  _id: string;
  analysisStatus?: string;
  uploadStatus?: string;
  viralityScore?: number | null;
  actualViews?: number | null;
  creatorPlatform?: string | null;
  createdAt: string;
}

export type VideoState = 'ready' | 'analyzing' | 'failed' | 'needs-views';

/** One filter typed into search, like `score:<40` or `status:ready`. */
export interface QueryToken {
  key: 'score' | 'status' | 'platform' | 'date' | 'needs';
  raw: string;
  /** Short label for a removable chip. */
  label: string;
  test: (v: SearchableVideo) => boolean;
}

export interface ParsedQuery {
  text: string;
  tokens: QueryToken[];
}

/** Filters offered under the search box, Stripe style. */
export const QUERY_HINTS: { token: string; label: string }[] = [
  { token: 'score:<40', label: 'Score under 40' },
  { token: 'status:ready', label: 'Ready to review' },
  { token: 'needs:views', label: 'Waiting for real views' },
  { token: 'platform:tiktok', label: 'Made for TikTok' },
  { token: 'date:2026/11', label: 'Uploaded in a month' },
];

const IN_PROGRESS = [ANALYSIS_STATUS.PENDING, ANALYSIS_STATUS.QUEUED, ANALYSIS_STATUS.PROCESSING] as string[];

/** Where a video is: ready, analyzing, failed, or ready but still waiting for its real view count. */
export const videoState = (v: Pick<SearchableVideo, 'analysisStatus' | 'actualViews' | 'viralityScore'>): VideoState => {
  if (v.analysisStatus === ANALYSIS_STATUS.FAILED) return 'failed';
  if (v.analysisStatus === ANALYSIS_STATUS.COMPLETED) return v.actualViews == null ? 'needs-views' : 'ready';
  if (!v.analysisStatus || IN_PROGRESS.includes(v.analysisStatus)) return 'analyzing';
  return 'analyzing';
};

const isReady = (v: SearchableVideo) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED;

const scoreToken = (raw: string, value: string): QueryToken | null => {
  const m = /^(<=|>=|<|>|=)?\s*(\d{1,3})$/.exec(value);
  if (!m) return null;
  const op = m[1] ?? '=';
  const n = Number(m[2]);
  const cmp: Record<string, (s: number) => boolean> = {
    '<': (s) => s < n,
    '<=': (s) => s <= n,
    '>': (s) => s > n,
    '>=': (s) => s >= n,
    '=': (s) => Math.round(s) === n,
  };
  const words: Record<string, string> = { '<': 'under', '<=': 'at most', '>': 'over', '>=': 'at least', '=': '' };
  return {
    key: 'score',
    raw,
    label: `Score ${words[op] ? `${words[op]} ` : ''}${n}`,
    test: (v) => typeof v.viralityScore === 'number' && cmp[op](v.viralityScore),
  };
};

const STATUS_WORDS: Record<string, { label: string; test: (v: SearchableVideo) => boolean }> = {
  ready: { label: 'Ready', test: isReady },
  done: { label: 'Ready', test: isReady },
  analyzing: { label: 'Analyzing', test: (v) => videoState(v) === 'analyzing' },
  processing: { label: 'Analyzing', test: (v) => videoState(v) === 'analyzing' },
  failed: { label: 'Failed', test: (v) => videoState(v) === 'failed' },
};

const dateToken = (raw: string, value: string): QueryToken | null => {
  const m = /^(\d{4})(?:[/-](\d{1,2}))?(?:[/-](\d{1,2}))?$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), m[2] ? Number(m[2]) : null, m[3] ? Number(m[3]) : null];
  const label = d
    ? new Date(y, (mo ?? 1) - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : mo
      ? new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : String(y);
  return {
    key: 'date',
    raw,
    label,
    test: (v) => {
      const t = new Date(v.createdAt);
      if (Number.isNaN(t.getTime())) return false;
      return t.getFullYear() === y && (mo == null || t.getMonth() + 1 === mo) && (d == null || t.getDate() === d);
    },
  };
};

/** Splits what was typed into plain words and `key:value` filters. Unknown filters stay as words. */
export function parseVideoQuery(input: string): ParsedQuery {
  const tokens: QueryToken[] = [];
  const words: string[] = [];
  for (const part of input.trim().split(/\s+/).filter(Boolean)) {
    const m = /^(score|status|platform|date|needs|is):(.+)$/i.exec(part);
    if (!m) {
      words.push(part);
      continue;
    }
    const key = m[1].toLowerCase();
    const value = m[2].toLowerCase();
    let token: QueryToken | null = null;
    if (key === 'score') token = scoreToken(part, value);
    else if ((key === 'status' || key === 'is') && STATUS_WORDS[value]) token = { key: 'status', raw: part, label: STATUS_WORDS[value].label, test: STATUS_WORDS[value].test };
    else if (key === 'platform')
      token = { key: 'platform', raw: part, label: value.charAt(0).toUpperCase() + value.slice(1), test: (v) => (v.creatorPlatform ?? '').toLowerCase() === value };
    else if (key === 'date') token = dateToken(part, value);
    else if (key === 'needs' && (value === 'views' || value === 'results'))
      token = { key: 'needs', raw: part, label: 'Needs views', test: (v) => videoState(v) === 'needs-views' };
    if (token) tokens.push(token);
    else words.push(part);
  }
  return { text: words.join(' '), tokens };
}

/** True when a video matches every filter and every typed word (in its name or file name). */
export function matchesVideoQuery(v: SearchableVideo, q: ParsedQuery): boolean {
  if (!q.tokens.every((t) => t.test(v))) return false;
  if (!q.text) return true;
  const hay = `${videoName(v)} ${v.filename ?? ''} ${v.title ?? ''} ${v.autoTitle ?? ''}`.toLowerCase();
  return q.text
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w));
}

/** The query with one filter taken out (removing a chip). */
export const removeQueryToken = (input: string, raw: string): string =>
  input
    .split(/\s+/)
    .filter((p) => p && p !== raw)
    .join(' ');
