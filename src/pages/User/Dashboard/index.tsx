import { useState } from 'react';
import { useUser } from '@/redux/hooks/use-user';
import UserPage from '@/components/Layout/UserPage';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import DashboardHeader from '@/pages/User/Dashboard/Header';
import SelectFeatures from '@/pages/User/Dashboard/SelectFeatures';
import UploadPage from '@/pages/User/Dashboard/UploadPage';


type DashboardPage = 'features' | 'upload';

function Dashboard() {
  const { name } = useUser();
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<DashboardPage>('features');


  const handleAnalyze = (data: { type: 'url' | 'file'; content: string | File }) => {
    console.log('Analyzing:', data);
    console.log('Selected features:', selectedFeatureIds);
  };

  const handleBackToFeatures = () => {
    setCurrentPage('features');
  };

  return (
    <UserPage>
      {currentPage === 'features' ? (
        <div className="px-2 sm:px-4 py-6 sm:py-8">
          <DashboardHeader
            name={name}
            selectedFeatureIds={selectedFeatureIds} />

          <SelectFeatures
            selectedFeatureIds={selectedFeatureIds}
            setSelectedFeatureIds={setSelectedFeatureIds}
          />

          {/* Analyze Button */}
          <div className="flex justify-center mt-8 sm:mt-12">
            <button
              onClick={() => setCurrentPage('upload')}
              disabled={selectedFeatureIds.length === 0}
              className={`btn-secondary !rounded-full`}
            >
              <FaWandMagicSparkles className="w-5 h-5 mr-2" />
              Analyze
            </button>
          </div>
        </div>
      ) : (
        <UploadPage
          selectedFeatureIds={selectedFeatureIds}
          onBack={handleBackToFeatures}
          onAnalyze={handleAnalyze}
        />
      )}
    </UserPage>
  );
}

export default Dashboard;