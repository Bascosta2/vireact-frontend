import { IoChatbubble, IoBarChart, IoTimer, IoCheckmarkCircle } from "react-icons/io5";
import { claims } from "@/content/claims";

export const viralStats = [
    {
        Icon: IoChatbubble,
        achievement: claims.featureStats.viralPredictor[0],
        subheading: "Better Engagement"
    },
    {
        Icon: IoBarChart,
        achievement: claims.featureStats.viralPredictor[1],
        subheading: "Higher Viral Potential"
    },
    {
        Icon: IoTimer,
        achievement: claims.featureStats.viralPredictor[2],
        subheading: "Instant Insights"
    },
    {
        Icon: IoCheckmarkCircle,
        achievement: claims.featureStats.viralPredictor[3],
        subheading: "Accurate AI Feedback"
    }
]