import { useOAuthHydration } from '@/redux/hooks/use-oauth-hydration';

/**
 * /auth/google/callback route component.
 *
 * After the backend finishes the Google round-trip it sets HttpOnly auth
 * cookies and 302s the browser here with `?auth=success`. We delegate all
 * Redux/localStorage hydration to useOAuthHydration, which calls
 * GET /auth/me (cookie-authenticated) to resolve the user identity without
 * exposing tokens to JavaScript.
 */
function GoogleCallback() {
    useOAuthHydration({
        redirectOnSuccess: '/dashboard',
        redirectOnFailure: '/login',
    });

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg">Processing your login...</p>
        </div>
    );
}

export default GoogleCallback;
