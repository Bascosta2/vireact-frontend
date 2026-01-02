import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import UserPage from '@/components/Layout/UserPage';
import TextField from '@/components/FormikFields/TextField';
import PasswordField from '@/components/FormikFields/PasswordField';
import { getProfile, updateProfile, updatePassword, type User } from '@/api/profile';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

interface ProfileFormValues {
  name: string;
  email: string;
}

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await getProfile();
        setUser(userData);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch profile';
        ErrorNotification(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const profileInitialValues: ProfileFormValues = {
    name: user?.name || '',
    email: user?.email || ''
  };

  const profileValidationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  const passwordInitialValues: PasswordFormValues = {
    newPassword: '',
    confirmPassword: ''
  };

  const passwordValidationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your password')
  });

  const handlePasswordSubmit = async (values: PasswordFormValues, { resetForm, setSubmitting }: any) => {
    try {
      setIsUpdatingPassword(true);
      await updatePassword({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      SuccessNotification('Password updated successfully');
      resetForm();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update password';
      ErrorNotification(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <UserPage>
        <div className="px-4 py-8">
          <h1 className="text-white text-2xl font-bebas-neue mb-4">Profile</h1>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </UserPage>
    );
  }

  if (!user) {
    return (
      <UserPage>
        <div className="px-4 py-8">
          <h1 className="text-white text-2xl font-bebas-neue mb-4">Profile</h1>
          <p className="text-gray-300">Failed to load profile information.</p>
        </div>
      </UserPage>
    );
  }

  const isLocalUser = user.provider === 'local';
  const isGoogleUser = user.provider === 'google';

  const handleProfileSubmit = async (values: ProfileFormValues, { setSubmitting }: any) => {
    try {
      setIsUpdatingProfile(true);
      // For Google users, send current email (unchanged) since email field is disabled
      // The backend will validate that email hasn't changed for Google users
      const updateData = { 
        name: values.name, 
        email: isGoogleUser ? user.email : values.email 
      };
      
      const updatedUser = await updateProfile(updateData);
      setUser(updatedUser);
      SuccessNotification('Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile';
      ErrorNotification(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
      setSubmitting(false);
    }
  };

  return (
    <UserPage>
      <div className="px-4 py-8 max-w-2xl mx-auto">
        <h1 className="text-white text-2xl font-bebas-neue mb-6">Profile</h1>

        {/* Section 1: Profile Information */}
        <section className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">Profile Information</h2>
          <Formik
            initialValues={profileInitialValues}
            validationSchema={profileValidationSchema}
            enableReinitialize
            onSubmit={handleProfileSubmit}
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="space-y-4">
                <TextField
                  field="name"
                  label_text="Full Name"
                  placeholder="Enter your full name"
                  type="text"
                  required
                  autoComplete="name"
                />

                <TextField
                  field="email"
                  label_text="Email Address"
                  placeholder="Enter your email"
                  type="email"
                  required
                  isDisabled={isGoogleUser}
                  helpText={isGoogleUser ? "Email is managed by Google and cannot be changed" : undefined}
                  autoComplete="email"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || isUpdatingProfile || !isValid || !dirty}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isUpdatingProfile ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </section>

        {/* Section 2: Change Password (only for local users) */}
        {isLocalUser && (
          <section>
            <h2 className="text-white text-xl font-semibold mb-4">Change Password</h2>
            <Formik
              initialValues={passwordInitialValues}
              validationSchema={passwordValidationSchema}
              onSubmit={handlePasswordSubmit}
            >
              {({ isSubmitting, isValid, dirty }) => (
                <Form className="space-y-4">
                  <PasswordField
                    field="newPassword"
                    label_text="New Password"
                    placeholder="Enter your new password"
                    required
                    autoComplete="new-password"
                  />

                  <PasswordField
                    field="confirmPassword"
                    label_text="Confirm New Password"
                    placeholder="Confirm your new password"
                    required
                    autoComplete="new-password"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || isUpdatingPassword || !isValid || !dirty}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isUpdatingPassword ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </section>
        )}
      </div>
    </UserPage>
  );
}

export default Profile;
