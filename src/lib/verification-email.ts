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

export const SET_PASSWORD_LOGIN_MESSAGE = 'For your security, please set a new password.';

/** Login 409 with code SET_PASSWORD: the account has no password, so send the user to Forgot password. */
export function isSetPasswordLoginError(error: unknown): boolean {
  const response = (error as { response?: { status?: number; data?: { data?: { code?: string } } } } | undefined)?.response;
  return response?.status === 409 && response.data?.data?.code === 'SET_PASSWORD';
}

export function forgotPasswordPath(email: string): string {
  return `/forgot-password?email=${encodeURIComponent(email)}`;
}

/** ---- Changing the account email (PATCH /profile, POST /auth/confirm-email-change) ---- */

export interface EmailChange {
  pendingEmail: string;
  expiresAt?: string;
}

/** `emailChange` from a profile update: the waiting change, or null when only the name changed. */
export function readEmailChange(data: unknown): EmailChange | null {
  const change = (data as { emailChange?: { pendingEmail?: unknown; expiresAt?: unknown } | null } | undefined)?.emailChange;
  if (!change || typeof change.pendingEmail !== 'string' || !change.pendingEmail) return null;
  return { pendingEmail: change.pendingEmail, expiresAt: typeof change.expiresAt === 'string' ? change.expiresAt : undefined };
}

export function emailChangeSentMessage(pendingEmail: string, currentEmail: string): string {
  return `Check ${pendingEmail} for a link to confirm your new email. Until then you'll keep signing in with ${currentEmail}.`;
}

export function pendingEmailNotice(pendingEmail: string, currentEmail: string): string {
  return `Waiting for you to confirm ${pendingEmail}. Open the link we sent there. Until then you'll keep signing in with ${currentEmail}.`;
}

/** True when saving would change the email, so the current password must be asked for. */
export function needsPasswordForEmailChange(newEmail: string, currentEmail: string, provider: string): boolean {
  return provider === 'local' && newEmail.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
}

export const SET_PASSWORD_FIRST_MESSAGE = 'Set a password first';

/** 403 with code SET_PASSWORD_FIRST: the account has no password yet, so it cannot change its email. */
export function isSetPasswordFirstError(error: unknown): boolean {
  const response = (error as { response?: { status?: number; data?: { code?: string; data?: { code?: string } } } } | undefined)?.response;
  return response?.status === 403 && (response.data?.data?.code === 'SET_PASSWORD_FIRST' || response.data?.code === 'SET_PASSWORD_FIRST');
}

/** Plain-language message for each way saving the profile can fail. */
export function profileUpdateErrorMessage(error: unknown): string {
  const response = (error as { response?: { status?: number; data?: { message?: string } } } | undefined)?.response;
  if (isSetPasswordFirstError(error)) return SET_PASSWORD_FIRST_MESSAGE;
  switch (response?.status) {
    case 400:
      return response.data?.message || 'Please check the details you entered and try again.';
    case 401:
      return 'That password is not correct.';
    case 403:
      return 'Your email is managed by Google and cannot be changed here.';
    case 409:
      return 'That email is already used by another account.';
    case 429:
      return TOO_MANY_ATTEMPTS_MESSAGE;
    case 503:
      return "We couldn't send the confirmation email right now. Nothing was changed. Try again in a few minutes.";
    default:
      return 'Failed to update profile';
  }
}

export type ConfirmEmailChangeError = 'invalid_link' | 'email_taken' | 'rate_limited' | 'failed';

export const CONFIRM_EMAIL_CHANGE_ERRORS: Record<ConfirmEmailChangeError, string> = {
  invalid_link: 'This link is invalid or already used',
  email_taken: 'That email is already used by another account',
  rate_limited: TOO_MANY_ATTEMPTS_MESSAGE,
  failed: "We couldn't confirm your new email right now. Try the link again in a moment.",
};

export function readConfirmEmailChangeError(error: unknown): ConfirmEmailChangeError {
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status;
  if (status === 400) return 'invalid_link';
  if (status === 409) return 'email_taken';
  if (status === 429) return 'rate_limited';
  return 'failed';
}

/** The new address from a confirm response body (`{ data: { email } }`), or null if it is missing. */
export function readConfirmedEmail(body: unknown): string | null {
  const email = (body as { data?: { email?: unknown } } | undefined)?.data?.email;
  return typeof email === 'string' && email ? email : null;
}

export function loginPathWithEmail(email: string): string {
  return `/login?email=${encodeURIComponent(email)}`;
}
