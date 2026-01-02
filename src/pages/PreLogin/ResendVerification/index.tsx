import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/FormikFields/TextField';
import Axios from '@/api';
import { SuccessNotification, ErrorNotification } from '@/utils/toast';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { Link } from 'react-router-dom';

interface FormValues {
  email: string;
}

function ResendVerification() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(true); // Start timer immediately
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const initialValues: FormValues = {
    email: ''
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeLeft]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (values: FormValues, { setSubmitting, setFieldError }: any) => {
    try {
      const response = await Axios.post('/auth/resend-verification', {
        email: values.email
      });

      if (response.data.success) {
        SuccessNotification('Verification email sent successfully!');
        setIsSubmitted(true);
        setIsTimerActive(true);
        setTimeLeft(60);
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);

      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';

      if (error.response?.status === 404) {
        setFieldError('email', 'No account found with this email address');
      } else if (error.response?.status === 400 && errorMessage.includes('already verified')) {
        setFieldError('email', 'This email is already verified');
      } else {
        ErrorNotification(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setIsSubmitted(false);
    setIsTimerActive(false);
    setTimeLeft(60);
  };

  if (isSubmitted) {
    return (
      <PreLoginPage>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="bg-dark-primary flex flex-col justify-center px-12 py-16 rounded-lg">
            {/* Main Heading */}
            <div className="mb-8">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Email Sent!
              </h1>
              <p className="text-white/80 mb-4">
                We've sent a verification email to your inbox. Please check your email and click the verification link.
              </p>
              <p className="text-white/60 text-sm mb-6">
                You need to wait {timeLeft} seconds before you can request another verification email.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors text-center block"
              >
                Go to Login
              </Link>
              <button
                onClick={handleSendAnother}
                disabled={isTimerActive}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                {isTimerActive ? `Wait ${timeLeft}s` : 'Send Another Email'}
              </button>
            </div>
          </div>
        </div>
      </PreLoginPage>
    );
  }

  return (
    <PreLoginPage>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-dark-primary flex flex-col justify-center px-12 py-16 rounded-lg w-full max-w-md">
        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Verify Your Email
          </h1>
          <p className="text-white/80 mb-4">
            We've sent a verification email to your email address. Please check your inbox and click the verification link.
          </p>
          <p className="text-white/60 text-sm mb-6">
            If you didn't receive the email, you can request another one after waiting {timeLeft} seconds.
          </p>
        </div>

        {/* Resend Form */}
        <div className="mb-6">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="space-y-4">
                <TextField
                  field="email"
                  label_text="Email Address"
                  placeholder="Enter your email address"
                  type="email"
                  required
                  autoComplete="email"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !dirty || isTimerActive}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : isTimerActive ? (
                    `Wait ${timeLeft}s before requesting another`
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-white">
            Already verified?{' '}
            <Link to="/login" className="underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>
        </div>
      </div>
    </PreLoginPage>
  );
}

export default ResendVerification;
