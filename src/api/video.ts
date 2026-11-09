import Axios from './index';
import type { VideoFeedbackResponse, FeedbackFix, ScriptRewrite } from '@/types/video-feedback';

export interface FeatureEntry {
    score: number | null;
    rating: string | null;
    feedback: string | null;
    suggestions: string[];
    emotionalTriggers?: string[];
    retentionDrivers?: string[];
    psychologicalProfile?: string | null;
    weakestMoment?: string | null;
}

interface PresignedUrlResponse {
    presignedUrl: string;
    videoId: string;
    s3Key: string;
}

interface Video {
    _id: string;
    s3Key?: string;
    s3_url?: string;
    filename: string;
    fileSize: number;
    duration?: number;
    uploadStatus: string;
    selectedFeatures: string[];
    analysisStatus: string;
    isAnalysisReady?: boolean;
    analysisResults?: unknown;
    viralityScore?: number | null;
    predictedViewsLow?: number | null;
    predictedViewsHigh?: number | null;
    predictedViewsExpected?: number | null;
    /** Latest real view count the creator logged (summary list includes it). */
    actualViews?: number | null;
    retentionCurve?: number[];
    /** Twelve Labs HLS stream URL, used by the report player for click-to-seek. */
    streamUrl?: string | null;
    thumbnailUrl?: string | null;
    /** Timestamped transcript segments (segment-level, from Twelve Labs). */
    rawTranscript?: Array<{ text: string; tStart: number; tEnd: number }>;
    twelveLabsVideoId?: string;
    uploader_id: string;
    createdAt: string;
    updatedAt: string;
    /** Sanitized client-safe message when analysis failed (from status API or list if provided) */
    errorSummary?: string;
    /** When returned from GET /videos/:id, analysis is the VideoAnalysis DTO */
    analysis?: {
        viralityScore: number;
        hookScore: number;
        pacingScore: number;
        audioScore: number;
        captionClarityScore: number;
        hookSwipeRate: number;
        predictedViewsLow: number;
        predictedViewsHigh: number;
        predictedViewsExpected: number;
        retentionCurve: number[];
        /**
         * Frame-level feedback. The first six keys are the documented FeedbackItem
         * contract; the rest are the 2026-09 frame-level additions (exact range,
         * literal fix, authoring analyzer).
         */
        feedbackItems: Array<{
            feature: string;
            whatIsWrong: string;
            suggestionsToImprove: string[];
            timestampStart?: number;
            timestampEnd?: number;
            severity: 'critical' | 'important' | 'minor' | string;

            id?: string;
            category?: string;
            severityLevel?: number;
            sourceFeature?: string | null;
            observed?: string;
            fix?: FeedbackFix;
            expectedImpact?: string | null;
            sourceConfidence?: number | null;
            timestampStartLabel?: string;
            timestampEndLabel?: string;
            isLegacy?: boolean;
        }>;
        /** Literal line rewrites, separate from general frame feedback. */
        scriptRewrites?: ScriptRewrite[];
        /** True when feedbackItems were adapted from pre-2026-09 prose entries. */
        isLegacyFeedback?: boolean;
        scores: {
            virality: number | null;
            hook: number | null;
            pacing: number | null;
            audio: number | null;
            caption: number | null;
            viewsPredictor: number | null;
            advanced?: number | null;
        };
        predictedViews: {
            low: number | null;
            expected: number | null;
            high: number | null;
            /** score = capped model estimate; followers = follower-based estimate; dataset = similar real results */
            method?: 'score' | 'followers' | 'dataset';
            comparables?: number;
            followers?: number | null;
            platform?: string | null;
        };
        /** Real view count the creator reported after posting. */
        actualViews?: number | null;
        actualViewsReportedAt?: string | null;
        features: {
            hook: FeatureEntry | null;
            pacing: FeatureEntry | null;
            audio: FeatureEntry | null;
            caption: FeatureEntry | null;
            viewsPredictor: FeatureEntry | null;
            advanced: FeatureEntry | null;
        };
    };
}

interface GetUserVideosResponse {
    videos: Video[];
}

export const getPresignedUploadUrl = async (
    filename: string,
    contentType: string,
    selectedFeatures: string[] = []
): Promise<PresignedUrlResponse> => {
    const response = await Axios.post<{ data: PresignedUrlResponse }>(
        '/videos/presigned-url',
        {
            filename,
            contentType,
            selectedFeatures
        }
    );
    return response.data.data;
};

export const uploadToS3 = async (
    presignedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const progress = Math.round((e.loaded / e.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve();
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
            reject(new Error('Upload was aborted'));
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
    });
};

export const confirmVideoUpload = async (videoId: string, fileSize: number): Promise<Video> => {
    const response = await Axios.patch<{ data: { video: Video } }>(
        `/videos/${videoId}/confirm`,
        { fileSize }
    );
    return response.data.data.video;
};

/**
 * The user's videos. `summary: true` returns list fields only (status, score, thumbnail, dates): use it
 * anywhere that does not need the full analysis, it is much lighter.
 */
export const getUserVideos = async (options: { summary?: boolean } = {}): Promise<Video[]> => {
    const response = await Axios.get<{ data?: { videos?: Video[] } | Video[]; videos?: Video[] }>('/videos', {
        params: options.summary ? { view: 'summary' } : undefined,
    });
    // Support wrapped (data.videos), direct (videos), or array-as-data (data = array)
    const raw =
        (response.data?.data as { videos?: Video[] })?.videos ??
        (Array.isArray(response.data?.data) ? response.data.data : null) ??
        response.data?.videos;
    const list = Array.isArray(raw) ? raw : [];
    // Normalize so analysisStatus is always set (backend may send camelCase or snake_case)
    return list.map((v) => {
        const row = v as unknown as Record<string, unknown>;
        return {
            ...row,
            analysisStatus: (row.analysisStatus ?? row.analysis_status ?? 'pending') as string,
            errorSummary:
                typeof row.errorSummary === 'string'
                    ? row.errorSummary
                    : typeof row.error_summary === 'string'
                      ? row.error_summary
                      : undefined,
        } as Video;
    });
};

export const deleteVideo = async (videoId: string): Promise<void> => {
    await Axios.delete(`/videos/${videoId}`);
};

export const reanalyzeVideo = async (
    videoId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await Axios.post<{
        data: { success: boolean; message: string };
    }>(`/videos/${videoId}/reanalyze`);
    return response.data.data;
};

export const markAnalysisViewed = async (videoId: string): Promise<Video> => {
    const response = await Axios.patch<{ data: { video: Video } }>(
        `/videos/${videoId}/mark-viewed`
    );
    return response.data.data.video;
};

/** Optional account context sent with an upload so predicted views fit the creator. */
export interface CreatorContext {
    platform?: string | null;
    followers?: number | null;
}

export const uploadVideoFileToTwelveLabs = async (
    file: File,
    filename: string,
    selectedFeatures: string[] = [],
    onProgress?: (progress: number) => void,
    creator: CreatorContext = {}
): Promise<Video> => {
    console.log('📤 Uploading video file to TwelveLabs...');
    console.log('📁 File:', filename, 'Size:', file.size);
    console.log('🎯 Selected features:', selectedFeatures);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('selectedFeatures', JSON.stringify(selectedFeatures));
    if (creator.platform) formData.append('platform', creator.platform);
    if (creator.followers != null && Number.isFinite(creator.followers)) formData.append('followers', String(creator.followers));

    try {
        const response = await Axios.post<{ data: { video: Video } }>(
            '/videos/upload-file',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: VIDEO_UPLOAD_TIMEOUT_MS,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            }
        );
        console.log('✅ Video uploaded successfully:', response.data.data.video);
        return response.data.data.video;
    } catch (error: any) {
        console.error('❌ Upload failed:', error);
        console.error('📡 Response status:', error?.response?.status);
        console.error('📄 Response data:', error?.response?.data);
        throw error;
    }
};

/** Timeout for video upload/processing (5 min) - backend may wait for Twelve Labs indexing */
export const VIDEO_UPLOAD_TIMEOUT_MS = 300000;

export const getVideoStatus = async (
    videoId: string
): Promise<{
    uploadStatus: string;
    analysisStatus: string;
    isAnalysisReady?: boolean;
    errorSummary?: string;
}> => {
    const response = await Axios.get<{
        data: {
            uploadStatus: string;
            analysisStatus: string;
            isAnalysisReady?: boolean;
            errorSummary?: string;
        };
    }>(`/videos/${videoId}/status`);
    return response.data.data;
};

export const getVideoFeedback = async (videoId: string): Promise<VideoFeedbackResponse> => {
    const response = await Axios.get<{ data: VideoFeedbackResponse }>(
        `/videos/${videoId}/feedback`
    );
    return response.data.data;
};

export const getVideoById = async (videoId: string): Promise<Video> => {
    const response = await Axios.get<{ data: Video }>(`/videos/${videoId}`);
    return response.data.data;
};

export type { Video };


// ─── Scripts tab ───────────────────────────────────────────────────────────

export interface ScriptBeat {
    tStart: number;
    tEnd: number;
    say: string;
    onScreenText: string;
    visual: string;
}

export interface ScriptOption {
    id: string;
    title: string;
    angle: string;
    hookLine: string;
    beats: ScriptBeat[];
    cta: string;
    whyItWorks: string;
}

export interface ScriptSuggestions {
    options: ScriptOption[];
    targetSeconds: number | null;
    generatedAt: string | null;
    regenerationsLeft: number;
}

/** Writing scripts takes a model call or two; allow well over the default 30 s client timeout. */
const SCRIPT_GENERATION_TIMEOUT_MS = 90000;

export const getScriptSuggestions = async (videoId: string): Promise<ScriptSuggestions> => {
    const response = await Axios.get<{ data: ScriptSuggestions }>(`/videos/${videoId}/scripts`);
    return response.data.data;
};

export const generateScriptSuggestions = async (videoId: string, regenerate = false): Promise<ScriptSuggestions> => {
    const response = await Axios.post<{ data: ScriptSuggestions }>(
        `/videos/${videoId}/scripts`,
        { regenerate },
        { timeout: SCRIPT_GENERATION_TIMEOUT_MS }
    );
    return response.data.data;
};

// ─── Real results ──────────────────────────────────────────────────────────

export const reportActualViews = async (
    videoId: string,
    views: number
): Promise<{ actualViews: number; actualViewsReportedAt: string }> => {
    const response = await Axios.patch<{ data: { actualViews: number; actualViewsReportedAt: string } }>(
        `/videos/${videoId}/actual-views`,
        { views }
    );
    return response.data.data;
};

export interface PerformanceSnapshot {
    id: string;
    capturedAt: string;
    views: number;
    likes: number | null;
    comments: number | null;
    shares: number | null;
    saves: number | null;
    source: string;
}

export interface VideoPerformance {
    videoId: string;
    postedAt: string | null;
    postUrl: string | null;
    creatorPlatform: string | null;
    creatorFollowers: number | null;
    actualViews: number | null;
    actualViewsReportedAt: string | null;
    snapshots: PerformanceSnapshot[];
}

export type SnapshotInput = {
    views: number;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
    saves?: number | null;
    capturedAt?: string;
};

export const getVideoPerformance = async (videoId: string): Promise<VideoPerformance> => {
    const response = await Axios.get<{ data: VideoPerformance }>(`/videos/${videoId}/performance`);
    return response.data.data;
};

export const updateVideoPost = async (
    videoId: string,
    body: { postedAt?: string | null; postUrl?: string | null; platform?: string | null }
): Promise<VideoPerformance> => {
    const response = await Axios.patch<{ data: VideoPerformance }>(`/videos/${videoId}/post`, body);
    return response.data.data;
};

export const addPerformanceSnapshot = async (videoId: string, body: SnapshotInput): Promise<VideoPerformance> => {
    const response = await Axios.post<{ data: VideoPerformance }>(`/videos/${videoId}/snapshots`, body);
    return response.data.data;
};

export const deletePerformanceSnapshot = async (videoId: string, snapshotId: string): Promise<VideoPerformance> => {
    const response = await Axios.delete<{ data: VideoPerformance }>(`/videos/${videoId}/snapshots/${snapshotId}`);
    return response.data.data;
};
