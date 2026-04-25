import { useState, useRef, useEffect, type ComponentType } from 'react';
import {
  Play,
  Trash2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Video as VideoIcon,
  Calendar,
  FileText,
  MoreVertical,
  MessageCircle,
  Zap,
  MessageSquare,
  Activity,
  Volume2,
  Eye,
  BarChart2,
  Circle,
} from 'lucide-react';
import { ANALYSIS_STATUS, UPLOAD_STATUS } from '@/constants';
import { getVideoStatus, type Video } from '@/api/video';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  video: Video & { thumbnailUrl?: string; videoUrl?: string; analysisProgress?: number; analysisScore?: number };
  onDelete: (videoId: string) => void;
  onReanalyze: (videoId: string) => void | Promise<void>;
  onChatClick: (videoId: string) => void;
  onCardClick: (videoId: string) => void;
  deletingVideoId?: string | null;
  reanalyzingVideoId?: string | null;
}

const ANALYZING_MESSAGES = [
  'Watching your video...',
  'Breaking down the hook...',
  'Analyzing pacing and rhythm...',
  'Listening to your audio...',
  'Reading psychological signals...',
  'Predicting view range...',
  'Almost there...',
];

function getProgressFromStatus(analysisStatus: string): number {
  const map: Record<string, number> = {
    [ANALYSIS_STATUS.PENDING]: 10,
    [ANALYSIS_STATUS.QUEUED]: 50,
    [ANALYSIS_STATUS.PROCESSING]: 50,
    [ANALYSIS_STATUS.COMPLETED]: 100,
    [ANALYSIS_STATUS.FAILED]: 0,
  };
  return map[analysisStatus] ?? 0;
}

export default function VideoCard({
  video,
  onDelete,
  onReanalyze,
  onChatClick,
  onCardClick,
  deletingVideoId = null,
  reanalyzingVideoId = null,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [fetchedErrorSummary, setFetchedErrorSummary] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const analysisProgress = video.analysisProgress ?? getProgressFromStatus(video.analysisStatus);
  const statusFromApi =
    video.analysisStatus ?? (video as unknown as Record<string, string>).analysis_status;
  const isAnalysisComplete = statusFromApi === ANALYSIS_STATUS.COMPLETED;
  const isAnalysisPending =
    statusFromApi === ANALYSIS_STATUS.PENDING ||
    statusFromApi === ANALYSIS_STATUS.QUEUED ||
    statusFromApi === ANALYSIS_STATUS.PROCESSING;

  useEffect(() => {
    if (isHovered && video.videoUrl) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowVideo(true);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }, 500);
    } else {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setShowVideo(false);
      videoRef.current?.pause();
    }
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isHovered, video.videoUrl]);

  useEffect(() => {
    if (statusFromApi !== ANALYSIS_STATUS.FAILED) {
      setFetchedErrorSummary(null);
      return;
    }
    const fromList =
      typeof video.errorSummary === 'string' && video.errorSummary.trim().length > 0
        ? video.errorSummary.trim()
        : '';
    if (fromList) {
      setFetchedErrorSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const st = await getVideoStatus(video._id);
        if (cancelled) return;
        const s = st.errorSummary;
        setFetchedErrorSummary(typeof s === 'string' && s.trim().length > 0 ? s.trim() : null);
      } catch {
        if (!cancelled) setFetchedErrorSummary(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFromApi, video._id, video.errorSummary]);

  useEffect(() => {
    const isInProgress =
      statusFromApi === ANALYSIS_STATUS.QUEUED ||
      statusFromApi === ANALYSIS_STATUS.PROCESSING ||
      statusFromApi === ANALYSIS_STATUS.PENDING;
    if (!isInProgress) {
      setMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [statusFromApi]);

  const displayErrorSummary =
    (typeof video.errorSummary === 'string' && video.errorSummary.trim().length > 0
      ? video.errorSummary.trim()
      : null) || fetchedErrorSummary;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (seconds == null) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusInfo = () => {
    if (statusFromApi === ANALYSIS_STATUS.COMPLETED) {
      return { text: 'Complete', color: 'bg-green-500', icon: CheckCircle };
    }
    if (statusFromApi === ANALYSIS_STATUS.QUEUED) {
      return { text: 'Queued', color: 'bg-purple-500', icon: RefreshCw };
    }
    if (statusFromApi === ANALYSIS_STATUS.PROCESSING) {
      return { text: 'Analyzing', color: 'bg-purple-500', icon: RefreshCw };
    }
    if (statusFromApi === ANALYSIS_STATUS.FAILED) {
      return { text: 'Analysis Failed', color: 'bg-red-500', icon: AlertCircle };
    }
    if (video.uploadStatus === UPLOAD_STATUS.UPLOADING) {
      return { text: 'Uploading', color: 'bg-blue-500', icon: Clock };
    }
    if (video.uploadStatus === UPLOAD_STATUS.COMPLETED) {
      return { text: 'Processing', color: 'bg-yellow-500', icon: RefreshCw };
    }
    return { text: 'Pending', color: 'bg-yellow-500', icon: Clock };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const isReanalyzing = reanalyzingVideoId === video._id;

  // Mobile-only: color-coded virality score next to the status pill.
  // Only rendered when analysis is complete AND viralityScore is a finite number.
  const mobileViralityScore =
    isAnalysisComplete &&
    typeof video.viralityScore === 'number' &&
    !isNaN(video.viralityScore)
      ? Math.round(video.viralityScore)
      : null;
  const viralityScoreColor =
    mobileViralityScore == null
      ? ''
      : mobileViralityScore >= 70
        ? 'text-green-400'
        : mobileViralityScore >= 40
          ? 'text-yellow-400'
          : 'text-red-400';

  const featureIcons: Record<string, ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
    hook: Zap,
    caption: MessageSquare,
    pacing: Activity,
    audio: Volume2,
    views_predictor: Eye,
    advanced_analytics: BarChart2,
  };
  const getFeatureIcon = (featureKey: string) =>
    featureIcons[featureKey] ?? Circle; // TODO: replace Circle with correct icon when feature key is unknown

  return (
    <>
    {/* Mobile compact card (<768px) */}
    <div
      className="md:hidden relative flex h-24 items-stretch overflow-hidden rounded-xl border border-white/5 bg-gray-900 cursor-pointer"
      onClick={() => onCardClick(video._id)}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
        {isAnalysisPending ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-1 text-center">
            <div className="h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p
              key={messageIndex}
              className="text-[9px] leading-tight text-gray-300 line-clamp-2 transition-opacity duration-300"
            >
              {ANALYZING_MESSAGES[messageIndex]}
            </p>
          </div>
        ) : video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.filename}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoIcon size={28} className="text-white/30" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 pr-10">
        <h3 className="truncate text-sm font-medium text-white" title={video.filename}>
          {video.filename}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white',
              statusInfo.color
            )}
          >
            <StatusIcon
              size={12}
              strokeWidth={2}
              className={cn('flex-shrink-0', statusFromApi === ANALYSIS_STATUS.COMPLETED && 'text-green-500')}
            />
            {statusInfo.text}
          </span>
          {mobileViralityScore != null && (
            <span className={cn('text-sm font-bold tabular-nums', viralityScoreColor)}>
              {mobileViralityScore}
            </span>
          )}
        </div>
        {isAnalysisPending ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onReanalyze(video._id);
              }}
              disabled={isReanalyzing}
              className="flex-1 rounded-md bg-gray-800 py-1.5 text-xs font-medium text-white flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={cn('w-3 h-3', isReanalyzing && 'animate-spin')} />
              Re-analyze
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video._id);
              }}
              disabled={deletingVideoId === video._id}
              className="flex-1 rounded-md bg-red-900/80 py-1.5 text-xs font-medium text-red-200 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!isAnalysisComplete}
            onClick={(e) => {
              e.stopPropagation();
              if (isAnalysisComplete) onChatClick(video._id);
            }}
            className={cn(
              'w-full rounded-md py-1.5 text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap transition-all',
              isAnalysisComplete
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            )}
          >
            <MessageCircle size={14} strokeWidth={2} className="flex-shrink-0" />
            Constructive Overview
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(video._id);
        }}
        disabled={deletingVideoId === video._id}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-gray-300 disabled:opacity-50"
        aria-label="Delete video"
      >
        {deletingVideoId === video._id ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>

    {/* Desktop/tablet card (>=768px) - unchanged layout, only visibility wrapper altered */}
    <div
      className={cn(
        'hidden md:block relative group bg-gray-900 rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 cursor-pointer',
        isHovered && 'scale-[1.02] border-orange-500/40 shadow-2xl shadow-orange-500/15',
        !isHovered && 'hover:border-white/10'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
      onClick={() => onCardClick(video._id)}
    >
      {/* Thumbnail/Video Preview */}
      <div className="relative aspect-video overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
        {/* Delete button - top right, visible on hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video._id);
          }}
          disabled={deletingVideoId === video._id}
          className={cn(
            'absolute top-2 right-2 z-20 p-2 rounded-lg transition-all',
            'bg-black/60 hover:bg-red-600/90 text-gray-300 hover:text-white',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Delete video"
          title="Delete video"
        >
          {deletingVideoId === video._id ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
        {!showVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <VideoIcon size={32} className="text-white/30 flex-shrink-0" />
            )}
          </div>
        )}

        {showVideo && video.videoUrl && (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        )}

        {video.duration != null && video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs font-semibold">
            {formatDuration(video.duration)}
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300',
            isHovered && !showVideo ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {isAnalysisPending && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent pointer-events-none" />
        )}
      </div>

      <div className="p-4 relative">
        <h3 className="text-white font-bold text-sm mb-2 truncate" title={video.filename}>
          {video.filename}
        </h3>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(video.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {formatFileSize(video.fileSize)}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5',
                statusInfo.color
              )}
            >
              <StatusIcon
                size={14}
                strokeWidth={2}
                className={cn('flex-shrink-0', statusFromApi === ANALYSIS_STATUS.COMPLETED && 'text-green-500')}
              />
              {statusInfo.text}
            </span>
            {isAnalysisComplete && video.analysisScore != null && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1.5">
                <Star className="w-3 h-3" fill="white" />
                {video.analysisScore}/10
              </span>
            )}
          </div>
          {statusFromApi === ANALYSIS_STATUS.FAILED && displayErrorSummary ? (
            <p
              className="text-xs text-red-400/90 mt-1.5 leading-snug line-clamp-3"
              title={displayErrorSummary}
            >
              {displayErrorSummary}
            </p>
          ) : null}
        </div>

        {video.selectedFeatures && video.selectedFeatures.length > 0 && (
          <div className="mb-3">
            <p className="text-gray-500 text-xs mb-2">Features:</p>
            <div className="flex flex-wrap gap-2">
              {video.selectedFeatures.map((feature) => {
                const IconComponent = getFeatureIcon(feature);
                return (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-medium flex items-center gap-1"
                  >
                    <IconComponent size={12} strokeWidth={2} className="flex-shrink-0" />
                    {feature.replace('_', ' ')}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isAnalysisComplete) onChatClick(video._id);
            }}
            disabled={!isAnalysisComplete}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all',
              isAnalysisComplete
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            )}
          >
            <MessageCircle size={16} strokeWidth={2} className="text-white flex-shrink-0" />
            Chat
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            aria-label="More actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {showActions && (
          <div className="absolute right-4 bottom-20 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-10 min-w-[150px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onReanalyze(video._id);
                setShowActions(false);
              }}
              disabled={isReanalyzing}
              className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isReanalyzing && 'animate-spin')} />
              Re-analyze
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video._id);
                setShowActions(false);
              }}
              disabled={deletingVideoId === video._id}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
            >
              {deletingVideoId === video._id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      {isAnalysisPending && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center pointer-events-none">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white font-semibold text-sm">
              {statusFromApi === ANALYSIS_STATUS.PROCESSING
                ? 'Analyzing...'
                : statusFromApi === ANALYSIS_STATUS.QUEUED
                  ? 'In queue...'
                  : 'Processing...'}
            </p>
            <p
              key={messageIndex}
              className="text-gray-400 text-xs mt-1 transition-opacity duration-300"
              style={{ opacity: 1 }}
            >
              {ANALYZING_MESSAGES[messageIndex]}
            </p>
          </div>
          <p className="text-gray-400 text-xs mt-2 mb-3 pointer-events-none">
            Taking longer than expected? Re-analyze or remove.
          </p>
          <div className="flex gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void onReanalyze(video._id);
              }}
              disabled={isReanalyzing}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isReanalyzing && 'animate-spin')} />
              Re-analyze
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(video._id);
              }}
              disabled={deletingVideoId === video._id}
              className="px-4 py-2 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {deletingVideoId === video._id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
