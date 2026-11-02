import type { PendingVideoMetadata } from '@/contexts/PendingUploadContext';
import { fileExtension, validateVideoDuration, validateVideoFile, VIDEO_ERRORS } from '@/lib/video-file';

/** Browsers often cannot decode these containers, so a metadata failure is not treated as a bad file. */
const MAY_NOT_DECODE = ['avi', 'mkv'];

const readMetadata = (file: File, previewUrl: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error('metadata'));
    video.src = previewUrl;
  });

export type InspectedVideo = { metadata: PendingVideoMetadata; error: null } | { metadata: null; error: string };

/** Validates type, size, emptiness and duration, and builds the preview URL the page shows. */
export const inspectVideoFile = async (file: File): Promise<InspectedVideo> => {
  const basicError = validateVideoFile(file);
  if (basicError) return { metadata: null, error: basicError };
  const ext = fileExtension(file.name);
  const previewUrl = URL.createObjectURL(file);
  try {
    const duration = await readMetadata(file, previewUrl);
    const durationError = validateVideoDuration(duration);
    if (durationError) {
      URL.revokeObjectURL(previewUrl);
      return { metadata: null, error: durationError };
    }
    return { metadata: { duration, size: file.size, format: ext, previewUrl }, error: null };
  } catch {
    if (MAY_NOT_DECODE.includes(ext)) {
      return { metadata: { duration: Number.NaN, size: file.size, format: ext, previewUrl }, error: null };
    }
    URL.revokeObjectURL(previewUrl);
    return { metadata: null, error: VIDEO_ERRORS.unreadable };
  }
};
