import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import TextField from '@/components/FormikFields/TextField';
import Axios from '@/api';
import PreLoginPage from '@/components/Layout/PreLoginPage';

/** /forgot-password: emails a reset link. Also how a Google-only account adds a password. */
function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <PreLoginPage>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col justify-center rounded-lg bg-dark-primary px-6 py-12 sm:px-12 sm:py-16">
          {sentTo ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">Check your email</h1>
              <p className="text-white/80">
                If <span className="font-semibold text-white">{sentTo}</span> has a Vireact account, a link to reset your password is on its way. It works for one hour.
              </p>
              <p className="text-sm text-white/60">No email after a few minutes? Check spam, or try again.</p>
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" className="btn-primary !w-full text-center">Back to log in</Link>
                <button type="button" onClick={() => setSentTo(null)} className="text-sm text-white/70 underline hover:text-white">
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-white">Forgot your password?</h1>
                <p className="text-white/80">
                  Enter your email and we will send you a link to set a new one. Signed up with Google? This adds a password too.
                </p>
              </div>
              <Formik
                initialValues={{ email: '' }}
                validationSchema={Yup.object({ email: Yup.string().email('Enter a valid email').required('Email is required') })}
                onSubmit={async (values, { setSubmitting }) => {
                  setError(null);
                  try {
                    await Axios.post('/auth/forgot-password', { email: values.email });
                    setSentTo(values.email);
                  } catch (err: unknown) {
                    const e = err as { response?: { status?: number; data?: { message?: string } } };
                    setError(
                      e.response?.status === 429
                        ? 'Too many attempts. Wait a few minutes and try again.'
                        : e.response?.data?.message || 'Something went wrong. Try again.'
                    );
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, isValid, dirty }) => (
                  <Form className="space-y-4">
                    <TextField field="email" label_text="Email Address" placeholder="Enter your email" type="email" required autoComplete="email" />
                    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
                    <button type="submit" disabled={isSubmitting || !isValid || !dirty} className="!w-full btn-primary">
                      {isSubmitting ? 'Sending...' : 'Send reset link'}
                    </button>
                  </Form>
                )}
              </Formik>
              <p className="mt-6 text-center text-sm text-white">
                Remembered it? <Link to="/login" className="text-secondary hover:underline">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </PreLoginPage>
  );
}

export default ForgotPassword;
