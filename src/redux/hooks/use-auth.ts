import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setIsAuthenticated as setIsAuthenticatedReducer, setAuthData as setAuthDataReducer, logout as logoutReducer } from "@/redux/slices/auth-slice";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, token, role } = useSelector((state: RootState) => state.auth);

    // Action functions
    const login = (auth: boolean) => {
        dispatch(setIsAuthenticatedReducer(auth));
    };

    const updateAuthData = (data: any) => {
        dispatch(setAuthDataReducer(data));
    };

    const logout = () => {
        dispatch(logoutReducer());
    };

    return { 
        isAuthenticated, 
        token, 
        role, 
        login, 
        updateAuthData, 
        logout 
    };
}