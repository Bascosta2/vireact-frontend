import { useState, useRef, useCallback } from 'react';
import { Upload, Video, Link2, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UPLOAD_VALIDATION } from '@/constants';

export type UploadMode = "file" | "url";

export interface VideoUploadProps {
  mode: UploadMode;
  onModeChange: (mode: UploadMode) => void;
  onFileSelected?: (file: File | null) => void;
  onUrlSubmitted?: (url: string) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
  selectedFile?: File | null;
  urlValue?: string;
  urlError?: string;
  isUploading?: boolean;
  className?: string;
  /** When true, uses smaller dropzone (p-8, w-12 h-12 icon, reduced height) */
  compact?: boolean;
}

export function VideoUpload({
  mode,
  onModeChange,
  onFileSelected,
  onUrlSubmitted,
  maxSizeMB = 200,
  allowedFileTypes = ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  selectedFile,
  urlValue = '',
  urlError,
  isUploading = false,
  className,
  compact = false
}: VideoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalUrl, setInternalUrl] = useState(urlValue);
  const [internalUrlError, setInternalUrlError] = useState(urlError || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // URL Validation
  const validateUrl = useCallback((url: string): boolean => {
    if (!url.trim()) return false;
    
    const { URL } = UPLOAD_VALIDATION;
    const patterns = [
      URL.YOUTUBE_REGEX,
      URL.TIKTOK_REGEX,
      URL.INSTAGRAM_REGEX,
      URL.TWITTER_REGEX,
      URL.FACEBOOK_REGEX
    ];

    return patterns.some(pattern => pattern.test(url));
  }, []);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalUrl(value);
    setInternalUrlError('');
    
    if (value.trim() && !validateUrl(value)) {
      setInternalUrlError('Please enter a valid URL from YouTube, TikTok, Instagram, Twitter, or Facebook');
    }
  };

  const handleUrlSubmit = () => {
    if (!internalUrl.trim()) {
      setInternalUrlError('Please enter a URL');
      return;
    }

    if (!validateUrl(internalUrl)) {
      setInternalUrlError('Please enter a valid URL from a supported platform');
      return;
    }

    onUrlSubmitted?.(internalUrl.trim());
  };

  // File Validation
  const validateFile = useCallback(async (file: File): Promise<boolean> => {
    // Check file size
    if (file.size > maxSizeBytes) {
      onFileSelected?.(null);
      return false;
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
      onFileSelected?.(null);
      return false;
    }

    // Check video duration
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (duration < UPLOAD_VALIDATION.VIDEO.MIN_DURATION || duration > UPLOAD_VALIDATION.VIDEO.MAX_DURATION) {
          onFileSelected?.(null);
          resolve(false);
        } else {
          resolve(true);
        }
      };

      video.onerror = () => {
        onFileSelected?.(null);
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  }, [maxSizeBytes, allowedFileTypes, onFileSelected]);

  const handleFileSelect = useCallback(async (file: File) => {
    const isValid = await validateFile(file);
    if (isValid) {
      onFileSelected?.(file);
    }
  }, [validateFile, onFileSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(() => {
    onFileSelected?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelected]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isUrlValid = internalUrl.trim() && validateUrl(internalUrl);

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-700">
          <button
            onClick={() => onModeChange('file')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300",
              mode === 'file'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white'
            )}
          >
            <Video className="w-4 h-4" />
            <span className="font-medium">Upload File</span>
          </button>
          <button
            onClick={() => onModeChange('url')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-300",
              mode === 'url'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/60 hover:text-white'
            )}
          >
            <Link2 className="w-4 h-4" />
            <span className="font-medium">URL Link</span>
          </button>
        </div>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFileTypes.map(format => `.${format}`).join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative w-full border-2 border-dashed rounded-xl cursor-pointer",
              "transition-all duration-300 ease-in-out",
              "bg-gray-900/30 backdrop-blur-sm",
              compact ? "h-auto min-h-[180px] p-8 rounded-lg" : "h-64",
              isDragOver
                ? 'border-green-500 bg-green-500/10'
                : selectedFile
                ? 'border-green-500 bg-green-500/5'
                : 'border-gray-600 hover:border-gray-500'
            )}
          >
            {selectedFile ? (
              <div className={cn("flex flex-col items-center justify-center", compact ? "p-4" : "h-full p-6")}>
                <div className={cn(
                  "flex items-center justify-center bg-green-500/20 rounded-full mb-4",
                  compact ? "w-12 h-12" : "w-16 h-16"
                )}>
                  <Check className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2">Video Selected</h3>
                <p className="text-gray-400 text-sm mb-2 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-gray-500 text-xs mb-4">{formatFileSize(selectedFile.size)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            ) : (
              <div className={cn("flex flex-col items-center justify-center text-center", compact ? "p-4" : "h-full p-6")}>
                <div className={cn(
                  "flex items-center justify-center bg-gray-700/50 rounded-full mb-4",
                  compact ? "w-12 h-12" : "w-16 h-16"
                )}>
                  <Upload className={compact ? "w-12 h-12 text-gray-500" : "w-8 h-8 text-gray-400"} />
                </div>
                <h3 className="text-white text-lg font-semibold mb-2 uppercase">
                  {isDragOver ? 'Drop your video here' : 'Upload Short Video'}
                </h3>
                <p className={cn("text-gray-400 text-center", compact ? "text-sm mb-3" : "text-sm mb-4")}>
                  Drag and drop your video file here, or click to browse
                </p>
                <p className="text-gray-500 text-xs">
                  Max {maxSizeMB}MB • {allowedFileTypes.join(', ').toUpperCase()}<br />
                  Duration: {UPLOAD_VALIDATION.VIDEO.MIN_DURATION}s - {UPLOAD_VALIDATION.VIDEO.MAX_DURATION}s
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Input Mode */}
      {mode === 'url' && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              <Link2 className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={internalUrl}
              onChange={handleUrlChange}
              placeholder="https://youtube.com/shorts/... or https://..."
              className={cn(
                "w-full bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-500",
                "rounded-lg py-4 pl-12 pr-4 border-2 outline-none transition-colors",
                "focus:ring-2 focus:ring-red-500/50",
                internalUrlError
                  ? 'border-red-500/50 focus:border-red-500'
                  : isUrlValid
                  ? 'border-green-500/50 focus:border-green-500'
                  : 'border-gray-600 focus:border-gray-500'
              )}
              disabled={isUploading}
            />
          </div>
          
          {internalUrlError && (
            <p className="text-red-400 text-sm">{internalUrlError}</p>
          )}
          
          {!internalUrlError && internalUrl.trim() && (
            <p className="text-gray-400 text-sm">
              Supported platforms: YouTube, TikTok, Instagram, Twitter, Facebook
            </p>
          )}

          {isUrlValid && (
            <button
              onClick={handleUrlSubmit}
              disabled={isUploading}
              className={cn(
                "w-full py-3 px-6 rounded-lg font-semibold transition-all",
                "bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white",
                "hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Continue with URL</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
