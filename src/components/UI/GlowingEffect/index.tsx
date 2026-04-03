import { useState, useRef, useCallback, useEffect } from 'react';

interface GlowingEffectProps {
  children: React.ReactNode;
  disabled?: boolean;
  spread?: number;
  proximity?: number;
  inactiveZone?: number;
  borderWidth?: number;
  blur?: number;
  glow?: boolean;
  colorStart?: string;
  colorEnd?: string;
  className?: string;
}

/** Hover-only glow: responds to mouseenter/mousemove/mouseleave, NOT click. */
function GlowingEffect({
  children,
  disabled = false,
  spread = 40,
  proximity = 100,
  inactiveZone = 0.01,
  borderWidth = 2,
  blur = 0,
  glow = true,
  colorStart = '#22c55e',
  colorEnd = '#10b981',
  className = '',
}: GlowingEffectProps) {
  const [angle, setAngle] = useState(0);
  const [active, setActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const marginW = rect.width * inactiveZone;
      const marginH = rect.height * inactiveZone;
      const inside =
        e.clientX >= rect.left + marginW &&
        e.clientX <= rect.right - marginW &&
        e.clientY >= rect.top + marginH &&
        e.clientY <= rect.bottom - marginH;
      if (inside) {
        setActive(true);
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const a = Math.atan2(dy, dx);
        setAngle((a * 180) / Math.PI + 90);
      } else {
        setActive(false);
      }
    },
    [disabled, inactiveZone, reducedMotion]
  );

  const handleMouseLeave = useCallback(() => setActive(false), []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showGlow = active && !disabled && !reducedMotion && glow;
  const gradient = `conic-gradient(from ${angle}deg, ${colorStart} 0deg, ${colorEnd} 90deg, ${colorStart} 180deg, transparent 270deg, ${colorStart} 360deg)`;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseEnter={(e) => handleMouseMove(e)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {showGlow && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[24px] transition-opacity duration-300 z-0"
          style={{
            padding: borderWidth,
            borderRadius: 24,
            background: gradient,
            opacity: 1,
            filter: blur ? `blur(${blur}px)` : undefined,
            boxShadow: glow ? `0 0 ${spread}px ${colorStart}50` : undefined,
          }}
        >
          <div className="w-full h-full rounded-[22px] bg-[rgba(15,20,28,0.98)]" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default GlowingEffect;
