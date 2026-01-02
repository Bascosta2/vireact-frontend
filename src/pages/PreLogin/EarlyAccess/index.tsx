import React, { useState } from 'react';
import PreLoginPage from '@/components/Layout/PreLoginPage';
import SectionHeader from '@/components/SectionHeader';
import Benefits from './components/Benefits';
import EarlyAccessForm from './components/Form';
import { IoSparkles } from 'react-icons/io5';
import OnSuccess from '@/pages/PreLogin/EarlyAccess/components/OnSuccess';

function EarlyAccess() {
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <PreLoginPage>
        <OnSuccess />
      </PreLoginPage>
    );
  }

  return (
    <PreLoginPage>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Header Section */}
          <SectionHeader
            badge="Early Access"
            title="Be among the first to access our free content rescources and AI-powered video analysis platform"
            icon={<IoSparkles className="w-4 h-4 text-gray-400" />}
            className="text-center mb-16"
          />

          {/* Benefits Section - Top */}
          <div className="mb-12">
            <Benefits />
          </div>

          {/* Form Section - Full Width */}
          <div className="w-full">
            <EarlyAccessForm onSuccess={() => setIsSuccess(true)} />
          </div>
        </div>
      </div>
    </PreLoginPage>
  );
}

export default EarlyAccess;