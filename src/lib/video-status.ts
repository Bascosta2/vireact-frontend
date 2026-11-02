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

export const formatVideoDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
