import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setAdminData as setAdminDataReducer, clearAdminData as clearAdminDataReducer } from "@/redux/slices/admin-slice";

export const useAdmin = () => {
    const dispatch = useDispatch();
    const { id, name, email, avatar, preferences } = useSelector((state: RootState) => state.admin);

    const setAdminData = (data: any) => {
        dispatch(setAdminDataReducer(data));
    };

    const clearAdminData = () => {
        dispatch(clearAdminDataReducer());
    };

    return {
        id,
        name,
        email,
        avatar,
        preferences,
        setAdminData,
        clearAdminData
    };
}