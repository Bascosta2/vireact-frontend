import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import { getUserVideos, deleteVideo, type Video } from '@/api/video';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { UPLOAD_STATUS, ANALYSIS_STATUS } from '@/constants';
import { FaTrash, FaVideo, FaSpinner, FaExclamationTriangle, FaComments, FaSync } from 'react-icons/fa';

function Videos() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const deleteFailedVideos = useCallback(async (failedVideoIds: string[]) => {
        if (failedVideoIds.length === 0) return;

        let successCount = 0;
        for (const videoId of failedVideoIds) {
            try {
                await deleteVideo(videoId);
                setVideos((prev) => prev.filter((video) => video._id !== videoId));
                successCount++;
            } catch (err: any) {
                console.error(`Failed to delete video ${videoId}:`, err);
                // Continue with next video
            }
        }

        if (successCount > 0) {
            SuccessNotification(`${successCount} failed video(s) were automatically removed`);
        }
    }, []);

    const fetchVideos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const videoList = await getUserVideos();
            
            // Filter out failed videos from display immediately
            const failedVideos = videoList.filter((video) => video.uploadStatus === UPLOAD_STATUS.FAILED);
            const validVideos = videoList.filter((video) => video.uploadStatus !== UPLOAD_STATUS.FAILED);
            
            setVideos(validVideos);
            
            // Delete failed videos in the background
            if (failedVideos.length > 0) {
                const failedVideoIds = failedVideos.map((video) => video._id);
                // Don't await - let it run in background
                deleteFailedVideos(failedVideoIds);
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch videos';
            setError(errorMessage);
            ErrorNotification(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [deleteFailedVideos]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleDeleteVideo = useCallback(async (e: React.MouseEvent, videoId: string) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (!confirm('Are you sure you want to delete this video?')) {
            return;
        }

        setDeletingVideoId(videoId);
        try {
            await deleteVideo(videoId);
            setVideos((prev) => prev.filter((video) => video._id !== videoId));
            SuccessNotification('Video deleted successfully');
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete video';
            ErrorNotification(errorMessage);
        } finally {
            setDeletingVideoId(null);
        }
    }, []);

    const handleCardClick = useCallback((videoId: string, analysisStatus: string) => {
        if (analysisStatus === ANALYSIS_STATUS.PENDING) {
            ErrorNotification('Video analysis is still pending. Please wait for analysis to complete.');
            return;
        }
        navigate(`/videos/${videoId}`);
    }, [navigate]);

    const handleChatClick = useCallback((e: React.MouseEvent, videoId: string, analysisStatus: string) => {
        e.stopPropagation(); // Prevent card click
        
        if (analysisStatus === ANALYSIS_STATUS.PENDING) {
            ErrorNotification('Video analysis is still pending. Please wait for analysis to complete.');
            return;
        }
        
        navigate(`/videos/${videoId}`);
    }, [navigate]);
    
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await fetchVideos();
            SuccessNotification('Videos status refreshed');
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to refresh videos';
            ErrorNotification(errorMessage);
        } finally {
            setIsRefreshing(false);
        }
    }, [fetchVideos]);

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStatusBadgeClass = (status: string, statusType: 'upload' | 'analysis'): string => {
        const statusMap: Record<string, string> = {
            [UPLOAD_STATUS.PENDING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            [UPLOAD_STATUS.UPLOADING]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            [UPLOAD_STATUS.COMPLETED]: 'bg-green-500/20 text-green-400 border-green-500/30',
            [UPLOAD_STATUS.FAILED]: 'bg-red-500/20 text-red-400 border-red-500/30',
            [ANALYSIS_STATUS.PROCESSING]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
        return statusMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    const getStatusLabel = (status: string): string => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (isLoading) {
        return (
            <UserPage>
                <div className="px-4 py-8">
                    <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-6">My Videos</h1>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <FaSpinner className="w-8 h-8 text-white animate-spin" />
                            <p className="text-gray-400">Loading videos...</p>
                        </div>
                    </div>
                </div>
            </UserPage>
        );
    }

    if (error && videos.length === 0) {
        return (
            <UserPage>
                <div className="px-4 py-8">
                    <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-6">My Videos</h1>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <FaExclamationTriangle className="w-12 h-12 text-red-400" />
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={fetchVideos}
                                className="btn-primary !rounded-lg mt-4"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </UserPage>
        );
    }

    return (
        <UserPage>
            <div className="px-2 sm:px-4 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-white text-2xl sm:text-3xl font-semibold">My Videos</h1>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Refresh videos status"
                    >
                        <FaSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh Status</span>
                    </button>
                </div>

                {videos.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                                <FaVideo className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 text-lg">No videos yet</p>
                            <p className="text-gray-500 text-sm">Upload your first video to get started</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {videos.map((video) => {
                            const isPending = video.analysisStatus === ANALYSIS_STATUS.PENDING;
                            return (
                            <div
                                key={video._id}
                                onClick={() => handleCardClick(video._id, video.analysisStatus)}
                                className={`bg-gray-800/50 rounded-lg p-4 sm:p-6 transition-colors relative ${
                                    isPending 
                                        ? 'opacity-60 cursor-not-allowed' 
                                        : 'hover:bg-gray-800/70 cursor-pointer'
                                }`}
                            >
                                {/* Video Thumbnail/Icon */}
                                <div className="w-full aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                                    <FaVideo className="w-12 h-12 text-gray-600" />
                                </div>

                                {/* Video Info */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-white font-semibold text-sm sm:text-base truncate" title={video.filename}>
                                            {video.filename}
                                        </h3>
                                        <p className="text-gray-400 text-xs mt-1">
                                            {formatDate(video.createdAt)}
                                        </p>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                                        {video.fileSize && (
                                            <span>{formatFileSize(video.fileSize)}</span>
                                        )}
                                        {video.duration && (
                                            <>
                                                <span>•</span>
                                                <span>{Math.round(video.duration)}s</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(video.uploadStatus, 'upload')}`}
                                        >
                                            Upload: {getStatusLabel(video.uploadStatus)}
                                        </span>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(video.analysisStatus, 'analysis')}`}
                                        >
                                            Analysis: {getStatusLabel(video.analysisStatus)}
                                        </span>
                                    </div>

                                    {/* Analysis Ready Badge */}
                                    {video.analysisStatus === ANALYSIS_STATUS.COMPLETED && !video.isAnalysisReady && (
                                        <div className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                                            <p className="text-green-400 text-xs font-medium">
                                                ✓ Your video analysis is ready!
                                            </p>
                                        </div>
                                    )}

                                    {/* Selected Features */}
                                    {video.selectedFeatures && video.selectedFeatures.length > 0 && (
                                        <div className="pt-2 border-t border-gray-700">
                                            <p className="text-gray-500 text-xs mb-2">Features:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {video.selectedFeatures.map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded"
                                                    >
                                                        {feature.replace('_', ' ')}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={(e) => handleChatClick(e, video._id, video.analysisStatus)}
                                            disabled={video.analysisStatus === ANALYSIS_STATUS.PENDING}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FaComments className="w-4 h-4" />
                                            <span>Chat</span>
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteVideo(e, video._id)}
                                            disabled={deletingVideoId === video._id || video.analysisStatus === ANALYSIS_STATUS.PENDING}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deletingVideoId === video._id ? (
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <FaTrash className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </UserPage>
    );
}

export default Videos;
