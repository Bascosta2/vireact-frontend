import { type IconType } from 'react-icons';
import React from 'react';
import { FaChartLine, FaEye, FaClock, FaClosedCaptioning, FaChartBar, FaVolumeUp } from 'react-icons/fa';
import { GiHook } from 'react-icons/gi';

export interface Feature {
    id: string;
    name: string;
    icon: IconType | React.ReactNode;
    description?: string;
}

export const featuresList: Feature[] = [
    {
        id: 'hook-analyzer',
        name: 'Hook Analyzer',
        icon: GiHook,
        description: 'Analyze the effectiveness of your video hooks'
    },
    {
        id: 'viral-view-predictor',
        name: 'Viral View Predictor',
        icon: FaEye,
        description: 'Predict potential viral reach before posting'
    },
    {
        id: 'pacing-rhythm',
        name: 'Pacing & Rhythm Score',
        icon: FaClock,
        description: 'Evaluate pacing and rhythm for optimal engagement'
    },
    {
        id: 'caption-clarity',
        name: 'Caption Clarity',
        icon: FaClosedCaptioning,
        description: 'Improve caption clarity and readability'
    },
    {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        icon: FaChartBar,
        description: 'Get comprehensive analytics and insights'
    },
    {
        id: 'audio-insight',
        name: 'Audio Insight',
        icon: FaVolumeUp,
        description: 'Analyze and enhance audio quality'
    }
];

