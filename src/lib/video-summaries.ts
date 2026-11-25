import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { getUserVideos, type Video } from '@/api/video';
import { UPLOAD_STATUS } from '@/constants';

/**
 * One shared copy of the video list for the app chrome (search, notifications, shortcuts), so opening
 * the command bar or the bell does not refetch every time. Pages that need it live (Library) still load
 * their own and push it here with `primeVideoSummaries`.
 */

const FRESH_MS = 30_000;
const listeners = new Set<() => void>();
let videos: Video[] | null = null;
let loadedAt = 0;
let loadedAtStamp: number | null = null;
let inflight: Promise<Video[]> | null = null;

const emit = () => listeners.forEach((l) => l());

export function primeVideoSummaries(list: Video[]) {
  videos = list.filter((v) => v.uploadStatus !== UPLOAD_STATUS.FAILED);
  loadedAt = Date.now();
  loadedAtStamp = loadedAt;
  emit();
}

/** Patch one video in the shared list (rename, new thumbnail). */
export function patchVideoSummary(id: string, patch: Partial<Video>) {
  if (!videos) return;
  videos = videos.map((v) => (v._id === id ? { ...v, ...patch } : v));
  emit();
}

export function removeVideoSummary(id: string) {
  if (!videos) return;
  videos = videos.filter((v) => v._id !== id);
  emit();
}

export async function loadVideoSummaries(force = false): Promise<Video[]> {
  if (!force && videos && Date.now() - loadedAt < FRESH_MS) return videos;
  if (inflight) return inflight;
  inflight = getUserVideos({ summary: true })
    .then((list) => {
      primeVideoSummaries(list);
      return videos ?? [];
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The shared list (null until it has loaded once) and when it was loaded. Loads it on first use. */
export function useVideoSummaries(): { videos: Video[] | null; loadedAt: number | null; reload: () => Promise<void>; error: boolean } {
  const list = useSyncExternalStore(subscribe, () => videos, () => null);
  const stamp = useSyncExternalStore(subscribe, () => loadedAtStamp, () => null);
  const [error, setError] = useState(false);
  const reload = useCallback(async () => {
    setError(false);
    try {
      await loadVideoSummaries(true);
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    loadVideoSummaries().catch(() => setError(true));
  }, []);
  return { videos: list, loadedAt: stamp, reload, error };
}

/** Test hook. */
export const resetVideoSummariesForTests = () => {
  videos = null;
  loadedAt = 0;
  loadedAtStamp = null;
  inflight = null;
};
