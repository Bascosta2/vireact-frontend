import { useEffect } from 'react';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import { useNavigate } from 'react-router-dom';
import Axios from '@/api';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';

function GoogleCallback() {
  const { login, updateAuthData } = useAuth();
  const { setUserData } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth');
      const userData = urlParams.get('data');

      if (authStatus === 'success' && userData) {
        try {
          const decodedData = JSON.parse(decodeURIComponent(userData));

          // Map user data to match user slice structure (same as custom login)
          const mappedUser = {
            id: decodedData.user._id || decodedData.user.id,
            name: decodedData.user.name,
            email: decodedData.user.email,
            avatar: decodedData.user.avatar,
            preferences: decodedData.user.preferences || {}
          };

          // Update Redux store (matching custom login flow)
          login(true);
          updateAuthData({
            token: decodedData.accessToken,
            refreshToken: decodedData.refreshToken || '',
            role: decodedData.user.role,
            user: mappedUser,
          });
          setUserData(mappedUser);

          // Store in localStorage for persistence (matching custom login flow)
          localStorage.setItem('accessToken', decodedData.accessToken);
          if (decodedData.refreshToken) {
            localStorage.setItem('refreshToken', decodedData.refreshToken);
          }
          localStorage.setItem('auth_role', decodedData.user.role);
          localStorage.setItem('auth_user', JSON.stringify(mappedUser));
          localStorage.setItem('auth_is_authenticated', 'true');

          SuccessNotification('Login successful!');

          // Redirect to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Error parsing user data:', error);
          ErrorNotification('Login failed. Please try again.');
          navigate('/login');
        }
      } else if (authStatus === 'failure') {
        ErrorNotification('Login failed. Please try again.');
        navigate('/login');
      } else {
        // Check if we have a session cookie from the backend
        try {
          // Make a request to check if user is authenticated
          const response = await Axios.get('/auth/me');

          if (response.data && response.data.user) {
            // Map user data to match user slice structure (same as custom login)
            const mappedUser = {
              id: response.data.user._id || response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email,
              avatar: response.data.user.avatar,
              preferences: response.data.user.preferences || {}
            };

            // User is authenticated, update Redux store (matching custom login flow)
            login(true);
            updateAuthData({
              token: response.data.accessToken || '',
              refreshToken: response.data.refreshToken || '',
              role: response.data.user.role,
              user: mappedUser,
            });
            setUserData(mappedUser);

            // Store in localStorage for persistence (matching custom login flow)
            localStorage.setItem('accessToken', response.data.accessToken || '');
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            localStorage.setItem('auth_role', response.data.user.role);
            localStorage.setItem('auth_user', JSON.stringify(mappedUser));
            localStorage.setItem('auth_is_authenticated', 'true');

            SuccessNotification('Login successful!');
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.error('Error checking authentication status:', error);
          navigate('/login');
        }
      }
    };

    handleGoogleCallback();
  }, [login, updateAuthData, setUserData, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-lg">Processing your login...</p>
    </div>
  );
}

export default GoogleCallback;
