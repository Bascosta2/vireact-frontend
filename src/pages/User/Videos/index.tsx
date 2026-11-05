import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Plus, Search } from 'lucide-react';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, deleteVideo, reanalyzeVideo, type Video } from '@/api/video';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { UPLOAD_STATUS, ANALYSIS_STATUS } from '@/constants';
import VideoCard from '@/components/UI/VideoCard';
import { PageHeader } from '@/components/app/PageHeader';
import { Button, ButtonLink } from '@/components/app/Button';
import { EmptyState } from '@/components/app/EmptyState';
import { Skeleton } from '@/components/app/Skeleton';
import { useDelayedFlag } from '@/hooks/useDelayedFlag';
import { useToast } from '@/components/app/Toast';
import { ANALYSIS_FEATURES_UI } from '@/data/analysis-features';
import { Select } from '@/components/app/Select';
import { cleanVideoTitle } from '@/lib/video-file';

type SortOption = 'date' | 'name' | 'status' | 'score';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: ANALYSIS_STATUS.COMPLETED, label: 'Ready' },
  { value: 'in_progress', label: 'In progress' },
  { value: ANALYSIS_STATUS.FAILED, label: 'Failed' },
];

const IN_PROGRESS = [ANALYSIS_STATUS.PENDING, ANALYSIS_STATUS.QUEUED, ANALYSIS_STATUS.PROCESSING] as string[];

function Videos() {
  const navigate = useNavigate();
  const toast = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [reanalyzingVideoId, setReanalyzingVideoId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const showSkeleton = useDelayedFlag(isLoading);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchVideos = useCallback(async () => {
    setError(null);
    try {
      const videoList = await getUserVideos();
      if (!mounted.current) return;
      setVideos(videoList.filter((v) => v.uploadStatus !== UPLOAD_STATUS.FAILED));
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to fetch videos';
      if (!mounted.current) return;
      setError(errorMessage);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Refetch when user returns to the tab so status is always live
  useEffect(() => {
    const onFocus = () => fetchVideos();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchVideos]);

  useEffect(() => {
    const hasPending = videos.some((v) => IN_PROGRESS.includes(v.analysisStatus));
    if (!hasPending) return;
    const interval = setInterval(() => {
      fetchVideos();
    }, 5000);
    return () => clearInterval(interval);
  }, [videos, fetchVideos]);

  const visible = videos.filter((v) => !hiddenIds.includes(v._id));

  const filteredVideos = visible.filter((video) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!video.filename.toLowerCase().includes(q) && !cleanVideoTitle(video.filename).toLowerCase().includes(q)) return false;
    }
    if (filterStatus === 'in_progress' && !IN_PROGRESS.includes(video.analysisStatus)) return false;
    if (filterStatus !== 'all' && filterStatus !== 'in_progress' && video.analysisStatus !== filterStatus) return false;
    if (filterFeature !== 'all' && !(video.selectedFeatures || []).includes(filterFeature)) return false;
    return true;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name':
        return cleanVideoTitle(a.filename).localeCompare(cleanVideoTitle(b.filename));
      case 'status':
        return (a.analysisStatus || '').localeCompare(b.analysisStatus || '');
      case 'score':
        return (b.viralityScore ?? -1) - (a.viralityScore ?? -1);
      default:
        return 0;
    }
  });

  /** Hides the card at once and only calls the API once the undo window closes. */
  const handleDelete = useCallback(
    (videoId: string) => {
      setHiddenIds((prev) => [...prev, videoId]);
      toast.show({
        message: 'Video deleted',
        actionLabel: 'Undo',
        onAction: () => setHiddenIds((prev) => prev.filter((id) => id !== videoId)),
        onExpire: async () => {
          try {
            await deleteVideo(videoId);
            if (mounted.current) setVideos((prev) => prev.filter((v) => v._id !== videoId));
          } catch (err: unknown) {
            const msg =
              (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
              (err as { message?: string })?.message ||
              'Failed to delete video';
            ErrorNotification(msg);
            if (mounted.current) setHiddenIds((prev) => prev.filter((id) => id !== videoId));
          }
        },
      });
    },
    [toast]
  );

  const handleReanalyze = useCallback(
    async (videoId: string) => {
      setReanalyzingVideoId(videoId);
      try {
        await reanalyzeVideo(videoId);
        SuccessNotification('Re-analysis queued');
        await fetchVideos();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Re-analyze failed';
        ErrorNotification(msg);
      } finally {
        setReanalyzingVideoId(null);
      }
    },
    [fetchVideos]
  );

  const handleChatClick = useCallback(
    (videoId: string) => {
      const video = videos.find((v) => v._id === videoId);
      if (video?.analysisStatus !== ANALYSIS_STATUS.COMPLETED) {
        ErrorNotification('Video analysis is still pending. Please wait for analysis to complete.');
        return;
      }
      navigate(`/videos/${videoId}`);
    },
    [navigate, videos]
  );

  const averageViralityScore = useMemo<number | null>(() => {
    const scored = visible.filter(
      (v) => v.analysisStatus === ANALYSIS_STATUS.COMPLETED && typeof v.viralityScore === 'number' && !isNaN(v.viralityScore)
    );
    if (scored.length === 0) return null;
    return Math.round(scored.reduce((acc, v) => acc + (v.viralityScore as number), 0) / scored.length);
  }, [visible]);

  const hasActiveFilters = Boolean(searchQuery) || filterFeature !== 'all' || filterStatus !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setFilterFeature('all');
    setFilterStatus('all');
  };

  const newButton = (
    <ButtonLink to="/new">
      <Plus className="h-4 w-4" aria-hidden="true" />
      New analysis
    </ButtonLink>
  );

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <PageHeader
          title="Library"
          subtitle={
            averageViralityScore != null ? (
              <span className="tabular">Average virality score {averageViralityScore} across your ready videos.</span>
            ) : (
              'Every video you have analyzed.'
            )
          }
          actions={visible.length > 0 ? newButton : undefined}
        />

        {isLoading ? (
          showSkeleton ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading videos">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-3">
                  <Skeleton className="h-[136px] w-[76px]" />
                  <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : null
        ) : error && videos.length === 0 ? (
          <div role="alert" className="rounded-xl border border-danger/40 bg-surface p-6">
            <p className="text-base font-medium text-fg">We couldn't load your videos.</p>
            <p className="mt-1 text-sm text-fg-muted">{error}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                fetchVideos();
              }}
            >
              Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Library className="h-10 w-10" aria-hidden="true" />}
            title="No videos yet"
            body="Your analyzed videos will appear here."
            action={newButton}
          />
        ) : (
          <>
            <div role="search" className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative basis-full sm:min-w-[200px] sm:flex-1 sm:basis-0">
                <label htmlFor="library-search" className="sr-only">
                  Search videos
                </label>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden="true" />
                <input
                  id="library-search"
                  type="search"
                  placeholder="Search videos"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="app-focus h-11 w-full rounded-lg border border-control bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle"
                />
              </div>
              <Select
                id="library-sort"
                label="Sort"
                value={sortBy}
                onChange={(v) => setSortBy(v as SortOption)}
                options={[
                  { value: 'date', label: 'Newest' },
                  { value: 'score', label: 'Top score' },
                  { value: 'name', label: 'Name' },
                  { value: 'status', label: 'Status' },
                ]}
              />
              <Select
                id="library-status"
                label="Status"
                value={filterStatus}
                onChange={setFilterStatus}
                options={STATUS_FILTERS}
              />
              <Select
                id="library-feature"
                label="Check"
                value={filterFeature}
                onChange={setFilterFeature}
                options={[
                  { value: 'all', label: 'All checks' },
                  ...ANALYSIS_FEATURES_UI.map((f) => ({ value: f.id, label: f.label })),
                ]}
              />
            </div>

            <p className="sr-only" role="status">
              {sortedVideos.length} {sortedVideos.length === 1 ? 'video' : 'videos'}
            </p>

            {sortedVideos.length === 0 ? (
              <EmptyState
                title="No videos match"
                body="Try a different search or clear the filters."
                action={
                  hasActiveFilters ? (
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sortedVideos.map((video) => (
                  <li key={video._id}>
                    <VideoCard
                      video={video}
                      onDelete={handleDelete}
                      onReanalyze={handleReanalyze}
                      onChatClick={handleChatClick}
                      reanalyzingVideoId={reanalyzingVideoId}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </UserPage>
  );
}

export default Videos;
