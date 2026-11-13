import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import {
  Captions,
  Check,
  Download,
  FileVideo,
  Gauge,
  Loader2,
  MessageSquareText,
  Music2,
  Pause,
  Play,
  Scissors,
  Sparkles,
  UploadCloud,
  Wand2,
  ZoomIn,
  type LucideIcon,
} from 'lucide-react';
import { track } from '@/lib/analytics';
import { prefersReducedMotion } from '@/lib/motion';
import { CLIPS, DEMO_STEPS, TALKING, VLOG, type ClipId, type DemoStepId } from './product-demo-steps';
import './ProductDemo.css';

/** Custom properties for ProductDemo.css (--d delay, --t duration, --w width, --to/--from counts). */
const css = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Whether the demo is paused (off screen, pause button or reduced motion); the clips follow it. */
const PausedContext = createContext(true);

const EDIT_ICONS: LucideIcon[] = [Scissors, Wand2, Captions, ZoomIn, Music2];

/** Timeline: grow is the stretch's length; cut stretches collapse. */
const TIMELINE = [
  { grow: 0.9, cut: 600 },
  { grow: 4 },
  { grow: 1.1, cut: 900 },
  { grow: 3.4 },
  { grow: 0.8, cut: 1200 },
  { grow: 3 },
];

const scoreTone = (v: number) => (v >= 75 ? 'bg-emerald-400' : v >= 55 ? 'bg-pink-400' : 'bg-orange-400');

/* ─── Shared pieces ─────────────────────────────────────────────────────────── */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-[9/16] w-[118px] shrink-0 overflow-hidden rounded-[18px] border border-white/15 bg-zinc-900 shadow-[0_0_40px_rgba(236,72,153,0.22)] sm:w-[170px] sm:rounded-[24px] md:w-[190px]">
      {children}
    </div>
  );
}

/**
 * A client's real clip, muted; it plays only while the demo plays. Loops from the start, or with `from`
 * plays once from that second and holds the last frame.
 */
function Footage({ clip, zoom = false, from }: { clip: ClipId; zoom?: boolean; from?: number }) {
  const paused = useContext(PausedContext);
  const ref = useRef<HTMLVideoElement | null>(null);
  const { src, poster } = CLIPS[clip];

  useEffect(() => {
    const video = ref.current;
    if (!video || from === undefined) return;
    const seek = () => {
      video.currentTime = from;
    };
    if (video.readyState >= 1) seek();
    else video.addEventListener('loadedmetadata', seek, { once: true });
    return () => video.removeEventListener('loadedmetadata', seek);
  }, [from]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    if (paused) video.pause();
    else void video.play().catch(() => {});
  }, [paused]);

  return (
    <div className={`absolute inset-0 ${zoom ? 'pd-zoom' : ''}`}>
      <video ref={ref} src={src} poster={poster} muted loop={from === undefined} playsInline preload="auto" className="h-full w-full object-cover" />
    </div>
  );
}

function HookOverlay({ delay = 0 }: { delay?: number }) {
  return (
    <div className="absolute inset-x-2 top-[7%] flex justify-center">
      <span className="pd-pop rounded-md bg-white px-1.5 py-1 text-center text-[8px] leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-[11px]" style={css({ '--d': `${delay}ms` })}>
        {TALKING.hookOverlay}
      </span>
    </div>
  );
}

/** Small score ring; the number counts from `from` to `value`. */
function Ring({ value, from = 0, delay = 0, tone = '#ec4899', size = 'md' }: { value: number; from?: number; delay?: number; tone?: string; size?: 'sm' | 'md' }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const box = size === 'sm' ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-14 w-14 sm:h-20 sm:w-20';
  const text = size === 'sm' ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl';
  return (
    <div className={`relative shrink-0 ${box}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          className="pd-ring"
          style={{ strokeDashoffset: c * (1 - value / 100), ...css({ '--c': c * (1 - from / 100), '--d': `${delay}ms` }) }}
        />
      </svg>
      <span className={`pd-count absolute inset-0 flex items-center justify-center font-bold text-white tabular-nums ${text}`} style={css({ '--to': value, '--from': from, '--d': `${delay}ms` })} />
    </div>
  );
}

function SceneLayout({ phone, children }: { phone: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-full items-center gap-3 sm:gap-5">
      {phone}
      <div className="flex h-full min-w-0 flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

function Note({ tone, label, delay, children }: { tone: 'orange' | 'pink'; label: string; delay: number; children: ReactNode }) {
  const dot = tone === 'orange' ? 'bg-orange-400' : 'bg-pink-400';
  const text = tone === 'orange' ? 'text-orange-300' : 'text-pink-300';
  return (
    <div className="pd-rise rounded-xl border border-white/10 bg-white/[0.04] p-2 sm:p-3" style={css({ '--d': `${delay}ms` })}>
      <p className={`flex items-center gap-1.5 text-[10px] font-semibold sm:text-xs ${text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-zinc-200 sm:text-sm">{children}</p>
    </div>
  );
}

/* ─── Scenes ────────────────────────────────────────────────────────────────── */

function UploadScene() {
  return (
    <SceneLayout
      phone={
        <Phone>
          <div className="pd-drop absolute inset-0" style={css({ '--d': '150ms' })}>
            <Footage clip="vlog" />
          </div>
          <div className="pd-fade-out absolute inset-0 flex items-center justify-center bg-zinc-950/70" style={css({ '--d': '2200ms' })}>
            <UploadCloud className="h-6 w-6 text-pink-200 sm:h-8 sm:w-8" />
          </div>
        </Phone>
      }
    >
      <div className="rounded-2xl border border-dashed border-pink-400/40 bg-pink-500/[0.05] p-3 sm:p-4">
        <p className="flex items-center gap-2 text-[11px] font-medium text-zinc-300 sm:text-sm">
          <UploadCloud className="h-4 w-4 shrink-0 text-pink-300" />
          Drop your video here
        </p>
        <div className="pd-drop mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 p-2" style={css({ '--d': '150ms' })}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500/30 to-orange-500/30">
            <FileVideo className="h-4 w-4 text-pink-100" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-medium text-white sm:text-sm">{VLOG.file}</span>
            <span className="block text-[10px] text-zinc-400 sm:text-xs">
              {VLOG.length} · {VLOG.size}
            </span>
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="pd-meter h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400" style={css({ '--d': '700ms', '--t': '1500ms' })} />
        </div>
        <p className="mt-1.5 flex justify-between text-[10px] text-zinc-400 sm:text-xs">
          <span>Uploading</span>
          <span className="tabular-nums">
            <span className="pd-count" style={css({ '--to': 100, '--d': '700ms', '--t': '1500ms' })} />%
          </span>
        </p>
      </div>
      <p className="pd-rise mt-3 flex items-center gap-2 text-[11px] text-pink-100 sm:text-sm" style={css({ '--d': '2300ms' })}>
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        Analysing hook, pacing, audio and captions
      </p>
    </SceneLayout>
  );
}

function ScoreScene() {
  return (
    <SceneLayout
      phone={
        <Phone>
          <Footage clip="vlog" />
          <div className="pd-scan absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-transparent via-pink-400/70 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:14px_14px]" />
        </Phone>
      }
    >
      <div className="flex items-center gap-3">
        <Ring value={VLOG.score} delay={200} />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase sm:text-xs">Virality score</p>
          <p className="pd-rise text-[11px] leading-snug font-semibold text-white sm:text-sm" style={css({ '--d': '900ms' })}>
            {VLOG.verdict}
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-2 sm:mt-5 sm:space-y-3">
        {VLOG.meters.map((m, i) => (
          <li key={m.label}>
            <div className="flex justify-between text-[10px] text-zinc-300 sm:text-xs">
              <span>{m.label}</span>
              <span className="pd-count font-semibold tabular-nums" style={css({ '--to': m.value, '--d': `${400 + i * 160}ms` })} />
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className={`pd-meter h-full rounded-full ${scoreTone(m.value)}`} style={css({ '--w': `${m.value}%`, '--d': `${400 + i * 160}ms` })} />
            </div>
          </li>
        ))}
      </ul>
    </SceneLayout>
  );
}

function FeedbackScene() {
  const words = VLOG.hookRewrite.split(' ');
  return (
    <SceneLayout
      phone={
        <Phone>
          {/* The Tube shots, where the captions sit on his face. */}
          <Footage clip="vlog" from={4.6} />
          <div className="pd-pop absolute inset-x-1 top-[47%] h-[13%] rounded-md border-2 border-pink-400 shadow-[0_0_16px_rgba(236,72,153,0.6)]" style={css({ '--d': '2500ms' })} />
          <div className="pd-pop absolute top-[7%] left-2 rounded-md bg-pink-500 px-1.5 py-0.5 text-[8px] font-bold text-white sm:text-[10px]" style={css({ '--d': '2500ms' })}>
            {VLOG.captionNote.at.replace('–', ' – ')}
          </div>
        </Phone>
      }
    >
      <div className="space-y-1.5 sm:space-y-2.5">
        <Note tone="orange" label={`Hook · ${VLOG.hookNote.at}`} delay={200}>
          {VLOG.hookNote.text}
        </Note>
        <div className="pd-rise rounded-xl border border-pink-400/30 bg-gradient-to-br from-pink-500/15 to-orange-500/10 p-2 sm:p-3" style={css({ '--d': '900ms' })}>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold text-pink-200 sm:text-xs">
            <Sparkles className="h-3 w-3" />
            Try this on-screen hook
          </p>
          <p className="mt-1 text-[11px] leading-snug font-semibold text-white sm:text-sm">
            {words.map((w, i) => (
              <span key={i} className="pd-rise inline-block" style={css({ '--d': `${1300 + i * 140}ms` })}>
                {w}&nbsp;
              </span>
            ))}
          </p>
        </div>
        <Note tone="pink" label={`Caption · ${VLOG.captionNote.at}`} delay={2400}>
          {VLOG.captionNote.text}
        </Note>
      </div>
    </SceneLayout>
  );
}

function EditScene() {
  return (
    <SceneLayout
      phone={
        <Phone>
          <Footage clip="talking" zoom />
          <HookOverlay delay={300} />
          <div className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-full bg-white/30">
            <div className="pd-meter h-full bg-white" style={{ animationTimingFunction: 'linear', ...css({ '--t': '5400ms' }) }} />
          </div>
        </Phone>
      }
    >
      <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase sm:text-xs">Your AI edit</p>
      <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2.5">
        {TALKING.changes.map((label, i) => {
          const Icon = EDIT_ICONS[i];
          return (
            <li key={label} className="pd-rise flex items-center gap-2 text-[11px] text-zinc-100 sm:text-sm" style={css({ '--d': `${300 + i * 650}ms` })}>
              <span className="pd-pop flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/90 sm:h-5 sm:w-5" style={css({ '--d': `${500 + i * 650}ms` })}>
                <Check className="h-2.5 w-2.5 text-zinc-950 sm:h-3 sm:w-3" strokeWidth={3} />
              </span>
              <Icon className="hidden h-4 w-4 shrink-0 text-pink-300 sm:block" />
              <span className="truncate">{label}</span>
              {Icon === Music2 && (
                <span className="ml-1 flex h-3 shrink-0 items-end gap-0.5">
                  {[0, 1, 2, 3].map((b) => (
                    <span key={b} className="pd-eq h-full w-0.5 rounded-full bg-pink-300" style={css({ '--d': `${b * -230}ms` })} />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 sm:mt-5">
        <div className="flex h-5 gap-0.5 sm:h-7">
          {TIMELINE.map((s, i) =>
            s.cut ? (
              <span
                key={i}
                className="pd-cut rounded-sm bg-[repeating-linear-gradient(135deg,rgba(248,113,113,0.7)_0_4px,rgba(248,113,113,0.25)_4px_8px)]"
                style={{ flexGrow: s.grow, ...css({ '--d': `${s.cut}ms` }) }}
              />
            ) : (
              <span key={i} className="rounded-sm bg-gradient-to-b from-pink-400/70 to-orange-400/60" style={{ flexGrow: s.grow }} />
            )
          )}
        </div>
        <p className="pd-rise mt-1.5 text-[10px] text-zinc-400 tabular-nums sm:text-xs" style={css({ '--d': '1800ms' })}>
          {TALKING.before} → <span className="font-semibold text-white">{TALKING.after}</span>
        </p>
      </div>
    </SceneLayout>
  );
}

function ExportScene() {
  return (
    <SceneLayout
      phone={
        <Phone>
          <Footage clip="talking" zoom />
          <HookOverlay />
          <span className="absolute right-2 bottom-2 rounded bg-black/60 px-1 text-[8px] text-white tabular-nums sm:text-[10px]">{TALKING.after}</span>
        </Phone>
      }
    >
      <p className="pd-pop flex items-center gap-1.5 text-xs font-semibold text-emerald-300 sm:text-base" style={css({ '--d': '100ms' })}>
        <Check className="h-4 w-4" strokeWidth={3} />
        Edit ready
      </p>
      <div className="mt-3 flex items-center gap-2 sm:mt-4 sm:gap-4">
        <div className="text-center">
          <Ring value={TALKING.scoreBefore} from={TALKING.scoreBefore} tone="#71717a" size="sm" />
          <p className="mt-1 text-[10px] text-zinc-400 sm:text-xs">Before</p>
        </div>
        <span className="text-zinc-500" aria-hidden="true">
          →
        </span>
        <div className="text-center">
          <Ring value={TALKING.scoreAfter} from={TALKING.scoreBefore} delay={500} tone="#34d399" size="sm" />
          <p className="mt-1 text-[10px] text-emerald-300 sm:text-xs">After</p>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-zinc-400 sm:text-xs">Scored again after the edit</p>
      <span
        className="pd-press mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1.5 text-[11px] font-semibold text-white sm:mt-5 sm:px-4 sm:py-2 sm:text-sm"
        style={css({ '--d': '1900ms' })}
      >
        <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Download MP4
      </span>
      <p className="pd-rise mt-2 flex items-center gap-1.5 text-[10px] text-zinc-300 sm:text-xs" style={css({ '--d': '2300ms' })}>
        <Check className="h-3 w-3 text-emerald-300" strokeWidth={3} />
        Saved · 1080 × 1920 · ready to post
      </p>
    </SceneLayout>
  );
}

/** Icon and scene for each step; copy and timing live in product-demo-steps.ts. */
const STEP_VIEW: Record<DemoStepId, { icon: LucideIcon; Scene: () => ReactNode }> = {
  upload: { icon: UploadCloud, Scene: UploadScene },
  score: { icon: Gauge, Scene: ScoreScene },
  feedback: { icon: MessageSquareText, Scene: FeedbackScene },
  edit: { icon: Wand2, Scene: EditScene },
  export: { icon: Download, Scene: ExportScene },
};

/* ─── Demo ──────────────────────────────────────────────────────────────────── */

/**
 * Hero walk-through on real client clips: upload, score, feedback, AI edit, export.
 * Plays while on screen, can be paused, and steps can be picked by hand. Under reduced motion
 * it does not autoplay, the clips stay on their first frame and each step shows its finished state.
 */
export function ProductDemo({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((e) => setInView(e.isIntersecting)), { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const paused = reduced || !playing || !inView;
  const current = DEMO_STEPS[step];
  const { Scene } = STEP_VIEW[current.id];

  const choose = (i: number, focus = false) => {
    setStep(i);
    if (focus) tabRefs.current[i]?.focus();
    track('demo_step_clicked', { step: DEMO_STEPS[i].id });
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = DEMO_STEPS.length - 1;
    const next = { ArrowRight: step + 1, ArrowDown: step + 1, ArrowLeft: step - 1, ArrowUp: step - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    choose((next + DEMO_STEPS.length) % DEMO_STEPS.length, true);
  };

  return (
    <div ref={rootRef} role="region" aria-label="Product demo" className={`pd-root w-full ${className}`} data-paused={paused}>
      <PausedContext.Provider value={paused}>
        <div className="relative rounded-3xl p-px">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/50 via-white/10 to-orange-400/50" aria-hidden="true" />
          <div id="pd-panel" role="tabpanel" aria-labelledby={`pd-tab-${current.id}`} className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-zinc-950">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </span>
              <span className="ml-2 truncate text-xs font-medium text-zinc-300">
                <span className="text-zinc-500 tabular-nums">
                  {step + 1}/{DEMO_STEPS.length}
                </span>{' '}
                {current.title}
              </span>
              <span className="ml-auto shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-wider text-zinc-400 uppercase">Example</span>
              {!reduced && (
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? 'Pause demo' : 'Play demo'}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400"
                >
                  {playing ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              )}
            </div>
            <p className="sr-only">{current.sr}</p>
            <div className="pd-stage h-[244px] p-4 sm:h-[344px] sm:p-5 md:h-[380px]" aria-hidden="true">
              <Scene key={step} />
            </div>
          </div>
        </div>

        <div role="tablist" aria-label="Demo steps" onKeyDown={onTabKey} className="mt-3 grid grid-cols-5 gap-2">
          {DEMO_STEPS.map((s, i) => {
            const active = i === step;
            const Icon = STEP_VIEW[s.id].icon;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`pd-tab-${s.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="pd-panel"
                aria-label={s.title}
                tabIndex={active ? 0 : -1}
                onClick={() => choose(i)}
                className={`group relative flex min-h-11 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border px-1 pt-2 pb-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-400 ${
                  active ? 'border-white/15 bg-white/[0.06]' : 'border-transparent hover:bg-white/[0.03]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    active ? 'border-pink-400/50 bg-gradient-to-br from-pink-500/25 to-orange-500/20 text-pink-100 shadow-[0_0_20px_rgba(236,72,153,0.35)]' : 'border-white/10 text-zinc-500 group-hover:text-zinc-300'
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`hidden text-xs font-medium sm:block ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} aria-hidden="true">
                  {s.short}
                </span>
                <span className="absolute inset-x-3 bottom-1 h-0.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  {active && !reduced ? (
                    <span
                      key={`${step}`}
                      className="pd-bar block h-full w-full bg-gradient-to-r from-pink-500 to-orange-400"
                      style={css({ '--pd-dur': `${s.ms}ms` })}
                      onAnimationEnd={(e) => {
                        if (e.target === e.currentTarget) setStep((i + 1) % DEMO_STEPS.length);
                      }}
                    />
                  ) : (
                    <span className={`block h-full bg-gradient-to-r from-pink-500 to-orange-400 ${i < step || active ? 'w-full' : 'w-0'}`} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </PausedContext.Provider>
    </div>
  );
}
