import type { CSSProperties } from 'react';
import type { Screen, StyleTheme } from '../theme';
import { caption, card, hook, markerDot, ringCircle, text, trFlash } from './presets';

/**
 * A style from only what makes it different: every part not given falls back to a clean, legible
 * default in the style's colors, so a new style starts complete and is then tuned part by part.
 */
export function defineStyle(s: Partial<StyleTheme> & Pick<StyleTheme, 'id' | 'accent' | 'colors'>): StyleTheme {
  const [a, b] = s.colors;
  return {
    footage: 'none',
    entrance: 'glide',
    step: 1,
    textScale: 1,
    Overlay: () => null,
    caption: caption({ color: '#fff', emph: s.accent, stroke: [10, '#000'], weight: 800 }),
    hook: hook({ bg: '#fff', color: '#111', radius: 18, size: 68, weight: 800, boxShadow: '0 14px 40px rgba(0,0,0,0.4)' }),
    card: card({ bg: 'rgba(12,12,18,0.88)', radius: 22, shadow: '0 18px 44px rgba(0,0,0,0.45)' }),
    title: text({ color: '#fff', weight: 800 }),
    body: text({ font: 'body', color: '#E8EAF2', weight: 600 }),
    number: text({ color: s.accent, weight: 900, shadow: '0 8px 30px rgba(0,0,0,0.5)' }),
    slam: text({ color: '#fff', weight: 900, upper: true, stroke: [10, '#000'] }),
    Marker: markerDot([s.accent, a, b]),
    Ring: ringCircle(s.accent, 10),
    stage: { shape: 'circle', fill: ['#ffffff', '#E9ECF5'], ring: s.accent, ringWidth: 8 },
    transition: trFlash(),
    sample: { type: 'headline', text: 'The one rule', subtext: 'that changes everything' },
    ...s,
  };
}

/** Where an explainer keeps the creator: a bubble low on the right, clear of captions, graphics and app buttons. */
export const PIP_BOX = { x: 690, y: 1385, w: 330, h: 330 } as const;

/** An explainer's creator bubble with the style's border. */
export const pipAt = (style: CSSProperties, shape: 'circle' | 'rect' = 'circle', o: Partial<Screen> = {}): Screen => ({ ...PIP_BOX, shape, radius: 26, style, ...o });
