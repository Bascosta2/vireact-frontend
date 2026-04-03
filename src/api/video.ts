import Axios from './index';
import type { VideoFeedbackResponse } from '@/types/video-feedback';

export interface FeatureEntry {
    score: number | null;
    rating: string | null;
    feedback: string | null;
    suggestions: string[];
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
    retentionCurve?: number[];
    twelveLabsVideoId?: string;
    uploader_id: string;
    createdAt: string;
    updatedAt: string;
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
        feedbackItems: Array<{
            feature: string;
            whatIsWrong: string;
            suggestionsToImprove: string[];
            timestampStart?: number;
            timestampEnd?: number;
            severity: 'critical' | 'important' | 'minor' | string;
        }>;
        scores: {
            virality: number | null;
            hook: number | null;
            pacing: number | null;
            audio: number | null;
            caption: number | null;
            viewsPredictor: number | null;
        };
        predictedViews: {
            low: number | null;
            expected: number | null;
            high: number | null;
        };
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

export const getUserVideos = async (): Promise<Video[]> => {
    const response = await Axios.get<{ data?: { videos?: Video[] } | Video[]; videos?: Video[] }>('/videos');
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

export const uploadVideoFileToTwelveLabs = async (
    file: File,
    filename: string,
    selectedFeatures: string[] = [],
    onProgress?: (progress: number) => void
): Promise<Video> => {
    console.log('📤 Uploading video file to TwelveLabs...');
    console.log('📁 File:', filename, 'Size:', file.size);
    console.log('🎯 Selected features:', selectedFeatures);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('selectedFeatures', JSON.stringify(selectedFeatures));

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

export const uploadVideoUrlToTwelveLabs = async (
    url: string,
    filename: string,
    selectedFeatures: string[] = []
): Promise<Video> => {
    console.log('📤 Uploading video URL to TwelveLabs...');
    console.log('🔗 URL:', url);
    console.log('📁 Filename:', filename);
    console.log('🎯 Selected features:', selectedFeatures);
    
    try {
        const response = await Axios.post<{ data: { video: Video } }>(
            '/videos/upload-url',
            {
                url,
                filename,
                selectedFeatures
            },
            { timeout: VIDEO_UPLOAD_TIMEOUT_MS }
        );
        console.log('✅ Video URL uploaded successfully:', response.data.data.video);
        console.log('📊 Video ID:', response.data.data.video._id);
        console.log('🎯 Features stored:', response.data.data.video.selectedFeatures);
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

export const getVideoStatus = async (videoId: string): Promise<{ uploadStatus: string; analysisStatus: string; isAnalysisReady?: boolean }> => {
    const response = await Axios.get<{ data: { uploadStatus: string; analysisStatus: string; isAnalysisReady?: boolean } }>(
        `/videos/${videoId}/status`
    );
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

