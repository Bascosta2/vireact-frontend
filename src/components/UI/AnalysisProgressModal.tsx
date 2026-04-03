import React, { useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';

interface AnalysisProgressModalProps {
  isOpen: boolean;
  progress: number; // 0-100
  onCancel?: () => void;
  allowCancel?: boolean;
}

const BRAND_ORANGE = '#FF5500';

function StageUploadIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect
        x="14"
        y="10"
        width="36"
        height="46"
        rx="5"
        stroke="rgba(212, 212, 216, 0.9)"
        strokeWidth="2"
        fill="none"
      />
      <path
        className="loader-file-arrow"
        d="M32 42 V24 M25 31 L32 24 L39 31"
        stroke={BRAND_ORANGE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function StageGearsIcon({ filterId }: { filterId: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
          <feOffset dx="0" dy="1" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} className="loader-gear-large">
        <path
          fill={BRAND_ORANGE}
          d="M30 12h4l1 4.2a12 12 0 018.5 3.5l3.9-2 3 3.3-2.2 3.7a12 12 0 010 7.4l2.2 3.7-3 3.3-3.9-2a12 12 0 01-8.5 3.5L34 48h-4l-1-4.2a12 12 0 01-8.5-3.5l-3.9 2-3-3.3 2.2-3.7a12 12 0 010-7.4l-2.2-3.7 3-3.3 3.9 2a12 12 0 018.5-3.5L29 12z"
        />
        <circle cx="32" cy="30" r="5" fill="#1a1a1e" />
      </g>
      <g filter={`url(#${filterId})`} className="loader-gear-small">
        <path
          fill={BRAND_ORANGE}
          d="M46 34h3l0.8 3.2a8 8 0 015.6 2.8l2.9-1.5 2.2 2.4-1.6 2.8a8 8 0 010 4.6l1.6 2.8-2.2 2.4-2.9-1.5a8 8 0 01-5.6 2.8L49 54h-3l-0.8-3.2a8 8 0 01-5.6-2.8l-2.9 1.5-2.2-2.4 1.6-2.8a8 8 0 010-4.6l-1.6-2.8 2.2-2.4 2.9 1.5a8 8 0 015.6-2.8L45 34z"
        />
        <circle cx="47.5" cy="44" r="3.2" fill="#1a1a1e" />
      </g>
    </svg>
  );
}

function StageScanIcon({ clipId }: { clipId: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <circle cx="28" cy="28" r="10" />
        </clipPath>
      </defs>
      <circle cx="28" cy="28" r="12" stroke="rgba(255,255,255,0.92)" strokeWidth="2" fill="none" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          className="loader-scan-line"
          x="14"
          y="26"
          width="28"
          height="3.5"
          rx="1"
          fill={BRAND_ORANGE}
          opacity={0.95}
        />
      </g>
      <path
        d="M38 38 L52 52"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AnalysisProgressModal({
  isOpen,
  progress,
  onCancel,
  allowCancel = false,
}: AnalysisProgressModalProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const reactId = useId().replace(/:/g, '');
  const gearFilterId = `loader-gear-glow-${reactId}`;
  const lensClipId = `loader-lens-clip-${reactId}`;

  useEffect(() => {
    if (progress > displayProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress((prev) => Math.min(prev + 1, progress));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  const getStage = () => {
    if (displayProgress < 34) {
      return {
        text: 'Uploading video...',
        icon: <StageUploadIcon />,
        description: 'Transferring your video to our servers',
      };
    }
    if (displayProgress < 67) {
      return {
        text: 'Processing content...',
        icon: <StageGearsIcon filterId={gearFilterId} />,
        description: 'Extracting frames and analyzing structure',
      };
    }
    return {
      text: 'Analyzing video...',
      icon: <StageScanIcon clipId={lensClipId} />,
      description: 'Generating insights and feedback',
    };
  };

  const stage = getStage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <style>{`
        @keyframes loader-file-arrow-bounce {
          0%, 100% { transform: translateY(12px); }
          50% { transform: translateY(-4px); }
        }
        .loader-file-arrow {
          animation: loader-file-arrow-bounce 1.1s ease-in-out infinite;
        }
        @keyframes loader-gear-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loader-gear-spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .loader-gear-large {
          animation: loader-gear-spin 2s linear infinite;
          transform-origin: 32px 30px;
        }
        .loader-gear-small {
          animation: loader-gear-spin-reverse 2s linear infinite;
          transform-origin: 53px 44px;
        }
        @keyframes loader-scan-sweep {
          0% { transform: translateX(-12px); }
          100% { transform: translateX(12px); }
        }
        .loader-scan-line {
          animation: loader-scan-sweep 1.5s ease-in-out infinite alternate;
        }
      `}</style>
      <div className="relative w-full max-w-2xl mx-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        {allowCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
            aria-label="Cancel"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-6 w-16 h-16 mx-auto items-center">{stage.icon}</div>

          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-3 uppercase"
            style={{
              fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
              background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {stage.text}
          </h2>

          <p className="text-gray-400 text-center mb-8">{stage.description}</p>

          <div className="mb-6">
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{
                  width: `${displayProgress}%`,
                  background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                }}
              >
                <div
                  className="absolute inset-0 analysis-progress-shimmer"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {displayProgress < 34 ? 'Stage 1/3' : displayProgress < 67 ? 'Stage 2/3' : 'Stage 3/3'}
              </span>
              <span
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {displayProgress}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2">
            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  displayProgress >= 1 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-800'
                }`}
              >
                <span className="text-white font-bold">1</span>
              </div>
              <span className={`text-xs text-center ${displayProgress >= 1 ? 'text-white' : 'text-gray-600'}`}>
                Upload
              </span>
            </div>

            <div
              className={`flex-1 h-1 rounded ${
                displayProgress >= 34 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-800'
              }`}
            />

            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  displayProgress >= 34 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-800'
                }`}
              >
                <span className="text-white font-bold">2</span>
              </div>
              <span className={`text-xs text-center ${displayProgress >= 34 ? 'text-white' : 'text-gray-600'}`}>
                Process
              </span>
            </div>

            <div
              className={`flex-1 h-1 rounded ${
                displayProgress >= 67 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-800'
              }`}
            />

            <div className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                  displayProgress >= 67 ? 'bg-gradient-to-r from-pink-500 to-orange-500' : 'bg-gray-800'
                }`}
              >
                <span className="text-white font-bold">3</span>
              </div>
              <span className={`text-xs text-center ${displayProgress >= 67 ? 'text-white' : 'text-gray-600'}`}>
                Analyze
              </span>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">✨ Hang tight! We&apos;re making magic happen...</p>
        </div>
      </div>
    </div>
  );
}
