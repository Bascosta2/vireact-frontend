import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Film, Loader2, LogOut, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Button } from '@/components/app/Button';
import { Tabs, type TabDef } from '@/components/app/Tabs';
import ConfirmationModal from '@/components/UI/ConfirmationModal';
import { useLogout } from '@/hooks/useLogout';
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
import { createPortalSession } from '@/api/subscription';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { useSubscription } from '@/redux/hooks/use-subscription';

interface ProfileFormValues {
  name: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const planNames: Record<'free' | 'premium' | 'pro' | 'enterprise', string> = {
  free: 'Free',
  premium: 'Premium',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

type SettingsTab = 'profile' | 'plan' | 'notifications' | 'password';

/** Settings page (/settings). Profile, plan, notifications and password are tabs; `?tab=` selects one. */
function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout } = useLogout();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  // Notification preferences. Video emails (short ready, report/export ready) are opt-in and start off;
  // new features and events start on. Same defaults as the backend user model.
  const [notifyShortsReady, setNotifyShortsReady] = useState(false);
  const [notifyExportReady, setNotifyExportReady] = useState(false);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(true);

  const {
    plan: subPlan,
    error: subError,
    lastFetchedAt,
    videosUsedThisPeriod,
    chatMessagesUsedThisPeriod,
    videosPerMonthLimit,
    chatMessagesPerMonthLimit,
    lifetimeFreeVideosUsed,
    lifetimeFreeVideoLimit,
    currentPeriodStart,
    currentPeriodEnd,
    subscriptionLifecycleStatus,
  } = useSubscription();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const [userData, notificationPrefs] = await Promise.all([
          getProfile(),
          getNotificationPreferences().catch(() => ({
            notifyShortsReady: false,
            notifyExportReady: false,
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
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
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
        currentPassword: values.currentPassword,
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

  const handleManageBilling = async () => {
    try {
      setLoadingPortal(true);
      setPortalError(null);
      const response = await createPortalSession();
      window.location.href = response.url;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to open billing portal';
      setPortalError(errorMessage);
      ErrorNotification(errorMessage);
    } finally {
      setLoadingPortal(false);
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

  // `limit` may be `null` for Enterprise unlimited tiers (per backend
  // PLAN_LIMITS). Treat null as 0% so the progress bar never fills and
  // the at-limit warnings never trigger for unlimited plans.
  const calculatePercentage = (used: number, limit: number | null) =>
    limit != null && limit > 0 ? Math.min((used / limit) * 100, 100) : 0;


  const tabs: TabDef<SettingsTab>[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'plan', label: 'Plan' },
    { id: 'notifications', label: 'Notifications' },
    ...(user?.provider === 'local' ? [{ id: 'password' as const, label: 'Password' }] : []),
  ];
  const requestedTab = searchParams.get('tab') as SettingsTab | null;
  const activeTab: SettingsTab = tabs.some((t) => t.id === requestedTab) ? (requestedTab as SettingsTab) : 'profile';
  const setActiveTab = (tab: SettingsTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'profile') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  if (isLoading) {
    return (
      <UserPage>
        <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-10">
          <PageHeader title="Settings" />
          <div className="flex justify-center py-8" role="status">
            <Loader2 className="h-6 w-6 text-fg-muted motion-safe:animate-spin" aria-hidden="true" />
            <span className="sr-only">Loading settings</span>
          </div>
        </div>
      </UserPage>
    );
  }

  if (!user) {
    return (
      <UserPage>
        <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-10">
          <PageHeader title="Settings" />
          <p role="alert" className="text-fg-muted">We couldn't load your profile. Refresh the page to try again.</p>
        </div>
      </UserPage>
    );
  }

  const isGoogleUser = user.provider === 'google';
  const hasSubscriptionData = subPlan != null && lastFetchedAt != null;
  const subscription = hasSubscriptionData
    ? {
        plan: subPlan,
        status: (subscriptionLifecycleStatus ?? 'active') as
          | 'active'
          | 'cancelled'
          | 'expired'
          | 'trial',
        currentPeriodStart: currentPeriodStart ?? '',
        currentPeriodEnd: currentPeriodEnd ?? '',
        usage: {
          videosUsed: videosUsedThisPeriod ?? 0,
          chatMessagesUsed: chatMessagesUsedThisPeriod ?? 0,
        },
      }
    : null;
  const limits = hasSubscriptionData
    ? {
        videosPerMonth: videosPerMonthLimit,
        chatMessagesPerMonth: chatMessagesPerMonthLimit,
        lifetimeFreeVideosUsed: lifetimeFreeVideosUsed ?? 0,
        lifetimeFreeVideoLimit,
      }
    : null;
  const subscriptionLoadError = subError && !lastFetchedAt;

  return (
    <UserPage>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8 md:py-10">
        <PageHeader title="Settings" />

        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} label="Settings sections">
          {activeTab === 'profile' && (
            <section className={cardClass} aria-labelledby="settings-profile">
              <h2 id="settings-profile" className={sectionTitleClass}>Profile</h2>
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
                      label_text="Full name"
                      placeholder="Enter your full name"
                      type="text"
                      required
                      autoComplete="name"
                    />

                    <TextField
                      field="email"
                      label_text="Email address"
                      placeholder="Enter your email"
                      type="email"
                      required
                      isDisabled={isGoogleUser}
                      helpText={isGoogleUser ? 'Email is managed by Google and cannot be changed' : undefined}
                      autoComplete="email"
                    />

                    <Button type="submit" disabled={isSubmitting || isUpdatingProfile || !isValid || !dirty}>
                      {isSubmitting || isUpdatingProfile ? 'Saving' : 'Save changes'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </section>
          )}

          {activeTab === 'plan' && (
            <section className={cardClass} aria-labelledby="settings-plan">
              <h2 id="settings-plan" className={sectionTitleClass}>Plan and usage</h2>

              {subscriptionLoadError && !subscription ? (
                <p role="alert" className="text-sm text-danger">We couldn't load your plan. Refresh the page to try again.</p>
              ) : subscription && limits ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-fg-muted">Current plan</p>
                      <p className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-lg font-semibold text-fg">{planNames[subscription.plan]}</span>
                        <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </p>
                      {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
                        <p className="tabular mt-1 text-sm text-fg-muted">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} to{' '}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {subscription.plan === 'free' && <Button onClick={handleUpgrade}>Upgrade</Button>}
                    {(subscription.plan === 'premium' || subscription.plan === 'pro') && (
                      <div className="flex flex-wrap gap-3">
                        <Button onClick={() => navigate('/subscription-plans')}>Change plan</Button>
                        <Button variant="secondary" onClick={handleManageBilling} disabled={loadingPortal}>
                          {loadingPortal ? 'Opening' : 'Manage billing'}
                        </Button>
                      </div>
                    )}
                  </div>
                  {portalError && <p role="alert" className="text-sm text-danger">{portalError}</p>}

                  {subscription.plan === 'free' &&
                    lifetimeFreeVideoLimit != null &&
                    (lifetimeFreeVideosUsed ?? 0) < lifetimeFreeVideoLimit && (
                      <p className="tabular rounded-lg border border-line bg-canvas p-4 text-sm text-fg">
                        You have used {lifetimeFreeVideosUsed ?? 0} of {lifetimeFreeVideoLimit} free trial videos.{' '}
                        <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent underline underline-offset-2">
                          Upgrade for monthly analyses
                        </Link>
                      </p>
                    )}

                  {subscription.plan === 'free' &&
                    lifetimeFreeVideoLimit != null &&
                    (lifetimeFreeVideosUsed ?? 0) >= lifetimeFreeVideoLimit && (
                      <p className="rounded-lg border border-line bg-canvas p-4 text-sm text-fg">
                        You&apos;ve used your free trial.{' '}
                        <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent underline underline-offset-2">
                          Upgrade to analyze more videos
                        </Link>
                      </p>
                    )}

                  <UsageBar
                    label="Video analyses"
                    used={subscription.usage.videosUsed}
                    limit={limits.videosPerMonth}
                    atLimitText="You've reached your video limit for this period. Upgrade to analyze more videos."
                    percent={calculatePercentage(subscription.usage.videosUsed, limits.videosPerMonth)}
                  />
                  <UsageBar
                    label="Chat messages"
                    used={subscription.usage.chatMessagesUsed}
                    limit={limits.chatMessagesPerMonth}
                    atLimitText="You've reached your chat message limit. Upgrade for more messages."
                    percent={calculatePercentage(subscription.usage.chatMessagesUsed, limits.chatMessagesPerMonth)}
                  />

                  {subscription.currentPeriodEnd && (
                    <p className="text-sm text-fg-muted">
                      Usage resets on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                    </p>
                  )}
                </div>
              ) : (
                <p role="status" className="text-sm text-fg-muted">Loading your plan</p>
              )}
            </section>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <section className={cardClass} aria-labelledby="settings-notifications-news">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h2 id="settings-notifications-news" className="text-lg font-semibold text-fg">Vireact news</h2>
                  <span className="app-label">Email</span>
                </div>
                <p className="text-sm text-fg-muted">Hear about launches and events. On unless you turn it off.</p>
                <div className="mt-2">
                  <NotificationToggle
                    icon={<Sparkles className="h-5 w-5" />}
                    title="New features and events"
                    description="When we release new features or host creator events"
                    enabled={notifyProductUpdates}
                    onToggle={() => toggleNotification('product')}
                  />
                </div>
              </section>

              <section className={cardClass} aria-labelledby="settings-notifications-videos">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h2 id="settings-notifications-videos" className="text-lg font-semibold text-fg">Your videos</h2>
                  <span className="app-label">Email</span>
                </div>
                <p className="text-sm text-fg-muted">Off by default. Turn these on if you want an email for every video.</p>
                <div className="mt-2">
                  <NotificationToggle
                    icon={<Film className="h-5 w-5" />}
                    title="Short ready"
                    description="When a short you uploaded is ready to view"
                    enabled={notifyShortsReady}
                    onToggle={() => toggleNotification('shorts')}
                  />
                  <NotificationToggle
                    icon={<Bell className="h-5 w-5" />}
                    title="Analysis or export ready"
                    description="When a report or export for your short is finished"
                    enabled={notifyExportReady}
                    onToggle={() => toggleNotification('export')}
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'password' && user.provider === 'local' && (
            <section className={cardClass} aria-labelledby="settings-password">
              <h2 id="settings-password" className={sectionTitleClass}>Change password</h2>
              <Formik
                initialValues={passwordInitialValues}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({ isSubmitting, isValid, dirty }) => (
                  <Form className="space-y-4">
                    <PasswordField
                      field="currentPassword"
                      label_text="Current password"
                      placeholder="Enter your current password"
                      required
                      autoComplete="current-password"
                    />
                    <PasswordField
                      field="newPassword"
                      label_text="New password"
                      placeholder="Enter your new password"
                      required
                      autoComplete="new-password"
                    />
                    <PasswordField
                      field="confirmPassword"
                      label_text="Confirm new password"
                      placeholder="Confirm your new password"
                      required
                      autoComplete="new-password"
                    />
                    <Button type="submit" disabled={isSubmitting || isUpdatingPassword || !isValid || !dirty}>
                      {isSubmitting || isUpdatingPassword ? 'Updating' : 'Update password'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </section>
          )}
        </Tabs>

        <div className="mt-10 border-t border-line pt-6 md:hidden">
          <Button variant="secondary" fullWidth onClick={() => setLogoutOpen(true)}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
        title="Log out?"
        message="You'll need to sign in again to see your videos."
        confirmText="Log out"
        cancelText="Cancel"
      />
    </UserPage>
  );
}

const cardClass = 'app-panel p-5 md:p-6';
const sectionTitleClass = 'mb-5 text-lg font-semibold text-fg';

function UsageBar({
  label,
  used,
  limit,
  percent,
  atLimitText,
}: {
  label: string;
  used: number;
  limit: number | null;
  percent: number;
  atLimitText: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-fg">{label}</h3>
        <span className="tabular text-sm text-fg-muted">
          {used} of {limit === null ? 'unlimited' : limit}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className={`h-full origin-left rounded-full ${percent >= 100 ? 'bg-danger' : percent >= 80 ? 'bg-warning' : 'bg-accent'}`}
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
      {percent >= 100 && <p className="mt-2 text-sm text-danger">{atLimitText}</p>}
    </div>
  );
}

export default Profile;
