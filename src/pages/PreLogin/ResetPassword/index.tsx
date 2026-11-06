import { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import PasswordField from '@/components/FormikFields/PasswordField';
import Axios from '@/api';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import { SuccessNotification } from '@/utils/toast';

/** A reset signs out every device, so this browser's saved sign-in is cleared too. */
const clearLocalAuth = () => {
  try {
    ['accessToken', 'refreshToken', 'auth_role', 'auth_user', 'auth_is_authenticated'].forEach((key) => localStorage.removeItem(key));
  } catch {
    /* storage blocked: nothing to clear */
  }
};

/** /reset-password?token=...: set a new password from the emailed link (works signed in or out). */
function ResetPassword() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') ?? '', []);
  const [error, setError] = useState<string | null>(null);
  const validLink = /^[a-f0-9]{64}$/.test(token);

  return (
    <PreLoginPage>
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col justify-center rounded-lg bg-dark-primary px-6 py-12 sm:px-12 sm:py-16">
          {!validLink ? (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">This link does not work</h1>
              <p className="text-white/80">The reset link is incomplete or was copied wrong. Request a new one and open it straight from the email.</p>
              <Link to="/forgot-password" className="btn-primary !w-full text-center">Request a new link</Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold text-white">Set a new password</h1>
                <p className="text-white/80">You will be signed out on every device, then you can log in with the new password.</p>
              </div>
              <Formik
                initialValues={{ password: '', confirmPassword: '' }}
                validationSchema={Yup.object({
                  password: Yup.string().min(6, 'Use at least 6 characters').max(128, 'Use at most 128 characters').required('Password is required'),
                  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm your password'),
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  setError(null);
                  try {
                    await Axios.post('/auth/reset-password', { token, password: values.password });
                    clearLocalAuth();
                    SuccessNotification('Password updated. Log in with your new password.');
                    // Full reload so a previously signed-in session is dropped everywhere in the app.
                    window.location.replace('/login');
                  } catch (err: unknown) {
                    const e = err as { response?: { status?: number; data?: { message?: string } } };
                    setError(
                      e.response?.status === 429
                        ? 'Too many attempts. Wait a few minutes and try again.'
                        : e.response?.data?.message || 'Could not update the password. Try again.'
                    );
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, isValid, dirty }) => (
                  <Form className="space-y-4">
                    <PasswordField field="password" label_text="New password" placeholder="At least 6 characters" required autoComplete="new-password" />
                    <PasswordField field="confirmPassword" label_text="Confirm new password" placeholder="Type it again" required autoComplete="new-password" />
                    {error && (
                      <p role="alert" className="text-sm text-red-400">
                        {error}{' '}
                        {/expired|used|invalid/i.test(error) && <Link to="/forgot-password" className="underline">Request a new link</Link>}
                      </p>
                    )}
                    <button type="submit" disabled={isSubmitting || !isValid || !dirty} className="!w-full btn-primary">
                      {isSubmitting ? 'Saving...' : 'Save new password'}
                    </button>
                  </Form>
                )}
              </Formik>
            </>
          )}
        </div>
      </div>
    </PreLoginPage>
  );
}

export default ResetPassword;
