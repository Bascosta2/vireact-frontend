import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import VideoPlayModal from '@/components/UI/VideoPlayModal';

interface NicheCardProps {
  category: string;
  alt: string;
  thumbnail: string;
  isFounder?: boolean;
  interactive?: boolean;
}

function NicheCard({ category, alt, thumbnail, isFounder = false, interactive = true }: NicheCardProps) {
  const [hover, setHover] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const cardContent = (
    <>
      <div className="mb-3">
        <span className="inline-block text-xs font-medium rounded-full px-4 py-2 bg-white/10 text-white border border-white/20">
          {isFounder ? 'Founder (1.1M+ @YouTube)' : category}
        </span>
      </div>
      <motion.div
        className="relative rounded-xl border overflow-hidden bg-white/10 border-white/20"
        style={{ width: 240, height: 426 }}
        whileHover={interactive ? {
          y: -10,
          scale: 1.05,
          boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
          borderColor: 'rgba(255,255,255,0.2)',
        } : undefined}
        transition={{ duration: 0.2 }}
      >
        <img
          src={thumbnail}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-200 ${interactive && hover ? 'brightness-110' : ''}`}
        />
        {interactive && hover && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <Play className="w-8 h-8 text-white fill-white" />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </>
  );

  if (interactive) {
    return (
      <>
        <div
          className="mx-2 flex-shrink-0 w-[240px] cursor-pointer"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => setModalOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setModalOpen(true)}
          role="button"
          tabIndex={0}
          aria-label={`Play ${alt}`}
        >
          {cardContent}
        </div>
        <VideoPlayModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          thumbnail={thumbnail}
          alt={alt}
        />
      </>
    );
  }

  return (
    <div className="mx-2 flex-shrink-0 w-[240px]">
      {cardContent}
    </div>
  );
}

export default NicheCard;
