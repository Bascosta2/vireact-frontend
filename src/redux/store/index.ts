import { configureStore } from "@reduxjs/toolkit"
import authReducer from "@/redux/slices/auth-slice"
import userReducer from "@/redux/slices/user-slice"
import adminReducer from "@/redux/slices/admin-slice"
import subscriptionReducer from "@/redux/slices/subscription-slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    admin: adminReducer,
    subscription: subscriptionReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch