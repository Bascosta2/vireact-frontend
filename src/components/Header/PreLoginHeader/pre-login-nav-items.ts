import type { PreLoginNavItem } from "@/types/header";
import { FaVideo, FaChartLine, FaYoutube, FaStar, FaSlidersH, FaHeadphones } from "react-icons/fa";

export const navItems: PreLoginNavItem[] = [
    {
        label: 'Features',
        href: '/features',
        hasDropdown: true,
        dropdownItems: [
            {
                id: 1,
                title: "Viral View Predictor",
                description: "Predict your reach before posting",
                href: "/features/viral-predictor",
                icon: FaChartLine,
            },
            {
                id: 2,
                title: "Pacing & Rhythm Score",
                description: "AI checks pacing & engagement flow",
                href: "/features/pacing-and-rhythm",
                icon: FaVideo,
            },
            {
                id: 3,
                title: "Caption Clarity",
                description: "Fix captions for max retention",
                href: "/features/caption-clarity",
                icon: FaYoutube,
            },
            {
                id: 4,
                title: "Hook Strength Analyzer",
                description: "Rate your opening 3–5 seconds",
                href: "/features/hook-analyzer",
                icon: FaStar,
            },
            {
                id: 5,
                title: "Advanced Analytics",
                description: "YouTube like advanced analytics before even posting",
                href: "/features/advanced-analytics",
                icon: FaSlidersH,
            },
            {
                id: 6,
                title: "Audio Insight",
                description: "Keep voices clear & audio pro-level",
                href: "/features/audio-insight",
                icon: FaHeadphones,
            }
        ]
        
    },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQs', href: '/frequently-asked-questions' },
    { label: 'Get in touch', href: '/get-in-touch' },
    { label: 'Early Access', href: '/early-access' }
];