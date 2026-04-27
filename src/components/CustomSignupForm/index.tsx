import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import TextField from '@/components/FormikFields/TextField';
import PasswordField from '@/components/FormikFields/PasswordField';
import Axios from '@/api';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { isProviderConflictError } from '@/utils/authHelpers';
import { VITE_BACKEND_URL } from '@/constants';

interface CustomSignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  isLogin?: boolean;
}

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

const CustomSignupForm: React.FC<CustomSignupFormProps> = ({ 
  onSuccess, 
  onError, 
  isLogin = false 
}) => {
  const { login, updateAuthData } = useAuth();
  const { setUserData } = useUser();

  const initialValues: FormValues = {
    name: '',
    email: '',
    password: '',
    ...(isLogin ? {} : { confirmPassword: '' })
  };

  const validationSchema = Yup.object({
    name: isLogin ? Yup.string() : Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .matches(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces, dots, apostrophes, and hyphens')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    ...(isLogin ? {} : {
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password')
    })
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, setFieldError, setStatus }: any) => {
    // Clear any prior form-level error before each submit attempt.
    setStatus(undefined);
    try {
      if (isLogin) {
        // Handle login
        const response = await Axios.post('/auth/login', {
          email: values.email,
          password: values.password,
          role: 'user'
        });

        if (response.data.success) {
          const { accessToken, user } = response.data.data;
          
          // Map user data to match user slice structure
          const mappedUser = {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            preferences: user.preferences || {}
          };
          
          // Update Redux store. The refresh token is intentionally not handled
          // here — it lives only in an HttpOnly cookie set by the backend on
          // this response, and is sent back automatically via withCredentials
          // when the auth interceptor calls /auth/refresh-token.
          login(true);
          updateAuthData({ 
            token: accessToken, 
            role: 'user', 
            user: mappedUser 
          });
          setUserData(mappedUser);
          
          // Store access token + identity in localStorage for rehydration on
          // reload. Refresh token is never persisted client-side.
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('auth_role', 'user');
          localStorage.setItem('auth_user', JSON.stringify(mappedUser));
          localStorage.setItem('auth_is_authenticated', 'true');
          
          SuccessNotification('Login successful!');
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Redirect to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        // Handle signup
        const response = await Axios.post('/auth/signup', {
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'user'
        });

        if (response.data.success) {
          SuccessNotification('Account created successfully! Please check your email for verification.');
          
          // Show verification message and redirect to resend page after a delay
          setTimeout(() => {
            window.location.href = '/resend-verification';
          }, 2000);
          
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle network errors (when backend is unreachable)
      if (!error.response) {
        // Network error - backend unreachable or connection failed
        let networkErrorMessage = 'Unable to connect to server. ';
        
        if (!VITE_BACKEND_URL) {
          networkErrorMessage = 'Backend URL is not configured. Please check your environment variables.';
        } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          networkErrorMessage += 'Please check your internet connection or ensure the backend server is running.';
        } else if (error.message && error.message.includes('Network Error')) {
          networkErrorMessage += 'Please check your internet connection and try again.';
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          networkErrorMessage = 'Request timed out. Please try again later.';
        } else {
          networkErrorMessage += 'Please try again later.';
        }
        
        if (onError) {
          onError(networkErrorMessage);
        } else {
          ErrorNotification(networkErrorMessage);
        }
        return;
      }
      
      // Handle API errors (backend responded with error status). Backend
      // security hardening (commit 0837232) collapsed all credential failures
      // (unknown email, bad password, unverified email) to a single 401 with
      // message "Invalid email or password". We must NOT pattern-match on the
      // old distinguishable strings — they no longer arrive — and we must NOT
      // attribute the failure to a specific field, since neither field is
      // independently wrong from the server's POV.
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          (isLogin ? 'Login failed' : 'Signup failed');
      
      if (error.response?.status === 401 && isLogin) {
        // Generic credential failure on login. Surface as a top-level form
        // error so neither email nor password gets a misleading field marker.
        setStatus({ formError: errorMessage || 'Invalid email or password' });
      } else if (error.response?.status === 409) {
        // 409 has two distinct meanings:
        //   - login + cross-provider conflict: the account exists under a
        //     different provider (e.g. Google). Surface as a top-level error;
        //     it's about the account, not a specific field value.
        //   - signup + email already taken: keep the existing field-level
        //     surfacing so the user knows which field to change.
        const conflictMessage = error.response?.data?.message || 'User with this email already exists';
        if (isLogin) {
          setStatus({ formError: conflictMessage });
        } else if (isProviderConflictError(conflictMessage)) {
          setFieldError('email', conflictMessage);
        } else {
          setFieldError('email', 'User with this email already exists');
        }
      } else {
        // Anything else (network 4xx/5xx that isn't 401-login or 409) — fall
        // through to the existing error-surface path. Field-level Yup errors
        // are handled by Formik before we ever reach this catch.
        if (onError) {
          onError(errorMessage);
        } else {
          ErrorNotification(errorMessage);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, dirty, status }) => (
          <Form className="space-y-4">
            {!isLogin && (
              <TextField
                field="name"
                label_text="Full Name"
                placeholder="Enter your full name"
                type="text"
                required
                autoComplete="name"
              />
            )}
            
            <TextField
              field="email"
              label_text="Email Address"
              placeholder="Enter your email"
              type="email"
              required
              autoComplete="email"
            />
            
            <PasswordField
              field="password"
              label_text="Password"
              placeholder="Enter your password"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            
            {!isLogin && (
              <PasswordField
                field="confirmPassword"
                label_text="Confirm Password"
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
            )}

            {status?.formError && (
              <div
                role="alert"
                className="text-sm text-red-400"
                data-testid="form-error"
              >
                {status.formError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !isValid || !dirty}
              className="!w-full btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Log in' : 'Create Account'
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CustomSignupForm;
