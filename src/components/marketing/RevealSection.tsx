import { useEffect, useRef, type ReactNode } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll reveal: when the section scrolls into view, the matched items rise, sharpen from a blur and
 * fade in one after another; cards ("cards" selector) also flash a short glow as they land.
 *
 * Safe by default: the hidden starting state is only applied once JavaScript runs (`reveal-armed`), and
 * not at all under reduced motion or without IntersectionObserver, so content is never stuck invisible.
 * Animations use fill-mode `backwards`, so after they finish the elements' own hover/transform styles
 * apply again.
 */
export function RevealSection({
  children,
  items = 'h2, header, [data-reveal]',
  cards,
  stepMs = 90,
  maxSteps = 8,
}: {
  children: ReactNode;
  /** CSS selector (inside this section) for elements that rise in. */
  items?: string;
  /** CSS selector for card-like elements that rise in with a glow. */
  cards?: string;
  stepMs?: number;
  maxSteps?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const cardSet = new Set(cards ? Array.from(root.querySelectorAll<HTMLElement>(cards)) : []);
    const targets = Array.from(root.querySelectorAll<HTMLElement>([items, cards].filter(Boolean).join(', ')))
      // Skip anything nested inside another target, and anything opted out.
      .filter((el, _, all) => !all.some((other) => other !== el && other.contains(el)))
      .filter((el) => !el.closest('[data-reveal-skip]'))
      // Skip elements not rendered at this breakpoint (e.g. `hidden md:grid`), so they don't take stagger slots.
      .filter((el) => el.getClientRects().length > 0);
    if (targets.length === 0) return;

    targets.forEach((el, i) => {
      el.classList.add('reveal-item');
      if (cardSet.has(el)) el.classList.add('reveal-card');
      el.style.setProperty('--reveal-delay', `${Math.min(i, maxSteps) * stepMs}ms`);
    });
    root.classList.add('reveal-armed');

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        targets.forEach((el) => el.classList.add('is-in'));
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [items, cards, stepMs, maxSteps]);

  return <div ref={ref}>{children}</div>;
}

export default RevealSection;
