import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { VideoUpload, type UploadMode } from '@/components/UI/file-upload';
import { UPLOAD_VALIDATION } from '@/constants';
import { ErrorNotification } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { usePendingUpload, type PendingVideoMetadata } from '@/contexts/PendingUploadContext';

interface UploadPageProps {
    onBack: () => void;
}

function UploadPage({ onBack }: UploadPageProps) {
    const navigate = useNavigate();
    const { setPending, clearPending } = usePendingUpload();
    const [uploadMode, setUploadMode] = useState<UploadMode>('file');
    const [url, setUrl] = useState('');
    const [urlError, setUrlError] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [videoMetadata, setVideoMetadata] = useState<PendingVideoMetadata | null>(null);
    const [urlSubmitted, setUrlSubmitted] = useState(false);
    const [stagedForFeatures, setStagedForFeatures] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const hasVideoReady = selectedFile !== null || urlSubmitted;
    const currentStep: 1 | 2 = hasVideoReady ? 2 : 1;

    const validateUrl = (u: string): boolean => {
        const { URL } = UPLOAD_VALIDATION;
        const patterns = [
            URL.YOUTUBE_REGEX,
            URL.TIKTOK_REGEX,
            URL.INSTAGRAM_REGEX,
            URL.TWITTER_REGEX,
            URL.FACEBOOK_REGEX,
        ];
        return patterns.some((pattern) => pattern.test(u));
    };

    const handleUrlSubmit = useCallback(async (submittedUrl: string) => {
        if (!submittedUrl.trim()) {
            setUrlError('Please enter a URL');
            return;
        }
        if (!validateUrl(submittedUrl)) {
            setUrlError('Please enter a valid URL from a supported platform');
            return;
        }
        setUrl(submittedUrl);
        setUrlError('');
        setUrlSubmitted(true);
        setError('');
        setStagedForFeatures(false);
    }, []);

    const handleFileSelect = useCallback(
        async (file: File | null) => {
            if (!file) {
                setSelectedFile(null);
                setVideoMetadata(null);
                setStagedForFeatures(false);
                clearPending();
                return;
            }
            setSelectedFile(file);
            setError('');
            setStagedForFeatures(false);
            clearPending();

            if (videoMetadata?.previewUrl) {
                URL.revokeObjectURL(videoMetadata.previewUrl);
            }

            try {
                setIsValidating(true);
                const metadata = await extractVideoMetadata(file);
                setVideoMetadata(metadata);
            } catch (err: unknown) {
                const errorMessage = (err as { message?: string })?.message || 'Failed to process video file';
                setError(errorMessage);
                ErrorNotification(errorMessage);
                setSelectedFile(null);
            } finally {
                setIsValidating(false);
            }
        },
        [videoMetadata, clearPending]
    );

    const extractVideoMetadata = useCallback(async (file: File): Promise<PendingVideoMetadata> => {
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
                    previewUrl,
                });
            };
            video.onerror = () => reject(new Error('Failed to load video metadata'));
            video.src = previewUrl;
        });
    }, []);

    const handleStageForFeatures = useCallback(() => {
        if (!hasVideoReady) {
            setError('Please provide a video first');
            return;
        }
        setError('');
        if (uploadMode === 'file' && selectedFile) {
            setPending({
                mode: 'file',
                file: selectedFile,
                url: '',
                displayName: selectedFile.name,
                videoMetadata,
            });
        } else if (uploadMode === 'url' && urlSubmitted && url.trim()) {
            const name =
                url.trim().length > 48 ? `${url.trim().slice(0, 48)}…` : url.trim();
            setPending({
                mode: 'url',
                file: null,
                url: url.trim(),
                displayName: name,
                videoMetadata: null,
            });
        } else {
            setError('Please provide a video first');
            return;
        }
        setStagedForFeatures(true);
    }, [hasVideoReady, uploadMode, selectedFile, urlSubmitted, url, videoMetadata, setPending]);

    useEffect(() => {
        return () => {
            if (videoMetadata?.previewUrl) {
                URL.revokeObjectURL(videoMetadata.previewUrl);
            }
        };
    }, [videoMetadata]);

    const displayName =
        selectedFile?.name ||
        (url.trim() ? (url.trim().length > 56 ? `${url.trim().slice(0, 56)}…` : url.trim()) : '');

    return (
        <div className="relative w-full min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-64px)] py-8 md:py-10 pb-28 sm:pb-10 px-6 md:px-8">
            <div
                className="pointer-events-none absolute left-1/2 top-24 h-80 w-full max-w-xl -translate-x-1/2 rounded-full opacity-[0.05]"
                style={{
                    background: 'radial-gradient(circle, rgba(255, 107, 53, 0.6) 0%, transparent 70%)',
                }}
            />

            <div className="relative max-w-5xl mx-auto h-full">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Home</span>
                </button>

                <div className="mb-8">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                                    currentStep >= 1
                                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                        : 'bg-gray-800 text-gray-500'
                                )}
                            >
                                1
                            </div>
                            <span className={currentStep >= 1 ? 'text-white font-semibold' : 'text-gray-500'}>
                                Upload Video
                            </span>
                        </div>
                        <div
                            className={cn(
                                'h-1 w-12 sm:w-16 rounded',
                                currentStep >= 2 ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-800'
                            )}
                        />
                        <div className="flex items-center gap-2">
                            {hasVideoReady ? (
                                <Link
                                    to="/features"
                                    className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                                >
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                                            currentStep >= 2
                                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                                : 'bg-gray-800 text-gray-500'
                                        )}
                                    >
                                        2
                                    </div>
                                    <span
                                        className={cn(
                                            currentStep >= 2 ? 'text-white font-semibold' : 'text-gray-500',
                                            'hover:text-orange-300 transition-colors'
                                        )}
                                    >
                                        Select Features
                                    </span>
                                </Link>
                            ) : (
                                <>
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                                            'bg-gray-800 text-gray-500'
                                        )}
                                    >
                                        2
                                    </div>
                                    <span className="text-gray-500 font-medium">Select Features</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1
                        className="text-3xl md:text-4xl lg:text-5xl uppercase text-center mb-3 font-bold"
                        style={{
                            fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
                            fontWeight: 600,
                            background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Upload Your Short Video
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg text-center max-w-xl mx-auto">
                        Drop a file or paste a link, then choose analysis features on the next step
                    </p>
                </div>

                <div className="mb-10">
                    <h2 className="text-xl md:text-2xl font-bold text-white uppercase mb-6 tracking-wide">
                        Provide Video
                    </h2>
                    <div className="max-w-3xl mx-auto">
                        <VideoUpload
                            compact
                            mode={uploadMode}
                            onModeChange={setUploadMode}
                            onFileSelected={handleFileSelect}
                            onUrlSubmitted={handleUrlSubmit}
                            selectedFile={selectedFile}
                            urlValue={url}
                            urlError={urlError}
                            isUploading={false}
                        />
                    </div>

                    {stagedForFeatures && displayName && (
                        <div className="mt-6 max-w-3xl mx-auto rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                            <CheckCircle className="w-10 h-10 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                            <div className="flex-1 text-left">
                                <p className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">
                                    Upload successful
                                </p>
                                <p className="text-white text-sm mt-1 break-all">{displayName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate('/features')}
                                className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 text-sm font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap"
                            >
                                Continue to Feature Selection →
                            </button>
                        </div>
                    )}

                    {selectedFile && videoMetadata && !stagedForFeatures && (
                        <div className="mt-6 p-5 bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/5">
                            <h4 className="text-white font-semibold mb-4">Video Preview</h4>
                            <div className="mb-4">
                                <video
                                    ref={videoRef}
                                    src={videoMetadata.previewUrl}
                                    controls
                                    className="w-full rounded-xl max-h-64 border border-white/5"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-400">
                                <div>
                                    <span>Duration:</span>
                                    <span className="text-white ml-2">{Math.round(videoMetadata.duration)}s</span>
                                </div>
                                <div>
                                    <span>Size:</span>
                                    <span className="text-white ml-2">
                                        {(videoMetadata.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                </div>
                                <div>
                                    <span>Format:</span>
                                    <span className="text-white ml-2 uppercase">{videoMetadata.format}</span>
                                </div>
                                <div>
                                    <span>Filename:</span>
                                    <span className="text-white ml-2 truncate">
                                        {selectedFile?.name.length > 24
                                            ? selectedFile?.name.slice(0, 24) + '…'
                                            : selectedFile?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {urlSubmitted && uploadMode === 'url' && !stagedForFeatures && (
                        <div className="mt-6 max-w-3xl mx-auto p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-emerald-300 text-sm break-all">
                                URL ready: {url.length > 64 ? url.slice(0, 64) + '…' : url}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 max-w-3xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {hasVideoReady && !stagedForFeatures && (
                        <div className="mt-8 max-w-3xl mx-auto">
                            <button
                                type="button"
                                onClick={handleStageForFeatures}
                                disabled={isValidating}
                                className={cn(
                                    'w-full h-12 rounded-xl font-semibold text-sm md:text-base transition-all',
                                    'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25',
                                    isValidating && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                Continue to Feature Selection →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UploadPage;
