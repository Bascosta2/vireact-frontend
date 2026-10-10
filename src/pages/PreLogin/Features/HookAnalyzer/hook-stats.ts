import { IoFish, IoEye, IoThumbsUp, IoCheckmarkCircle } from "react-icons/io5";
import { claims } from "@/content/claims";

export const hookStats = [
    {
        Icon: IoFish,
        achievement: claims.featureStats.hookAnalyzer[0],
        subheading: "Hook Effectiveness"
    },
    {
        Icon: IoEye,
        achievement: claims.featureStats.hookAnalyzer[1],
        subheading: "More Views"
    },
    {
        Icon: IoThumbsUp,
        achievement: claims.featureStats.hookAnalyzer[2],
        subheading: "Higher Retention"
    },
    {
        Icon: IoCheckmarkCircle,
        achievement: claims.featureStats.hookAnalyzer[3],
        subheading: "Hook Optimization"
    }
]
