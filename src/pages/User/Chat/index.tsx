import {
    useState,
    useEffect,
    useCallback,
    useId,
    useRef,
    useMemo,
    type ReactNode,
    type ReactElement,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import {
    getUserVideos,
    markAnalysisViewed,
    getVideoById,
    getVideoFeedback,
    getVideoStatus,
    type Video,
    type FeatureEntry,
} from '@/api/video';
import type { FrameFeedback, ScriptRewrite } from '@/types/video-feedback';
import FeedbackFixCard, { ScriptRewriteCard } from '@/components/domain/FeedbackFixCard';
import SeekableVideoPlayer, { type SeekableVideoPlayerHandle } from '@/components/domain/SeekableVideoPlayer';
import { getChatMessages, sendChatMessage, type Message } from '@/api/chat';
import { useUser } from '@/redux/hooks/use-user';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { LockedProFeatureSection } from '@/components/AnalysisReport/LockedSection';
import { CHAT_WELCOME_MESSAGES, ANALYSIS_STATUS } from '@/constants';
import { ErrorNotification } from '@/utils/toast';
import {
    ArrowUp,
    BarChart3,
    ChevronDown,
    ChevronLeft,
    Loader2,
    Lock,
    MessageSquare,
    Play,
    ScrollText,
    Sparkles,
} from 'lucide-react';
import { cleanVideoTitle } from '@/lib/video-file';
import ScriptSuggestions from '@/components/domain/ScriptSuggestions';
import ActualViewsCard from '@/components/domain/ActualViews';

function normalizeChatText(text: string): string {
    // Older stored messages may contain em/en dashes; show them as plain punctuation.
    return text
        .replace(/\*\*/g, '')
        .replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2')
        .replace(/\s*[–—]\s*/g, ', ');
}

const FEATURE_NAMES_GROUP = '(Hook|Pacing|Audio|Views Predictor|Advanced Analytics|Caption)';

const FEATURE_SECTION_SPLIT = new RegExp(
    `(?=\\b${FEATURE_NAMES_GROUP}\\b\\s*[—\\-]?\\s*What's wrong:)`,
    'gi',
);

const FEATURE_HEADER_START = new RegExp(
    `^\\s*(${FEATURE_NAMES_GROUP})\\s*[—\\-]?\\s*What's wrong:\\s*`,
    'i',
);

const HAS_FEATURE_SECTION = new RegExp(
    `\\b${FEATURE_NAMES_GROUP}\\b\\s*[—\\-]?\\s*What's wrong:`,
    'i',
);

function formatSuggestionLines(suggestionsBody: string): ReactNode[] {
    const t = suggestionsBody.trim();
    if (!t) return [];
    let chunks: string[] = [];
    if (/\n\s*-\s+/.test(t)) {
        chunks = t.split(/\n\s*-\s+/).map((s) => s.trim()).filter(Boolean);
    } else if (/^\s*-\s+/.test(t)) {
        chunks = t
            .split(/\n/)
            .map((line) => line.replace(/^\s*-\s+/, '').trim())
            .filter(Boolean);
    } else if (/\.\s+- /.test(t)) {
        chunks = t.split(/\.\s+- /).map((s) => s.trim()).filter(Boolean);
    } else if (/\s+-\s+/.test(t)) {
        chunks = t.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
    } else {
        chunks = [t];
    }
    return chunks.map((body, j) => {
        const clean = body.replace(/^[-•]\s*/, '').trim();
        if (!clean) return null;
        return (
            <p key={j} style={{ paddingLeft: '12px', marginBottom: '4px' }}>
                • {clean}
            </p>
        );
    });
}

/** Presentational formatting for assistant chat bubbles only; raw message text is unchanged in state. */
function formatChatMessage(raw: string): ReactElement {
    const text = normalizeChatText(raw);
    if (!HAS_FEATURE_SECTION.test(text)) {
        const paras = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
        return (
            <div style={{ lineHeight: '1.65', fontSize: 'inherit' }}>
                {paras.length === 0 ? <p style={{ marginBottom: '10px' }}>{text}</p> : null}
                {paras.map((p, i) => (
                    <p key={i} style={{ marginBottom: '10px' }}>
                        {p}
                    </p>
                ))}
            </div>
        );
    }

    const parts = text.split(FEATURE_SECTION_SPLIT);
    return (
        <div style={{ lineHeight: '1.65', fontSize: 'inherit' }}>
            {parts.map((part, i) => {
                const trimmed = part.trim();
                if (!trimmed) return null;
                const m = trimmed.match(FEATURE_HEADER_START);
                if (!m) {
                    const paras = trimmed.split(/\n+/).map((p) => p.trim()).filter(Boolean);
                    return (
                        <div key={i}>
                            {paras.map((p, j) => (
                                <p key={j} style={{ marginBottom: '10px' }}>
                                    {p}
                                </p>
                            ))}
                        </div>
                    );
                }
                const featureName = m[1];
                const after = trimmed.slice(m[0].length);
                const sugIdx = after.indexOf('Suggestions to improve:');
                const critique = (sugIdx >= 0 ? after.slice(0, sugIdx) : after).trim();
                const sugBody = sugIdx >= 0 ? after.slice(sugIdx + 'Suggestions to improve:'.length).trim() : '';
                const bullets = formatSuggestionLines(sugBody).filter(Boolean);

                return (
                    <div key={i} style={{ marginTop: i > 0 ? '18px' : 0 }}>
                        <p
                            style={{
                                fontWeight: 600,
                                marginTop: '20px',
                                marginBottom: '6px',
                                color: 'inherit',
                            }}
                        >
                            {featureName}
                        </p>
                        {critique ? <p style={{ marginBottom: '8px' }}>{critique}</p> : null}
                        {sugBody ? (
                            <>
                                <p style={{ fontWeight: 500, marginTop: '10px', marginBottom: '6px' }}>
                                    What to do
                                </p>
                                {bullets}
                            </>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

/** Inline SVGs replace emoji in static UI only; stroke uses currentColor for layout parity. */
const svgRow = 'inline-block align-middle shrink-0 text-fg-muted';
const svgChip = 'inline-block align-middle shrink-0 text-accent';
const svgCard = 'inline-block align-middle text-fg-muted';

function SvgLightningCoach() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${svgRow} !text-on-brand`}
            aria-hidden
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

function SvgHookFish() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgRow}
            aria-hidden
        >
            <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5V12a6 6 0 0 1-6 6H6a4 4 0 0 0 4 4" />
            <circle cx={12} cy={6} r={1} fill="currentColor" />
        </svg>
    );
}

function SvgWaveformBars() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className={svgRow}
            aria-hidden
        >
            <line x1="4" y1="12" x2="4" y2="12" />
            <line x1="7" y1="8" x2="7" y2="16" />
            <line x1="10" y1="5" x2="10" y2="19" />
            <line x1="13" y1="9" x2="13" y2="15" />
            <line x1="16" y1="6" x2="16" y2="18" />
            <line x1="19" y1="10" x2="19" y2="14" />
        </svg>
    );
}

function SvgSpeaker() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgRow}
            aria-hidden
        >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    );
}

function SvgSpeechBubble() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgRow}
            aria-hidden
        >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function SvgBarChartSmall() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgRow}
            aria-hidden
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

function SvgSwipeGesture() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgRow}
            aria-hidden
        >
            <path d="M9 11V6a2 2 0 0 1 4 0v5" />
            <path d="M13 11V9a2 2 0 0 1 4 0v2" />
            <path d="M17 11v-1a2 2 0 0 1 4 0v4a7 7 0 0 1-14 0v-5a2 2 0 0 1 4 0v1" />
        </svg>
    );
}

function SvgChipWrench() {
    return (
        <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgChip}
            aria-hidden
        >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    );
}

function SvgChipScissors() {
    return (
        <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgChip}
            aria-hidden
        >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
    );
}

function SvgChipBarChart() {
    return (
        <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgChip}
            aria-hidden
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

function SvgChipMusic() {
    return (
        <svg
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgChip}
            aria-hidden
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}

function SvgEyeTarget() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgCard}
            aria-hidden
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function SvgTrendingArrow() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgCard}
            aria-hidden
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

function SvgGauge() {
    return (
        <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={svgCard}
            aria-hidden
        >
            <path d="M12 2a10 10 0 0 1 7.38 16.75" />
            <path d="M12 2a10 10 0 0 0-7.38 16.75" />
            <line x1="12" y1="12" x2="16" y2="8" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
        </svg>
    );
}

// ─── Report: one scale for every score on the page (dial, tiles, accordions, header chip) ───
type ScoreTone = 'strong' | 'okay' | 'weak' | 'none';

function scoreTone(score: number | null | undefined): ScoreTone {
    if (score == null || Number.isNaN(score)) return 'none';
    return score >= 75 ? 'strong' : score >= 50 ? 'okay' : 'weak';
}

const TONE_STYLES: Record<ScoreTone, { label: string; color: string; text: string; chip: string }> = {
    strong: {
        label: 'Strong',
        color: 'var(--app-success)',
        text: 'text-success',
        chip: 'border-success/30 bg-success/10 text-success',
    },
    okay: {
        label: 'Okay',
        color: 'var(--app-warning)',
        text: 'text-warning',
        chip: 'border-warning/30 bg-warning/10 text-warning',
    },
    weak: {
        label: 'Needs work',
        color: 'var(--app-danger)',
        text: 'text-danger',
        chip: 'border-danger/30 bg-danger/10 text-danger',
    },
    none: {
        label: 'Not analyzed',
        color: 'var(--app-text-tertiary)',
        text: 'text-fg-subtle',
        chip: 'border-line bg-white/[0.03] text-fg-subtle',
    },
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Counts up to `target` once (skipped under reduced motion). */
function useCountUp(target: number | null) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (target == null) {
            setValue(0);
            return;
        }
        if (prefersReducedMotion()) {
            setValue(target);
            return;
        }
        let current = 0;
        const timer = setInterval(() => {
            current += 2;
            if (current >= target) {
                setValue(target);
                clearInterval(timer);
            } else setValue(current);
        }, 16);
        return () => clearInterval(timer);
    }, [target]);
    return value;
}

// ─── Report: circular virality dial ───
function ScoreDial({ score, size = 112 }: { score: number | null; size?: number }) {
    const displayed = useCountUp(score);
    const tone = TONE_STYLES[scoreTone(score)];
    const stroke = 8;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = score == null ? 0 : Math.max(0, Math.min(100, displayed)) / 100;
    const gradientId = `dial-${useId().replace(/:/g, '')}`;

    return (
        <div
            className="relative shrink-0"
            style={{ width: size, height: size, ['--dial-color' as string]: tone.color }}
        >
            {/* overflow-visible: the glow is drawn outside the circle; clipping it to the SVG box cut it off on desktop. */}
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 overflow-visible" aria-hidden>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={tone.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={tone.color} stopOpacity={0.55} />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
                {/* Tick ring for the "instrument" look */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r - stroke - 3}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                    strokeDasharray="1 5"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - pct)}
                    className={score == null ? undefined : 'score-dial-arc'}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="tabular text-3xl font-semibold leading-none text-fg">
                    {score == null ? '—' : displayed}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-fg-subtle">of 100</span>
            </div>
        </div>
    );
}

/** Small score pill used in the page header. */
function ScoreChip({ score }: { score: number | null }) {
    const tone = TONE_STYLES[scoreTone(score)];
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`tabular inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${tone.chip}`}
            title="Virality score"
        >
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] opacity-80 sm:inline">Virality</span>
            {score != null ? score : '—'}
        </motion.span>
    );
}

// ─── Report: one score tile (replaces the old horizontal bar rows) ───
function ScoreTile({
    icon,
    label,
    score,
    delay = 0,
    tooltip,
    notAnalyzed = false,
    locked = false,
}: {
    icon: ReactNode;
    label: string;
    score: number;
    delay?: number;
    tooltip?: string;
    notAnalyzed?: boolean;
    locked?: boolean;
}) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        if (notAnalyzed || locked) {
            setWidth(0);
            return;
        }
        if (prefersReducedMotion()) {
            setWidth(score);
            return;
        }
        const t = setTimeout(() => setWidth(score), delay);
        return () => clearTimeout(t);
    }, [score, delay, notAnalyzed, locked]);

    const tone = TONE_STYLES[notAnalyzed || locked ? 'none' : scoreTone(score)];

    return (
        <div className="min-w-0 rounded-xl border border-line bg-white/[0.02] p-3" title={tooltip}>
            <div className="flex items-center gap-2 text-xs text-fg-muted">
                <span className="inline-flex shrink-0 items-center [&>svg]:inline-block">{icon}</span>
                <span className="truncate">{label}</span>
                {tooltip != null && (
                    <span className="ml-auto cursor-help text-fg-subtle" aria-label={tooltip}>
                        ⓘ
                    </span>
                )}
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
                {locked ? (
                    <Link
                        to="/subscription-plans"
                        className="app-focus inline-flex items-center gap-1 rounded-md text-sm font-semibold text-fg hover:text-accent"
                    >
                        <Lock className="h-3.5 w-3.5" aria-hidden />
                        Pro
                    </Link>
                ) : (
                    <span className={`tabular text-2xl font-semibold leading-none ${notAnalyzed ? 'text-fg-subtle' : 'text-fg'}`}>
                        {notAnalyzed ? '—' : score}
                    </span>
                )}
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.chip}`}>
                    {locked ? 'Locked' : tone.label}
                </span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                    className="h-full rounded-full"
                    style={{
                        width: notAnalyzed || locked ? '0%' : `${width}%`,
                        backgroundColor: tone.color,
                        transition: 'width 0.8s cubic-bezier(0.2, 0, 0, 1)',
                        boxShadow: notAnalyzed || locked ? 'none' : `0 0 8px ${tone.color}`,
                    }}
                />
            </div>
        </div>
    );
}

// ─── Report: numbered section heading with a light rule ───
function ReportSection({
    id,
    index,
    title,
    hint,
    children,
    className = 'mt-8',
}: {
    id: string;
    index: string;
    title: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section id={id} className={`scroll-mt-16 ${className}`} aria-labelledby={`${id}-title`}>
            <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] text-accent">{index}</span>
                <h3 id={`${id}-title`} className="text-sm font-semibold text-fg">
                    {title}
                </h3>
                <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            {hint && <p className="-mt-1 mb-3 text-xs text-fg-subtle">{hint}</p>}
            {children}
        </section>
    );
}

// ─── Report: shared body for each feature in "Detailed analysis" ───
function FeatureDetail({
    feedback,
    suggestions,
    problemLabel = 'What’s holding it back',
    children,
}: {
    feedback: string | null | undefined;
    suggestions: string[] | null | undefined;
    problemLabel?: string;
    children?: ReactNode;
}) {
    const tips = (suggestions ?? []).filter(Boolean);
    return (
        <div className="space-y-4 pt-4">
            <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-danger">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-danger" />
                    {problemLabel}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{feedback ?? 'No analysis yet'}</p>
            </div>
            {children}
            {tips.length > 0 && (
                <div>
                    <p className="flex items-center gap-2 text-xs font-semibold text-success">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
                        How to fix it
                    </p>
                    <ol className="mt-2 space-y-2">
                        {tips.map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm leading-relaxed text-fg">
                                <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-success/30 bg-success/10 text-[11px] font-semibold text-success">
                                    {i + 1}
                                </span>
                                <span className="min-w-0">{s}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

function SvgWarningTriangle() {
    return (
        <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            display="inline-block"
            style={{ verticalAlign: 'middle' }}
            aria-hidden
        >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

const ADVANCED_LOCKED_DESCRIPTION =
    'Unlock the full breakdown: psychological strategy, emotional triggers, retention drivers, weakest moment, and tailored suggestions, written to match what Pro analysis returns for your short.';

function AdvancedAnalyticsDetailCard({ advanced }: { advanced: FeatureEntry | null | undefined }) {
    const [expanded, setExpanded] = useState(true);
    const { plan, status } = useSubscription();

    if (status === 'loading' && plan == null) {
        return (
            <div
                className="mb-4 h-28 animate-pulse rounded-xl border border-line bg-white/[0.03]"
                role="status"
                aria-live="polite"
            />
        );
    }

    // Free/Premium: only the Pro lock surface, even if DTO or legacy props ever regressed non-null advanced.
    if (plan === 'free' || plan === 'premium') {
        return (
            <LockedProFeatureSection
                featureId="advanced_analytics"
                title="Advanced Analytics"
                description={ADVANCED_LOCKED_DESCRIPTION}
            />
        );
    }

    if (advanced == null) {
        if (plan === 'pro' || plan === 'enterprise') {
            return (
                <div className="mb-4 rounded-xl border border-line bg-white/[0.02] p-4">
                    <p className="text-sm text-fg-muted">No Advanced Analytics data for this video yet.</p>
                </div>
            );
        }
        return (
            <LockedProFeatureSection
                featureId="advanced_analytics"
                title="Advanced Analytics"
                description={ADVANCED_LOCKED_DESCRIPTION}
            />
        );
    }

    const profile = advanced.psychologicalProfile?.trim();
    const triggers = advanced.emotionalTriggers?.filter(Boolean) ?? [];
    const drivers = advanced.retentionDrivers?.filter(Boolean) ?? [];
    const weakest = advanced.weakestMoment?.trim();
    const suggestions = advanced.suggestions?.filter(Boolean) ?? [];

    const hasBody =
        (profile && profile.length > 0) ||
        triggers.length > 0 ||
        drivers.length > 0 ||
        (weakest && weakest.length > 0) ||
        suggestions.length > 0;

    return (
        <div className="app-panel mb-4 p-4">
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                aria-expanded={expanded}
                className="app-focus flex w-full items-center justify-between gap-2 rounded-lg text-left"
            >
                <span className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex shrink-0 text-fg [&>svg]:inline-block [&>svg]:align-middle">
                        <SvgBarChartSmall />
                    </span>
                    <span className="text-brand-gradient truncate text-sm font-bold uppercase tracking-wide">
                        Advanced Analytics
                    </span>
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    aria-hidden
                />
            </button>

            {expanded && hasBody ? (
                <div className="mt-4 space-y-5 border-t border-line pt-4">
                    {profile ? (
                        <div>
                            <p className="app-label mb-1.5">Psychological strategy</p>
                            <p className="text-sm text-fg-muted">{profile}</p>
                        </div>
                    ) : null}

                    {triggers.length > 0 ? (
                        <div>
                            <p className="app-label mb-2">Emotional triggers</p>
                            <div className="flex flex-wrap gap-2">
                                {triggers.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-full border border-danger/25 bg-danger/10 px-2.5 py-1 text-xs text-danger"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {drivers.length > 0 ? (
                        <div>
                            <p className="app-label mb-2">Retention drivers</p>
                            <div className="flex flex-wrap gap-2">
                                {drivers.map((d) => (
                                    <span
                                        key={d}
                                        className="rounded-full border border-accent/25 bg-accent-tint px-2.5 py-1 text-xs text-accent"
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {weakest ? (
                        <div>
                            <p className="app-label mb-2">Weakest moment</p>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/10 px-3 py-1.5 text-sm text-warning">
                                <span className="inline-flex shrink-0 [&>svg]:inline-block [&>svg]:align-middle">
                                    <SvgWarningTriangle />
                                </span>
                                <span>{weakest}</span>
                            </div>
                        </div>
                    ) : null}

                    {suggestions.length > 0 ? (
                        <div>
                            <p className="app-label mb-2">Suggestions</p>
                            <ul className="m-0 list-none p-0">
                                {suggestions.map((s, i) => (
                                    <li key={i} className="mb-2 border-l-2 border-accent/40 pl-3 text-sm text-fg-muted last:mb-0">
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

// ─── Report: accordion card for "Detailed analysis" ───
function AccordionCard({
    icon,
    title,
    score,
    children,
    defaultOpen = false,
}: {
    icon: ReactNode;
    title: string;
    score: number | null;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const panelId = useId();
    const tone = TONE_STYLES[scoreTone(score)];

    return (
        <div
            className={`mb-2 overflow-hidden rounded-xl border transition-colors duration-200 ${
                open ? 'border-white/[0.14] bg-white/[0.035]' : 'border-line bg-white/[0.02]'
            }`}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={panelId}
                className="app-focus flex w-full items-center gap-3 px-4 py-3 text-left"
            >
                <span className="inline-flex shrink-0 items-center [&>svg]:inline-block [&>svg]:align-middle">{icon}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{title}</span>
                <span className={`tabular shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone.chip}`}>
                    {score == null ? '—' : score}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-fg-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden
                />
            </button>
            {/* grid-rows 0fr -> 1fr animates to the content's real height (no max-height clipping). */}
            <div
                id={panelId}
                className={`grid transition-[grid-template-rows] duration-300 ease-app-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                inert={!open}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-line px-4 pb-4">{children}</div>
                </div>
            </div>
        </div>
    );
}

function Chat() {
    const { videoId } = useParams<{ videoId: string }>();
    const navigate = useNavigate();
    const { name } = useUser();
    const { plan: reportSubscriptionPlan } = useSubscription();
    const [video, setVideo] = useState<Video | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [chipsVisible, setChipsVisible] = useState(true);
    const [timestampFeedbackList, setTimestampFeedbackList] = useState<FrameFeedback[]>([]);
    const [scriptRewriteList, setScriptRewriteList] = useState<ScriptRewrite[]>([]);
    /** Ids cited by the most recent chat reply, highlighted in the report. */
    const [citedFeedbackIds, setCitedFeedbackIds] = useState<string[]>([]);
    const playerRef = useRef<SeekableVideoPlayerHandle>(null);
    const [analysisErrorSummary, setAnalysisErrorSummary] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'scripts'>('analytics');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevAnalysisStatusForPollRef = useRef<string | null>(null);
    /** Latest video, for the status poll to merge into without restarting on every update. */
    const latestVideoRef = useRef<Video | null>(null);
    latestVideoRef.current = video;

    // Reset state when videoId changes
    useEffect(() => {
        setMessages([]);
        setInputText('');
        setChipsVisible(true);
        setAnalysisErrorSummary(null);
        prevAnalysisStatusForPollRef.current = null;
    }, [videoId]);

    // Fetch video data
    useEffect(() => {
        const fetchVideo = async () => {
            if (!videoId) {
                navigate('/videos');
                return;
            }

            setIsLoading(true);
            try {
                const videos = await getUserVideos();
                const foundVideo = videos.find((v) => v._id === videoId);

                if (!foundVideo) {
                    navigate('/videos');
                    return;
                }

                setVideo(foundVideo);
                prevAnalysisStatusForPollRef.current = foundVideo.analysisStatus;

                if (foundVideo.analysisStatus === ANALYSIS_STATUS.FAILED) {
                    const fromList =
                        typeof foundVideo.errorSummary === 'string' && foundVideo.errorSummary.trim().length > 0
                            ? foundVideo.errorSummary.trim()
                            : '';
                    if (fromList) {
                        setAnalysisErrorSummary(fromList);
                    } else {
                        try {
                            const st = await getVideoStatus(videoId);
                            const s = st.errorSummary;
                            setAnalysisErrorSummary(
                                typeof s === 'string' && s.trim().length > 0 ? s.trim() : null
                            );
                        } catch {
                            setAnalysisErrorSummary(null);
                        }
                    }
                } else {
                    setAnalysisErrorSummary(null);
                }

                const isPendingOrProcessing =
                    foundVideo.analysisStatus === ANALYSIS_STATUS.PENDING ||
                    foundVideo.analysisStatus === ANALYSIS_STATUS.QUEUED ||
                    foundVideo.analysisStatus === ANALYSIS_STATUS.PROCESSING;

                if (!isPendingOrProcessing && foundVideo.analysisStatus === ANALYSIS_STATUS.COMPLETED) {
                    try {
                        const fullVideo = await getVideoById(videoId);
                        setVideo(fullVideo);
                        prevAnalysisStatusForPollRef.current = fullVideo.analysisStatus;
                        try {
                            const fb = await getVideoFeedback(videoId);
                            setTimestampFeedbackList(fb.feedback ?? []);
                            setScriptRewriteList(fb.scriptRewrites ?? []);
                        } catch {
                            setTimestampFeedbackList([]);
                            setScriptRewriteList([]);
                        }
                    } catch {
                        // keep list video if single fetch fails
                    }
                }

                if (isPendingOrProcessing) {
                    setIsLoading(false);
                    return;
                }

                if (foundVideo.analysisStatus === ANALYSIS_STATUS.COMPLETED && !foundVideo.isAnalysisReady) {
                    try {
                        await markAnalysisViewed(videoId);
                    } catch (error) {
                        console.error('Failed to mark analysis as viewed:', error);
                    }
                }

                setIsLoadingMessages(true);
                try {
                    const existingMessages = await getChatMessages(videoId);
                    if (existingMessages && existingMessages.length > 0) {
                        const formattedMessages: Message[] = existingMessages.map((msg, idx) => ({
                            id: msg._id || `msg-${idx}`,
                            text: msg.text,
                            isUser: msg.isUser,
                            createdAt: msg.createdAt,
                            feedbackRefs: msg.feedbackRefs,
                            fixes: msg.fixes,
                            scriptRewrites: msg.scriptRewrites,
                            coverage: msg.coverage,
                        }));
                        setMessages(formattedMessages);
                    } else {
                        const randomWelcome = CHAT_WELCOME_MESSAGES[
                            Math.floor(Math.random() * CHAT_WELCOME_MESSAGES.length)
                        ](name || 'there');
                        setMessages([
                            {
                                id: 'welcome',
                                text: randomWelcome,
                                isUser: false,
                            },
                        ]);
                    }
                } catch (error) {
                    console.error('Failed to fetch chat messages:', error);
                    const randomWelcome = CHAT_WELCOME_MESSAGES[
                        Math.floor(Math.random() * CHAT_WELCOME_MESSAGES.length)
                    ](name || 'there');
                    setMessages([
                        {
                            id: 'welcome',
                            text: randomWelcome,
                            isUser: false,
                        },
                    ]);
                } finally {
                    setIsLoadingMessages(false);
                }
            } catch (error) {
                console.error('Failed to fetch video:', error);
                navigate('/videos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideo();
    }, [videoId, navigate, name]);

    // When viewing a video that is pending/processing, poll until analysis completes
    useEffect(() => {
        if (!videoId || !video) return;
        const isPending =
            video.analysisStatus === ANALYSIS_STATUS.PENDING ||
            video.analysisStatus === ANALYSIS_STATUS.QUEUED ||
            video.analysisStatus === ANALYSIS_STATUS.PROCESSING;
        if (!isPending) return;

        const interval = setInterval(async () => {
            try {
                // Status only (light): the full video is loaded once the analysis completes, below.
                const videos = await getUserVideos({ summary: true });
                const summary = videos.find((v) => v._id === videoId);
                if (!summary) return;
                const prevStatus = prevAnalysisStatusForPollRef.current;
                const current = latestVideoRef.current;
                const found = current && current._id === summary._id ? { ...current, ...summary } : summary;
                setVideo(found);
                if (
                    found.analysisStatus === ANALYSIS_STATUS.FAILED &&
                    (prevStatus === ANALYSIS_STATUS.PENDING ||
                        prevStatus === ANALYSIS_STATUS.QUEUED ||
                        prevStatus === ANALYSIS_STATUS.PROCESSING)
                ) {
                    try {
                        const st = await getVideoStatus(videoId);
                        const s = st.errorSummary;
                        setAnalysisErrorSummary(
                            typeof s === 'string' && s.trim().length > 0 ? s.trim() : null
                        );
                    } catch {
                        setAnalysisErrorSummary(null);
                    }
                }
                prevAnalysisStatusForPollRef.current = found.analysisStatus;
                if (found.analysisStatus === ANALYSIS_STATUS.COMPLETED) {
                    setAnalysisErrorSummary(null);
                    try {
                        const fullVideo = await getVideoById(videoId);
                        setVideo(fullVideo);
                        prevAnalysisStatusForPollRef.current = fullVideo.analysisStatus;
                        try {
                            const fb = await getVideoFeedback(videoId);
                            setTimestampFeedbackList(fb.feedback ?? []);
                            setScriptRewriteList(fb.scriptRewrites ?? []);
                        } catch {
                            setTimestampFeedbackList([]);
                            setScriptRewriteList([]);
                        }
                    } catch {
                        setVideo(found);
                    }
                    if (!found.isAnalysisReady) {
                        try {
                            await markAnalysisViewed(videoId);
                        } catch (e) {
                            console.error('Failed to mark analysis as viewed:', e);
                        }
                    }
                    setIsLoadingMessages(true);
                    try {
                        const existingMessages = await getChatMessages(videoId);
                        if (existingMessages && existingMessages.length > 0) {
                            const formatted: Message[] = existingMessages.map((msg, idx) => ({
                                id: msg._id || `msg-${idx}`,
                                text: msg.text,
                                isUser: msg.isUser,
                                createdAt: msg.createdAt,
                                feedbackRefs: msg.feedbackRefs,
                                fixes: msg.fixes,
                                scriptRewrites: msg.scriptRewrites,
                                coverage: msg.coverage,
                            }));
                            setMessages(formatted);
                        } else {
                            const randomWelcome = CHAT_WELCOME_MESSAGES[
                                Math.floor(Math.random() * CHAT_WELCOME_MESSAGES.length)
                            ](name || 'there');
                            setMessages([{ id: 'welcome', text: randomWelcome, isUser: false }]);
                        }
                    } catch (e) {
                        console.error('Failed to fetch chat messages:', e);
                        const randomWelcome = CHAT_WELCOME_MESSAGES[
                            Math.floor(Math.random() * CHAT_WELCOME_MESSAGES.length)
                        ](name || 'there');
                        setMessages([{ id: 'welcome', text: randomWelcome, isUser: false }]);
                    } finally {
                        setIsLoadingMessages(false);
                    }
                }
            } catch (e) {
                console.error('Poll video status:', e);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [videoId, video?.analysisStatus, name]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(
        async (overrideText?: string) => {
            const messageText =
                overrideText !== undefined && overrideText !== ''
                    ? overrideText.trim()
                    : inputText.trim();
            if (!messageText || isSending || !videoId) return;
            if (overrideText === undefined) setInputText('');

            setIsSending(true);

            const tempUserMessage: Message = {
                id: `temp-${Date.now()}`,
                text: messageText,
                isUser: true,
            };

            setMessages((prev) => [...prev, tempUserMessage]);

            try {
                const response = await sendChatMessage(videoId, messageText);

                setMessages((prev) => {
                    const updated = prev.filter((msg) => msg.id !== tempUserMessage.id);
                    updated.push({
                        id: response.userMessage._id || `user-${Date.now()}`,
                        text: response.userMessage.text,
                        isUser: response.userMessage.isUser,
                        createdAt: response.userMessage.createdAt,
                    });
                    updated.push({
                        id: response.aiMessage._id || `ai-${Date.now()}`,
                        text: response.aiMessage.text,
                        isUser: response.aiMessage.isUser,
                        createdAt: response.aiMessage.createdAt,
                        feedbackRefs: response.aiMessage.feedbackRefs,
                        fixes: response.aiMessage.fixes,
                        scriptRewrites: response.aiMessage.scriptRewrites,
                        coverage: response.aiMessage.coverage,
                    });
                    return updated;
                });

                // Highlight the report items this reply cited.
                setCitedFeedbackIds(response.aiMessage.feedbackRefs ?? []);
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string }; status?: number } };
                console.error('Failed to send message:', error);
                const errorMessage =
                    err?.response?.data?.message || 'Failed to send message. Please try again.';
                if (err?.response?.status === 403 && errorMessage.includes('limit')) {
                    ErrorNotification(errorMessage + ' Visit Settings > Subscription to upgrade.');
                } else {
                    ErrorNotification(errorMessage);
                }
                setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
            } finally {
                setIsSending(false);
            }
        },
        [inputText, isSending, videoId]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        },
        [handleSendMessage]
    );

    const handleChipClick = useCallback(
        (chip: string) => {
            setChipsVisible(false);
            handleSendMessage(chip);
        },
        [handleSendMessage]
    );

    const formatTimestamp = useCallback((msg: Message) => {
        if (msg.createdAt) {
            try {
                const d = new Date(msg.createdAt);
                return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            } catch {
                return '';
            }
        }
        return '';
    }, []);

    // Use stored virality score from API; show placeholder when missing
    const viralityScore = video?.viralityScore ?? null;

    const retentionChartData = useMemo(() => {
        const curve = video?.retentionCurve ?? [];
        if (curve.length === 0) return [{ t: '0s', v: 0 }, { t: '—', v: 0 }];
        const bucketSeconds = 5;
        return curve.map((v, i) => ({
            t: i === 0 ? '0s' : i === curve.length - 1 ? `${curve.length * bucketSeconds}s` : '',
            v,
        }));
    }, [video?.retentionCurve]);

    const retentionAvgPct =
        video?.retentionCurve && video.retentionCurve.length > 0
            ? Math.round(
                  video.retentionCurve.reduce((a, b) => a + b, 0) / video.retentionCurve.length
              )
            : null;

    if (isLoading || !video) {
        return (
            <div className="app-root flex h-dvh items-center justify-center" role="status">
                <Loader2 className="h-8 w-8 text-fg-muted motion-safe:animate-spin" aria-hidden />
                <span className="sr-only">Loading your analysis</span>
            </div>
        );
    }

    const isAnalysisPending =
        video.analysisStatus === ANALYSIS_STATUS.PENDING ||
        video.analysisStatus === ANALYSIS_STATUS.QUEUED ||
        video.analysisStatus === ANALYSIS_STATUS.PROCESSING;
    const isAnalysisFailed = video.analysisStatus === ANALYSIS_STATUS.FAILED;

    if (isAnalysisPending) {
        return (
            <div className="app-root flex min-h-dvh flex-col items-center justify-center px-4">
                <div className="app-panel w-full max-w-md p-6 text-center">
                    <div className="relative mx-auto mb-5 h-16 w-16">
                        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                        <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-accent" aria-hidden />
                    </div>
                    <h2 className="text-xl font-semibold text-fg">Analysis in progress</h2>
                    <p className="mt-2 text-sm text-fg-muted">
                        Your video is being analyzed. This usually takes a few minutes.
                    </p>
                    <p className="mt-1 text-sm text-fg-subtle">
                        You can wait here or go back to the library and we’ll refresh automatically.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/videos')}
                        className="app-focus app-primary mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    if (isAnalysisFailed) {
        const failedDetail =
            (analysisErrorSummary && analysisErrorSummary.trim().length > 0
                ? analysisErrorSummary.trim()
                : null) ||
            (typeof video.errorSummary === 'string' && video.errorSummary.trim().length > 0
                ? video.errorSummary.trim()
                : null);
        return (
            <div className="app-root flex min-h-dvh flex-col items-center justify-center px-4">
                <div className="app-panel w-full max-w-md p-6 text-center">
                    <p className="font-semibold text-danger">Analysis failed for this video.</p>
                    {failedDetail ? (
                        <p className="mt-2 text-xs leading-snug text-danger/90">{failedDetail}</p>
                    ) : null}
                    <p className="mt-3 text-sm text-fg-muted">You can try re-analyzing from the library.</p>
                    <button
                        type="button"
                        onClick={() => navigate('/videos')}
                        className="app-focus app-primary mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    if (isLoadingMessages) {
        return (
            <div className="app-root flex h-dvh items-center justify-center" role="status">
                <Loader2 className="h-8 w-8 text-fg-muted motion-safe:animate-spin" aria-hidden />
                <span className="sr-only">Loading your chat</span>
            </div>
        );
    }

    function formatViews(n: number | null | undefined): string {
        if (n === null || n === undefined) return '—';
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
        return String(n);
    }

    function formatSecondsToMmSs(seconds: number): string {
        const s = Math.max(0, Math.floor(seconds));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
    }

    /**
     * Jump the report player to a feedback item's timestamp. On mobile the report
     * lives behind the analytics tab, so switch to it first — otherwise the player
     * is off-screen and the seek is invisible.
     */
    const handleSeek = (seconds: number) => {
        setActiveTab('analytics');
        playerRef.current?.seekTo(seconds);
    };

    const canSeek = Boolean(video.streamUrl);

    const dto = video.analysis;
    const pv = dto?.predictedViews;
    const predsAllNull = pv?.low == null && pv?.expected == null && pv?.high == null;
    const hookSwipe = dto?.hookSwipeRate;
    const hookSwipeNotAnalyzed = hookSwipe == null || hookSwipe <= 0;
    const showFrameFeedbackSection =
        Array.isArray(video.selectedFeatures) &&
        video.selectedFeatures.some((f) => f === 'hook' || f === 'pacing' || f === 'audio');

    // "At a glance": the overall verdict plus the strongest and weakest analyzed areas.
    const areaScores = (
        [
            { label: 'Hook', score: dto?.scores?.hook },
            { label: 'Pacing', score: dto?.scores?.pacing },
            { label: 'Audio', score: dto?.scores?.audio },
            { label: 'Captions', score: dto?.scores?.caption },
        ] as { label: string; score: number | null | undefined }[]
    ).filter((a): a is { label: string; score: number } => typeof a.score === 'number' && !Number.isNaN(a.score));
    const weakestArea = areaScores.length > 0 ? areaScores.reduce((a, b) => (b.score < a.score ? b : a)) : null;
    const strongestArea = areaScores.length > 1 ? areaScores.reduce((a, b) => (b.score > a.score ? b : a)) : null;
    const overallTone = scoreTone(viralityScore);
    const verdictTitle =
        overallTone === 'strong'
            ? 'Ready to post'
            : overallTone === 'okay'
                ? 'Close. Fix a few things first'
                : overallTone === 'weak'
                    ? 'Fix this before you post'
                    : 'Score not available yet';
    const verdictBody = weakestArea
        ? `Start with your ${weakestArea.label.toLowerCase()} (${weakestArea.score}). It is holding this video back the most.`
        : 'Open the details below to see what to fix.';

    const jumpTargets: { id: string; label: string }[] = [
        { id: 'report-overview', label: 'Overview' },
        { id: 'report-scores', label: 'Scores' },
        { id: 'report-predictions', label: 'Predictions' },
        ...(video.streamUrl ? [{ id: 'report-video', label: 'Video' }] : []),
        ...(showFrameFeedbackSection ? [{ id: 'report-moments', label: 'Moments' }] : []),
        ...(scriptRewriteList.length > 0 ? [{ id: 'report-rewrites', label: 'Rewrites' }] : []),
        { id: 'report-details', label: 'Details' },
    ];
    const sectionNumber = (id: string) => String(jumpTargets.findIndex((t) => t.id === id) + 1).padStart(2, '0');
    const jumpTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    };

    const showScripts = activeTab === 'scripts';
    const PLATFORM_NAMES: Record<string, string> = { tiktok: 'TikTok', instagram: 'Instagram', youtube: 'YouTube', facebook: 'Facebook', other: 'your platform' };
    const predictionBasis = (() => {
        const followers = pv?.followers != null ? pv.followers.toLocaleString() : null;
        const where = pv?.platform ? ` on ${PLATFORM_NAMES[pv.platform] ?? pv.platform}` : '';
        if (pv?.method === 'dataset' && followers) {
            return `Based on ${pv.comparables ?? 0} similar videos with real results, scaled to your ${followers} followers${where}.`;
        }
        if (pv?.method === 'followers' && followers) {
            return `Estimate for ${followers} followers${where}. It gets more accurate as creators report real results.`;
        }
        return 'Estimate for a typical account. Add your follower count on your next upload for a range that fits you.';
    })();
    const userInitial = (name || 'You').trim().charAt(0).toUpperCase() || 'U';
    const hasUserMessage = messages.some((m) => m.isUser);

    return (
        <div className="app-root flex h-dvh flex-col overflow-hidden">
            {/* ─── Header: back, title, score, and (mobile) the Analytics / Chat switch ─── */}
            <header className="app-chrome app-edge-bottom relative z-20 flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="flex h-14 items-center gap-3 px-3 md:px-5">
                    <Link
                        to="/videos"
                        aria-label="Back to Library"
                        className="app-focus inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-line bg-white/[0.03] pl-2 pr-2.5 text-sm text-fg-muted transition-colors hover:border-white/20 hover:text-fg"
                    >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                        <span className="hidden sm:inline">Library</span>
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="app-label hidden sm:block">Analysis report</p>
                        <p className="truncate text-sm font-medium text-fg" title={video.filename}>
                            {cleanVideoTitle(video.filename)}
                        </p>
                    </div>
                    <ScoreChip score={viralityScore} />
                </div>

                <div className="px-3 pb-2 md:hidden">
                    <div role="tablist" aria-label="Video view" className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-white/[0.02] p-1">
                        {(['analytics', 'chat', 'scripts'] as const).map((tab) => {
                            const isActive = activeTab === tab;
                            const TabIcon = tab === 'analytics' ? BarChart3 : tab === 'chat' ? MessageSquare : ScrollText;
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveTab(tab)}
                                    className={`app-focus flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ${
                                        isActive
                                            ? 'bg-surface-raised text-fg shadow-[0_0_0_1px_rgba(232,103,53,0.35),0_0_16px_rgba(232,103,53,0.15)]'
                                            : 'text-fg-muted'
                                    }`}
                                >
                                    <TabIcon className={`h-4 w-4 ${isActive ? 'text-accent' : ''}`} aria-hidden />
                                    {tab === 'analytics' ? 'Analytics' : tab === 'chat' ? 'Chat' : 'Scripts'}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ─── Two panels: Chat (left) | Analysis (right). Mobile: one at a time via the switch above ─── */}
            <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
                {/* ─── Chat ─── */}
                <div
                    className={`${activeTab === 'chat' ? 'flex' : 'hidden'} min-h-0 w-full flex-1 flex-col md:flex md:w-[42%] md:max-w-[560px] md:flex-none md:flex-shrink-0 md:border-r md:border-line`}
                >
                    <div className="flex flex-shrink-0 items-center gap-3 border-b border-line px-4 py-3">
                        <span
                            aria-hidden
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-on-brand shadow-[0_0_20px_rgba(232,103,53,0.35)]"
                        >
                            <SvgLightningCoach />
                            <span className="app-glow-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-canvas bg-success" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-sm font-semibold text-fg">Personalized Video Coach</h2>
                            <p className="text-xs text-fg-muted">Ask anything about your video</p>
                        </div>
                    </div>

                    {/* Message history */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
                        {messages.map((message) => {
                            const messageId =
                                message.id ?? (message as { _id?: string })._id ?? `msg-${Date.now()}`;
                            const timestamp = formatTimestamp(message);

                            if (message.isUser) {
                                return (
                                    <div key={messageId} className="mb-4 flex flex-row-reverse items-end gap-2.5">
                                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-line bg-surface-raised text-[11px] font-semibold text-fg-muted">
                                            {userInitial}
                                        </div>
                                        <div className="max-w-[82%] break-words rounded-2xl rounded-br-md border border-accent/30 bg-accent-tint px-4 py-2.5 text-sm leading-relaxed text-fg">
                                            {message.text}
                                            {timestamp && <div className="mt-1 text-right text-[10px] text-fg-subtle">{timestamp}</div>}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={messageId} className="mb-4 flex items-start gap-2.5">
                                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-bold text-on-brand">
                                        V
                                    </div>
                                    <div className="min-w-0 max-w-[88%] break-words rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-fg shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
                                        {formatChatMessage(message.text)}

                                        {/* Fixes render as structured diffs, never as prose inside the reply. */}
                                        {(message.fixes ?? []).map((fix) => (
                                            <FeedbackFixCard
                                                key={fix.id}
                                                item={fix}
                                                onSeek={canSeek ? handleSeek : undefined}
                                            />
                                        ))}
                                        {(message.scriptRewrites ?? []).map((rewrite) => (
                                            <ScriptRewriteCard
                                                key={rewrite.lineId}
                                                rewrite={rewrite}
                                                onSeek={canSeek ? handleSeek : undefined}
                                            />
                                        ))}

                                        {/* Deep-link into the report for items the reply cited. */}
                                        {(message.feedbackRefs ?? []).length > 0 && (
                                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                <span className="app-label mr-1">Jump to</span>
                                                {(message.feedbackRefs ?? []).map((ref) => {
                                                    const cited = timestampFeedbackList.find((item) => item.id === ref);
                                                    const citedRewrite = scriptRewriteList.find((item) => item.lineId === ref);
                                                    const seconds = cited?.tStart ?? citedRewrite?.timestamp;
                                                    if (seconds == null) return null;
                                                    return (
                                                        <button
                                                            key={ref}
                                                            type="button"
                                                            onClick={() => {
                                                                setCitedFeedbackIds([ref]);
                                                                if (canSeek) handleSeek(seconds);
                                                            }}
                                                            className="app-focus inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-fg-muted transition-colors hover:border-accent/40 hover:text-fg"
                                                            title="Show this item in the report"
                                                        >
                                                            <Play className="h-2.5 w-2.5" aria-hidden />
                                                            {formatSecondsToMmSs(seconds)}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {timestamp && <div className="mt-1.5 text-[10px] text-fg-subtle">{timestamp}</div>}
                                    </div>
                                </div>
                            );
                        })}

                        {isSending && (
                            <div className="mb-4 flex items-start gap-2.5" role="status">
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-bold text-on-brand">
                                    V
                                </div>
                                <div className="rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3.5">
                                    <span className="sr-only">Coach is typing</span>
                                    <div className="flex items-center gap-1.5" aria-hidden>
                                        {[0, 150, 300].map((d) => (
                                            <span
                                                key={d}
                                                className="chat-typing-dot h-1.5 w-1.5 rounded-full bg-accent"
                                                style={{ animationDelay: `${d}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestion chips (only when user hasn't sent a message yet) */}
                    {chipsVisible && !hasUserMessage && (
                        <div className="flex-shrink-0 px-4 pb-2">
                            <p className="app-label mb-2">Try asking</p>
                            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
                                {(
                                    [
                                        { key: 'chip-hook', prompt: 'Fix my hook', label: 'Fix my hook', Icon: SvgChipWrench },
                                        { key: 'chip-cut', prompt: 'What to cut?', label: 'What to cut?', Icon: SvgChipScissors },
                                        {
                                            key: 'chip-platform',
                                            prompt: 'TikTok vs Reels?',
                                            label: 'TikTok vs Reels?',
                                            Icon: SvgChipBarChart,
                                        },
                                        { key: 'chip-pacing', prompt: 'My pacing?', label: 'My pacing?', Icon: SvgChipMusic },
                                    ] as const
                                ).map(({ key, prompt, label, Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className="app-focus inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-3 text-xs font-medium text-fg-muted transition-colors hover:border-accent/40 hover:bg-accent-tint hover:text-fg"
                                        onClick={() => handleChipClick(prompt)}
                                    >
                                        <Icon />
                                        <span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input bar */}
                    <div
                        className="app-chrome flex-shrink-0 border-t border-line px-3 pt-3 md:px-4"
                        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
                    >
                        <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 pl-4 transition-[border-color,box-shadow] duration-200 focus-within:border-accent/50 focus-within:shadow-[0_0_0_3px_rgba(232,103,53,0.12)]">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything to improve your video..."
                                aria-label="Message the video coach"
                                // 16px on mobile so iOS does not zoom the page when the field gets focus.
                                className="min-w-0 flex-1 bg-transparent py-2 text-base text-fg placeholder:text-fg-subtle focus:outline-none md:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isSending}
                                className="app-focus flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-on-brand transition-[opacity,box-shadow] hover:shadow-[0_0_20px_rgba(232,103,53,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Send message"
                            >
                                {isSending ? (
                                    <Loader2 className="h-[18px] w-[18px] motion-safe:animate-spin" aria-hidden />
                                ) : (
                                    <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Analytics report ─── */}
                <div
                    className={`${activeTab !== 'chat' ? 'block' : 'hidden'} min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain md:block`}
                >
                    {/* Jump bar: every report section one tap away. Opaque so headings never show through it. */}
                    <nav
                        aria-label="Report sections"
                        className={`sticky top-0 z-10 border-b border-line bg-canvas ${showScripts ? 'hidden md:block' : ''}`}
                    >
                        <div className="mx-auto flex max-w-3xl items-center gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] md:px-6">
                            {/* Desktop: the chat is always visible, so the right panel switches between report and scripts. */}
                            <div role="tablist" aria-label="Right panel" className="mr-1 hidden shrink-0 rounded-full border border-line bg-white/[0.02] p-0.5 md:flex">
                                {(['analytics', 'scripts'] as const).map((tab) => {
                                    const isActive = tab === 'scripts' ? showScripts : !showScripts;
                                    const TabIcon = tab === 'scripts' ? ScrollText : BarChart3;
                                    return (
                                        <button
                                            key={tab}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive}
                                            onClick={() => setActiveTab(tab)}
                                            className={`app-focus inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
                                                isActive ? 'bg-surface-raised text-fg shadow-[0_0_0_1px_rgba(232,103,53,0.35)]' : 'text-fg-muted hover:text-fg'
                                            }`}
                                        >
                                            <TabIcon className={`h-3.5 w-3.5 ${isActive ? 'text-accent' : ''}`} aria-hidden />
                                            {tab === 'scripts' ? 'Scripts' : 'Report'}
                                        </button>
                                    );
                                })}
                            </div>
                            {!showScripts && jumpTargets.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => jumpTo(t.id)}
                                    className="app-focus inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-3 text-xs font-medium text-fg-muted transition-colors hover:border-accent/40 hover:text-fg"
                                >
                                    <span className="font-mono text-[10px] text-accent">{sectionNumber(t.id)}</span>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {showScripts ? (
                        <div
                            className="mx-auto max-w-3xl px-4 pt-5 md:px-6 md:pt-6"
                            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
                        >
                            <ScriptSuggestions videoId={video._id} onSeek={canSeek ? handleSeek : undefined} />
                        </div>
                    ) : (
                    <div
                        className="mx-auto max-w-3xl px-4 pt-5 md:px-6 md:pt-6"
                        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
                    >
                        {/* 01 Overview: one verdict, the score, and where to start */}
                        <ReportSection id="report-overview" index={sectionNumber('report-overview')} title="At a glance" className="">
                            <div className="app-panel p-5">
                                <div className="relative flex items-center gap-5">
                                    <ScoreDial score={viralityScore} />
                                    <div className="min-w-0">
                                        <p className="app-label">Virality score</p>
                                        <p className={`mt-1 text-lg font-semibold leading-snug md:text-xl ${TONE_STYLES[overallTone].text}`}>
                                            {verdictTitle}
                                        </p>
                                        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{verdictBody}</p>
                                    </div>
                                </div>
                                <dl className="relative mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
                                    <div className="min-w-0">
                                        <dt className="app-label">Expected views</dt>
                                        <dd className="tabular mt-1 truncate text-base font-semibold text-fg">
                                            {predsAllNull ? '—' : formatViews(pv?.expected ?? null)}
                                        </dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="app-label">Fix first</dt>
                                        <dd className="mt-1 truncate text-base font-semibold text-danger">
                                            {weakestArea ? weakestArea.label : '—'}
                                        </dd>
                                    </div>
                                    <div className="min-w-0">
                                        <dt className="app-label">{strongestArea && strongestArea.score < 50 ? 'Least weak' : 'Best part'}</dt>
                                        <dd className="mt-1 truncate text-base font-semibold text-success">
                                            {strongestArea ? strongestArea.label : '—'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </ReportSection>

                        {/* 02 Scores */}
                        <ReportSection
                            id="report-scores"
                            index={sectionNumber('report-scores')}
                            title="Score breakdown"
                            hint="75 and up is strong, 50 to 74 is okay, under 50 needs work."
                        >
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                <ScoreTile
                                    icon={<SvgHookFish />}
                                    label="Hook"
                                    score={dto?.scores?.hook ?? 0}
                                    delay={100}
                                    notAnalyzed={dto?.scores?.hook == null}
                                />
                                <ScoreTile
                                    icon={<SvgWaveformBars />}
                                    label="Pacing & Rhythm"
                                    score={dto?.scores?.pacing ?? 0}
                                    delay={200}
                                    notAnalyzed={dto?.scores?.pacing == null}
                                />
                                <ScoreTile
                                    icon={<SvgSpeaker />}
                                    label="Audio"
                                    score={dto?.scores?.audio ?? 0}
                                    delay={300}
                                    notAnalyzed={dto?.scores?.audio == null}
                                />
                                <ScoreTile
                                    icon={<SvgSpeechBubble />}
                                    label="Caption Clarity"
                                    score={dto?.scores?.caption ?? 0}
                                    delay={400}
                                    notAnalyzed={dto?.scores?.caption == null}
                                />
                                <ScoreTile
                                    icon={<SvgSwipeGesture />}
                                    label="Hook Swipe Rate"
                                    score={hookSwipeNotAnalyzed ? 0 : (hookSwipe ?? 0)}
                                    delay={500}
                                    notAnalyzed={hookSwipeNotAnalyzed}
                                    tooltip="Lower swipe rate = more viewers stayed past your hook. Higher is better here."
                                />
                                <ScoreTile
                                    icon={<SvgBarChartSmall />}
                                    label="Advanced"
                                    score={dto?.scores?.advanced ?? 0}
                                    delay={600}
                                    tooltip="Advanced Analytics: emotional triggers, retention drivers and your weakest moment"
                                    notAnalyzed={dto?.scores?.advanced == null && reportSubscriptionPlan !== 'free' && reportSubscriptionPlan !== 'premium'}
                                    locked={reportSubscriptionPlan === 'free' || reportSubscriptionPlan === 'premium'}
                                />
                            </div>

                            <div className="mt-4">
                                <AdvancedAnalyticsDetailCard advanced={dto?.features?.advanced} />
                            </div>
                        </ReportSection>

                        {/* 03 Predicted performance */}
                        <ReportSection
                            id="report-predictions"
                            index={sectionNumber('report-predictions')}
                            title="Predicted performance"
                            hint={predictionBasis}
                        >
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <div className="min-w-0 rounded-xl border border-line bg-white/[0.02] p-4">
                                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                                        <span className="inline-flex text-[#38bdf8] [&>svg]:inline-block">
                                            <SvgEyeTarget />
                                        </span>
                                        Predicted views (range)
                                    </div>
                                    <p className="tabular mt-2 text-xl font-semibold text-fg">
                                        {predsAllNull ? (
                                            <span className="text-sm font-normal text-fg-muted">
                                                Run Views analysis to get a prediction
                                            </span>
                                        ) : (
                                            <>
                                                {formatViews(pv?.low ?? null)} – {formatViews(pv?.high ?? null)}
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="min-w-0 rounded-xl border border-line bg-white/[0.02] p-4">
                                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                                        <span className="inline-flex text-success [&>svg]:inline-block">
                                            <SvgTrendingArrow />
                                        </span>
                                        Expected views
                                    </div>
                                    <p className="tabular mt-2 text-xl font-semibold text-success">
                                        {predsAllNull ? '—' : formatViews(pv?.expected ?? null)}
                                    </p>
                                    <p className="mt-2 text-xs text-fg-muted">
                                        Avg retention{' '}
                                        <span className="tabular font-semibold text-fg">
                                            {retentionAvgPct != null ? `${retentionAvgPct}%` : '—'}
                                        </span>
                                    </p>
                                    <ResponsiveContainer width="100%" height={44}>
                                        <LineChart data={retentionChartData}>
                                            <Line
                                                type="monotone"
                                                dataKey="v"
                                                stroke="#3dd68c"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    background: '#181c25',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: 8,
                                                    fontSize: 11,
                                                }}
                                                formatter={(v: number | undefined) => [v != null ? `${v}%` : '', 'Retention']}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="min-w-0 rounded-xl border border-line bg-white/[0.02] p-4">
                                    <div className="flex items-center gap-2 text-xs text-fg-muted">
                                        <span className="inline-flex text-accent [&>svg]:inline-block">
                                            <SvgGauge />
                                        </span>
                                        Views predictor score
                                    </div>
                                    <p className="tabular mt-2 text-xl font-semibold text-accent">
                                        {dto?.scores?.viewsPredictor != null ? dto.scores.viewsPredictor : '—'}
                                    </p>
                                    <p className="mt-1 text-xs text-fg-subtle">
                                        {dto?.features?.viewsPredictor?.rating
                                            ? `Tier: ${dto.features.viewsPredictor.rating}`
                                            : 'Run Views predictor in upload options'}
                                    </p>
                                </div>
                            </div>
                            <ActualViewsCard videoId={video._id} initialViews={dto?.actualViews ?? null} />
                        </ReportSection>

                        {video.streamUrl ? (
                            <ReportSection
                                id="report-video"
                                index={sectionNumber('report-video')}
                                title="Your video"
                                hint="Tap any timestamp in the report or chat to jump to that moment."
                            >
                                <div className="overflow-hidden rounded-xl border border-line">
                                    <SeekableVideoPlayer
                                        ref={playerRef}
                                        streamUrl={video.streamUrl}
                                        poster={video.thumbnailUrl}
                                    />
                                </div>
                            </ReportSection>
                        ) : null}

                        {showFrameFeedbackSection && (
                            <ReportSection
                                id="report-moments"
                                index={sectionNumber('report-moments')}
                                title="Moment-by-moment fixes"
                            >
                                {timestampFeedbackList.length === 0 ? (
                                    <p className="rounded-xl border border-line bg-white/[0.02] p-4 text-sm text-fg-muted">
                                        No frame-level feedback available for this video.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {timestampFeedbackList.map((item) => (
                                            <FeedbackFixCard
                                                key={item.id}
                                                item={item}
                                                onSeek={canSeek ? handleSeek : undefined}
                                                isHighlighted={citedFeedbackIds.includes(item.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </ReportSection>
                        )}

                        {scriptRewriteList.length > 0 && (
                            <ReportSection id="report-rewrites" index={sectionNumber('report-rewrites')} title="Script rewrites">
                                <div className="space-y-3">
                                    {scriptRewriteList.map((rewrite) => (
                                        <ScriptRewriteCard
                                            key={rewrite.lineId}
                                            rewrite={rewrite}
                                            onSeek={canSeek ? handleSeek : undefined}
                                        />
                                    ))}
                                </div>
                            </ReportSection>
                        )}

                        {/* Detailed analysis */}
                        <ReportSection
                            id="report-details"
                            index={sectionNumber('report-details')}
                            title="Detailed analysis"
                            hint="What is holding each part back, and how to fix it."
                        >
                            <AccordionCard icon={<SvgHookFish />} title="Hook" score={dto?.scores?.hook ?? null} defaultOpen={true}>
                                <FeatureDetail feedback={dto?.features?.hook?.feedback} suggestions={dto?.features?.hook?.suggestions} />
                            </AccordionCard>

                            <AccordionCard icon={<SvgWaveformBars />} title="Pacing & Rhythm" score={dto?.scores?.pacing ?? null}>
                                <FeatureDetail feedback={dto?.features?.pacing?.feedback} suggestions={dto?.features?.pacing?.suggestions} />
                            </AccordionCard>

                            <AccordionCard icon={<SvgSpeaker />} title="Audio" score={dto?.scores?.audio ?? null}>
                                <FeatureDetail feedback={dto?.features?.audio?.feedback} suggestions={dto?.features?.audio?.suggestions} />
                            </AccordionCard>

                            <AccordionCard icon={<SvgSpeechBubble />} title="Caption Clarity" score={dto?.scores?.caption ?? null}>
                                <FeatureDetail feedback={dto?.features?.caption?.feedback} suggestions={dto?.features?.caption?.suggestions} />
                            </AccordionCard>

                            <AccordionCard icon={<SvgGauge />} title="Views predictor" score={dto?.scores?.viewsPredictor ?? null}>
                                <FeatureDetail
                                    problemLabel="Summary"
                                    feedback={dto?.features?.viewsPredictor?.feedback}
                                    suggestions={dto?.features?.viewsPredictor?.suggestions}
                                />
                            </AccordionCard>

                            {dto?.features?.advanced &&
                                (reportSubscriptionPlan === 'pro' || reportSubscriptionPlan === 'enterprise') && (
                                <AccordionCard
                                    icon={<SvgBarChartSmall />}
                                    title="Advanced Analytics"
                                    score={dto.features.advanced.score ?? null}
                                >
                                    <FeatureDetail
                                        problemLabel="Summary"
                                        feedback={dto.features.advanced.feedback}
                                        suggestions={dto.features.advanced.suggestions}
                                    >
                                        {dto.features.advanced.rating != null ? (
                                            <p className="text-xs text-fg-muted">Rating: {dto.features.advanced.rating}</p>
                                        ) : null}
                                    </FeatureDetail>
                                </AccordionCard>
                            )}
                        </ReportSection>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;
