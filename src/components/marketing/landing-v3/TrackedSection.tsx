import { useEffect, useRef, type ReactNode } from 'react';
import { track } from '@/lib/analytics';

interface TrackedSectionProps {
  /** Stable analytics id, e.g. "free_stack". */
  section: string;
  id?: string;
  children: ReactNode;
}

/** Fires `section_viewed` once when at least half of the section is visible. */
export function TrackedSection({ section, id, children }: TrackedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        track('section_viewed', { section });
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [section]);

  return (
    <div ref={ref} id={id} data-section={section}>
      {children}
    </div>
  );
}
