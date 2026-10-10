import { IoText, IoEye, IoThumbsUp, IoCheckmarkCircle } from "react-icons/io5";
import { claims } from "@/content/claims";

export const captionStats = [
    {
        Icon: IoText,
        achievement: claims.featureStats.captionClarity[0],
        subheading: "Caption Clarity Score"
    },
    {
        Icon: IoEye,
        achievement: claims.featureStats.captionClarity[1],
        subheading: "More Views"
    },
    {
        Icon: IoThumbsUp,
        achievement: claims.featureStats.captionClarity[2],
        subheading: "Higher Engagement"
    },
    {
        Icon: IoCheckmarkCircle,
        achievement: claims.featureStats.captionClarity[3],
        subheading: "Caption Optimization"
    }
]
