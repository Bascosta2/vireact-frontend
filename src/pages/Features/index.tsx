import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Wand2, X } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { usePendingUpload } from '@/contexts/PendingUploadContext';
import { getUserVideos, uploadVideoFileToTwelveLabs, uploadVideoUrlToTwelveLabs, type Video } from '@/api/video';
import { ANALYSIS_FEATURES_UI } from '@/data/analysis-features';
import { ANALYSIS_STATUS } from '@/constants';
import { cn } from '@/lib/utils';
import AnalysisProgressModal from '@/components/UI/AnalysisProgressModal';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

const STORAGE_SELECTED = 'vireact-selected-feature-ids';
const SESSION_BANNER_DISMISSED = 'vireact-features-upload-banner-dismissed';

function loadStoredFeatures(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SELECTED);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function Features() {
  const navigate = useNavigate();
  const { pending, clearPending } = usePendingUpload();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>(loadStoredFeatures);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => sessionStorage.getItem(SESSION_BANNER_DISMISSED) === '1'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const simulateProgressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshVideos = useCallback(async () => {
    try {
      const list = await getUserVideos();
      setVideos(list);
    } catch {
      setVideos([]);
    }
  }, []);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SELECTED, JSON.stringify(selectedFeatureIds));
  }, [selectedFeatureIds]);

  const hasProcessingOrCompleted = videos.some(
    (v) =>
      v.analysisStatus === ANALYSIS_STATUS.QUEUED ||
      v.analysisStatus === ANALYSIS_STATUS.PROCESSING ||
      v.analysisStatus === ANALYSIS_STATUS.COMPLETED
  );

  const completedCount = videos.filter((v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED).length;

  const dismissBanner = () => {
    sessionStorage.setItem(SESSION_BANNER_DISMISSED, '1');
    setBannerDismissed(true);
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatureIds((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  const stopSimulatedProgress = () => {
    if (simulateProgressRef.current) {
      clearInterval(simulateProgressRef.current);
      simulateProgressRef.current = null;
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!pending) {
      ErrorNotification('Upload a video first from the Upload page.');
      return;
    }
    if (selectedFeatureIds.length === 0) return;

    setIsUploading(true);
    setAnalysisProgress(0);

    const startSimulatedProgress = () => {
      if (simulateProgressRef.current) return;
      simulateProgressRef.current = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) {
            stopSimulatedProgress();
            return 90;
          }
          return prev + 2;
        });
      }, 1500);
    };

    try {
      if (pending.mode === 'url' && pending.url) {
        setAnalysisProgress(10);
        startSimulatedProgress();
        await uploadVideoUrlToTwelveLabs(
          pending.url.trim(),
          pending.displayName || `video_${Date.now()}.mp4`,
          selectedFeatureIds
        );
        stopSimulatedProgress();
        setAnalysisProgress(100);
        SuccessNotification('Video uploaded successfully!');
      } else if (pending.mode === 'file' && pending.file) {
        await uploadVideoFileToTwelveLabs(
          pending.file,
          pending.file.name,
          selectedFeatureIds,
          (uploadPct) => {
            const stage1 = Math.round((uploadPct / 100) * 33);
            setAnalysisProgress((prev) => Math.max(prev, stage1));
            if (stage1 >= 33) startSimulatedProgress();
          }
        );
        stopSimulatedProgress();
        setAnalysisProgress(100);
        SuccessNotification('Video uploaded successfully!');
        if (pending.videoMetadata?.previewUrl) {
          URL.revokeObjectURL(pending.videoMetadata.previewUrl);
        }
      } else {
        throw new Error('No video file or URL to upload');
      }

      await new Promise((r) => setTimeout(r, 800));
      clearPending();
      await refreshVideos();
      navigate('/videos');
    } catch (err: unknown) {
      stopSimulatedProgress();
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to upload video';
      if ((err as { response?: { status?: number } })?.response?.status === 403 && errorMessage.includes('limit')) {
        ErrorNotification(`${errorMessage} Visit Settings > Subscription to upgrade.`);
      } else {
        ErrorNotification(errorMessage);
      }
      setAnalysisProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [pending, selectedFeatureIds, clearPending, navigate, refreshVideos]);

  const showUploadHint = !hasProcessingOrCompleted && !bannerDismissed && !pending;

  const analyzeDisabled = !pending || selectedFeatureIds.length === 0 || isUploading;

  return (
    <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
      <div className="relative max-w-6xl mx-auto pb-24 sm:pb-10">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[min(70vh,520px)] w-[min(100%,720px)] -translate-x-1/2 rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 27, 107, 0.5) 0%, transparent 70%)',
          }}
        />

        <AnalysisProgressModal isOpen={isUploading} progress={analysisProgress} allowCancel={false} />

        <header className="relative mb-10 text-center">
          <h1
            className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-3"
            style={{
              fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
              background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SELECT FEATURES
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Choose which aspects of your video you want analyzed
          </p>
        </header>

        {showUploadHint && (
          <div
            className="relative mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
            role="status"
          >
            <p className="text-sm text-amber-100/90 pr-8">
              Upload a video first on the Upload page, then return here to select features and start analysis.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                to="/upload"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
              >
                Go to Upload →
              </Link>
              <button
                type="button"
                onClick={dismissBanner}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {pending && (
          <div className="mb-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm text-emerald-100/90">
            <span className="font-semibold text-white">Video ready:</span>{' '}
            <span className="text-emerald-200">{pending.displayName}</span>
            <span className="block mt-1 text-emerald-200/80">
              Select features below, then run analysis. Completed videos in your library: {completedCount}
            </span>
          </div>
        )}

        {/* Mobile 2x3 compact tile grid (<768px) */}
        <div className="md:hidden mx-auto grid grid-cols-2 gap-3">
          {ANALYSIS_FEATURES_UI.map((feature) => {
            const isSelected = selectedFeatureIds.includes(feature.id);
            const Icon = feature.Icon;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                aria-pressed={isSelected}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-2xl border p-3 transition-all duration-200',
                  'bg-gray-900/80 backdrop-blur-sm',
                  isSelected
                    ? 'border-orange-500/60 shadow-[0_0_24px_-4px_rgba(249,115,22,0.35)] bg-orange-500/5'
                    : 'border-white/5'
                )}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow">
                    <CheckCircle className="w-3 h-3" strokeWidth={2.5} />
                  </span>
                )}
                <Icon
                  size={32}
                  strokeWidth={1.5}
                  className={cn('mb-2', isSelected ? 'text-orange-400' : 'text-gray-400')}
                />
                <span className="text-center text-sm font-medium text-white leading-tight">
                  {feature.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop/tablet grid (>=768px) - unchanged from pre-change layout */}
        <div className="hidden md:grid mx-auto max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {ANALYSIS_FEATURES_UI.map((feature) => {
            const isSelected = selectedFeatureIds.includes(feature.id);
            const Icon = feature.Icon;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                className={cn(
                  'relative flex flex-col items-center text-center rounded-2xl border p-6 min-h-[200px] transition-all duration-200',
                  'bg-gray-900/80 backdrop-blur-sm',
                  isSelected
                    ? 'border-orange-500/60 shadow-[0_0_24px_-4px_rgba(249,115,22,0.35)] bg-orange-500/5'
                    : 'border-white/5 hover:border-white/10'
                )}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg">
                    <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                )}
                <Icon
                  size={36}
                  strokeWidth={1.5}
                  className={cn('mb-4', isSelected ? 'text-orange-400' : 'text-gray-400')}
                />
                <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-2">{feature.name}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mx-auto max-w-5xl mt-10 rounded-2xl border border-white/5 bg-gray-900/50 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
            Selected features ({selectedFeatureIds.length}/6)
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedFeatureIds.length > 0 ? (
              selectedFeatureIds.map((id) => {
                const f = ANALYSIS_FEATURES_UI.find((x) => x.id === id);
                if (!f) return null;
                const Icon = f.Icon;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white uppercase"
                  >
                    <Icon size={14} strokeWidth={2} className="text-orange-400" />
                    {f.name}
                  </span>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No features selected yet</p>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
          {!pending && (
            <Link
              to="/upload"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-gray-900/80 px-8 text-sm font-semibold text-white hover:border-white/25 hover:bg-gray-800/80 transition-colors text-center"
            >
              Continue to Upload →
            </Link>
          )}
          <div className="relative flex-1 sm:flex-initial sm:min-w-[280px]">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeDisabled}
              title={selectedFeatureIds.length === 0 ? 'Select at least one feature' : undefined}
              className={cn(
                'w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-semibold transition-all',
                analyzeDisabled
                  ? 'opacity-40 cursor-not-allowed bg-gray-800 text-gray-500'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/30'
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Analyze with Selected Features →
                </>
              )}
            </button>
          </div>
        </div>

        {!pending && videos.length > 0 && (
          <p className="text-center text-gray-500 text-sm mt-6">
            You have {videos.length} video{videos.length === 1 ? '' : 's'} in your library. Upload a new clip from{' '}
            <Link to="/upload" className="text-orange-400 hover:underline">
              Upload
            </Link>{' '}
            to stage another analysis.
          </p>
        )}
      </div>
    </UserPage>
  );
}

export default Features;
