import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Axios from '@/api';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import { readVerifyResponse, readVerifyError, TOO_MANY_ATTEMPTS_MESSAGE } from '@/lib/verification-email';

type VerificationStatus = 'verifying' | 'success' | 'error';

const ERROR_MESSAGES = {
  no_token: 'This link is missing its verification code. Request a new link and use the newest email.',
  invalid_link: 'This link is invalid or was already used. If you already verified, just log in. Otherwise request a new link.',
  rate_limited: TOO_MANY_ATTEMPTS_MESSAGE,
  failed: "We couldn't verify your email right now. Try the link again in a moment, or request a new one.",
} as const;

// The link is single-use: keep the first request per token at module level so remounts reuse it.
const verifyRequests = new Map<string, Promise<{ data: unknown }>>();

function postVerifyOnce(token: string): Promise<{ data: unknown }> {
  const existing = verifyRequests.get(token);
  if (existing) return existing;
  const request = Axios.post('/auth/verify-email', { token });
  verifyRequests.set(token, request);
  return request;
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setUserData } = useUser();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus('error');
        setErrorMessage(ERROR_MESSAGES.no_token);
        return;
      }

      try {
        const response = await postVerifyOnce(token);
        setAlreadyVerified(readVerifyResponse(response.data) === 'already_verified');
        setVerificationStatus('success');
        // Signed-in users keep their session; just update what the app knows about them.
        if (isAuthenticated) setUserData({ isEmailVerified: true });
      } catch (error: unknown) {
        console.error('Email verification error:', error);
        const kind = readVerifyError(error);
        setErrorMessage(kind === 'invalid_link' || kind === 'rate_limited' ? ERROR_MESSAGES[kind] : ERROR_MESSAGES.failed);
        setVerificationStatus('error');
      }
    };

    verifyEmail();
    // Runs once per mount by design (see postVerifyOnce).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logged-out users are sent to log in a few seconds after success.
  useEffect(() => {
    if (verificationStatus !== 'success' || isAuthenticated) return undefined;
    const timer = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(timer);
  }, [verificationStatus, isAuthenticated, navigate]);

  return (
    <PreLoginPage>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-dark-primary flex flex-col justify-center px-12 py-16 rounded-lg w-full max-w-md">
          <div className="text-center">
            {verificationStatus === 'verifying' && (
              <>
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Verifying Your Email</h1>
                <p role="status" className="text-white/80">Please wait while we verify your email address...</p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <div className="mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">Email Verified!</h1>
                <p role="status" className="text-white/80 mb-6">
                  {alreadyVerified
                    ? 'Your email is already verified. You can log in.'
                    : isAuthenticated
                      ? 'Your email is verified. You are all set.'
                      : 'Your email is verified. You can log in now.'}
                </p>
                <div className="space-y-3">
                  <Link
                    to={isAuthenticated ? '/dashboard' : '/login'}
                    className="btn-secondary"
                  >
                    {isAuthenticated ? 'Continue' : 'Log in'}
                  </Link>
                  {!isAuthenticated && (
                    <p className="text-sm text-white/60">
                      You will be redirected to log in in a few seconds...
                    </p>
                  )}
                </div>
              </>
            )}

            {verificationStatus === 'error' && (
              <>
                <div className="mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">We couldn't verify this link</h1>
                <p role="alert" className="text-white/80 mb-6">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <Link to="/dashboard" className="btn-secondary">
                      Continue (use the banner to resend the link)
                    </Link>
                  ) : (
                    <>
                      <Link to={'/resend-verification'} className="btn-secondary">
                        Request a new link
                      </Link>
                      <Link to={'/login'} className="btn-outline">
                        Log in
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PreLoginPage>
  );
}

export default VerifyEmail;
