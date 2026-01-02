import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';

type TabType = 'general' | 'subscription';

function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const navigate = useNavigate();

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'subscription') {
      navigate('/subscription-usage');
    }
  };

  return (
    <UserPage>
      <div className="px-4 py-8">
        <h1 className="text-white text-2xl font-bebas-neue mb-6">Settings</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => handleTabClick('general')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => handleTabClick('subscription')}
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'subscription'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Subscription & Usage
          </button>
        </div>

        {/* General Tab Content */}
        {activeTab === 'general' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">General Settings</h2>
            <p className="text-gray-300">Your general settings and preferences will appear here.</p>
          </div>
        )}
      </div>
    </UserPage>
  );
}

export default Settings;
