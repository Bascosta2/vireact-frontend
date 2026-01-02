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

  const handleSubmit = async (values: FormValues, { setSubmitting, setFieldError }: any) => {
    try {
      if (isLogin) {
        // Handle login
        const response = await Axios.post('/auth/login', {
          email: values.email,
          password: values.password,
          role: 'user'
        });

        if (response.data.success) {
          const { accessToken, refreshToken, user } = response.data.data;
          
          // Map user data to match user slice structure
          const mappedUser = {
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            preferences: user.preferences || {}
          };
          
          // Update Redux store
          login(true);
          updateAuthData({ 
            token: accessToken, 
            refreshToken: refreshToken || '',
            role: 'user', 
            user: mappedUser 
          });
          setUserData(mappedUser);
          
          // Store tokens in localStorage for persistence
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
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
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          (isLogin ? 'Login failed' : 'Signup failed');
      
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.message || 'User with this email already exists';
        if (isProviderConflictError(errorMessage)) {
          setFieldError('email', errorMessage);
        } else {
          setFieldError('email', 'User with this email already exists');
        }
      } else if (error.response?.status === 401) {
        // Handle authentication failures (401 status)
        if (errorMessage.includes('verify your email')) {
          setFieldError('email', 'Please verify your email first. Check your inbox for a verification link.');
        } else {
          setFieldError('password', 'Invalid password');
        }
      } else if (error.response?.status === 400) {
        // Handle validation errors and other 400 status responses
        if (errorMessage.includes('User Not Found')) {
          setFieldError('email', 'User not found');
        } else if (errorMessage.includes('Invalid Password')) {
          setFieldError('password', 'Invalid password');
        } else {
          setFieldError('password', 'Invalid password');
        }
      } else if (error.response?.status === 404) {
        setFieldError('email', 'User not found');
      } else {
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
        {({ isSubmitting, isValid, dirty }) => (
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
