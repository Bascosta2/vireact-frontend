import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Clapperboard, Copy, Loader2, Mic, Play, RefreshCw, Type, Video as VideoIcon } from 'lucide-react';
import {
    generateScriptSuggestions,
    getScriptSuggestions,
    type ScriptOption,
    type ScriptSuggestions as ScriptSuggestionsData,
} from '@/api/video';

const clock = (seconds: number) => {
    const s = Math.max(0, Math.round(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const errorMessage = (err: unknown, fallback: string) => {
    const e = err as { response?: { data?: { message?: string } } };
    return e?.response?.data?.message || fallback;
};

/** Plain-text version of one script, for pasting into notes or a teleprompter. */
const scriptToText = (option: ScriptOption) =>
    [
        `${option.title}`,
        option.hookLine ? `Hook: ${option.hookLine}` : '',
        '',
        ...option.beats.map((beat) =>
            [
                `${clock(beat.tStart)}-${clock(beat.tEnd)}`,
                beat.say ? `  Say: ${beat.say}` : '',
                beat.onScreenText ? `  On screen: ${beat.onScreenText}` : '',
                beat.visual ? `  Show: ${beat.visual}` : '',
            ]
                .filter(Boolean)
                .join('\n')
        ),
        '',
        option.cta ? `Ending: ${option.cta}` : '',
    ]
        .filter((line, index, all) => line !== '' || (all[index - 1] ?? '') !== '')
        .join('\n')
        .trim();

type Status = 'loading' | 'generating' | 'ready' | 'error';

/**
 * Scripts tab: complete alternative scripts fitted to the video's length, generated on first open and
 * cached by the backend.
 */
export function ScriptSuggestions({ videoId, onSeek }: { videoId: string; onSeek?: (seconds: number) => void }) {
    const [data, setData] = useState<ScriptSuggestionsData | null>(null);
    const [status, setStatus] = useState<Status>('loading');
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const generate = useCallback(
        async (regenerate: boolean) => {
            setStatus('generating');
            setError(null);
            try {
                const next = await generateScriptSuggestions(videoId, regenerate);
                setData(next);
                setSelectedId(next.options[0]?.id ?? null);
                setStatus('ready');
            } catch (err) {
                // 409 = another request (e.g. the tab was reopened) is already writing them: wait for that result.
                if ((err as { response?: { status?: number } })?.response?.status === 409) {
                    for (let attempt = 0; attempt < 10; attempt++) {
                        await new Promise((resolve) => setTimeout(resolve, 4000));
                        try {
                            const pending = await getScriptSuggestions(videoId);
                            if (pending.options.length > 0) {
                                setData(pending);
                                setSelectedId(pending.options[0].id);
                                setStatus('ready');
                                return;
                            }
                        } catch {
                            // keep waiting
                        }
                    }
                }
                setError(errorMessage(err, 'We could not write scripts right now. Try again in a moment.'));
                setStatus(data && data.options.length > 0 ? 'ready' : 'error');
            }
        },
        [videoId, data]
    );

    const load = useCallback(async () => {
        setStatus('loading');
        setError(null);
        try {
            const existing = await getScriptSuggestions(videoId);
            if (existing.options.length > 0) {
                setData(existing);
                setSelectedId(existing.options[0].id);
                setStatus('ready');
                return;
            }
        } catch {
            // Fall through to generating; that call reports its own error.
        }
        await generate(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    useEffect(() => {
        void load();
        return () => clearTimeout(copiedTimer.current);
    }, [load]);

    const selected = data?.options.find((o) => o.id === selectedId) ?? data?.options[0] ?? null;

    const copy = async () => {
        if (!selected) return;
        try {
            await navigator.clipboard.writeText(scriptToText(selected));
            setCopied(true);
            clearTimeout(copiedTimer.current);
            copiedTimer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            setError('Copy failed. Select the text and copy it manually.');
        }
    };

    if (status === 'loading' || (status === 'generating' && !data?.options.length)) {
        return (
            <div className="app-panel p-6" role="status" aria-live="polite">
                <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-accent motion-safe:animate-spin" aria-hidden />
                    <p className="text-sm font-medium text-fg">
                        {status === 'loading' ? 'Loading your scripts' : 'Writing scripts fitted to your video'}
                    </p>
                </div>
                {status === 'generating' && (
                    <p className="mt-2 text-sm text-fg-muted">This takes about 15 seconds. Each option is timed to your video's length.</p>
                )}
                <div className="mt-5 space-y-2" aria-hidden>
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded-xl bg-white/[0.04]" />
                    ))}
                </div>
            </div>
        );
    }

    if (status === 'error' || !selected || !data) {
        return (
            <div className="app-panel p-6" role="alert">
                <p className="text-sm font-medium text-fg">{error || 'No scripts yet.'}</p>
                <button
                    type="button"
                    onClick={() => void generate(false)}
                    className="app-focus app-primary mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                >
                    <RefreshCw className="h-4 w-4" aria-hidden />
                    Try again
                </button>
            </div>
        );
    }

    const busy = status === 'generating';

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-fg">Full script options</h3>
                    <p className="mt-0.5 text-sm text-fg-muted">
                        {data.options.length} ways to make this video
                        {data.targetSeconds ? `, each timed to ${data.targetSeconds} seconds` : ''}.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void copy()}
                        className="app-focus inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-fg-muted transition-colors hover:border-white/20 hover:text-fg"
                    >
                        {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                        {copied ? 'Copied' : 'Copy script'}
                    </button>
                    <button
                        type="button"
                        onClick={() => void generate(true)}
                        disabled={busy || data.regenerationsLeft <= 0}
                        title={data.regenerationsLeft <= 0 ? 'No refreshes left for this video' : undefined}
                        className="app-focus inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-fg-muted transition-colors hover:border-white/20 hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${busy ? 'motion-safe:animate-spin' : ''}`} aria-hidden />
                        {busy ? 'Writing' : `New options (${data.regenerationsLeft} left)`}
                    </button>
                </div>
            </div>

            {error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                    {error}
                </p>
            )}

            {/* Option picker */}
            <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
                {data.options.map((option, index) => {
                    const active = option.id === selected.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelectedId(option.id)}
                            className={`app-focus inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ${
                                active
                                    ? 'border-accent/50 bg-accent-tint text-fg shadow-[0_0_16px_rgba(232,103,53,0.15)]'
                                    : 'border-line bg-white/[0.02] text-fg-muted hover:border-white/20 hover:text-fg'
                            }`}
                        >
                            <span className="font-mono text-[11px] text-accent">{String(index + 1).padStart(2, '0')}</span>
                            {option.title}
                        </button>
                    );
                })}
            </div>

            {/* Selected script */}
            <article className="app-panel mt-4 p-5" aria-label={`Script: ${selected.title}`}>
                {selected.angle && <p className="text-sm text-fg-muted">{selected.angle}</p>}

                {selected.hookLine && (
                    <div className="mt-4 rounded-xl border border-accent/30 bg-accent-tint px-4 py-3">
                        <p className="app-label !text-accent">Hook, first 2 seconds</p>
                        <p className="mt-1 text-lg font-semibold leading-snug text-fg">{selected.hookLine}</p>
                    </div>
                )}

                <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-line">
                    {selected.beats.map((beat, index) => (
                        <li key={`${beat.tStart}-${index}`} className="relative pl-6">
                            <span aria-hidden className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-accent bg-canvas" />
                            <div className="flex flex-wrap items-center gap-2">
                                {onSeek ? (
                                    <button
                                        type="button"
                                        onClick={() => onSeek(beat.tStart)}
                                        className="app-focus inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-fg-muted transition-colors hover:border-accent/40 hover:text-fg"
                                        title="Jump to this moment in your video"
                                    >
                                        <Play className="h-2.5 w-2.5" aria-hidden />
                                        {clock(beat.tStart)}-{clock(beat.tEnd)}
                                    </button>
                                ) : (
                                    <span className="rounded-md border border-line bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-fg-muted">
                                        {clock(beat.tStart)}-{clock(beat.tEnd)}
                                    </span>
                                )}
                                {index === selected.beats.length - 1 && <span className="app-label">Ending</span>}
                            </div>
                            <dl className="mt-2 space-y-1.5 text-sm">
                                {beat.say && (
                                    <div className="flex gap-2">
                                        <dt className="mt-0.5 shrink-0 text-fg-subtle" title="Say">
                                            <Mic className="h-4 w-4" aria-hidden />
                                            <span className="sr-only">Say</span>
                                        </dt>
                                        <dd className="min-w-0 font-medium text-fg">"{beat.say}"</dd>
                                    </div>
                                )}
                                {beat.onScreenText && (
                                    <div className="flex gap-2">
                                        <dt className="mt-0.5 shrink-0 text-fg-subtle" title="On screen">
                                            <Type className="h-4 w-4" aria-hidden />
                                            <span className="sr-only">On screen</span>
                                        </dt>
                                        <dd className="min-w-0 text-fg">
                                            <span className="rounded bg-white/[0.06] px-1.5 py-0.5">{beat.onScreenText}</span>
                                        </dd>
                                    </div>
                                )}
                                {beat.visual && (
                                    <div className="flex gap-2">
                                        <dt className="mt-0.5 shrink-0 text-fg-subtle" title="Show">
                                            <VideoIcon className="h-4 w-4" aria-hidden />
                                            <span className="sr-only">Show</span>
                                        </dt>
                                        <dd className="min-w-0 text-fg-muted">{beat.visual}</dd>
                                    </div>
                                )}
                            </dl>
                        </li>
                    ))}
                </ol>

                {selected.cta && (
                    <div className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-sm">
                        <Clapperboard className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                        <p className="text-fg">
                            <span className="font-semibold">End with: </span>
                            {selected.cta}
                        </p>
                    </div>
                )}
                {selected.whyItWorks && <p className="mt-3 text-sm leading-relaxed text-fg-muted">{selected.whyItWorks}</p>}
            </article>
        </div>
    );
}

export default ScriptSuggestions;
