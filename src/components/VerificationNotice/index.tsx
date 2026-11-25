import React, { useState } from 'react';
import Axios from '@/api';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import {
  outcomeNotice,
  readVerificationOutcome,
  resendErrorMessage,
  type VerificationOutcome,
} from '@/lib/verification-email';

interface VerificationNoticeProps {
  outcome: VerificationOutcome;
  email: string;
  /** The account already existed (signed up again). */
  resignup?: boolean;
  /** Lets the user go back and fix the address (bad_address). */
  onEditAddress?: () => void;
}

/** Tells the user what happened to their verification email, and offers a resend (60 s cooldown). */
function VerificationNotice({ outcome, email, resignup = false, onEditAddress }: VerificationNoticeProps) {
  const notice = outcomeNotice(outcome, email, resignup);
  // The server just sent (or just skipped sending) a link, so the wait starts now.
  const { secondsLeft, start } = useResendCooldown(outcome === 'sent' || outcome === 'recent');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

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

  const resendLabel = outcome === 'unavailable' ? 'Try again' : 'Resend email';

  return (
    <div className="space-y-4 text-center">
      <p
        role="status"
        className={notice.tone === 'success' ? 'text-white' : 'text-amber-300'}
        data-testid="verification-notice"
      >
        {notice.message}
      </p>
      {feedback && (
        <p role={feedback.kind === 'error' ? 'alert' : 'status'} className={feedback.kind === 'error' ? 'text-sm text-red-400' : 'text-sm text-white/80'}>
          {feedback.text}
        </p>
      )}
      {notice.canResend && (
        <button
          type="button"
          onClick={handleResend}
          disabled={isSending || secondsLeft > 0}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {secondsLeft > 0 ? `${resendLabel} (wait ${secondsLeft}s)` : isSending ? 'Sending...' : resendLabel}
        </button>
      )}
      {notice.canEditAddress && onEditAddress && (
        <button type="button" onClick={onEditAddress} className="btn-secondary w-full">
          Use a different email
        </button>
      )}
    </div>
  );
}

export default VerificationNotice;
