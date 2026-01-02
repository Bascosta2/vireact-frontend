import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserData {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    preferences?: Record<string, any>;
}

// Load initial state from localStorage
const getInitialState = (): UserData => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
        const parsedUser = JSON.parse(userStr);
        return {
            id: parsedUser._id || parsedUser.id || "",
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            avatar: parsedUser.avatar || "",
            preferences: parsedUser.preferences || {}
        };
    }
    
    return {
        id: "",
        name: "",
        email: "",
        avatar: "",
        preferences: {}
    };
};

const initialState: UserData = getInitialState();

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<UserData>) => {
            return { ...state, ...action.payload };
        },
        clearUserData: () => initialState,
        updatePreferences: (state, action: PayloadAction<Record<string, any>>) => {
            state.preferences = { ...state.preferences, ...action.payload };
        }
    }
});

export const { setUserData, clearUserData, updatePreferences } = userSlice.actions;
export default userSlice.reducer;
