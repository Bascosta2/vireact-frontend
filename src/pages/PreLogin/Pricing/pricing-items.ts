import type { PricingFeature } from '@/types/pricing';

// Free plan features
export const freeFeatures: PricingFeature[] = [
    { text: '30 credits per month', type: 'check' },
    { text: 'Upload up to 5 videos / month', type: 'check' },
    { text: 'Video insights with HookScore™ & TempoCheck™ (basic)', type: 'check' },
    { text: 'AI captions with SmartSubs™ (watermarked)', type: 'check' },
    { text: 'Basic audio quality feedback (SonicLens™ Lite)', type: 'check' },
    { text: 'Watermark on all exports', type: 'warning' },
    { text: 'Limited storage (7 days)', type: 'warning' },
    { text: 'No team or brand options', type: 'warning' }
];

// Starter plan features
export const starterFeatures: PricingFeature[] = [
    { text: '150 credits per month', type: 'check' },
    { text: 'Full insights: HookScore™, TempoCheck™, Pacing & Rhythm Score', type: 'check' },
    { text: 'SmartSubs™ captions in 20+ languages', type: 'check' },
    { text: 'Download insights reports as PDF', type: 'check' },
    { text: 'Audio clarity insights (SonicLens™)', type: 'check' },
    { text: 'Remove watermark', type: 'check' },
    { text: 'Save video insights in your dashboard', type: 'check' }
];

// Pro plan features
export const proFeatures: PricingFeature[] = [
    { text: '3,600 credits per year (instantly available)', type: 'check' },
    { text: 'Team workspace with 2 seats', type: 'check' },
    { text: 'Advanced Pacing & Rhythm Score', type: 'check' },
    { text: 'StayOn™ retention drop-off detector', type: 'check' },
    { text: 'Priority analysis (faster processing)', type: 'check' },
    { text: 'Upload from multiple sources (YouTube, TikTok, file, cloud)', type: 'check' },
    { text: 'Export reports to Adobe Premiere Pro & DaVinci Resolve', type: 'check' },
    { text: 'Multiple aspect ratios (9:16, 1:1, 16:9)', type: 'check' },
    { text: 'Custom fonts & branding', type: 'check' },
    { text: 'Speech enhancement', type: 'check' },
    { text: 'Live chat support', type: 'check' }
];

// Business plan features
export const businessFeatures: PricingFeature[] = [
    { text: 'Custom pricing & credit packs', type: 'check' },
    { text: 'Priority project processing (queue jump)', type: 'check' },
    { text: 'Customized team seats & storage options', type: 'check' },
    { text: 'Tailored business insights: brand templates, vocab, AI tuning', type: 'check' },
    { text: 'Dedicated storage & enterprise controls', type: 'check' },
    { text: 'API access & custom integrations', type: 'check' },
    { text: 'Dedicated Slack support channel', type: 'check' },
    { text: 'Enterprise-level security (SOC2/GDPR ready)', type: 'check' }
];
