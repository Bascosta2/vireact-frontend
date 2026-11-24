/** Logic for the "verify your email" flow: what the backend said, and what we tell the user. */

export type VerificationOutcome = 'sent' | 'recent' | 'bad_address' | 'unavailable';

export const RESEND_COOLDOWN_SECONDS = 60;

export const TOO_MANY_ATTEMPTS_MESSAGE = 'Too many attempts, wait a few minutes and try again.';

export interface OutcomeNotice {
  tone: 'success' | 'warning';
  message: string;
  /** True when the user can request another link (after the cooldown). */
  canResend: boolean;
  /** True when the user should go back and fix the address they typed. */
  canEditAddress: boolean;
}

const OUTCOMES: VerificationOutcome[] = ['sent', 'recent', 'bad_address', 'unavailable'];

/**
 * Read the outcome from a signup or resend response body (`data` of the API envelope).
 * Newer backends send `verificationEmail`; older ones only a `verificationEmailSent` boolean.
 * Anything unrecognised is treated as "sent" so a missing field never shows a false alarm.
 */
export function readVerificationOutcome(data: unknown): VerificationOutcome {
  const body = (data ?? {}) as { verificationEmail?: unknown; verificationEmailSent?: unknown };
  if (typeof body.verificationEmail === 'string' && OUTCOMES.includes(body.verificationEmail as VerificationOutcome)) {
    return body.verificationEmail as VerificationOutcome;
  }
  if (body.verificationEmailSent === false) return 'unavailable';
  return 'sent';
}

export function outcomeNotice(outcome: VerificationOutcome, email: string): OutcomeNotice {
  switch (outcome) {
    case 'recent':
      return { tone: 'success', message: 'We just sent one. Check your inbox.', canResend: true, canEditAddress: false };
    case 'bad_address':
      return {
        tone: 'warning',
        message: "That address can't receive email. Check it for typos.",
        canResend: false,
        canEditAddress: true,
      };
    case 'unavailable':
      return {
        tone: 'warning',
        message: "We couldn't send the email right now. You can still use Vireact; we'll let you verify later.",
        canResend: true,
        canEditAddress: false,
      };
    case 'sent':
    default:
      return {
        tone: 'success',
        message: `We sent a link to ${email}. Check spam and promotions too.`,
        canResend: true,
        canEditAddress: false,
      };
  }
}

export type VerifyResult = 'verified' | 'already_verified' | 'invalid_link' | 'rate_limited' | 'failed';

/** A 200 is success even when an older backend sends no `status`. */
export function readVerifyResponse(data: unknown): 'verified' | 'already_verified' {
  const status = (data as { data?: { status?: unknown } } | undefined)?.data?.status;
  return status === 'already_verified' ? 'already_verified' : 'verified';
}

/** 400 means the link is invalid or already used; 429 means slow down; anything else is a real failure. */
export function readVerifyError(error: unknown): VerifyResult {
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status;
  if (status === 400) return 'invalid_link';
  if (status === 429) return 'rate_limited';
  return 'failed';
}

export function resendErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { status?: number; data?: { message?: string } } } | undefined)?.response;
  if (response?.status === 429) return TOO_MANY_ATTEMPTS_MESSAGE;
  return response?.data?.message || fallback;
}
