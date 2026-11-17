import { ANALYSIS_STATUS } from '@/constants';

/** Minimal shape the hub pages and the video picker need from a video in the list. */
export interface HubVideo {
  _id: string;
  filename?: string;
  analysisStatus: string;
  createdAt?: string;
}

const LAST_VIDEO_KEY = 'vireact_last_video';

/** Remember the video the person last opened, so the sidebar's view links come back to it. */
export function rememberLastVideo(videoId: string): void {
  try {
    sessionStorage.setItem(LAST_VIDEO_KEY, videoId);
  } catch {
    // Storage blocked (private mode): the hub falls back to the latest video.
  }
}

export function readLastVideo(): string | null {
  try {
    return sessionStorage.getItem(LAST_VIDEO_KEY);
  } catch {
    return null;
  }
}

const isPending = (status: string) =>
  status === ANALYSIS_STATUS.PENDING || status === ANALYSIS_STATUS.QUEUED || status === ANALYSIS_STATUS.PROCESSING;

/** Analysed videos, newest first. Only these have a report, a coach and scripts. */
export function completedVideos<T extends HubVideo>(videos: T[]): T[] {
  return videos
    .filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED)
    .sort((a, b) => Date.parse(b.createdAt ?? '') - Date.parse(a.createdAt ?? '') || 0);
}

/**
 * Which video a hub page opens: the last one opened this session if it is still analysed, otherwise the
 * newest analysed one. `running` is a video still being analysed, shown when nothing is ready yet.
 */
export function pickHubVideo<T extends HubVideo>(videos: T[], lastVideoId: string | null): { open: T | null; running: T | null } {
  const done = completedVideos(videos);
  const remembered = lastVideoId ? done.find((v) => v._id === lastVideoId) : undefined;
  const running = videos.find((v) => isPending(v.analysisStatus)) ?? null;
  return { open: remembered ?? done[0] ?? null, running };
}
