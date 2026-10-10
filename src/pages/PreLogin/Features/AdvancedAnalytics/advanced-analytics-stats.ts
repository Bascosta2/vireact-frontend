import { IoSpeedometer, IoTime, IoTrendingUp, IoCheckmarkCircle } from "react-icons/io5";
import { claims } from "@/content/claims";

export const advancedAnalyticsStats = [
    {
        Icon: IoSpeedometer,
        achievement: claims.featureStats.advancedAnalytics[0],
        subheading: "Average View Duration"
    },
    {
        Icon: IoTime,
        achievement: claims.featureStats.advancedAnalytics[1],
        subheading: "Watch Time"
    },
    {
        Icon: IoTrendingUp,
        achievement: claims.featureStats.advancedAnalytics[2],
        subheading: "Engagement Rate"
    },
    {
        Icon: IoCheckmarkCircle,
        achievement: claims.featureStats.advancedAnalytics[3],
        subheading: "Retention Rate"
    }
]
