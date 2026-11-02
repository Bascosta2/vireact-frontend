import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { fetchFunnelResults, type FunnelResults } from '@/api/funnel';
import { clearFunnelState, loadFunnelState } from '@/funnel/session';
import { googleAuthUrl } from '@/funnel/google-auth';
import { useAuth } from '@/redux/hooks/use-auth';
import { track } from '@/lib/analytics';
import HookCard from './components/HookCard';
import HookRewriter from './components/HookRewriter';
import EmailResults from './components/EmailResults';
import UnlockedStack from './components/UnlockedStack';

const PLAN_LABELS: Record<FunnelResults['recommendedPlan'], string> = { premium: 'Premium', pro: 'Pro' };

const calcomUrl = (): string | null => {
  const raw = String(import.meta.env.VITE_CALCOM_LINK ?? '').trim();
  if (!raw) return null;
  return raw.startsWith('https://') ? raw : `https://cal.com/${raw.replace(/^\/+/, '')}`;
};

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const sessionId = useMemo(() => loadFunnelState().sessionId, []);
  const [results, setResults] = useState<FunnelResults | null>(
    (location.state as { results?: FunnelResults } | null)?.results ?? null
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(results ? 'ready' : 'loading');
  const viewed = useRef(false);

  const restart = useCallback(() => {
    clearFunnelState();
    navigate('/start?retake=1', { replace: true });
  }, [navigate]);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setStatus('loading');
    try {
      setResults(await fetchFunnelResults(sessionId));
      setStatus('ready');
    } catch (error) {
      const code = isAxiosError(error) ? error.response?.status : undefined;
      if (code === 404 || code === 409) restart();
      else setStatus('error');
    }
  }, [sessionId, restart]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/start', { replace: true });
      return;
    }
    if (!results) load();
  }, [sessionId, results, load, navigate]);

  useEffect(() => {
    if (!results || viewed.current) return;
    viewed.current = true;
    track('results_viewed', {
      hooks_count: results.hooks.length,
      hooks_hidden: results.hooksHidden,
      high_intent: results.highIntent,
      recommended_plan: results.recommendedPlan,
    });
  }, [results]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh]" role="alert">
        <p className="text-lg font-semibold">We couldn't load your results.</p>
        <button type="button" className="btn-primary mt-6 min-h-[48px] rounded-xl" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  if (!results || !sessionId) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-label="Loading results">
        <div className="h-10 w-10 rounded-full border-4 border-white/15 border-t-[#FF004F] animate-spin" />
      </div>
    );
  }

  const startGoogle = () => {
    track('signup_started', { method: 'google', source: 'quiz_results' }, { beforeUnload: true });
    window.location.href = googleAuthUrl(`${window.location.origin}/auth/google/callback`);
  };

  const primaryCta = isAuthenticated ? (
    <Link to="/upload" className="btn-primary w-full min-h-[52px] rounded-xl">
      Upload a video for feedback
    </Link>
  ) : (
    <button type="button" onClick={startGoogle} className="btn-primary w-full min-h-[52px] rounded-xl">
      Continue with Google
    </button>
  );

  const callUrl = results.highIntent ? calcomUrl() : null;
  const { diagnosis } = results;

  return (
    <div className="pb-28 sm:pb-0 flex flex-col gap-8">
      <section>
        <p className="text-sm uppercase tracking-wide text-white/50">Your results</p>
        {diagnosis && (
          <>
            <h1 className="mt-2 !text-4xl sm:!text-5xl">{diagnosis.headline}</h1>
            <p className="mt-4 text-base text-white/80 leading-relaxed">{diagnosis.body}</p>
          </>
        )}
      </section>

      <UnlockedStack hooksHidden={results.hooksHidden} rewriteUsed={results.rewritesUsed > 0} isAuthenticated={isAuthenticated} />

      <section aria-labelledby="hooks-heading" className="flex flex-col gap-3">
        <h3 id="hooks-heading" className="text-lg font-semibold scroll-mt-20">Hooks to try on your next video</h3>
        {results.hooksHidden ? (
          <p className="text-sm text-white/60">
            Hook picks for your answers aren't available yet. You can still rewrite your own hook below.
          </p>
        ) : (
          results.hooks.map((hook, i) => (
            <HookCard
              key={hook.slug}
              text={hook.displayText}
              label={hook.category}
              onCopied={() => track('hook_copied', { slug: hook.slug, position: i + 1 })}
            />
          ))
        )}
      </section>

      <div id="hook-rewriter" className="scroll-mt-20">
        <HookRewriter sessionId={sessionId} initiallyUsed={results.rewritesUsed > 0} isAuthenticated={isAuthenticated} />
      </div>

      <section aria-labelledby="next-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 flex flex-col gap-4">
        <h3 id="next-heading" className="text-lg font-semibold">Your next step</h3>
        {diagnosis && <p className="text-sm text-white/70">{diagnosis.nextStep}</p>}
        <p className="text-sm text-white/60">
          Suggested plan for your account:{' '}
          <Link to={isAuthenticated ? '/subscription-plans' : '/pricing'} className="text-white underline underline-offset-4">
            {PLAN_LABELS[results.recommendedPlan]}
          </Link>
        </p>
        <div className="hidden sm:block">{primaryCta}</div>
        {!isAuthenticated && (
          <Link
            to="/signup"
            className="text-sm text-white/70 underline underline-offset-4 self-center min-h-[44px] inline-flex items-center"
          >
            Sign up with email instead
          </Link>
        )}
      </section>

      {callUrl && (
        <section className="rounded-2xl border border-[#FF883E]/40 bg-[#FF883E]/5 p-4 sm:p-6">
          <h3 className="text-lg font-semibold">Want a hand with your strategy?</h3>
          <p className="mt-1 text-sm text-white/70">Book a call with the Vireact team to talk through your channel.</p>
          <a
            href={callUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('book_call_clicked')}
            className="btn-secondary mt-4 min-h-[48px] rounded-xl inline-flex"
          >
            Book a call
          </a>
        </section>
      )}

      <div className="flex flex-col items-center gap-2">
        {results.emailDelivery && !results.emailCaptured && <EmailResults sessionId={sessionId} />}
        <button type="button" onClick={restart} className="text-sm text-white/50 hover:text-white min-h-[44px]">
          Retake the quiz
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 sm:hidden p-3 bg-black/90 backdrop-blur border-t border-white/10 z-20">
        {primaryCta}
      </div>
    </div>
  );
}

export default ResultsPage;
