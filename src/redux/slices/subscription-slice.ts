import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getSubscription, type SubscriptionData } from "@/api/subscription";
import type { TierId } from "@/config/tiers";
import type { RootState } from "@/redux/store";

/**
 * Stale-while-revalidate window. If the slice's lastFetchedAt is younger than
 * this, the fetchSubscription thunk's condition callback short-circuits and
 * no network request fires. Components calling refetch() can pass force=true
 * to bypass this (used after on-site changePlan() success and after Customer
 * Portal return).
 */
const STALE_AFTER_MS = 5 * 60 * 1000; // 5 minutes

export type SubscriptionStatus = "idle" | "loading" | "loaded" | "error";

export interface SubscriptionState {
    plan: TierId | null;
    status: SubscriptionStatus;
    lifetimeFreeVideosUsed: number | null;
    /** Server cap for lifetime free trial; `null` if not provided by API. */
    lifetimeFreeVideoLimit: number | null;
    videosUsedThisPeriod: number | null;
    chatMessagesUsedThisPeriod: number | null;
    /** Per-period video analysis cap. `null` represents unlimited (Enterprise). */
    videosPerMonthLimit: number | null;
    /** Per-period chat cap. `null` represents unlimited (Enterprise). */
    chatMessagesPerMonthLimit: number | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    /** Subscription document `status` (active, cancelled, etc.). */
    subscriptionLifecycleStatus: SubscriptionData['subscription']['status'] | null;
    paymentFailed: boolean;
    error: string | null;
    lastFetchedAt: number | null;
}

const initialState: SubscriptionState = {
    plan: null,
    status: "idle",
    lifetimeFreeVideosUsed: null,
    lifetimeFreeVideoLimit: null,
    videosUsedThisPeriod: null,
    chatMessagesUsedThisPeriod: null,
    videosPerMonthLimit: null,
    chatMessagesPerMonthLimit: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    subscriptionLifecycleStatus: null,
    paymentFailed: false,
    error: null,
    lastFetchedAt: null,
};

interface FetchArgs {
    /** Bypass the 5-minute stale-while-revalidate window. */
    force?: boolean;
}

export const fetchSubscription = createAsyncThunk<
    SubscriptionData,
    FetchArgs | undefined,
    { state: RootState; rejectValue: string }
>(
    "subscription/fetch",
    async (_args, { rejectWithValue }) => {
        try {
            const data = await getSubscription();
            return data;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load subscription";
            return rejectWithValue(message);
        }
    },
    {
        condition: (args, { getState }) => {
            const { subscription } = getState();
            if (args?.force) return true;
            if (subscription.status === "loading") return false; // dedupe in-flight
            if (subscription.lastFetchedAt == null) return true; // never fetched
            const age = Date.now() - subscription.lastFetchedAt;
            return age >= STALE_AFTER_MS;
        },
    }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        /**
         * Reset slice to initial state. Call from useLogout to ensure the
         * slice does not leak across user sessions. The auth slice's logout
         * reducer does NOT clear this slice — that boundary is owned by
         * useLogout.
         */
        clearSubscription: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSubscription.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<SubscriptionData>) => {
                const { subscription, limits } = action.payload;
                state.plan = (subscription?.plan ?? "free") as TierId;
                state.lifetimeFreeVideosUsed = limits?.lifetimeFreeVideosUsed ?? 0;
                state.lifetimeFreeVideoLimit = limits?.lifetimeFreeVideoLimit ?? null;
                state.videosUsedThisPeriod = subscription?.usage?.videosUsed ?? null;
                state.chatMessagesUsedThisPeriod = subscription?.usage?.chatMessagesUsed ?? null;
                state.videosPerMonthLimit = limits?.videosPerMonth ?? null;
                state.chatMessagesPerMonthLimit = limits?.chatMessagesPerMonth ?? null;
                state.currentPeriodStart = subscription?.currentPeriodStart ?? null;
                state.currentPeriodEnd = subscription?.currentPeriodEnd ?? null;
                state.subscriptionLifecycleStatus = subscription?.status ?? null;
                state.paymentFailed = subscription?.paymentFailed ?? false;
                state.status = "loaded";
                state.error = null;
                state.lastFetchedAt = Date.now();
            })
            .addCase(fetchSubscription.rejected, (state, action) => {
                state.status = "error";
                state.error = (action.payload as string) || action.error?.message || "Failed to load subscription";
                // IMPORTANT: do NOT clear plan/limits here. If we already had
                // a successful fetch, keep stale data visible rather than
                // collapsing the UI to "unknown" on a transient network blip.
            });
    },
});

export const { clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
