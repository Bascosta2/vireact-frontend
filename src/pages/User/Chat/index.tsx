import {
    useState,
    useEffect,
    useCallback,
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
import type { VideoFeedback } from '@/types/video-feedback';
import { getChatMessages, sendChatMessage, type Message } from '@/api/chat';
import { useUser } from '@/redux/hooks/use-user';
import { CHAT_WELCOME_MESSAGES, ANALYSIS_STATUS } from '@/constants';
import { ErrorNotification } from '@/utils/toast';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

function normalizeChatText(text: string): string {
    return text.replace(/\*\*/g, '').replace(/—/g, ', ');
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
                            {featureName} — What&apos;s wrong:
                        </p>
                        {critique ? <p style={{ marginBottom: '8px' }}>{critique}</p> : null}
                        {sugBody ? (
                            <>
                                <p style={{ fontWeight: 500, marginTop: '10px', marginBottom: '6px' }}>
                                    Suggestions to improve:
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
const svgRow = 'inline-block align-middle shrink-0 text-zinc-300';
const svgChip = 'inline-block align-middle shrink-0 text-[#FF8C00]';
const svgCard = 'inline-block align-middle text-zinc-300';

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
            className={`${svgRow} text-white`}
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

// ─── Right panel: Virality ring (conic gradient) ───
function ViralityRing({ score }: { score: number | null }) {
    const [displayed, setDisplayed] = useState(0);
    useEffect(() => {
        if (score == null) {
            setDisplayed(0);
            return;
        }
        let start = 0;
        const timer = setInterval(() => {
            start += 2;
            if (start >= score) {
                setDisplayed(score);
                clearInterval(timer);
            } else setDisplayed(start);
        }, 16);
        return () => clearInterval(timer);
    }, [score]);

    if (score == null) {
        return (
            <div className="flex flex-col items-center my-6">
                <div
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 92,
                            height: 92,
                            borderRadius: '50%',
                            background: '#0a0a0f',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#71717a' }}>—</span>
                        <span style={{ fontSize: 10, color: '#71717a' }}>Overall</span>
                    </div>
                </div>
            </div>
        );
    }

    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f97316' : '#ef4444';
    const pct = (displayed / 100) * 360;

    return (
        <div className="flex flex-col items-center my-6">
            <div
                style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(${color} ${pct}deg, rgba(255,255,255,0.08) ${pct}deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 30px ${color}40`,
                }}
            >
                <div
                    style={{
                        width: 92,
                        height: 92,
                        borderRadius: '50%',
                        background: '#0a0a0f',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{displayed}</span>
                    <span style={{ fontSize: 10, color: '#71717a' }}>Overall</span>
                </div>
            </div>
        </div>
    );
}

// ─── Right panel: Sub-score bar ───
function ScoreBar({
    icon,
    label,
    score,
    delay = 0,
    tooltip,
    notAnalyzed = false,
}: {
    icon: ReactNode;
    label: string;
    score: number;
    delay?: number;
    tooltip?: string;
    notAnalyzed?: boolean;
}) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        if (notAnalyzed) {
            setWidth(0);
            return;
        }
        const t = setTimeout(() => setWidth(score), delay);
        return () => clearTimeout(t);
    }, [score, delay, notAnalyzed]);

    const color = notAnalyzed ? '#52525b' : score > 75 ? '#22c55e' : score > 50 ? '#f97316' : '#ef4444';

    return (
        <div className="flex items-center gap-3 mb-3">
            <span className="text-base w-5 inline-flex items-center justify-center shrink-0 [&>svg]:inline-block [&>svg]:align-middle">
                {icon}
            </span>
            <span className="text-xs text-zinc-300 w-32 flex-shrink-0 flex items-center gap-1">
                {label}
                {tooltip != null && (
                    <span
                        className="text-zinc-500 cursor-help"
                        title={tooltip}
                        aria-label={tooltip}
                    >
                        ⓘ
                    </span>
                )}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]">
                <div
                    style={{
                        width: notAnalyzed ? '0%' : `${width}%`,
                        backgroundColor: color,
                        transition: 'width 0.8s ease',
                        boxShadow: notAnalyzed ? 'none' : `0 0 6px ${color}80`,
                    }}
                    className="h-full rounded-full"
                />
            </div>
            <span
                className={`text-xs font-semibold w-24 text-right ${notAnalyzed ? 'text-zinc-500' : 'text-white'}`}
            >
                {notAnalyzed ? 'Not analyzed' : score}
            </span>
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

function AdvancedAnalyticsDetailCard({ advanced }: { advanced: FeatureEntry | null | undefined }) {
    const [expanded, setExpanded] = useState(true);

    if (advanced == null) return null;

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
        <div
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-4"
            style={{
                backgroundImage: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(249,115,22,0.04) 100%)',
            }}
        >
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex w-full items-center justify-between gap-2 text-left"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <span className="text-base inline-flex shrink-0 text-white [&>svg]:inline-block [&>svg]:align-middle">
                        <SvgBarChartSmall />
                    </span>
                    <span className="text-sm font-bold tracking-wide bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent truncate uppercase">
                        Advanced Analytics
                    </span>
                </span>
                <span
                    className={`text-zinc-500 text-xs shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    aria-hidden
                >
                    ▼
                </span>
            </button>

            {expanded && hasBody ? (
                <div className="mt-4 space-y-5 border-t border-white/[0.06] pt-4">
                    {profile ? (
                        <div>
                            <p className="text-xs text-white/40 tracking-widest uppercase mb-1.5">
                                PSYCHOLOGICAL STRATEGY
                            </p>
                            <p className="text-sm text-white/80">{profile}</p>
                        </div>
                    ) : null}

                    {triggers.length > 0 ? (
                        <div>
                            <p className="text-xs text-white/40 tracking-widest uppercase mb-2">EMOTIONAL TRIGGERS</p>
                            <div className="flex flex-wrap gap-2">
                                {triggers.map((t) => (
                                    <span
                                        key={t}
                                        className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-400"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {drivers.length > 0 ? (
                        <div>
                            <p className="text-xs text-white/40 tracking-widest uppercase mb-2">RETENTION DRIVERS</p>
                            <div className="flex flex-wrap gap-2">
                                {drivers.map((d) => (
                                    <span
                                        key={d}
                                        className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-xs text-orange-400"
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {weakest ? (
                        <div>
                            <p className="text-xs text-white/40 tracking-widest uppercase mb-2">WEAKEST MOMENT</p>
                            <div className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-300">
                                <span className="text-yellow-400 shrink-0 inline-flex [&>svg]:inline-block [&>svg]:align-middle">
                                    <SvgWarningTriangle />
                                </span>
                                <span>{weakest}</span>
                            </div>
                        </div>
                    ) : null}

                    {suggestions.length > 0 ? (
                        <div>
                            <p className="text-xs text-white/40 tracking-widest uppercase mb-2">SUGGESTIONS</p>
                            <ul className="list-none p-0 m-0">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        className="mb-2 border-l-2 border-red-500/40 pl-3 text-sm text-white/70 last:mb-0"
                                    >
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

// ─── Right panel: Accordion card for detailed analysis ───
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
    const color =
        score == null ? '#71717a' : score > 75 ? '#22c55e' : score > 50 ? '#f97316' : '#ef4444';

    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                marginBottom: 8,
                overflow: 'hidden',
            }}
        >
            <div
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
            >
                <span
                    style={{
                        fontSize: 16,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    className="[&>svg]:inline-block [&>svg]:align-middle"
                >
                    {icon}
                </span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'white' }}>
                    {title}
                </span>
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: `${color}20`,
                        color,
                        border: `1px solid ${color}60`,
                    }}
                >
                    {score == null ? '—' : score}
                </span>
                <span
                    style={{
                        color: '#71717a',
                        fontSize: 12,
                        marginLeft: 8,
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                    }}
                >
                    ▼
                </span>
            </div>
            <div
                style={{
                    maxHeight: open ? '600px' : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                }}
            >
                <div
                    style={{
                        padding: '0 16px 16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

function Chat() {
    const { videoId } = useParams<{ videoId: string }>();
    const navigate = useNavigate();
    const { name } = useUser();
    const [video, setVideo] = useState<Video | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [chipsVisible, setChipsVisible] = useState(true);
    const [timestampFeedbackList, setTimestampFeedbackList] = useState<VideoFeedback[]>([]);
    const [analysisErrorSummary, setAnalysisErrorSummary] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevAnalysisStatusForPollRef = useRef<string | null>(null);

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
                    foundVideo.analysisStatus === ANALYSIS_STATUS.PROCESSING;

                if (!isPendingOrProcessing && foundVideo.analysisStatus === ANALYSIS_STATUS.COMPLETED) {
                    try {
                        const fullVideo = await getVideoById(videoId);
                        setVideo(fullVideo);
                        prevAnalysisStatusForPollRef.current = fullVideo.analysisStatus;
                        try {
                            const fb = await getVideoFeedback(videoId);
                            setTimestampFeedbackList(fb.feedback ?? []);
                        } catch {
                            setTimestampFeedbackList([]);
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
            video.analysisStatus === ANALYSIS_STATUS.PENDING || video.analysisStatus === ANALYSIS_STATUS.PROCESSING;
        if (!isPending) return;

        const interval = setInterval(async () => {
            try {
                const videos = await getUserVideos();
                const found = videos.find((v) => v._id === videoId);
                if (!found) return;
                const prevStatus = prevAnalysisStatusForPollRef.current;
                setVideo(found);
                if (
                    found.analysisStatus === ANALYSIS_STATUS.FAILED &&
                    (prevStatus === ANALYSIS_STATUS.PENDING || prevStatus === ANALYSIS_STATUS.PROCESSING)
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
                        } catch {
                            setTimestampFeedbackList([]);
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
                    });
                    return updated;
                });
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
    const filenameDisplay =
        video?.filename != null && video.filename.length > 36
            ? `${video.filename.slice(0, 36)}…`
            : video?.filename ?? '';

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
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    const isAnalysisPending =
        video.analysisStatus === ANALYSIS_STATUS.PENDING || video.analysisStatus === ANALYSIS_STATUS.PROCESSING;
    const isAnalysisFailed = video.analysisStatus === ANALYSIS_STATUS.FAILED;

    if (isAnalysisPending) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <Link to="/videos" className="text-zinc-400 hover:text-white transition-colors text-sm mb-6">
                    ← Back to Library
                </Link>
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-white mb-2">Analysis in progress</h2>
                <p className="text-gray-400 text-center max-w-md mb-2">
                    Your video is being analyzed. This usually takes a few minutes.
                </p>
                <p className="text-gray-500 text-sm">You can wait here or go back to the library and we’ll refresh automatically.</p>
                <button
                    type="button"
                    onClick={() => navigate('/videos')}
                    className="mt-8 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    Back to Library
                </button>
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
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <Link to="/videos" className="text-zinc-400 hover:text-white transition-colors text-sm mb-6">
                    ← Back to Library
                </Link>
                <p className="text-red-400 mb-2">Analysis failed for this video.</p>
                {failedDetail ? (
                    <p className="text-xs text-red-400/90 text-center max-w-md mb-3 leading-snug">{failedDetail}</p>
                ) : null}
                <p className="text-gray-400 text-center max-w-md mb-6">
                    You can try re-analyzing from the library.
                </p>
                <button
                    type="button"
                    onClick={() => navigate('/videos')}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                    Back to Library
                </button>
            </div>
        );
    }

    if (isLoadingMessages) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <FaSpinner className="w-8 h-8 text-white animate-spin" />
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

    const dto = video.analysis;
    const pv = dto?.predictedViews;
    const predsAllNull = pv?.low == null && pv?.expected == null && pv?.high == null;
    const hookSwipe = dto?.hookSwipeRate;
    const hookSwipeNotAnalyzed = hookSwipe == null || hookSwipe <= 0;
    const showFrameFeedbackSection =
        Array.isArray(video.selectedFeatures) &&
        video.selectedFeatures.some((f) => f === 'hook' || f === 'pacing' || f === 'audio');

    return (
        <div
            className="flex flex-col overflow-hidden md:h-[calc(100vh-80px)] h-[calc(100vh-80px)]"
            style={{ height: 'calc(100vh - 80px)' }}
        >
            {/* ─── Sticky banner (full width) ─── */}
            <div
                className="sticky top-0 z-20 flex-shrink-0 px-6 py-3 flex items-center justify-between border-b border-white/[0.08]"
                style={{ background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(12px)' }}
            >
                <Link
                    to="/videos"
                    className="text-zinc-400 hover:text-white transition-colors text-sm"
                >
                    ← Back to Library
                </Link>
                <span className="text-white font-medium truncate max-w-[40%] mx-2" title={video.filename}>
                    {filenameDisplay}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-zinc-400">Virality Score</span>
                    <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="font-bold text-white text-sm px-3 py-1 rounded-full"
                        style={{
                            background:
                                viralityScore == null
                                    ? 'rgba(255,255,255,0.1)'
                                    : viralityScore >= 80
                                        ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)'
                                        : viralityScore >= 60
                                            ? 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)'
                                            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        }}
                    >
                        {viralityScore != null ? viralityScore : '—'}
                    </motion.span>
                </div>
            </div>

            {/* ─── Two panels: Chat (left) | Analysis (right). Mobile: stack (45vh + 55vh) ─── */}
            <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full">
                {/* Left: 45% desktop, 45vh mobile - AI Chat */}
                <div className="flex flex-col w-full md:w-[45%] min-h-0 md:min-h-0 h-[45vh] md:h-auto border-r border-white/[0.07] flex-shrink-0">
                    {/* Panel header (sticky within left) */}
                    <div
                        className="flex-shrink-0 px-4 py-3 border-b border-white/[0.08] flex items-start justify-between gap-3"
                        style={{ background: 'rgba(10, 10, 15, 0.95)' }}
                    >
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <SvgLightningCoach />
                                Personalized Video Coach
                            </h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Ask anything about your video</p>
                        </div>
                    </div>

                    {/* Message history */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
                        {messages.map((message) => {
                            const messageId =
                                message.id ?? (message as { _id?: string })._id ?? `msg-${Date.now()}`;
                            const timestamp = formatTimestamp(message);

                            if (message.isUser) {
                                return (
                                    <div key={messageId} className="flex items-start gap-3 mb-4 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-700 text-white text-xs font-bold">
                                            U
                                        </div>
                                        <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-r from-[#FF3CAC] to-[#FF8C00] text-white text-sm leading-relaxed">
                                            {message.text}
                                            {timestamp && (
                                                <div className="text-[10px] text-white/50 mt-1">{timestamp}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={messageId} className="flex items-start gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF3CAC] to-[#FF8C00] text-white text-xs font-bold">
                                        V
                                    </div>
                                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 border border-white/[0.08] text-white text-sm leading-relaxed bg-[rgba(255,255,255,0.05)]">
                                        {formatChatMessage(message.text)}
                                        {timestamp && (
                                            <div className="text-[10px] text-zinc-500 mt-1">{timestamp}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {isSending && (
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF3CAC] to-[#FF8C00] text-white text-xs font-bold">
                                    V
                                </div>
                                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-white/[0.08]">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0ms' }}
                                        />
                                        <div
                                            className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '150ms' }}
                                        />
                                        <div
                                            className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '300ms' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestion chips (only when user hasn't sent a message yet) */}
                    {chipsVisible && !messages.some((m) => m.isUser) && (
                        <div className="px-4 pb-2 flex flex-wrap gap-2">
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
                                    className="text-xs px-3 py-1.5 rounded-full border border-[#FF8C00] text-[#FF8C00] bg-[rgba(255,140,0,0.1)] hover:bg-[rgba(255,140,0,0.2)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                    onClick={() => handleChipClick(prompt)}
                                >
                                    <Icon />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input bar (sticky at bottom of left panel) */}
                    <div
                        className="flex-shrink-0 border-t border-white/[0.08] px-4 py-3"
                        style={{ background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(12px)' }}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything to improve your video..."
                                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-white/[0.1] rounded-full px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#FF8C00] focus:shadow-[0_0_0_2px_rgba(255,140,0,0.2)] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isSending}
                                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-[#FF3CAC] to-[#FF8C00] hover:shadow-[0_0_20px_rgba(255,60,172,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
                                aria-label="Send message"
                            >
                                {isSending ? (
                                    <FaSpinner className="w-[18px] h-[18px] animate-spin" />
                                ) : (
                                    <FaPaperPlane className="w-[18px] h-[18px]" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vertical divider */}
                <div
                    className="hidden md:block flex-shrink-0"
                    style={{ width: 1, background: 'rgba(255,255,255,0.07)' }}
                />

                {/* Right: 55% desktop, 55vh mobile - Analysis Report */}
                <div className="flex-1 min-h-[55vh] md:min-h-0 overflow-y-auto px-6 py-6 bg-[rgba(255,255,255,0.01)] md:min-w-0">
                    {/* Section A: Scores overview */}
                    <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
                        Analysis Report
                    </p>
                    <hr className="border-0 h-px bg-white/[0.06] w-full my-2" />

                    <ViralityRing score={viralityScore} />

                    <ScoreBar
                        icon={<SvgHookFish />}
                        label="Hook Score"
                        score={dto?.scores?.hook ?? 0}
                        delay={100}
                        notAnalyzed={dto?.scores?.hook == null}
                    />
                    <ScoreBar
                        icon={<SvgWaveformBars />}
                        label="Pacing & Rhythm"
                        score={dto?.scores?.pacing ?? 0}
                        delay={200}
                        notAnalyzed={dto?.scores?.pacing == null}
                    />
                    <ScoreBar
                        icon={<SvgSpeaker />}
                        label="Audio Score"
                        score={dto?.scores?.audio ?? 0}
                        delay={300}
                        notAnalyzed={dto?.scores?.audio == null}
                    />
                    <ScoreBar
                        icon={<SvgSpeechBubble />}
                        label="Caption Clarity"
                        score={dto?.scores?.caption ?? 0}
                        delay={400}
                        notAnalyzed={dto?.scores?.caption == null}
                    />
                    <ScoreBar
                        icon={<SvgBarChartSmall />}
                        label="Advanced"
                        score={dto?.scores?.advanced ?? 0}
                        delay={5}
                        tooltip="Advanced Analytics score"
                        notAnalyzed={dto?.scores?.advanced == null}
                    />
                    <ScoreBar
                        icon={<SvgSwipeGesture />}
                        label="Hook Swipe Rate"
                        score={hookSwipeNotAnalyzed ? 0 : (hookSwipe ?? 0)}
                        delay={500}
                        notAnalyzed={hookSwipeNotAnalyzed}
                        tooltip="Lower swipe rate = more viewers stayed past your hook. Higher is better here."
                    />

                    <AdvancedAnalyticsDetailCard advanced={dto?.features?.advanced} />

                    {/* Section B: Predicted Performance */}
                    <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mt-8">
                        Predicted Performance
                    </p>
                    <hr className="border-0 h-px bg-white/[0.06] w-full my-2" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div
                            className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.04]"
                            style={{ borderTop: '3px solid #06B6D4' }}
                        >
                            <span className="text-base inline-flex [&>svg]:inline-block [&>svg]:align-middle">
                                <SvgEyeTarget />
                            </span>
                            <p className="text-xs text-zinc-400 mt-1">Predicted Views (band)</p>
                            <p className="text-xl font-bold text-white mt-0.5">
                                {predsAllNull ? (
                                    <span className="text-sm font-normal text-zinc-400">
                                        Run Views analysis to get a prediction
                                    </span>
                                ) : (
                                    <>
                                        {formatViews(pv?.low ?? null)} – {formatViews(pv?.high ?? null)}
                                    </>
                                )}
                            </p>
                            <p className="text-[10px] text-zinc-500">Based on similar content</p>
                        </div>

                        <div
                            className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.04]"
                            style={{ borderTop: '3px solid #22C55E' }}
                        >
                            <span className="text-base inline-flex [&>svg]:inline-block [&>svg]:align-middle">
                                <SvgTrendingArrow />
                            </span>
                            <p className="text-xs text-zinc-400 mt-1">Expected views</p>
                            <p className="text-xl font-bold text-green-400">
                                {predsAllNull ? '—' : formatViews(pv?.expected ?? null)}
                            </p>
                            <p className="text-xs text-zinc-400 mt-2">Avg retention (curve)</p>
                            <p className="text-sm font-semibold text-zinc-300">
                                {retentionAvgPct != null ? `${retentionAvgPct}%` : '—'}
                            </p>
                            <ResponsiveContainer width="100%" height={48}>
                                <LineChart data={retentionChartData}>
                                    <Line
                                        type="monotone"
                                        dataKey="v"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ background: '#1a1a2e', border: 'none', fontSize: 10 }}
                                        formatter={(v: number | undefined) => [v != null ? `${v}%` : '', 'Retention']}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div
                            className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.04]"
                            style={{ borderTop: '3px solid #F97316' }}
                        >
                            <span className="text-base inline-flex [&>svg]:inline-block [&>svg]:align-middle">
                                <SvgGauge />
                            </span>
                            <p className="text-xs text-zinc-400 mt-1">Views predictor (score)</p>
                            <p className="text-xl font-bold text-orange-400">
                                {dto?.scores?.viewsPredictor != null
                                    ? dto.scores.viewsPredictor
                                    : '—'}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1">
                                {dto?.features?.viewsPredictor?.rating
                                    ? `Tier: ${dto.features.viewsPredictor.rating}`
                                    : 'Run Views predictor in upload options'}
                            </p>
                        </div>
                    </div>

                    {showFrameFeedbackSection && (
                        <>
                            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mt-8">
                                Frame-level feedback
                            </p>
                            <hr className="border-0 h-px bg-white/[0.06] w-full my-2" />
                            {timestampFeedbackList.length === 0 ? (
                                <p className="text-sm text-zinc-500 py-4">
                                    No frame-level feedback available for this video.
                                </p>
                            ) : (
                                <ul className="space-y-3 mt-2">
                                    {timestampFeedbackList.map((item, idx) => (
                                        <li
                                            key={`${item.timestamp}-${idx}`}
                                            className="rounded-xl p-4 border border-white/[0.08] bg-white/[0.03]"
                                        >
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                                                    {formatSecondsToMmSs(item.timestamp)}
                                                    {item.endTimestamp != null
                                                        ? ` – ${formatSecondsToMmSs(item.endTimestamp)}`
                                                        : ''}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-white/15 text-zinc-400">
                                                    {item.category}
                                                </span>
                                                <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                                                    {item.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-white">{item.issue}</p>
                                            <p className="text-sm text-zinc-300 mt-1">{item.suggestion}</p>
                                            {item.example ? (
                                                <p className="text-xs text-zinc-500 mt-2 italic">{item.example}</p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    {/* Section C: Detailed Analysis (accordions) */}
                    <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mt-8">
                        Detailed Analysis
                    </p>
                    <hr className="border-0 h-px bg-white/[0.06] w-full my-2" />

                    <AccordionCard
                        icon={<SvgHookFish />}
                        title="Hook"
                        score={dto?.scores?.hook ?? null}
                        defaultOpen={true}
                    >
                        <p
                            style={{
                                color: '#f87171',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            What&apos;s wrong:
                        </p>
                        <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6 }}>
                            {dto?.features?.hook?.feedback ?? 'No analysis yet'}
                        </p>
                        <p
                            style={{
                                color: '#4ade80',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            Suggestions to improve:
                        </p>
                        <ul className="list-disc list-inside text-[#d4d4d8] text-sm leading-relaxed">
                            {(dto?.features?.hook?.suggestions ?? []).map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </AccordionCard>

                    <AccordionCard icon={<SvgWaveformBars />} title="Pacing & Rhythm" score={dto?.scores?.pacing ?? null}>
                        <p
                            style={{
                                color: '#f87171',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            What&apos;s wrong:
                        </p>
                        <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6 }}>
                            {dto?.features?.pacing?.feedback ?? 'No analysis yet'}
                        </p>
                        <p
                            style={{
                                color: '#4ade80',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            Suggestions to improve:
                        </p>
                        <ul className="list-disc list-inside text-[#d4d4d8] text-sm leading-relaxed">
                            {(dto?.features?.pacing?.suggestions ?? []).map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </AccordionCard>

                    <AccordionCard icon={<SvgSpeaker />} title="Audio Score" score={dto?.scores?.audio ?? null}>
                        <p
                            style={{
                                color: '#f87171',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            What&apos;s wrong:
                        </p>
                        <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6 }}>
                            {dto?.features?.audio?.feedback ?? 'No analysis yet'}
                        </p>
                        <p
                            style={{
                                color: '#4ade80',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            Suggestions to improve:
                        </p>
                        <ul className="list-disc list-inside text-[#d4d4d8] text-sm leading-relaxed">
                            {(dto?.features?.audio?.suggestions ?? []).map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </AccordionCard>

                    <AccordionCard icon={<SvgSpeechBubble />} title="Caption Clarity" score={dto?.scores?.caption ?? null}>
                        <p
                            style={{
                                color: '#f87171',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            What&apos;s wrong:
                        </p>
                        <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6 }}>
                            {dto?.features?.caption?.feedback ?? 'No analysis yet'}
                        </p>
                        <p
                            style={{
                                color: '#4ade80',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            Suggestions to improve:
                        </p>
                        <ul className="list-disc list-inside text-[#d4d4d8] text-sm leading-relaxed">
                            {(dto?.features?.caption?.suggestions ?? []).map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </AccordionCard>

                    <AccordionCard
                        icon={<SvgGauge />}
                        title="Views predictor"
                        score={dto?.scores?.viewsPredictor ?? null}
                    >
                        <p
                            style={{
                                color: '#f87171',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            Summary:
                        </p>
                        <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6 }}>
                            {dto?.features?.viewsPredictor?.feedback ?? 'No analysis yet'}
                        </p>
                        <p
                            style={{
                                color: '#4ade80',
                                fontSize: 12,
                                fontWeight: 600,
                                marginBottom: 4,
                                marginTop: 12,
                            }}
                        >
                            Suggestions to improve:
                        </p>
                        <ul className="list-disc list-inside text-[#d4d4d8] text-sm leading-relaxed">
                            {(dto?.features?.viewsPredictor?.suggestions ?? []).map((s, i) => (
                                <li key={i}>{s}</li>
                            ))}
                        </ul>
                    </AccordionCard>

                    {dto?.features?.advanced && (
                        <AccordionCard
                            icon={<SvgBarChartSmall />}
                            title="Advanced Analytics"
                            score={dto.features.advanced.score ?? null}
                        >
                            <p
                                style={{
                                    color: '#f87171',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginBottom: 4,
                                    marginTop: 12,
                                }}
                            >
                                Summary:
                            </p>
                            <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6 }}>
                                {dto.features.advanced.feedback ?? 'No analysis yet'}
                            </p>
                            {dto.features.advanced.rating != null ? (
                                <p className="text-xs text-zinc-400 mt-2">
                                    Rating: {dto.features.advanced.rating}
                                </p>
                            ) : null}
                            <p
                                style={{
                                    color: '#4ade80',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginBottom: 4,
                                    marginTop: 12,
                                }}
                            >
                                Suggestions to improve:
                            </p>
                            <ul className="list-disc list-inside text-[#d4d4d8] text-sm leading-relaxed">
                                {(dto.features.advanced.suggestions ?? []).map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </AccordionCard>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;
