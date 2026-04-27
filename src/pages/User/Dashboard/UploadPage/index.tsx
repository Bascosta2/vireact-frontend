import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { VideoUpload, type UploadMode } from '@/components/UI/file-upload';
import { UPLOAD_VALIDATION } from '@/constants';
import { ErrorNotification } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { usePendingUpload, type PendingVideoMetadata } from '@/contexts/PendingUploadContext';
import { useSubscription } from '@/redux/hooks/use-subscription';

interface UploadPageProps {
    onBack: () => void;
}

function UploadPage({ onBack }: UploadPageProps) {
    const navigate = useNavigate();
    const { setPending, clearPending } = usePendingUpload();
    const { status: subStatus, videosUsedThisPeriod, videosPerMonthLimit, lastFetchedAt } =
        useSubscription();

    const { isUnlimited, isApproachingLimit, isAtLimit, showUsageSkeleton, hideUsageCounter } =
        useMemo(() => {
            const isUnlimited = videosPerMonthLimit === null;
            const used = videosUsedThisPeriod;
            const limit = videosPerMonthLimit;
            let pct = 0;
            if (!isUnlimited && used != null && limit != null && limit > 0) {
                pct = Math.min((used / limit) * 100, 100);
            }
            const isApproaching = !isUnlimited && pct >= 80 && pct < 100;
            const isAtLimit = !isUnlimited && pct >= 100;
            const showUsageSkeleton =
                subStatus !== 'error' &&
                used == null &&
                (subStatus === 'loading' || (subStatus === 'idle' && lastFetchedAt == null));
            const hideUsageCounter = subStatus === 'error';
            return {
                isUnlimited,
                isApproachingLimit: isApproaching,
                isAtLimit,
                showUsageSkeleton,
                hideUsageCounter,
            };
        }, [subStatus, videosUsedThisPeriod, videosPerMonthLimit, lastFetchedAt]);
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
        if (isAtLimit) {
            return;
        }
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
    }, [isAtLimit, hasVideoReady, uploadMode, selectedFile, urlSubmitted, url, videoMetadata, setPending]);

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
                            {hasVideoReady && !isAtLimit ? (
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
                            ) : hasVideoReady && isAtLimit ? (
                                <div className="flex items-center gap-2 opacity-60">
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                                            'bg-gray-800 text-gray-500'
                                        )}
                                    >
                                        2
                                    </div>
                                    <span className="text-gray-500 font-medium">Select Features</span>
                                </div>
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

                    {!hideUsageCounter && (
                        <>
                            {showUsageSkeleton ? (
                                <div
                                    className="mb-4 max-w-3xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] p-4"
                                    aria-hidden
                                >
                                    <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
                                </div>
                            ) : (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    className="mb-4 max-w-3xl mx-auto rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-gray-300"
                                >
                                    {isUnlimited ? (
                                        <span>
                                            Unlimited videos this month <span aria-hidden>∞</span>
                                        </span>
                                    ) : (
                                        <span>
                                            {videosUsedThisPeriod ?? 0} of {videosPerMonthLimit} videos used
                                            this month
                                        </span>
                                    )}
                                </div>
                            )}

                            {isApproachingLimit && (
                                <div
                                    role="alert"
                                    className="mb-4 max-w-3xl mx-auto rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                                >
                                    <p>
                                        You&apos;re approaching your monthly limit.{' '}
                                        <Link
                                            to="/subscription-plans"
                                            className="font-semibold text-amber-300 underline underline-offset-2 hover:text-amber-200"
                                        >
                                            Upgrade for more uploads
                                        </Link>
                                        .
                                    </p>
                                </div>
                            )}

                            {isAtLimit && (
                                <div
                                    role="alert"
                                    className="mb-4 max-w-3xl mx-auto rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                                >
                                    <p>
                                        You&apos;ve reached your monthly limit.{' '}
                                        <Link
                                            to="/subscription-plans"
                                            className="font-semibold text-red-300 underline underline-offset-2 hover:text-red-200"
                                        >
                                            Upgrade to continue uploading
                                        </Link>
                                        .
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    <div
                        className={cn(
                            'max-w-3xl mx-auto relative',
                            isAtLimit && 'pointer-events-none opacity-60'
                        )}
                    >
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
                                onClick={() => !isAtLimit && navigate('/features')}
                                disabled={isAtLimit}
                                aria-disabled={isAtLimit}
                                className={cn(
                                    'inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold whitespace-nowrap transition-opacity',
                                    isAtLimit
                                        ? 'cursor-not-allowed bg-gray-700 text-gray-400 opacity-70'
                                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-95'
                                )}
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
                                <div className="flex items-baseline min-w-0">
                                    <span className="shrink-0">Filename:</span>
                                    <span className="text-white ml-2 truncate min-w-0">
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
                            <p className="text-red-400 text-sm break-words">{error}</p>
                        </div>
                    )}

                    {hasVideoReady && !stagedForFeatures && (
                        <div className="mt-8 max-w-3xl mx-auto">
                            <button
                                type="button"
                                onClick={handleStageForFeatures}
                                disabled={isValidating || isAtLimit}
                                aria-disabled={isValidating || isAtLimit}
                                className={cn(
                                    'w-full h-12 rounded-xl font-semibold text-sm md:text-base transition-all',
                                    isAtLimit || isValidating
                                        ? 'cursor-not-allowed bg-gray-700 text-gray-400 opacity-70'
                                        : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25',
                                    isValidating && !isAtLimit && 'opacity-50 cursor-not-allowed'
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
