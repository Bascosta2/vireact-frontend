import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { requestHookRewrite, type HookRewriteResult } from '@/api/funnel';
import { track } from '@/lib/analytics';
import HookCard from './HookCard';

const MAX_LENGTH = 200;

interface HookRewriterProps {
  sessionId: string;
  initiallyUsed: boolean;
  isAuthenticated: boolean;
}

const errorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (status === 429) return message || "You've used your free rewrite.";
    if (status === 400 && message) return message;
  }
  return "We couldn't rewrite that right now. Please try again.";
};

function HookRewriter({ sessionId, initiallyUsed, isAuthenticated }: HookRewriterProps) {
  const [hookLine, setHookLine] = useState('');
  const [result, setResult] = useState<HookRewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(initiallyUsed && !isAuthenticated);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const line = hookLine.trim();
    if (line.length < 3 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const data = await requestHookRewrite({ sessionId, hookLine: line });
      setResult(data);
      if (!isAuthenticated) setUsed(true);
      track('hook_rewrite_used', { rewrites: data.rewrites.length });
    } catch (err) {
      setError(errorMessage(err));
      if (isAxiosError(err) && err.response?.status === 429 && !isAuthenticated) setUsed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="rewriter-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h3 id="rewriter-heading" className="text-lg font-semibold">Rewrite your own hook</h3>
      <p className="mt-1 text-sm text-white/60">
        Paste the first line of a video. We'll rewrite it using the hook patterns from the library.
        {!isAuthenticated && ' One free rewrite per quiz.'}
      </p>

      {!result && !used && (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <label htmlFor="hook-line" className="sr-only">Your hook</label>
          <textarea
            id="hook-line"
            value={hookLine}
            onChange={(e) => setHookLine(e.target.value.slice(0, MAX_LENGTH))}
            rows={3}
            maxLength={MAX_LENGTH}
            placeholder="e.g. Today I'm going to show you how I edit my videos"
            className="w-full rounded-xl bg-white/5 border border-white/15 p-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/40">{hookLine.length}/{MAX_LENGTH}</span>
            <button type="submit" disabled={loading || hookLine.trim().length < 3} className="btn-primary min-h-[48px] rounded-xl">
              {loading ? 'Rewriting…' : 'Rewrite it'}
            </button>
          </div>
        </form>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}

      {used && !result && !error && (
        <p className="mt-4 text-sm text-white/70">You've used your free rewrite. Create an account to rewrite more hooks.</p>
      )}

      {result && (
        <div className="mt-4 flex flex-col gap-3" aria-live="polite">
          <p className="text-sm text-white/70">{result.diagnosis}</p>
          {result.rewrites.map((rewrite, i) => (
            <HookCard key={rewrite.line} text={rewrite.line} label={`Rewrite ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
}

export default HookRewriter;
