import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import UserPage from '@/components/Layout/UserPage';
import TextField from '@/components/FormikFields/TextField';
import PasswordField from '@/components/FormikFields/PasswordField';
import { NotificationToggle } from '@/components/UI/notification-toggle';
import {
    getProfile,
    updateProfile,
    updatePassword,
    getNotificationPreferences,
    updateNotificationPreferences,
    type User,
} from '@/api/profile';
import { getSubscription, cancelSubscription, type SubscriptionData } from '@/api/subscription';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

interface ProfileFormValues {
  name: string;
  email: string;
}

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const planNames = {
  free: 'FREE',
  starter: 'STARTER',
  pro: 'CREATOR PRO',
};

const planColors = {
  free: 'bg-gray-600',
  starter: 'bg-blue-600',
  pro: 'bg-gradient-to-r from-purple-500 to-pink-500',
};

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Notification preferences
  const [notifyShortsReady, setNotifyShortsReady] = useState(true);
  const [notifyExportReady, setNotifyExportReady] = useState(true);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const [userData, notificationPrefs] = await Promise.all([
          getProfile(),
          getNotificationPreferences().catch(() => ({
            notifyShortsReady: true,
            notifyExportReady: true,
            notifyProductUpdates: true,
          })),
        ]);
        setUser(userData);
        setNotifyShortsReady(notificationPrefs.notifyShortsReady);
        setNotifyExportReady(notificationPrefs.notifyExportReady);
        setNotifyProductUpdates(notificationPrefs.notifyProductUpdates);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch profile';
        ErrorNotification(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubscriptionError(null);
        const data = await getSubscription();
        setSubscriptionData(data);
      } catch {
        setSubscriptionError('Failed to load subscription data');
        setSubscriptionData(null);
      }
    };

    fetchSubscription();
  }, []);

  const profileInitialValues: ProfileFormValues = {
    name: user?.name || '',
    email: user?.email || '',
  };

  const profileValidationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const passwordInitialValues: PasswordFormValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const passwordValidationSchema = Yup.object({
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your password'),
  });

  const handlePasswordSubmit = async (values: PasswordFormValues, { resetForm, setSubmitting }: any) => {
    try {
      setIsUpdatingPassword(true);
      await updatePassword({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
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

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your subscription? You will be downgraded to the FREE plan immediately.'
      )
    ) {
      return;
    }

    try {
      setCancelling(true);
      await cancelSubscription();
      const data = await getSubscription();
      setSubscriptionData(data);
      SuccessNotification('Subscription cancelled. You have been downgraded to the FREE plan.');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to cancel subscription';
      ErrorNotification(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/subscription-plans');
  };

  const toggleNotification = async (type: 'shorts' | 'export' | 'product') => {
    const updateMap = {
      shorts: {
        key: 'notifyShortsReady' as const,
        setter: setNotifyShortsReady,
        current: notifyShortsReady,
      },
      export: {
        key: 'notifyExportReady' as const,
        setter: setNotifyExportReady,
        current: notifyExportReady,
      },
      product: {
        key: 'notifyProductUpdates' as const,
        setter: setNotifyProductUpdates,
        current: notifyProductUpdates,
      },
    };

    const { key, setter, current } = updateMap[type];
    const newValue = !current;

    setter(newValue);

    try {
      await updateNotificationPreferences({ [key]: newValue });
      SuccessNotification('Notification preference updated');
    } catch (error: any) {
      setter(current);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update preference';
      ErrorNotification(errorMessage);
    }
  };

  const handleProfileSubmit = async (values: ProfileFormValues, { setSubmitting }: any) => {
    try {
      setIsUpdatingProfile(true);
      const isGoogleUser = user?.provider === 'google';
      const updateData = {
        name: values.name,
        email: isGoogleUser ? user?.email : values.email,
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

  const calculatePercentage = (used: number, limit: number) =>
    limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

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
  const subscription = subscriptionData?.subscription;
  const limits = subscriptionData?.limits;

  return (
    <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
      <div className="max-w-6xl mx-auto pb-8">
        <button
          onClick={() => navigate('/settings')}
          className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
        >
          ← Back to Settings
        </button>

        <h1
          className="text-3xl md:text-4xl font-black mb-8 uppercase tracking-wide"
          style={{
            background: 'linear-gradient(90deg, #ef4444, #ec4899, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          PROFILE
        </h1>

        {/* Section 1: Profile Information */}
        <section className="rounded-2xl border border-white/5 bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-6">PROFILE INFORMATION</h2>
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
                  helpText={isGoogleUser ? 'Email is managed by Google and cannot be changed' : undefined}
                  autoComplete="email"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || isUpdatingProfile || !isValid || !dirty}
                  className="w-full h-12 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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

        {/* Section 2: Subscription & Usage */}
        <section className="rounded-2xl border border-white/5 bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-6">SUBSCRIPTION & USAGE</h2>

          {subscriptionError && !subscription ? (
            <div className="text-red-400 text-sm py-4">{subscriptionError}</div>
          ) : subscription && limits ? (
            <>
              {/* Current Plan */}
              <div
                className="rounded-lg p-6 mb-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-pink-500 font-bold text-sm mb-2">CURRENT PLAN</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`${
                          planColors[subscription.plan]
                        } text-white px-4 py-2 rounded-lg font-bold text-sm`}
                      >
                        {planNames[subscription.plan]}
                      </span>
                      <span className="text-green-400 text-sm">
                        Status: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>

                  {subscription.plan === 'free' ? (
                    <button
                      onClick={handleUpgrade}
                      className="px-6 py-2 text-white rounded-lg font-semibold text-sm transition-colors hover:opacity-90"
                      style={{
                        background: 'linear-gradient(135deg, #FF3CAC, #FF8C00)',
                        border: 'none',
                      }}
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              </div>

              {/* Video Analyses Usage */}
              <div
                className="rounded-lg p-6 mb-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg">VIDEO ANALYSES</h3>
                  <span className="text-gray-400 text-sm">
                    {subscription.usage.videosUsed} / {limits.videosPerMonth}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      calculatePercentage(subscription.usage.videosUsed, limits.videosPerMonth) >= 100
                        ? 'bg-red-500'
                        : calculatePercentage(subscription.usage.videosUsed, limits.videosPerMonth) >= 80
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${calculatePercentage(
                        subscription.usage.videosUsed,
                        limits.videosPerMonth
                      )}%`,
                    }}
                  />
                </div>
                {calculatePercentage(subscription.usage.videosUsed, limits.videosPerMonth) >= 100 && (
                  <p className="text-red-400 text-sm mt-2">
                    You&apos;ve reached your video limit for this period. Upgrade to analyze more videos.
                  </p>
                )}
              </div>

              {/* Chat Messages Usage */}
              <div
                className="rounded-lg p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg">CHAT MESSAGES</h3>
                  <span className="text-gray-400 text-sm">
                    {subscription.usage.chatMessagesUsed} / {limits.chatMessagesPerMonth}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      calculatePercentage(subscription.usage.chatMessagesUsed, limits.chatMessagesPerMonth) >= 100
                        ? 'bg-red-500'
                        : calculatePercentage(
                            subscription.usage.chatMessagesUsed,
                            limits.chatMessagesPerMonth
                          ) >= 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${calculatePercentage(
                        subscription.usage.chatMessagesUsed,
                        limits.chatMessagesPerMonth
                      )}%`,
                    }}
                  />
                </div>
                {calculatePercentage(
                  subscription.usage.chatMessagesUsed,
                  limits.chatMessagesPerMonth
                ) >= 100 && (
                  <p className="text-red-400 text-sm mt-2">
                    You&apos;ve reached your chat message limit. Upgrade for more messages.
                  </p>
                )}
              </div>

              {/* Usage Reset Note */}
              <div className="mt-6 flex items-start gap-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <span className="text-2xl">💡</span>
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Usage resets on your subscription anniversary date (
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}).
                  {subscription.plan === 'free' &&
                    ' Upgrade to get more videos and chat messages per month!'}
                </p>
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm py-4">Loading subscription data...</div>
          )}
        </section>

        {/* Section 3: Email Notifications (Dark Theme) */}
        <section className="rounded-2xl border border-white/5 bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-red-500 mb-6">EMAIL NOTIFICATIONS</h2>

          <div className="space-y-0">
            <NotificationToggle
              title="Shorts ready"
              description="Get notified when your Shorts are ready"
              enabled={notifyShortsReady}
              onToggle={() => toggleNotification('shorts')}
              variant="dark"
            />
            <NotificationToggle
              title="Export ready"
              description="Get notified when your exports are ready"
              enabled={notifyExportReady}
              onToggle={() => toggleNotification('export')}
              variant="dark"
            />
            <NotificationToggle
              title="Product updates"
              description="Get notified when we release new features"
              enabled={notifyProductUpdates}
              onToggle={() => toggleNotification('product')}
              variant="dark"
            />
          </div>
        </section>

        {/* Section 4: Change Password (only for local users) */}
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
