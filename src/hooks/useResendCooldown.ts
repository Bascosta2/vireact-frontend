import { useCallback, useEffect, useState } from 'react';
import { RESEND_COOLDOWN_SECONDS } from '@/lib/verification-email';

/** Counts down from `RESEND_COOLDOWN_SECONDS` after `start()`; `secondsLeft` is 0 when a resend is allowed. */
export function useResendCooldown(initialActive = false) {
  const [secondsLeft, setSecondsLeft] = useState(initialActive ? RESEND_COOLDOWN_SECONDS : 0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const start = useCallback(() => setSecondsLeft(RESEND_COOLDOWN_SECONDS), []);

  return { secondsLeft, start };
}
