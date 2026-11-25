import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Axios from '@/api';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import {
  CONFIRM_EMAIL_CHANGE_ERRORS,
  loginPathWithEmail,
  readConfirmedEmail,
  readConfirmEmailChangeError,
  type ConfirmEmailChangeError,
} from '@/lib/verification-email';

type ConfirmStatus = 'confirming' | 'success' | 'error';

const MISSING_TOKEN_MESSAGE = 'This link is missing its confirmation code. Open the newest email we sent.';

// The link is single-use: keep the first request per token at module level so remounts reuse it.
const confirmRequests = new Map<string, Promise<{ data: unknown }>>();

// The token is stripped from the address bar once read, so a remount must remember it.
let rememberedToken: string | null = null;

function postConfirmOnce(token: string): Promise<{ data: unknown }> {
  const existing = confirmRequests.get(token);
  if (existing) return existing;
  const request = Axios.post('/auth/confirm-email-change', { token });
  confirmRequests.set(token, request);
  return request;
}

/** /confirm-email-change?token=...: finishes an email change. Works signed in or signed out. */
function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const { logout: clearAuth } = useAuth();
  const { clearUserData } = useUser();
  const [status, setStatus] = useState<ConfirmStatus>('confirming');
  const [newEmail, setNewEmail] = useState('');
  const [errorKind, setErrorKind] = useState<ConfirmEmailChangeError | 'no_token'>('invalid_link');

  useEffect(() => {
    const confirm = async () => {
      const token = searchParams.get('token') ?? rememberedToken;
      if (token) {
        rememberedToken = token;
        // Keep the one-time token out of history and screenshots.
        window.history.replaceState(window.history.state, '', window.location.pathname);
      }

      if (!token) {
        setErrorKind('no_token');
        setStatus('error');
        return;
      }

      try {
        const response = await postConfirmOnce(token);
        // The server signed out every device; drop the local session without calling the backend logout.
        clearAuth();
        clearUserData();
        setNewEmail(readConfirmedEmail(response.data) ?? '');
        setStatus('success');
      } catch (error: unknown) {
        console.error('Email change confirmation error:', error);
        setErrorKind(readConfirmEmailChangeError(error));
        setStatus('error');
      }
    };

    confirm();
    // Runs once per mount by design (see postConfirmOnce).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errorMessage = errorKind === 'no_token' ? MISSING_TOKEN_MESSAGE : CONFIRM_EMAIL_CHANGE_ERRORS[errorKind];

  return (
    <PreLoginPage>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-dark-primary flex flex-col justify-center px-12 py-16 rounded-lg w-full max-w-md">
          <div className="text-center">
            {status === 'confirming' && (
              <>
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" aria-hidden="true"></div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Confirming your new email</h1>
                <p role="status" className="text-white/80">Please wait a moment...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Email changed</h1>
                <p role="status" className="text-white/80 mb-6">
                  {newEmail ? `Your email is now ${newEmail}. Please sign in again.` : 'Your email was changed. Please sign in again.'}
                </p>
                <Link to={newEmail ? loginPathWithEmail(newEmail) : '/login'} className="btn-secondary">
                  Log in
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">We couldn't confirm this change</h1>
                <p role="alert" className="text-white/80 mb-6">{errorMessage}</p>
                <div className="space-y-3">
                  <Link to="/settings" className="btn-secondary">Go to Settings</Link>
                  <Link to="/login" className="btn-outline">Log in</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PreLoginPage>
  );
}

export default ConfirmEmailChange;
