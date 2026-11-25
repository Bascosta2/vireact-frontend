import type { Video } from '@/api/video';
import { formatCompact } from '@/components/charts/chart-theme';
import { formatDuration, formatFileSize } from '@/lib/video-file';
import { PLATFORM_LABELS } from '@/pages/User/Analytics/labels';

export type HistoryVideo = Video & { actualViewsReportedAt?: string | null };

export interface HistoryStep {
  id: string;
  label: string;
  detail?: string;
  at?: string | null;
  done: boolean;
  action?: { label: string; to: string };
}

export const when = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

/** The story of one video, oldest first: uploaded, analyzed, scripts, posted, real views. */
export function videoHistory(v: HistoryVideo): HistoryStep[] {
  const score = typeof v.viralityScore === 'number' ? Math.round(v.viralityScore) : null;
  const scripts = Array.isArray(v.scriptSuggestions) ? v.scriptSuggestions.length : 0;
  const platform = v.creatorPlatform ? (PLATFORM_LABELS[v.creatorPlatform] ?? v.creatorPlatform) : null;
  return [
    { id: 'uploaded', label: 'Uploaded', detail: [formatDuration(v.duration), v.fileSize ? formatFileSize(v.fileSize) : ''].filter(Boolean).join(' · ') || undefined, at: v.createdAt, done: true },
    { id: 'analyzed', label: score != null ? `Analyzed, score ${score}` : 'Analyzed', detail: v.selectedFeatures?.length ? `${v.selectedFeatures.length} checks` : undefined, done: v.analysisStatus === 'completed' },
    {
      id: 'scripts',
      label: scripts > 0 ? `${scripts} script ${scripts === 1 ? 'idea' : 'ideas'} written` : 'Script ideas',
      done: scripts > 0,
      action: scripts > 0 ? undefined : { label: 'Write scripts', to: `/videos/${v._id}/scripts` },
    },
    {
      id: 'posted',
      label: v.postedAt ? `Posted${platform ? ` on ${platform}` : ''}` : 'Posted',
      at: v.postedAt ?? null,
      done: Boolean(v.postedAt),
      action: v.postedAt ? undefined : { label: 'Add when you post', to: `/analytics?tab=videos&log=${v._id}` },
    },
    {
      id: 'views',
      label: v.actualViews != null ? `${formatCompact(v.actualViews)} real views logged` : 'Real views',
      at: v.actualViewsReportedAt ?? null,
      done: v.actualViews != null,
      action: v.actualViews != null ? undefined : { label: 'Log views', to: `/analytics?tab=videos&log=${v._id}` },
    },
  ];
}
