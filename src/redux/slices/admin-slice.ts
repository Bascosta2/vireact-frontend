import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AdminData {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    preferences?: Record<string, any>;
}

const initialState: AdminData = {
    id: "",
    name: "admin",
    email: "",
    avatar: "",
    preferences: {},
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setAdminData: (state, action: PayloadAction<AdminData>) => {
            return { ...state, ...action.payload };
        },
        clearAdminData: () => initialState,
    }
});

export const { setAdminData, clearAdminData } = adminSlice.actions;
export default adminSlice.reducer;
