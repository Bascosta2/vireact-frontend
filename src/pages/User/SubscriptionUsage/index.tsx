import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import { getSubscription, cancelSubscription, type SubscriptionData } from '@/api/subscription';

function SubscriptionUsage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(function loadSubscription() {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      setLoading(true);
      setError(null);
      const subscriptionData = await getSubscription();
      setData(subscriptionData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the FREE plan immediately.')) {
      return;
    }

    try {
      setCancelling(true);
      await cancelSubscription();
      await fetchSubscription();
      alert('Subscription cancelled successfully. You have been downgraded to the FREE plan.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  }

  function handleUpgrade() {
    navigate('/subscription-plans');
  }

  if (loading) {
    return (
      <UserPage>
        <div className="px-4 py-8">
          <div className="text-center text-gray-400">Loading subscription data...</div>
        </div>
      </UserPage>
    );
  }

  if (error || !data) {
    return (
      <UserPage>
        <div className="px-4 py-8">
          <div className="text-center text-red-400">{error || 'Failed to load subscription'}</div>
        </div>
      </UserPage>
    );
  }

  const { subscription, limits } = data;
  const videoPercentage = (subscription.usage.videosUsed / limits.videosPerMonth) * 100;
  const chatPercentage = (subscription.usage.chatMessagesUsed / limits.chatMessagesPerMonth) * 100;

  const planColors = {
    free: 'bg-gray-600',
    starter: 'bg-blue-600',
    pro: 'bg-purple-600'
  };

  const planNames = {
    free: 'FREE',
    starter: 'STARTER',
    pro: 'CREATOR PRO'
  };

  return (
    <UserPage>
      <div className="px-4 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/settings')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back to Settings
          </button>
          <h1 className="text-white text-2xl font-bebas-neue">Subscription & Usage</h1>
        </div>

        {/* Current Plan Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-xl font-semibold mb-2">Current Plan</h2>
              <div className="flex items-center gap-3">
                <span className={`${planColors[subscription.plan]} text-white px-4 py-1 rounded-full text-sm font-bold`}>
                  {planNames[subscription.plan]}
                </span>
                <span className="text-gray-400 text-sm">
                  Status: <span className="text-green-400 capitalize">{subscription.status}</span>
                </span>
              </div>
            </div>
            {subscription.plan === 'free' ? (
              <button
                onClick={handleUpgrade}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Upgrade Plan
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>

          {/* Billing Period */}
          <div className="text-sm text-gray-400 mt-4">
            <p>
              Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-6">
          {/* Video Usage */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Video Analyses</h3>
              <span className="text-gray-300 text-sm">
                {subscription.usage.videosUsed} / {limits.videosPerMonth}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  videoPercentage >= 100 ? 'bg-red-500' : videoPercentage >= 80 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(videoPercentage, 100)}%` }}
              />
            </div>
            {videoPercentage >= 100 && (
              <p className="text-red-400 text-sm mt-2">
                ⚠️ You've reached your video limit for this period. Upgrade to analyze more videos.
              </p>
            )}
          </div>

          {/* Chat Usage */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Chat Messages</h3>
              <span className="text-gray-300 text-sm">
                {subscription.usage.chatMessagesUsed} / {limits.chatMessagesPerMonth}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  chatPercentage >= 100 ? 'bg-red-500' : chatPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(chatPercentage, 100)}%` }}
              />
            </div>
            {chatPercentage >= 100 && (
              <p className="text-red-400 text-sm mt-2">
                ⚠️ You've reached your chat message limit for this period. Upgrade for more messages.
              </p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-6">
          <p className="text-blue-300 text-sm">
            💡 <strong>Note:</strong> Usage resets on your subscription anniversary date ({new Date(subscription.currentPeriodEnd).toLocaleDateString()}).
            {subscription.plan === 'free' && ' Upgrade to get more videos and chat messages per month!'}
          </p>
        </div>
      </div>
    </UserPage>
  );
}

export default SubscriptionUsage;

