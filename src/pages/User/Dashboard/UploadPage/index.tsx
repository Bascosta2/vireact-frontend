import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLink, FaVideo, FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';
import { FaWandMagicSparkles, FaSpinner } from 'react-icons/fa6';
import VideoURLInput from '@/components/UI/VideoURLInput';
import VideoUploadInput from '@/components/UI/VideoUploadInput';
import { UPLOAD_VALIDATION, getRandomIndexingMessage } from '@/constants';
import { uploadVideoFileToTwelveLabs, uploadVideoUrlToTwelveLabs } from '@/api/video';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

interface UploadPageProps {
    selectedFeatureIds: string[];
    onBack: () => void;
    onAnalyze: (data: { type: 'url' | 'file'; content: string | File }) => void;
}

interface VideoMetadata {
    duration: number;
    size: number;
    format: string;
    previewUrl: string;
}

function UploadPage({ selectedFeatureIds, onBack, onAnalyze }: UploadPageProps) {
    const navigate = useNavigate();
    const [uploadType, setUploadType] = useState<'url' | 'file'>('file');
    const [url, setUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [indexingMessage, setIndexingMessage] = useState('');
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const validateUrl = (url: string): boolean => {
        const { URL } = UPLOAD_VALIDATION;
        const patterns = [
            URL.YOUTUBE_REGEX,
            URL.TIKTOK_REGEX,
            URL.INSTAGRAM_REGEX,
            URL.TWITTER_REGEX,
            URL.FACEBOOK_REGEX
        ];

        return patterns.some(pattern => pattern.test(url));
    };

    const handleUrlSubmit = useCallback(async () => {
        if (!url.trim()) {
            setError('Please enter a URL');
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);
        setIndexingMessage(getRandomIndexingMessage());

        try {
            // Upload URL to TwelveLabs
            await uploadVideoUrlToTwelveLabs(
                url.trim(),
                `video_${Date.now()}.mp4`,
                selectedFeatureIds
            );

            SuccessNotification('Video URL uploaded successfully!');

            // Redirect to videos page
            setTimeout(() => {
                navigate('/videos');
            }, 500);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to upload video URL';
            setError(errorMessage);
            
            // Check if it's a subscription limit error
            if (err?.response?.status === 403 && errorMessage.includes('limit')) {
                ErrorNotification(errorMessage + ' Visit Settings > Subscription to upgrade.');
            } else {
                ErrorNotification(errorMessage);
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            setIndexingMessage('');
        }
    }, [url, selectedFeatureIds, navigate]);

    const extractVideoMetadata = useCallback(async (file: File): Promise<VideoMetadata> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const previewUrl = URL.createObjectURL(file);
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
                resolve({
                    duration: video.duration,
                    size: file.size,
                    format: fileExtension,
                    previewUrl
                });
            };

            video.onerror = () => {
                reject(new Error('Failed to load video metadata'));
            };

            video.src = previewUrl;
        });
    }, []);


    const handleFileSelect = useCallback(async (file: File) => {
        setSelectedFile(file);
        setError('');
        setShowConfirmButtons(false);
        setUploadProgress(0);

        // Clean up previous preview URL
        if (videoMetadata?.previewUrl) {
            URL.revokeObjectURL(videoMetadata.previewUrl);
        }

        try {
            setIsValidating(true);
            const metadata = await extractVideoMetadata(file);
            setVideoMetadata(metadata);
            setShowConfirmButtons(true);
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to process video file';
            setError(errorMessage);
            ErrorNotification(errorMessage);
            setSelectedFile(null);
        } finally {
            setIsValidating(false);
        }
    }, [extractVideoMetadata, videoMetadata]);

    const handleFileError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        ErrorNotification(errorMessage);
    }, []);

    const handleChangeVideo = useCallback(() => {
        // Clean up preview URL
        if (videoMetadata?.previewUrl) {
            URL.revokeObjectURL(videoMetadata.previewUrl);
        }

        // Reset state
        setSelectedFile(null);
        setVideoMetadata(null);
        setShowConfirmButtons(false);
        setUploadProgress(0);
        setError('');

        // Clear file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }, [videoMetadata]);

    const handleConfirmUpload = useCallback(async () => {
        if (!selectedFile) {
            setError('Please select a video file');
            return;
        }

        setIsUploading(true);
        setError('');
        setUploadProgress(0);
        setIndexingMessage(getRandomIndexingMessage());

        try {
            // Upload to TwelveLabs with progress tracking
            await uploadVideoFileToTwelveLabs(
                selectedFile,
                selectedFile.name,
                selectedFeatureIds,
                (progress) => {
                    setUploadProgress(progress);
                }
            );

            setUploadProgress(100);
            SuccessNotification('Video uploaded successfully!');

            // Clean up preview URL
            if (videoMetadata?.previewUrl) {
                URL.revokeObjectURL(videoMetadata.previewUrl);
            }

            // Redirect to videos page
            setTimeout(() => {
                navigate('/videos');
            }, 500);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to upload video';
            setError(errorMessage);
            
            // Check if it's a subscription limit error
            if (err?.response?.status === 403 && errorMessage.includes('limit')) {
                ErrorNotification(errorMessage + ' Visit Settings > Subscription to upgrade.');
            } else {
                ErrorNotification(errorMessage);
            }
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
            setIndexingMessage('');
        }
    }, [selectedFile, selectedFeatureIds, videoMetadata, navigate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (videoMetadata?.previewUrl) {
                URL.revokeObjectURL(videoMetadata.previewUrl);
            }
        };
    }, [videoMetadata]);

    const handleFileSubmit = () => {
        if (!selectedFile) {
            setError('Please select a video file');
            return;
        }

        setError('');
        onAnalyze({ type: 'file', content: selectedFile });
    };

    const handleAnalyze = () => {
        if (uploadType === 'url') {
            handleUrlSubmit();
        } else {
            handleFileSubmit();
        }
    };

    const isAnalyzeDisabled = uploadType === 'url'
        ? !url.trim() || !validateUrl(url)
        : !selectedFile;

    return (
        <div className="px-2 sm:px-4 py-6 sm:py-8">
            {/* Indexing Overlay */}
            {isUploading && indexingMessage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="text-center max-w-md px-6">
                        <FaSpinner className="w-16 h-16 text-white mx-auto mb-6 animate-spin" />
                        <p className="text-white text-lg font-medium leading-relaxed">
                            {indexingMessage}
                        </p>
                    </div>
                </div>
            )}

            {/* Background Gradient Circle */}
            <div className="absolute top-20 sm:top-32 left-1/2 transform -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-primary rounded-full opacity-30 blur-3xl" />

            {/* Header */}
            <div className="text-center mb-8">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
                >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Back to Features</span>
                </button>

                <h2 className="text-white text-2xl sm:text-3xl font-semibold mb-4">
                    Upload Your Short Video
                </h2>
                <p className="text-white/80 text-lg font-roboto">
                    Choose how you'd like to provide your video for analysis
                </p>
            </div>

            {/* Upload Type Selector */}
            <div className="flex justify-center mb-8">
                <div className="flex bg-gray-800 rounded-lg p-1 relative z-10">


                    {/* Upload File Button */}
                    <button
                        onClick={() => {
                            console.log('File tab clicked');
                            setUploadType('file');
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 cursor-pointer ${uploadType === 'file'
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FaVideo className="w-4 h-4" />
                        <span>Upload File</span>
                    </button>

                    {/* URL Link Button */}
                    <button
                        onClick={() => {
                            console.log('URL tab clicked');
                            setUploadType('url');
                        }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300 cursor-pointer ${uploadType === 'url'
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <FaLink className="w-4 h-4" />
                        <span>URL Link</span>
                    </button>
                </div>
            </div>

            {/* Upload Content */}
            <div className="max-w-2xl mx-auto">
                {uploadType === 'url' ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-white text-sm font-semibold mb-3">
                                Enter Video URL
                            </label>
                            <VideoURLInput
                                value={url}
                                onChange={setUrl}
                                onError={setError}
                            />
                            <div className="mt-3 text-gray-400 text-sm">
                                Supported platforms: YouTube, TikTok, Instagram, Twitter, Facebook
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-white text-sm font-semibold mb-3">
                                Select Video File
                            </label>
                            <VideoUploadInput
                                onFileSelect={handleFileSelect}
                                onError={handleFileError}
                            />
                        </div>

                        {/* Video Preview and Metadata */}
                        {selectedFile && videoMetadata && (
                            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                                <h3 className="text-white font-semibold mb-4">Video Preview</h3>

                                {/* Video Player */}
                                <div className="mb-4">
                                    <video
                                        ref={videoRef}
                                        src={videoMetadata.previewUrl}
                                        controls
                                        className="w-full rounded-lg max-h-64"
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-white ml-2">
                                            {Math.round(videoMetadata.duration)}s
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Size:</span>
                                        <span className="text-white ml-2">
                                            {(videoMetadata.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Format:</span>
                                        <span className="text-white ml-2 uppercase">
                                            {videoMetadata.format}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Filename:</span>
                                        <span className="text-white ml-2 truncate">
                                            {/* support to roundoff for long file names */}
                                            {selectedFile?.name.length > 20 ? selectedFile?.name.slice(0, 20) + '...' : selectedFile?.name}
                                        </span>
                                    </div>
                                </div>


                                {/* Upload Progress */}
                                {isUploading && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white text-sm font-semibold">Uploading...</span>
                                            <span className="text-gray-400 text-sm">{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Confirm/Change Buttons */}
                                {showConfirmButtons && !isUploading && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleConfirmUpload}
                                            className="flex-1 btn-primary !rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <FaCheck className="w-4 h-4" />
                                            <span>Confirm & Upload</span>
                                        </button>
                                        <button
                                            onClick={handleChangeVideo}
                                            className="flex-1 btn-secondary !rounded-lg flex items-center justify-center gap-2"
                                        >
                                            <FaTimes className="w-4 h-4" />
                                            <span>Change Video</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Selected Features Summary */}
                <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Analysis Features</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedFeatureIds.map((featureId) => (
                            <span
                                key={featureId}
                                className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full"
                            >
                                {featureId.replace('_', ' ').toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Analyze Button - Only show for URL upload type */}
                {uploadType === 'url' && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={handleUrlSubmit}
                            disabled={!url.trim() || isUploading}
                            className={`btn-primary !rounded-full flex items-center gap-2 ${!url.trim() || isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <FaWandMagicSparkles className="w-5 h-5" />
                                    <span>Upload & Analyze</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UploadPage;
