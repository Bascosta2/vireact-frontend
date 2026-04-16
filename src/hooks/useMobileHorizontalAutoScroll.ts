import { useEffect, useRef } from 'react';

/**
 * Auto-increments scrollLeft by 1px every 20ms; pauses while `isPaused` is true.
 * Effect uses [] so the interval is not stacked on re-renders.
 */
export function useMobileHorizontalAutoScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      if (isPaused.current) return;
      if (el.scrollWidth <= el.clientWidth) return;
      el.scrollLeft += 1;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      }
    }, 20);
    return () => window.clearInterval(id);
  }, []);

  const touchHandlers = {
    onTouchStart: () => {
      isPaused.current = true;
    },
    onTouchEnd: () => {
      isPaused.current = false;
    },
    onTouchCancel: () => {
      isPaused.current = false;
    },
  } as const;

  return { scrollRef, touchHandlers };
}
