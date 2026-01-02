import { type IconType } from 'react-icons';
import { FaChartLine, FaEye, FaClock, FaClosedCaptioning, FaChartBar, FaVolumeUp } from 'react-icons/fa';

export interface AIFeature {
    id: string;
    name: string;
    icon: IconType;
    route: string;
    description?: string;
}

export const aiFeatures: AIFeature[] = [
    {
        id: 'hook-analyzer',
        name: 'Hook Analyzer',
        icon: FaChartLine,
        route: '/features/hook-analyzer',
        description: 'Analyze the effectiveness of your video hooks'
    },
    {
        id: 'viral-view-predictor',
        name: 'Viral View Predictor',
        icon: FaEye,
        route: '/features/viral-predictor',
        description: 'Predict potential viral reach before posting'
    },
    {
        id: 'pacing-rhythm',
        name: 'Pacing & Rhythm Score',
        icon: FaClock,
        route: '/features/pacing-and-rhythm',
        description: 'Evaluate pacing and rhythm for optimal engagement'
    },
    {
        id: 'caption-clarity',
        name: 'Caption Clarity',
        icon: FaClosedCaptioning,
        route: '/features/caption-clarity',
        description: 'Improve caption clarity and readability'
    },
    {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        icon: FaChartBar,
        route: '/features/advanced-analytics',
        description: 'Get comprehensive analytics and insights'
    },
    {
        id: 'audio-insight',
        name: 'Audio Insight',
        icon: FaVolumeUp,
        route: '/features/audio-insight',
        description: 'Analyze and enhance audio quality'
    }
];

