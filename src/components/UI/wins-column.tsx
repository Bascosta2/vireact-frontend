import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export interface WinScreenshot {
  image: string;
  alt: string;
  size?: "small" | "medium" | "large";
}

interface WinsColumnProps {
  className?: string;
  wins: WinScreenshot[];
  duration?: number;
}

// Height constraints for each size
const HEIGHT_CONSTRAINTS = {
  small: { min: 160, base: 180, max: 240 },
  medium: { min: 200, base: 240, max: 300 },
  large: { min: 260, base: 300, max: 380 },
};

// Padding based on size
const PADDING_MAP = {
  small: 16,
  medium: 24,
  large: 32,
};

// Individual Win Card with Dynamic Sizing
const WinCard = ({ win }: { win: WinScreenshot }) => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    padding: number;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      const size = win.size || "medium";
      const constraints = HEIGHT_CONSTRAINTS[size];
      const basePadding = PADDING_MAP[size];

      // Fixed card width
      const cardWidth = 320;

      // Available space for image
      const availableWidth = cardWidth - basePadding * 2;

      // Calculate height maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      const imageHeight = availableWidth / aspectRatio;

      // Total card height with padding
      const rawCardHeight = imageHeight + basePadding * 2;

      // Apply constraints
      const constrainedHeight = Math.max(
        constraints.min,
        Math.min(constraints.max, rawCardHeight)
      );

      // Adjust padding if height was constrained significantly
      const heightRatio = constrainedHeight / rawCardHeight;
      const adjustedPadding =
        heightRatio < 0.9 ? Math.max(12, basePadding * 0.8) : basePadding;

      setDimensions({
        width: cardWidth,
        height: constrainedHeight,
        padding: adjustedPadding,
      });

      setImageLoaded(true);
    };

    img.src = win.image;
  }, [win.image, win.size]);

  if (!dimensions || !imageLoaded) {
    // Skeleton loader
    const size = win.size || "medium";
    return (
      <div
        style={{
          width: "320px",
          height: `${HEIGHT_CONSTRAINTS[size].base}px`,
          padding: `${PADDING_MAP[size]}px`,
        }}
        className="relative overflow-hidden rounded-2xl flex-shrink-0 bg-gradient-to-br from-white/5 to-white/2 border border-white/10 animate-pulse"
      >
        <div className="w-full h-full bg-gray-700/20 rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      onClick={() => navigate("/case-studies")}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        padding: `${dimensions.padding}px`,
      }}
      className="relative overflow-hidden rounded-2xl cursor-pointer group flex-shrink-0"
    >
      {/* Glassmorphism background */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-br from-white/10 to-white/5
          backdrop-blur-md
          border border-white/20
          shadow-xl shadow-black/20
          transition-all duration-300
          group-hover:border-red-500/50
          group-hover:shadow-red-500/20
          group-hover:shadow-2xl
        "
      />

      {/* Hover glow */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-br from-red-500/0 to-red-500/0
          group-hover:from-red-500/10 group-hover:to-pink-500/10
          transition-all duration-300
          pointer-events-none
        "
      />

      {/* Screenshot - fills width */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <img
          src={win.image}
          alt={win.alt}
          loading="lazy"
          decoding="async"
          className="
            w-full h-auto max-w-full max-h-full
            object-contain
            transition-transform duration-300
            group-hover:scale-105
          "
        />
      </div>

      {/* Hover highlight */}
      <div
        className="
          absolute inset-0
          opacity-0 group-hover:opacity-100
          bg-gradient-to-tr from-red-500/20 via-transparent to-pink-500/20
          transition-opacity duration-300
          pointer-events-none
        "
      />
    </motion.div>
  );
};

// Main Wins Column Component
export const WinsColumn = ({
  className,
  wins,
  duration = 30,
}: WinsColumnProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
  }, []);

  const shouldAnimate = !prefersReducedMotion;

  return (
    <div className={className}>
      <motion.div
        animate={
          shouldAnimate
            ? {
                translateY: "-50%",
              }
            : {}
        }
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        style={{ willChange: shouldAnimate ? "transform" : "auto" }}
        className="flex flex-col gap-6 pb-6"
      >
        {[0, 1].map((index) => (
          <React.Fragment key={index}>
            {wins.map((win, i) => (
              <WinCard key={`${index}-${i}`} win={win} />
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
