import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setUserData as setUserDataReducer, clearUserData as clearUserDataReducer } from "@/redux/slices/user-slice";

export const useUser = () => {
    const dispatch = useDispatch();
    const { id, name, email, avatar, preferences } = useSelector((state: RootState) => state.user);

    // Action functions
    const setUserData = (data: any) => {
        dispatch(setUserDataReducer(data));
    };

    const clearUserData = () => {
        dispatch(clearUserDataReducer());
    };

    return {
        id,
        name,
        email,
        avatar,
        preferences,
        setUserData,
        clearUserData
    };
}