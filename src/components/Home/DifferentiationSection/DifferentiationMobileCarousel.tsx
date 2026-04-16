import {
  Children,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type TouchEvent,
} from 'react';
import { cn } from '@/lib/utils';

const AUTO_ADVANCE_MS = 4000;
const SWIPE_THRESHOLD_PX = 50;
const SLIDE_WIDTH_FRAC = 0.7;
const SLIDE_GAP_PX = 16;

type DifferentiationMobileCarouselProps = {
  children: ReactNode;
  onActiveIndexChange?: (index: number) => void;
};

export default function DifferentiationMobileCarousel({
  children,
  onActiveIndexChange,
}: DifferentiationMobileCarouselProps) {
  const items = Children.toArray(children);
  const n = items.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % n);
    }, AUTO_ADVANCE_MS);
  }, [n]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer]);

  useEffect(() => {
    onActiveIndexChange?.(activeIndex);
  }, [activeIndex, onActiveIndexChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerWidth(el.offsetWidth));
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const goBy = useCallback(
    (delta: number) => {
      setActiveIndex((i) => (i + delta + n) % n);
      startTimer();
    },
    [n, startTimer]
  );

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > SWIPE_THRESHOLD_PX) goBy(-1);
    else if (dx < -SWIPE_THRESHOLD_PX) goBy(1);
  };

  const slideWidth =
    containerWidth > 0 ? containerWidth * SLIDE_WIDTH_FRAC : 0;
  const translateX =
    containerWidth > 0 && slideWidth > 0
      ? containerWidth / 2 - (activeIndex * (slideWidth + SLIDE_GAP_PX) + slideWidth / 2)
      : 0;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="overflow-hidden w-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex flex-nowrap transition-transform duration-300 ease-out"
          style={{ transform: `translate3d(${translateX}px,0,0)` }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="flex-shrink-0 box-border"
              style={{
                width: slideWidth > 0 ? slideWidth : `${SLIDE_WIDTH_FRAC * 100}%`,
                marginRight: i < n - 1 ? SLIDE_GAP_PX : 0,
              }}
            >
              <div
                className={cn(
                  'h-full transition-[opacity,filter] duration-300',
                  i === activeIndex
                    ? 'opacity-100'
                    : 'opacity-[0.55] blur-[0.5px] brightness-[0.88]',
                )}
              >
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="flex justify-center gap-2 mt-4"
        role="tablist"
        aria-label="Feature cards"
      >
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              'h-2 w-2 rounded-full transition-all',
              i === activeIndex
                ? 'bg-[#FF3CAC] scale-125'
                : 'bg-zinc-600',
            )}
            onClick={() => {
              setActiveIndex(i);
              startTimer();
            }}
          />
        ))}
      </div>
    </div>
  );
}
