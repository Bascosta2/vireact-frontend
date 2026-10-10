import { IoVolumeHigh, IoMusicalNote, IoTrendingUp, IoCheckmarkCircle } from "react-icons/io5";
import { claims } from "@/content/claims";

export const audioStats = [
    {
        Icon: IoVolumeHigh,
        achievement: claims.featureStats.audioInsight[0],
        subheading: "Audio Quality Score"
    },
    {
        Icon: IoMusicalNote,
        achievement: claims.featureStats.audioInsight[1],
        subheading: "Better Sound Clarity"
    },
    {
        Icon: IoTrendingUp,
        achievement: claims.featureStats.audioInsight[2],
        subheading: "Engagement Boost"
    },
    {
        Icon: IoCheckmarkCircle,
        achievement: claims.featureStats.audioInsight[3],
        subheading: "Audio Optimization"
    }
]
