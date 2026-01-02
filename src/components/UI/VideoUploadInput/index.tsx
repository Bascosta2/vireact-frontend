import { useState, useRef, useCallback } from 'react';
import { FaUpload, FaVideo, FaTimes, FaCheck } from 'react-icons/fa';
import { UPLOAD_VALIDATION } from '@/constants';

interface VideoUploadInputProps {
    onFileSelect: (file: File) => void;
    onError: (error: string) => void;
    className?: string;
}

function VideoUploadInput({ onFileSelect, onError, className = '' }: VideoUploadInputProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback(async (file: File): Promise<boolean> => {
        // Check file size
        if (file.size > UPLOAD_VALIDATION.VIDEO.MAX_SIZE) {
            onError(`File size must be less than ${UPLOAD_VALIDATION.VIDEO.MAX_SIZE / (1024 * 1024)}MB`);
            return false;
        }

        // Check file format
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !UPLOAD_VALIDATION.VIDEO.ALLOWED_FORMATS.includes(fileExtension)) {
            onError(`Only ${UPLOAD_VALIDATION.VIDEO.ALLOWED_FORMATS.join(', ')} formats are allowed`);
            return false;
        }

        // Check video duration (basic check - in real app you'd use a video library)
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                const duration = video.duration;
                if (duration < UPLOAD_VALIDATION.VIDEO.MIN_DURATION) {
                    onError(`Video must be at least ${UPLOAD_VALIDATION.VIDEO.MIN_DURATION} seconds long`);
                    resolve(false);
                } else if (duration > UPLOAD_VALIDATION.VIDEO.MAX_DURATION) {
                    onError(`Video must be no longer than ${UPLOAD_VALIDATION.VIDEO.MAX_DURATION} seconds`);
                    resolve(false);
                } else {
                    resolve(true);
                }
            };

            video.onerror = () => {
                onError('Invalid video file');
                resolve(false);
            };

            video.src = URL.createObjectURL(file);
        });
    }, [onError]);

    const handleFileSelect = useCallback(async (file: File) => {
        setIsValidating(true);
        setSelectedFile(file);
        
        const isValid = await validateFile(file);
        if (isValid) {
            onFileSelect(file);
        } else {
            setSelectedFile(null);
        }
        setIsValidating(false);
    }, [validateFile, onFileSelect]);

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
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`relative ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept={UPLOAD_VALIDATION.VIDEO.ALLOWED_FORMATS.map(format => `.${format}`).join(',')}
                onChange={handleFileInputChange}
                className="hidden"
            />
            
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative w-full h-64 border-2 border-dashed rounded-xl cursor-pointer
                    transition-all duration-300 ease-in-out
                    ${isDragOver 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }
                    ${selectedFile ? 'border-green-500 bg-green-500/5' : ''}
                `}
            >
                {selectedFile ? (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                            {isValidating ? (
                                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FaCheck className="w-6 h-6 text-green-500" />
                            )}
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">Video Selected</h3>
                        <p className="text-gray-400 text-sm mb-2">{selectedFile.name}</p>
                        <p className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                            }}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                            <FaTimes className="w-4 h-4" />
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                            <FaVideo className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">
                            {isDragOver ? 'Drop your video here' : 'Upload Short Video'}
                        </h3>
                        <p className="text-gray-400 text-sm text-center mb-4">
                            Drag and drop your video file here, or click to browse
                        </p>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <FaUpload className="w-4 h-4" />
                            <span>Max {UPLOAD_VALIDATION.VIDEO.MAX_SIZE / (1024 * 1024)}MB</span>
                            <span>•</span>
                            <span>{UPLOAD_VALIDATION.VIDEO.ALLOWED_FORMATS.join(', ')}</span>
                        </div>
                        <div className="mt-2 text-gray-500 text-xs">
                            Duration: {UPLOAD_VALIDATION.VIDEO.MIN_DURATION}s - {UPLOAD_VALIDATION.VIDEO.MAX_DURATION}s
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VideoUploadInput;
