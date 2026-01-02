import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';
import { createCheckoutSession } from '@/api/subscription';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: 'starter' | 'pro';
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 15,
    description: 'Perfect for individual creators getting started',
    features: [
      { text: '15 video analyses per month', included: true },
      { text: '100 chat messages per month', included: true },
      { text: 'All analysis features', included: true },
      { text: 'Email support', included: true },
      { text: 'Priority processing', included: false }
    ]
  },
  {
    id: 'pro',
    name: 'Creator Pro',
    price: 30,
    description: 'For serious content creators',
    features: [
      { text: '40 video analyses per month', included: true },
      { text: '400 chat messages per month', included: true },
      { text: 'All analysis features', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Priority processing', included: true }
    ],
    popular: true
  }
];

function SubscriptionPlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'starter' | 'pro' | null>(null);

  async function handleSubscribe(planId: 'starter' | 'pro') {
    try {
      setLoading(planId);
      const { url } = await createCheckoutSession(planId);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      setLoading(null);
      alert(err.response?.data?.message || 'Failed to create checkout session');
    }
  }

  return (
    <UserPage>
      <div className="px-4 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/subscription-usage')}
            className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
          >
            ← Back to Subscription
          </button>
          <h1 className="text-white text-3xl font-bebas-neue mb-3">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">
            Upgrade your account to analyze more videos and get more insights
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gray-800 rounded-xl p-8 border-2 transition-all ${
                plan.popular
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h2 className="text-white text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-white text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 text-lg">/month</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Subscribe Button */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading === plan.id ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-gray-400 text-sm">
            💳 Secure payment powered by Stripe
          </p>
          <p className="text-gray-400 text-sm">
            ✨ Cancel anytime, no questions asked
          </p>
          <p className="text-gray-400 text-sm">
            🔄 Usage resets monthly on your subscription anniversary
          </p>
        </div>
      </div>
    </UserPage>
  );
}

export default SubscriptionPlans;

