import { IoChatbubble, IoCloudUpload, IoSparkles } from "react-icons/io5";



export interface HowItWorksStep {
    id: number;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

export  const howItWorksSteps: HowItWorksStep[] = [
    {
        id: 1,
        icon: IoCloudUpload,
        title: "Upload A Video",
        description: "Drop your video file or share a link from TikTok, YouTube Shorts, Instagram, or Facebook."
    },
    {
        id: 2,
        icon: IoSparkles,
        title: "AI Analysis",
        description: "Our app reviews hooks, captions, pacing, visuals, audio, story and more."
    },
    {
        id: 3,
        icon: IoChatbubble,
        title: "Get Feedback",
        description: "Receive clear insights on what to fix, what to keep, and how to make your video go viral."
    }
];