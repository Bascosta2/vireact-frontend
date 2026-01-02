import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Axios from '@/api';
import { SuccessNotification, ErrorNotification } from '@/utils/toast';
import PreLoginPage from '@/components/Layout/PreLoginPage';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('No verification token provided');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await Axios.post('/auth/verify-email', null, {
          params: { token }
        });

        if (response.data.success) {
          setVerificationStatus('success');
          SuccessNotification('Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        const errorMsg = error.response?.data?.message || 'Email verification failed';
        setErrorMessage(errorMsg);
        ErrorNotification(errorMsg);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

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
                <p className="text-white/80">Please wait while we verify your email address...</p>
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
                <p className="text-white/80 mb-6">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <div className="space-y-3">
                  <Link
                    to={'/login'}
                    className="btn-secondary"
                  >
                    Go to Login
                  </Link>
                  <p className="text-sm text-white/60">
                    You will be automatically redirected in a few seconds...
                  </p>
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
                <h1 className="text-4xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-white/80 mb-6">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  <Link
                    to={'/resend-verification'}
                    className="btn-secondary"
                  >
                    Resend Verification Email
                  </Link>
                  <Link
                    to={'/login'}
                    className="btn-outline"
                  >
                    Go to Login
                  </Link>
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
