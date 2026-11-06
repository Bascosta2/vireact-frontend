import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getUserVideos, getVideoStatus, uploadVideoFileToTwelveLabs, type CreatorContext, type Video } from '@/api/video';
import { ANALYSIS_STATUS } from '@/constants';
import { useSubscription } from '@/redux/hooks/use-subscription';
import type { AnalysisStage, NotifyState } from '@/components/app/ProgressPanel';
import { VIDEO_ERRORS } from '@/lib/video-file';

export type AnalysisJob = {
  fileName: string;
  stage: AnalysisStage;
  uploadPercent: number;
  startedAt: number;
  videoId: string | null;
  errorMessage: string | null;
};

type ActiveAnalysesValue = {
  job: AnalysisJob | null;
  /** Videos the server still reports as queued or processing (includes `job` once uploaded). */
  inProgressCount: number;
  notifyState: NotifyState;
  start: (file: File, features: string[], creator?: CreatorContext) => Promise<void>;
  retry: () => void;
  reset: () => void;
  enableNotifications: () => void;
};

const ActiveAnalysesContext = createContext<ActiveAnalysesValue | null>(null);

const STATUS_POLL_MS = 5000;
const LIST_POLL_MS = 15000;

const isPendingVideo = (v: Video) =>
  v.analysisStatus === ANALYSIS_STATUS.QUEUED ||
  v.analysisStatus === ANALYSIS_STATUS.PROCESSING ||
  v.analysisStatus === ANALYSIS_STATUS.PENDING;

const initialNotifyState = (): NotifyState => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return 'idle';
};

const uploadErrorMessage = (err: unknown): string => {
  const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  const message = e?.response?.data?.message;
  if (e?.response?.status === 403 && message?.includes('limit')) return `${message} Visit Settings > Subscription to upgrade.`;
  return message || VIDEO_ERRORS.uploadFailed;
};

/**
 * Owns the one upload + analysis the user starts from /new, above the page level,
 * so navigating away keeps the request and status polling alive.
 */
export function ActiveAnalysesProvider({ children }: { children: ReactNode }) {
  const { refetch: refetchSubscription } = useSubscription();
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [serverPending, setServerPending] = useState(0);
  const [notifyState, setNotifyState] = useState<NotifyState>(initialNotifyState);
  const lastRequest = useRef<{ file: File; features: string[]; creator?: CreatorContext } | null>(null);
  const notifyRef = useRef(false);

  const patch = useCallback((p: Partial<AnalysisJob>) => setJob((prev) => (prev ? { ...prev, ...p } : prev)), []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const videos = await getUserVideos();
      setServerPending(videos.filter(isPendingVideo).length);
    } catch {
      // Badge is best effort; the Library page shows the authoritative list.
    }
  }, []);

  useEffect(() => {
    void refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    if (serverPending === 0) return;
    const t = setInterval(refreshPendingCount, LIST_POLL_MS);
    return () => clearInterval(t);
  }, [serverPending, refreshPendingCount]);

  const start = useCallback(
    async (file: File, features: string[], creator?: CreatorContext) => {
      lastRequest.current = { file, features, creator };
      setJob({ fileName: file.name, stage: 'uploading', uploadPercent: 0, startedAt: Date.now(), videoId: null, errorMessage: null });
      try {
        const video = await uploadVideoFileToTwelveLabs(file, file.name, features, (pct) => {
          patch(pct >= 100 ? { uploadPercent: 100, stage: 'preparing' } : { uploadPercent: pct });
        }, creator);
        patch({ stage: 'analyzing', uploadPercent: 100, videoId: video?._id ?? null });
        void refetchSubscription();
        void refreshPendingCount();
      } catch (err) {
        patch({ stage: 'failed', errorMessage: uploadErrorMessage(err) });
      }
    },
    [patch, refetchSubscription, refreshPendingCount]
  );

  const videoId = job?.videoId ?? null;
  const stage = job?.stage;

  useEffect(() => {
    if (stage !== 'analyzing' || !videoId) return;
    let cancelled = false;
    const check = async () => {
      try {
        const status = await getVideoStatus(videoId);
        if (cancelled) return;
        if (status.analysisStatus === ANALYSIS_STATUS.COMPLETED || status.isAnalysisReady) {
          patch({ stage: 'ready' });
          void refreshPendingCount();
          if (notifyRef.current && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Analysis ready', { body: 'Your Vireact results are ready to open.' });
          }
        } else if (status.analysisStatus === ANALYSIS_STATUS.FAILED) {
          patch({ stage: 'failed', errorMessage: status.errorSummary || 'The analysis failed. Try again.' });
          void refreshPendingCount();
        }
      } catch {
        // Transient status errors: keep polling.
      }
    };
    void check();
    const t = setInterval(check, STATUS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [stage, videoId, patch, refreshPendingCount]);

  const uploading = stage === 'uploading' || stage === 'preparing';
  useEffect(() => {
    if (!uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [uploading]);

  const enableNotifications = useCallback(() => {
    if (!('Notification' in window)) return setNotifyState('unsupported');
    void Notification.requestPermission().then((perm) => {
      notifyRef.current = perm === 'granted';
      setNotifyState(perm === 'granted' ? 'on' : perm === 'denied' ? 'denied' : 'idle');
    });
  }, []);

  const retry = useCallback(() => {
    if (lastRequest.current) void start(lastRequest.current.file, lastRequest.current.features, lastRequest.current.creator);
  }, [start]);

  const reset = useCallback(() => {
    lastRequest.current = null;
    setJob(null);
  }, []);

  const localRunning = job && job.stage !== 'ready' && job.stage !== 'failed' ? 1 : 0;
  const inProgressCount = Math.max(serverPending, localRunning);

  const value = useMemo(
    () => ({ job, inProgressCount, notifyState, start, retry, reset, enableNotifications }),
    [job, inProgressCount, notifyState, start, retry, reset, enableNotifications]
  );

  return <ActiveAnalysesContext.Provider value={value}>{children}</ActiveAnalysesContext.Provider>;
}

export const useActiveAnalyses = (): ActiveAnalysesValue => {
  const ctx = useContext(ActiveAnalysesContext);
  if (!ctx) throw new Error('useActiveAnalyses must be used within ActiveAnalysesProvider');
  return ctx;
};
