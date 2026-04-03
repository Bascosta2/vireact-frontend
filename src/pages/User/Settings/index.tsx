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
      navigate('/profile');
    }
  };

  return (
    <UserPage mainClassName="pt-8 md:pt-10 px-6 md:px-8">
      <div className="max-w-6xl mx-auto pb-8">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-white mb-6" style={{ fontFamily: 'Impact, Anton, "Arial Black", sans-serif' }}>
          Settings
        </h1>
        
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
          <div className="rounded-2xl border border-white/5 bg-gray-900/50 backdrop-blur-sm p-6 md:p-8">
            <h2 className="text-white text-xl font-semibold mb-4">General Settings</h2>
            <p className="text-gray-300">Your general settings and preferences will appear here.</p>
          </div>
        )}
      </div>
    </UserPage>
  );
}

export default Settings;
