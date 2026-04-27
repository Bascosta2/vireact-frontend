import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchSubscription, clearSubscription } from "@/redux/slices/subscription-slice";

export const useSubscription = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((s: RootState) => s.subscription);

    /**
     * Force a re-fetch, bypassing the 5-minute stale-while-revalidate window.
     * Use after on-site changePlan() success and after returning from the
     * Stripe Customer Portal.
     */
    const refetch = () => dispatch(fetchSubscription({ force: true }));

    /**
     * Standard fetch — respects the stale-while-revalidate window. Safe to
     * call from any component's mount effect; the slice will dedupe.
     */
    const ensureLoaded = () => dispatch(fetchSubscription(undefined));

    const clear = () => dispatch(clearSubscription());

    return {
        plan: state.plan,
        status: state.status,
        lifetimeFreeVideosUsed: state.lifetimeFreeVideosUsed,
        lifetimeFreeVideoLimit: state.lifetimeFreeVideoLimit,
        videosUsedThisPeriod: state.videosUsedThisPeriod,
        chatMessagesUsedThisPeriod: state.chatMessagesUsedThisPeriod,
        videosPerMonthLimit: state.videosPerMonthLimit,
        chatMessagesPerMonthLimit: state.chatMessagesPerMonthLimit,
        currentPeriodStart: state.currentPeriodStart,
        currentPeriodEnd: state.currentPeriodEnd,
        subscriptionLifecycleStatus: state.subscriptionLifecycleStatus,
        paymentFailed: state.paymentFailed,
        error: state.error,
        lastFetchedAt: state.lastFetchedAt,
        refetch,
        ensureLoaded,
        clear,
    };
};
