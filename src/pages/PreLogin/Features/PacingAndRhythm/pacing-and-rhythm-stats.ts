import { IoPlay, IoTime, IoTrendingUp, IoCheckmarkCircle } from "react-icons/io5";
import { claims } from "@/content/claims";

export const flowStats = [
    {
        Icon: IoPlay,
        achievement: claims.featureStats.pacingAndRhythm[0],
        subheading: "Flow Quality Score"
    },
    {
        Icon: IoTime,
        achievement: claims.featureStats.pacingAndRhythm[1],
        subheading: "Better Retention"
    },
    {
        Icon: IoTrendingUp,
        achievement: claims.featureStats.pacingAndRhythm[2],
        subheading: "Viewer Engagement"
    },
    {
        Icon: IoCheckmarkCircle,
        achievement: claims.featureStats.pacingAndRhythm[3],
        subheading: "Content Flow"
    }
]
