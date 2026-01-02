// Import PNG icons from the icons directory
import cameraIcon from './icons/camera.png';
import videoIcon from './icons/video.png';
import musicIcon from './icons/music.png';
import chartIcon from './icons/chart.png';
import usersIcon from './icons/heart.png';
import awardIcon from './icons/like.png';
import youtubeIcon from './icons/youtube.png';
import instagramIcon from './icons/Instagram.png';
import facebookIcon from './icons/facebook.png';
import tiktokIcon from './icons/tiktok.png';

export interface Feature {
    id: number;
    creativeText: string;
    icons: string[];
    title: string;
    description: string;
}

export const features: Feature[] = [
    {
        id: 1,
        creativeText: "SMART SCAN",
        icons: [videoIcon, musicIcon, cameraIcon],
        title: "AI-Powered Video Analysis",
        description: "Upload your video or paste a link, our AI reviews hooks, captions, pacing, visuals, and sounds to give you detailed feedback that boosts engagement."
    },
    {
        id: 2,
        creativeText: "GROW FAST",
        icons: [chartIcon, usersIcon, awardIcon],
        title: "AI-Powered Growth Recommendations",
        description: "Get clear, step-by-step tips on how to improve views, likes, and subscriber growth, based on real platform trends."
    },
    {
        id: 3,
        creativeText: "ALL PLATFORMS",
        icons: [youtubeIcon, instagramIcon, facebookIcon, tiktokIcon],
        title: "Built for Every Platform",
        description: "Whether it's Shorts, Reels, TikToks, or Facebook videos, our tool analyzes and adapts feedback for each platform's algorithm."
    }
];
