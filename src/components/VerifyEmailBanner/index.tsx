import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Axios from '@/api';
import { getProfile } from '@/api/profile';
import { useUser } from '@/redux/hooks/use-user';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import { outcomeNotice, readVerificationOutcome, resendErrorMessage } from '@/lib/verification-email';

const DISMISS_KEY = 'vireact_verify_email_banner_dismissed';
// Module-level so the profile is re-checked once per page session, not on every page change.
let profileChecked = false;

/** Small dismissible reminder for signed-in users whose email is not verified yet. */
function VerifyEmailBanner() {
  const { email, isEmailVerified, setUserData } = useUser();
  const { secondsLeft, start } = useResendCooldown();
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [dismissed, setDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === '1'
  );

  // Cached data may be missing or stale (verified on another device); ask once per session.
  useEffect(() => {
    if (isEmailVerified === true || (isEmailVerified === false && profileChecked)) return;
    profileChecked = true;
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (!cancelled) setUserData({ isEmailVerified: profile.isEmailVerified });
      })
      .catch(() => { /* No banner if we can't tell. */ });
    return () => { cancelled = true; };
    // setUserData is recreated every render; only the flag matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmailVerified]);

  const handleDismiss = useCallback(() => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  }, []);

  const handleResend = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      const response = await Axios.post('/auth/resend-verification', { email });
      const result = outcomeNotice(readVerificationOutcome(response.data?.data), email);
      if (result.tone === 'warning') {
        setFeedback({ kind: 'error', text: result.message });
      } else {
        setFeedback({ kind: 'success', text: result.message });
        start();
      }
    } catch (error: unknown) {
      setFeedback({ kind: 'error', text: resendErrorMessage(error, "We couldn't send the email. Try again soon.") });
    } finally {
      setIsSending(false);
    }
  };

  if (isEmailVerified !== false || dismissed) return null;

  return (
    <div role="region" aria-label="Email verification" className="relative flex flex-col gap-2 border-b border-warning/30 bg-surface-raised px-4 py-2 text-sm text-fg sm:flex-row sm:items-center sm:justify-between">
      <p className="pr-8 sm:pr-0">
        Please verify your email.{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending || secondsLeft > 0}
          className="app-focus rounded font-medium text-accent underline underline-offset-2 disabled:no-underline disabled:opacity-60"
        >
          {secondsLeft > 0 ? `Resend link (wait ${secondsLeft}s)` : isSending ? 'Sending...' : 'Resend link'}
        </button>
        {feedback && (
          <span role={feedback.kind === 'error' ? 'alert' : 'status'} className="ml-2 text-fg-muted">
            {feedback.text}
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="app-focus absolute right-2 top-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-white/10 sm:static"
        aria-label="Dismiss verify email reminder"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export default VerifyEmailBanner;
