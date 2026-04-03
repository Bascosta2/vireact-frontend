import { useEffect } from 'react';

interface VideoPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  thumbnail: string;
  alt?: string;
  videoUrl?: string | null;
}

function VideoPlayModal({ isOpen, onClose, thumbnail, alt = '', videoUrl }: VideoPlayModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl"
          aria-label="Close"
        >
          ×
        </button>
        {videoUrl ? (
          <video
            src={videoUrl}
            className="max-w-full max-h-[90vh] object-contain"
            autoPlay
            controls
            playsInline
          />
        ) : (
          <img src={thumbnail} alt={alt} className="max-w-full max-h-[90vh] object-contain" />
        )}
      </div>
    </div>
  );
}

export default VideoPlayModal;
