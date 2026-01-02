import { IoSparkles, IoStar, IoShield } from 'react-icons/io5';

export interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    icon: IoStar,
    title: 'Free Resources',
    description: 'Access to a completely free PDF containing 119 hooks + the viral storytelling structure I use'
  },
  {
    icon: IoSparkles,
    title: 'AI Analysis Platform',
    description: 'Early access to our AI tool that analyzes videos and gives constructive feedback on how to improve them'
  },
  {
    icon: IoShield,
    title: 'Private Community',
    description: 'Join our exclusive growth community with industry leaders'
  }
];
