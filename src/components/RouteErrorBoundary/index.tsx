import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

// One-shot auto-reload guard: a chunk-load failure right after deploy is
// almost always recoverable by reloading the page so the browser fetches
// the new chunk hashes. We only auto-reload once per tab session — if the
// reload itself trips the boundary, we surface an interactive fallback so
// the user is not stuck in a refresh loop on a genuinely broken deploy.
const RECOVERY_COUNT_KEY = 'vireact-route-recovery-count';
const MAX_AUTO_RELOADS = 1;

function isChunkLoadError(error: unknown): boolean {
    if (!error) return false;
    const err = error as { name?: string; message?: string };
    if (err.name === 'ChunkLoadError') return true;
    const msg = err.message || '';
    return (
        /Loading chunk \d+ failed/i.test(msg) ||
        /Failed to fetch dynamically imported module/i.test(msg) ||
        /Importing a module script failed/i.test(msg)
    );
}

interface State {
    hasError: boolean;
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidMount(): void {
        // A clean mount means the previous reload (if any) succeeded; reset
        // the counter so the next genuine failure can use its one auto-reload.
        try {
            sessionStorage.removeItem(RECOVERY_COUNT_KEY);
        } catch {
            // sessionStorage can throw in private mode or sandboxed iframes;
            // the counter then degrades to "always show fallback on error",
            // which is still a recoverable UX.
        }
    }

    componentDidCatch(error: Error, _info: ErrorInfo): void {
        if (!isChunkLoadError(error)) return;

        let count = 0;
        try {
            count = Number(sessionStorage.getItem(RECOVERY_COUNT_KEY) || '0');
        } catch {
            count = MAX_AUTO_RELOADS;
        }

        if (count < MAX_AUTO_RELOADS) {
            try {
                sessionStorage.setItem(RECOVERY_COUNT_KEY, String(count + 1));
            } catch {
                // ignore — the next paint will show the fallback regardless
            }
            window.location.reload();
        }
    }

    private handleRefresh = () => {
        try {
            sessionStorage.removeItem(RECOVERY_COUNT_KEY);
        } catch {
            // ignore
        }
        window.location.reload();
    };

    private handleHomeClick = () => {
        try {
            sessionStorage.removeItem(RECOVERY_COUNT_KEY);
        } catch {
            // ignore
        }
    };

    render(): ReactNode {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6 text-center">
                <div className="max-w-md flex flex-col items-center gap-6">
                    <h1
                        className="text-3xl md:text-4xl font-bold uppercase tracking-wide"
                        style={{
                            fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
                            background:
                                'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Something went wrong
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        We couldn&apos;t finish loading this part of Vireact. Reloading the page
                        should pick up the latest version.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            type="button"
                            onClick={this.handleRefresh}
                            className="flex-1 h-12 rounded-xl font-semibold text-sm md:text-base bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-95 transition-opacity"
                        >
                            Refresh page
                        </button>
                        <Link
                            to="/"
                            onClick={this.handleHomeClick}
                            className="flex-1 h-12 inline-flex items-center justify-center rounded-xl border border-white/15 bg-gray-900/80 text-sm md:text-base font-semibold text-white hover:border-white/25 hover:bg-gray-800/80 transition-colors"
                        >
                            Go to home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default RouteErrorBoundary;
