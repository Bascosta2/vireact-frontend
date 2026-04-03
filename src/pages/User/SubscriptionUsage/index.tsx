import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPage from '@/components/Layout/UserPage';

function SubscriptionUsage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/profile', { replace: true });
  }, [navigate]);

  return (
    <UserPage>
      <div className="px-4 py-8 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-400">Redirecting to profile...</p>
      </div>
    </UserPage>
  );
}

export default SubscriptionUsage;
