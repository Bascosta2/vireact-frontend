import { motion } from 'framer-motion';

interface CircuitBoardOverlayProps {
  color: string;
  opacity?: number;
  hoverOpacity?: number;
  isHovered?: boolean;
  className?: string;
}

export default function CircuitBoardOverlay({
  color,
  opacity = 0.02,
  hoverOpacity = 0.08,
  isHovered = false,
  className = '',
}: CircuitBoardOverlayProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-[24px] ${className}`}
      aria-hidden
    >
      <motion.svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: isHovered ? hoverOpacity : opacity }}
        transition={{ duration: 0.4 }}
      >
        <defs>
          <pattern
            id={`circuit-grid-${color.replace(/[^a-z0-9]/gi, '')}`}
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 12 0 L 0 0 0 12"
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity="0.15"
            />
            <circle cx="0" cy="0" r="1.5" fill={color} opacity="0.2" />
            <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#circuit-grid-${color.replace(/[^a-z0-9]/gi, '')})`} />
      </motion.svg>
    </div>
  );
}
