import Axios from './index';

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
    analysisResults?: any;
    twelveLabsVideoId?: string;
    uploader_id: string;
    createdAt: string;
    updatedAt: string;
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
    const response = await Axios.get<{ data: GetUserVideosResponse }>('/videos');
    return response.data.data.videos;
};

export const deleteVideo = async (videoId: string): Promise<void> => {
    await Axios.delete(`/videos/${videoId}`);
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('selectedFeatures', JSON.stringify(selectedFeatures));

    const response = await Axios.post<{ data: { video: Video } }>(
        '/videos/upload-file',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            },
        }
    );
    return response.data.data.video;
};

export const uploadVideoUrlToTwelveLabs = async (
    url: string,
    filename: string,
    selectedFeatures: string[] = []
): Promise<Video> => {
    const response = await Axios.post<{ data: { video: Video } }>(
        '/videos/upload-url',
        {
            url,
            filename,
            selectedFeatures
        }
    );
    return response.data.data.video;
};

export type { Video };

