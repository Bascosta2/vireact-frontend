export const VIDEO_ACCEPT = '.mp4,.mov,.avi,.mkv,.webm';
export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'mkv', 'webm'] as const;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const VIDEO_MIN_SECONDS = 5;
export const VIDEO_MAX_SECONDS = 60;

/** Shown under every dropzone (Home and New analysis). */
export const VIDEO_RULES_HINT = 'MP4, MOV, AVI, MKV or WEBM. 5 to 60 seconds. Up to 200 MB.';

export const VIDEO_ERRORS = {
  missing: 'Select a video to analyze',
  type: 'The selected file must be an MP4, MOV, AVI, MKV or WEBM',
  size: 'The selected file must be smaller than 200 MB',
  empty: 'The selected file is empty',
  unreadable: 'The selected file could not be read as a video. Try another file.',
  uploadFailed: 'The video could not be uploaded. Try again.',
  duration: (seconds: number) =>
    `The selected video must be 5 to 60 seconds long. This one is ${Math.round(seconds)} seconds.`,
} as const;

export const fileExtension = (name: string): string => name.split('.').pop()?.toLowerCase() ?? '';

/** Checks that need no decoding. Returns an error message or null. */
export const validateVideoFile = (file: Pick<File, 'name' | 'size'>): string | null => {
  if (!(VIDEO_EXTENSIONS as readonly string[]).includes(fileExtension(file.name))) return VIDEO_ERRORS.type;
  if (file.size === 0) return VIDEO_ERRORS.empty;
  if (file.size > VIDEO_MAX_BYTES) return VIDEO_ERRORS.size;
  return null;
};

export const validateVideoDuration = (seconds: number): string | null => {
  if (!Number.isFinite(seconds)) return null;
  if (seconds < VIDEO_MIN_SECONDS || seconds > VIDEO_MAX_SECONDS) return VIDEO_ERRORS.duration(seconds);
  return null;
};

const DOWNLOADER_PREFIX = /^(?:snapinsta\.to|ssstik\.io|ytdown\.com|savefrom\.net|snaptik\.app|copy)[ _-]+/i;

/** Readable title from a raw upload filename: drops downloader prefixes and the extension, sentence case. */
export const cleanVideoTitle = (raw: string): string => {
  let name = raw.trim().replace(/\.[a-z0-9]{2,4}$/i, '');
  let previous = '';
  while (previous !== name) {
    previous = name;
    name = name.replace(DOWNLOADER_PREFIX, '');
  }
  name = name.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!name) return 'Untitled video';
  const lower = name === name.toUpperCase() ? name.toLowerCase() : name;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

export const formatDuration = (seconds?: number | null): string => {
  if (seconds == null || !Number.isFinite(seconds)) return '';
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Score colors used across the app: 70+ good, 40 to 69 fair, under 40 weak. */
export const scoreTone = (score: number): 'success' | 'warning' | 'danger' =>
  score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger';

export const scoreWord = (score: number): string => (score >= 70 ? 'Strong' : score >= 40 ? 'Fair' : 'Weak');
