import { useEffect } from 'react';
import GoogleOneTap from '@/components/GoogleOneTap';
import CustomSignupForm from '@/components/CustomSignupForm';
import { ErrorNotification, SuccessNotification } from '@/utils/toast';
import { useAuth } from '@/redux/hooks/use-auth';
import { useUser } from '@/redux/hooks/use-user';
import { Link } from 'react-router-dom';

function LoginForm() {

    const { login, updateAuthData } = useAuth();
    const { setUserData } = useUser();

    // Handle OAuth callback and errors
    useEffect(() => {
        const handleOAuthCallback = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const authStatus = urlParams.get('auth');
            const userData = urlParams.get('data');
            const errorMessage = urlParams.get('error');

            // Handle provider conflict errors
            if (errorMessage) {
                const decodedError = decodeURIComponent(errorMessage);
                ErrorNotification(decodedError);
                // Clear the error parameter from URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (authStatus === 'success' && userData) {
                try {
                    const decodedData = JSON.parse(decodeURIComponent(userData));

                    // Update Redux store
                    login(true);
                    updateAuthData({
                        token: decodedData.accessToken,
                        refreshToken: decodedData.refreshToken || '',
                        role: decodedData.user.role,
                    });

                    // Map user data to match user slice structure
                    const mappedUser = {
                        id: decodedData.user._id || decodedData.user.id,
                        name: decodedData.user.name,
                        email: decodedData.user.email,
                        avatar: decodedData.user.avatar,
                        preferences: decodedData.user.preferences || {}
                    };
                    setUserData(mappedUser);

                    // Store in localStorage for persistence
                    localStorage.setItem('accessToken', decodedData.accessToken);
                    if (decodedData.refreshToken) {
                        localStorage.setItem('refreshToken', decodedData.refreshToken);
                    }
                    localStorage.setItem('auth_role', decodedData.user.role);
                    localStorage.setItem('auth_user', JSON.stringify(mappedUser));
                    localStorage.setItem('auth_is_authenticated', 'true');

                    SuccessNotification('Login successful!');

                    // Clear URL parameters and redirect to dashboard
                    window.history.replaceState({}, document.title, window.location.pathname);
                    window.location.href = '/dashboard';
                } catch (error) {
                    console.error('Error parsing OAuth data:', error);
                    ErrorNotification('Login failed. Please try again.');
                }
            }
        };

        handleOAuthCallback();
    }, [login, updateAuthData, setUserData]);

    const handleGoogleSuccess = () => {
        console.log('Google authentication initiated');
    };

    const handleGoogleError = (error: string) => {
        console.error('Google authentication error:', error);
        ErrorNotification('Google authentication failed. Please try again.');
    };

    const handleFormSuccess = () => {
        console.log('Login successful');
    };

    const handleFormError = (error: string) => {
        console.error('Login error:', error);
        ErrorNotification(error);
    };




    return (
        <div className="bg-dark-primary flex flex-col justify-center px-6 sm:px-12 py-16 rounded-lg">
            {/* Main Heading */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back
                </h1>
                <p className="text-white text-lg">
                    Sign in to your account
                </p>
            </div>

            {/* Google Authentication */}
            <div className="mb-6">
                <GoogleOneTap
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    buttonText="Continue with Google"
                />
            </div>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="text-white font-medium px-4 bg-dark-primary">or continue with email</span>
                </div>
            </div>

            {/* Custom Login Form */}
            <div className="mb-6">
                <CustomSignupForm
                    isLogin={true}
                    onSuccess={handleFormSuccess}
                    onError={handleFormError}
                />
            </div>

            <div className="text-center my-4">
                <p className="font-medium text-white ">
                    Need to verify your email?
                    <br />
                    <Link to="/resend-verification"
                        className=" text-sm text-gray-400 hover:text-secondary">
                        Resend verification email
                    </Link>
                </p>
            </div>


            {/* Signup Link */}
            <div className="text-center">
                <p className="text-sm ">
                    Don't have an account?{' '}
                    <Link to="/signup" className="hover:underline text-secondary">
                        Sign up
                    </Link>
                </p>
            </div>


        </div>
    )
}

export default LoginForm