import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/motion';
import { avatarThumb, resultSlides, type Win } from './hero-data';
import { GrowthCard } from './GrowthCard';

const ROTATE_MS = 3500;
/** After a swipe, tap or key press the carousel waits this long before rotating again. */
const INTERACTION_HOLD_MS = 6000;
const GAP_PX = 12;

const stepWidth = (track: HTMLDivElement) => {
  const first = track.firstElementChild as HTMLElement | null;
  return first ? first.offsetWidth + GAP_PX : track.clientWidth;
};

const CreatorResultCard = ({ win }: { win: Win }) => (
  <figure className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur">
    <div className="flex items-center gap-3">
      <img
        src={avatarThumb(win.avatarSrc)}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        decoding="async"
        className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{win.name}</p>
        <p className="truncate text-xs text-zinc-400">{win.platform}</p>
      </div>
    </div>
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <p className="bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-2xl font-extrabold tabular-nums text-transparent">
        {win.stat}
      </p>
      <p className="text-xs text-zinc-400">{win.niche}</p>
    </div>
    <blockquote className="line-clamp-2 text-sm leading-snug text-zinc-300">&ldquo;{win.quote}&rdquo;</blockquote>
  </figure>
);

/** Auto-rotating creator results under the hero proof row. Swipeable; pauses on hover, focus, touch and the pause button. */
export function HeroResultsCarousel({ className = '' }: { className?: string }) {
  const slides = resultSlides();
  const regionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hovering = useRef(false);
  const holdUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    const target = track?.children[index] as HTMLElement | undefined;
    if (!track || !target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setActive(Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / stepWidth(track)))));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [slides.length]);

  useEffect(() => {
    const node = regionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || !inView || slides.length < 2) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track || document.hidden || hovering.current || Date.now() < holdUntil.current) return;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      goTo(atEnd ? 0 : Math.round(track.scrollLeft / stepWidth(track)) + 1);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, inView, slides.length, goTo]);

  const hold = () => {
    holdUntil.current = Date.now() + INTERACTION_HOLD_MS;
  };

  if (slides.length === 0) return null;

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Creator results"
      className={`w-full ${className}`}
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
      onFocusCapture={() => {
        hovering.current = true;
      }}
      onBlurCapture={() => {
        hovering.current = false;
      }}
      onTouchStart={hold}
      onWheel={hold}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Real creators. Real results.</p>
        {!reducedMotion && slides.length > 1 && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play creator results' : 'Pause creator results'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"
          >
            {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        )}
      </div>
      <div
        ref={trackRef}
        tabIndex={0}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-2xl [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-6px)] lg:w-[calc((100%-24px)/3)]"
          >
            {slide.kind === 'growth' ? <GrowthCard item={slide.item} /> : <CreatorResultCard win={slide.win} />}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="mt-2 flex justify-center gap-1 sm:hidden">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => {
                hold();
                goTo(i);
              }}
              aria-label={`Go to result ${i + 1}`}
              aria-current={i === active}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span className={`block h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-pink-400' : 'w-1.5 bg-white/30'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
