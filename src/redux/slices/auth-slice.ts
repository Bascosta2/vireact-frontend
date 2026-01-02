import { createSlice } from "@reduxjs/toolkit";
import { USER_ROLES } from "@/constants";

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
    refreshToken: string,
    role: string | null,
    user: User | null
}

// Load initial state from localStorage
const getInitialState = (): AuthData => {
    const isAuthenticated = localStorage.getItem('auth_is_authenticated') === 'true';
    const token = localStorage.getItem('accessToken') || '';
    const refreshToken = localStorage.getItem('refreshToken') || '';
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
        refreshToken,
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
                state.refreshToken = action.payload.refreshToken || '';
                state.role = action.payload.role;
                state.user = action.payload.user || null;
            },
            logout: (state) => {
                state.isAuthenticated = false;
                state.token = "";
                state.refreshToken = "";
                state.role = null;
                state.user = null;
                
                // Clear localStorage
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