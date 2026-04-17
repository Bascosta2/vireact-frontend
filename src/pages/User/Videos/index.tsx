import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, deleteVideo, reanalyzeVideo, type Video } from '@/api/video';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { UPLOAD_STATUS, ANALYSIS_STATUS } from '@/constants';
import VideoCard from '@/components/UI/VideoCard';
import { SlidersHorizontal, Search, Upload as UploadIcon } from 'lucide-react';

type SortOption = 'date' | 'name' | 'status';

function Videos() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [reanalyzingVideoId, setReanalyzingVideoId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchVideos = useCallback(async () => {
    setError(null);
    try {
      const videoList = await getUserVideos();
      const validVideos = videoList.filter((v) => v.uploadStatus !== UPLOAD_STATUS.FAILED);
      setVideos(validVideos);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string }; message?: string }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Failed to fetch videos';
      setError(errorMessage);
      ErrorNotification(errorMessage);
    } finally {
      setIsLoading(false);
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
    const hasPending = videos.some(
      (v) =>
        v.analysisStatus === ANALYSIS_STATUS.PENDING ||
        v.analysisStatus === ANALYSIS_STATUS.QUEUED ||
        v.analysisStatus === ANALYSIS_STATUS.PROCESSING
    );
    if (!hasPending) return;
    const interval = setInterval(() => {
      fetchVideos();
    }, 5000);
    return () => clearInterval(interval);
  }, [videos, fetchVideos]);

  const filteredVideos = videos.filter((video) => {
    if (searchQuery && !video.filename.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus !== 'all' && video.analysisStatus !== filterStatus) return false;
    if (filterFeature !== 'all' && !(video.selectedFeatures || []).includes(filterFeature)) return false;
    return true;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name':
        return a.filename.localeCompare(b.filename);
      case 'status':
        return (a.analysisStatus || '').localeCompare(b.analysisStatus || '');
      default:
        return 0;
    }
  });

  const handleDelete = useCallback(
    async (videoId: string) => {
      if (!confirm('Are you sure you want to delete this video?')) return;
      setDeletingVideoId(videoId);
      try {
        await deleteVideo(videoId);
        setVideos((prev) => prev.filter((v) => v._id !== videoId));
        SuccessNotification('Video deleted successfully');
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Failed to delete video';
        ErrorNotification(msg);
      } finally {
        setDeletingVideoId(null);
      }
    },
    []
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
        console.error('Reanalyze failed:', err);
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

  const handleCardClick = useCallback(
    (videoId: string) => {
      navigate(`/videos/${videoId}`);
    },
    [navigate]
  );

  const allFeatures = ['hook', 'caption', 'pacing', 'audio', 'views_predictor', 'advanced_analytics'];
  const allStatuses = [
    ANALYSIS_STATUS.COMPLETED,
    ANALYSIS_STATUS.PROCESSING,
    ANALYSIS_STATUS.QUEUED,
    ANALYSIS_STATUS.PENDING,
    ANALYSIS_STATUS.FAILED,
  ];
  const hasActiveFilters = searchQuery || filterFeature !== 'all' || filterStatus !== 'all';
  const isEmpty = sortedVideos.length === 0;

  if (isLoading) {
    return (
      <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
        <div className="pb-24 sm:pb-10">
          <div className="max-w-6xl mx-auto">
            <h1
              className="text-3xl md:text-4xl font-bold uppercase mb-2 tracking-wide"
              style={{
                fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
                background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MY VIDEOS
            </h1>
            <p className="text-gray-400 mb-8">Manage and view your analyzed short-form videos</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden animate-pulse border border-white/5"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <div className="aspect-video bg-white/5" />
                  <div className="p-4">
                    <div className="h-4 bg-white/10 rounded mb-2 w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </UserPage>
    );
  }

  if (error && videos.length === 0) {
    return (
      <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
        <div className="pb-24 sm:pb-10">
          <div className="max-w-6xl mx-auto text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => { setIsLoading(true); fetchVideos(); }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </UserPage>
    );
  }

  return (
    <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
      <div className="pb-24 sm:pb-10">
          <div className="max-w-6xl mx-auto mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold uppercase mb-2 tracking-wide"
            style={{
              fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
              background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            MY VIDEOS
          </h1>
          <p className="text-gray-400">Manage and view your analyzed short-form videos</p>
        </div>

        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 rounded-lg text-white focus:outline-none focus:border-orange-500"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-gray-400 hover:bg-white/5 border border-white/[0.08]'
              }`}
              style={!showFilters ? { background: 'rgba(255, 255, 255, 0.04)' } : undefined}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div
              className="mt-4 p-4 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Filter by Feature</label>
                  <select
                    value={filterFeature}
                    onChange={(e) => setFilterFeature(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Features</option>
                    {allFeatures.map((f) => (
                      <option key={f} value={f}>
                        {f.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Filter by Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">All Statuses</option>
                    {allStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          {isEmpty ? (
            <div className="text-center py-20">
              <UploadIcon className="w-24 h-24 text-gray-700 mx-auto mb-4" />
              <h2
                className="text-2xl md:text-3xl font-bold uppercase mb-2 text-gray-400"
                style={{ fontFamily: 'Impact, Anton, "Arial Black", sans-serif' }}
              >
                {hasActiveFilters ? 'NO VIDEOS MATCH YOUR FILTERS' : 'NO VIDEOS YET'}
              </h2>
              <p className="text-gray-500 text-lg mb-8">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'Start by uploading your first short-form video for analysis'}
              </p>
              {!hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => navigate('/upload')}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all"
                >
                  Upload Your First Video
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedVideos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onDelete={handleDelete}
                  onReanalyze={handleReanalyze}
                  onChatClick={handleChatClick}
                  onCardClick={handleCardClick}
                  deletingVideoId={deletingVideoId}
                  reanalyzingVideoId={reanalyzingVideoId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserPage>
  );
}

export default Videos;
