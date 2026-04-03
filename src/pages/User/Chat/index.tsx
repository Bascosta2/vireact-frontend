import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
    type Video,
} from '@/api/video';
import type { VideoFeedback } from '@/types/video-feedback';
import { getChatMessages, sendChatMessage, type Message } from '@/api/chat';
import { useUser } from '@/redux/hooks/use-user';
import { CHAT_WELCOME_MESSAGES, ANALYSIS_STATUS } from '@/constants';
import { ErrorNotification } from '@/utils/toast';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

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
    icon: string;
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
            <span className="text-base w-5">{icon}</span>
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

// ─── Right panel: Accordion card for detailed analysis ───
function AccordionCard({
    icon,
    title,
    score,
    children,
    defaultOpen = false,
}: {
    icon: string;
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
                <span style={{ fontSize: 16 }}>{icon}</span>
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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset state when videoId changes
    useEffect(() => {
        setMessages([]);
        setInputText('');
        setChipsVisible(true);
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

                const isPendingOrProcessing =
                    foundVideo.analysisStatus === ANALYSIS_STATUS.PENDING ||
                    foundVideo.analysisStatus === ANALYSIS_STATUS.PROCESSING;

                if (!isPendingOrProcessing && foundVideo.analysisStatus === ANALYSIS_STATUS.COMPLETED) {
                    try {
                        const fullVideo = await getVideoById(videoId);
                        setVideo(fullVideo);
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
                setVideo(found);
                if (found.analysisStatus === ANALYSIS_STATUS.COMPLETED) {
                    try {
                        const fullVideo = await getVideoById(videoId);
                        setVideo(fullVideo);
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

    const formatChatbotMessage = useCallback((text: string): string => {
        return text.replace(/\*\*/g, '').replace(/—/g, ', ');
    }, []);

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
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <Link to="/videos" className="text-zinc-400 hover:text-white transition-colors text-sm mb-6">
                    ← Back to Library
                </Link>
                <p className="text-red-400 mb-2">Analysis failed for this video.</p>
                <p className="text-gray-400 text-center max-w-md mb-6">You can try re-analyzing from the library.</p>
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
                                ⚡ AI Video Coach
                            </h2>
                            <p className="text-xs text-zinc-400 mt-0.5">Ask anything about your video</p>
                        </div>
                        <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 border"
                            style={{
                                background: 'rgba(255, 140, 0, 0.15)',
                                borderColor: '#FF8C00',
                                color: '#FF8C00',
                            }}
                        >
                            Powered by AI
                        </span>
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
                                        {formatChatbotMessage(message.text)}
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
                            {[
                                '🎣 Fix my hook',
                                '✂️ What to cut?',
                                '📱 TikTok vs Reels?',
                                '⏱️ My pacing?',
                            ].map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    className="text-xs px-3 py-1.5 rounded-full border border-[#FF8C00] text-[#FF8C00] bg-[rgba(255,140,0,0.1)] hover:bg-[rgba(255,140,0,0.2)] transition-colors cursor-pointer"
                                    onClick={() => handleChipClick(chip)}
                                >
                                    {chip}
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
                        icon="⚡"
                        label="Hook Score"
                        score={dto?.scores?.hook ?? 0}
                        delay={100}
                        notAnalyzed={dto?.scores?.hook == null}
                    />
                    <ScoreBar
                        icon="🎬"
                        label="Pacing & Rhythm"
                        score={dto?.scores?.pacing ?? 0}
                        delay={200}
                        notAnalyzed={dto?.scores?.pacing == null}
                    />
                    <ScoreBar
                        icon="🔊"
                        label="Audio Score"
                        score={dto?.scores?.audio ?? 0}
                        delay={300}
                        notAnalyzed={dto?.scores?.audio == null}
                    />
                    <ScoreBar
                        icon="💬"
                        label="Caption Clarity"
                        score={dto?.scores?.caption ?? 0}
                        delay={400}
                        notAnalyzed={dto?.scores?.caption == null}
                    />
                    <ScoreBar
                        icon="🪝"
                        label="Hook Swipe Rate"
                        score={hookSwipeNotAnalyzed ? 0 : (hookSwipe ?? 0)}
                        delay={500}
                        notAnalyzed={hookSwipeNotAnalyzed}
                        tooltip="Lower swipe rate = more viewers stayed past your hook. Higher is better here."
                    />

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
                            <span className="text-base">👁️</span>
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
                            <span className="text-base">📊</span>
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
                            <span className="text-base">📈</span>
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
                        icon="🎣"
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

                    <AccordionCard icon="🎬" title="Pacing & Rhythm" score={dto?.scores?.pacing ?? null}>
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

                    <AccordionCard icon="🔊" title="Audio Score" score={dto?.scores?.audio ?? null}>
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

                    <AccordionCard icon="💬" title="Caption Clarity" score={dto?.scores?.caption ?? null}>
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
                        icon="🪝"
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
                </div>
            </div>
        </div>
    );
}

export default Chat;
