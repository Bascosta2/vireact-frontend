import { ANALYSIS_STATUS } from '@/constants';
import { videoName } from '@/lib/video-file';
import type { SearchableVideo } from '@/lib/video-query';

export type NoticeKind = 'finished' | 'failed' | 'log-views';

export interface Notice {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  href: string;
  at: number;
}

const DAY = 86_400_000;
const RECENT_MS = 7 * DAY;
/** Real views mean something a few days after posting. */
const LOG_VIEWS_AFTER_MS = 3 * DAY;

type NoticeVideo = SearchableVideo & { updatedAt?: string };

/**
 * What the bell shows, worked out from the video list: analyses that finished or failed this week, and
 * one reminder for videos old enough to log their real views. Newest first.
 */
export function buildNotices(videos: NoticeVideo[], now = Date.now()): Notice[] {
  const out: Notice[] = [];
  for (const v of videos) {
    const at = Date.parse(v.updatedAt ?? v.createdAt);
    if (!Number.isFinite(at) || now - at > RECENT_MS) continue;
    const name = videoName(v);
    if (v.analysisStatus === ANALYSIS_STATUS.COMPLETED) {
      const score = typeof v.viralityScore === 'number' ? ` Score ${Math.round(v.viralityScore)}.` : '';
      out.push({ id: `done-${v._id}`, kind: 'finished', title: 'Analysis finished', body: `${name}.${score}`, href: `/videos/${v._id}`, at });
    } else if (v.analysisStatus === ANALYSIS_STATUS.FAILED) {
      out.push({ id: `failed-${v._id}`, kind: 'failed', title: 'Analysis failed', body: `${name}. Open the Library to try again.`, href: '/videos?q=status:failed', at });
    }
  }
  const waiting = videos
    .filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED && v.actualViews == null && now - Date.parse(v.createdAt) > LOG_VIEWS_AFTER_MS)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (waiting.length > 0) {
    // One reminder, dated by the newest video that became due, so it reappears when another one does.
    const dueAt = Date.parse(waiting[0].createdAt) + LOG_VIEWS_AFTER_MS;
    out.push({
      id: `views-${waiting.length}-${waiting[0]._id}`,
      kind: 'log-views',
      title: 'Time to log views',
      body: waiting.length === 1 ? `${videoName(waiting[0])} is waiting for its real views.` : `${waiting.length} videos are waiting for their real views.`,
      href: `/analytics?tab=videos&log=${waiting[0]._id}`,
      at: dueAt,
    });
  }
  return out.sort((a, b) => b.at - a.at);
}

const SEEN_KEY = 'vireact_notices_seen_at';

export const readSeenAt = (): number => {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
};

export const writeSeenAt = (at: number) => {
  try {
    localStorage.setItem(SEEN_KEY, String(at));
  } catch {
    // ignore
  }
};
