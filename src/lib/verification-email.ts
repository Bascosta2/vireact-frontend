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

/** A signup response for an account that already existed (created more than a minute ago) is a re-signup. */
export function isResignup(user: unknown, now: number = Date.now()): boolean {
  const createdAt = (user as { createdAt?: unknown } | undefined)?.createdAt;
  if (typeof createdAt !== 'string') return false;
  const created = Date.parse(createdAt);
  return !Number.isNaN(created) && now - created > 60_000;
}

export function outcomeNotice(outcome: VerificationOutcome, email: string, resignup = false): OutcomeNotice {
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
      if (resignup) {
        return { tone: 'warning', message: "We couldn't send the email right now. Try again in a few minutes.", canResend: true, canEditAddress: false };
      }
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
        message: `We sent a link to ${email}. Check spam and promotions too.${resignup ? ' Use the link in the newest email from us.' : ''}`,
        canResend: true,
        canEditAddress: false,
      };
  }
}

export type VerifyResult = 'verified' | 'already_verified' | 'invalid_link' | 'rate_limited' | 'failed';

export type VerifyStatus = 'verified' | 'already_verified' | 'verified_set_password';

export const SET_PASSWORD_NOTICE = 'Your email is verified. For your security, choose a new password.';

/** A 200 is success even when an older backend sends no `status`. */
export function readVerifyResponse(data: unknown): VerifyStatus {
  const status = (data as { data?: { status?: unknown } } | undefined)?.data?.status;
  if (status === 'already_verified' || status === 'verified_set_password') return status;
  return 'verified';
}

/** Path to choose a new password after a `verified_set_password` outcome, or null if the token is missing. */
export function setPasswordPath(data: unknown): string | null {
  const resetToken = (data as { data?: { resetToken?: unknown } } | undefined)?.data?.resetToken;
  return typeof resetToken === 'string' && resetToken ? `/reset-password?token=${encodeURIComponent(resetToken)}` : null;
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
