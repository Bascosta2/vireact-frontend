import { ANALYSIS_STATUS, UPLOAD_STATUS } from '@/constants';

export type StatusKind = 'complete' | 'analyzing' | 'queued' | 'failed' | 'uploading' | 'pending';

export const statusKind = (analysisStatus?: string, uploadStatus?: string): StatusKind => {
  if (analysisStatus === ANALYSIS_STATUS.COMPLETED) return 'complete';
  if (analysisStatus === ANALYSIS_STATUS.FAILED) return 'failed';
  if (analysisStatus === ANALYSIS_STATUS.PROCESSING) return 'analyzing';
  if (analysisStatus === ANALYSIS_STATUS.QUEUED) return 'queued';
  if (uploadStatus === UPLOAD_STATUS.UPLOADING) return 'uploading';
  return 'pending';
};

export const isInProgress = (kind: StatusKind) => kind === 'analyzing' || kind === 'queued' || kind === 'uploading' || kind === 'pending';

/** A "pending" video older than this was never queued (abandoned or failed upload), so it is not analyzing. */
const ABANDONED_PENDING_MS = 2 * 60 * 60 * 1000;

/**
 * Whether a video counts toward the "N analyzing" badge. Failed uploads are hidden in the Library,
 * so they never count; nor do pending videos nobody queued within two hours.
 */
export const isPendingVideo = (
  v: { analysisStatus?: string; uploadStatus?: string; updatedAt?: string; createdAt?: string },
  now = Date.now()
): boolean => {
  if (v.uploadStatus === UPLOAD_STATUS.FAILED) return false;
  if (v.analysisStatus === ANALYSIS_STATUS.QUEUED || v.analysisStatus === ANALYSIS_STATUS.PROCESSING) return true;
  if (v.analysisStatus !== ANALYSIS_STATUS.PENDING) return false;
  const changed = Date.parse(String(v.updatedAt ?? v.createdAt ?? ''));
  return Number.isNaN(changed) || now - changed < ABANDONED_PENDING_MS;
};

export const formatVideoDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
