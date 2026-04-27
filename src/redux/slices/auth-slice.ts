import { createSlice } from "@reduxjs/toolkit";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

interface AuthData {
    isAuthenticated: boolean,
    token: string,
    role: string | null,
    user: User | null
}

// Load initial state from localStorage. The refresh token is intentionally
// NOT rehydrated here — refresh-token state lives only in the HttpOnly cookie
// set by the backend; sending the cookie automatically via withCredentials
// is the sole client-side refresh path.
const getInitialState = (): AuthData => {
    const isAuthenticated = localStorage.getItem('auth_is_authenticated') === 'true';
    const token = localStorage.getItem('accessToken') || '';
    const role = localStorage.getItem('auth_role') || null;
    const userStr = localStorage.getItem('auth_user');
    let user = null;
    
    if (userStr) {
        const parsedUser = JSON.parse(userStr);
        // Map user data to match the expected structure
        user = {
            id: parsedUser._id || parsedUser.id,
            email: parsedUser.email,
            name: parsedUser.name,
            role: parsedUser.role,
            avatar: parsedUser.avatar
        };
    }

    return {
        isAuthenticated,
        token,
        role,
        user
    };
};

const initialState: AuthData = getInitialState();

const authSlice = createSlice(
    {
        name: "auth",
        initialState,
        reducers: {
            setIsAuthenticated: (state, action) => {
                state.isAuthenticated = action.payload;
            },
            setAuthData: (state, action) => {
                state.token = action.payload.token;
                state.role = action.payload.role;
                state.user = action.payload.user || null;
            },
            logout: (state) => {
                state.isAuthenticated = false;
                state.token = "";
                state.role = null;
                state.user = null;
                
                // Clear localStorage. refreshToken removal is legacy cleanup
                // for sessions that were established before refresh tokens
                // stopped being persisted client-side. Safe to keep indefinitely.
                localStorage.removeItem('auth_is_authenticated');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('auth_role');
                localStorage.removeItem('auth_user');
            },
        },
    }
)

export const { setIsAuthenticated, setAuthData, logout } = authSlice.actions;
export default authSlice.reducer;