import type { StyleId } from './ids';
import { isStyleId } from './ids';
import type { StyleTheme } from './theme';
import { brickBuild } from './themes/brick-build';
import { cgiMotion } from './themes/cgi-motion';
import { chalkboard } from './themes/chalkboard';
import { comicArt } from './themes/comic-art';
import { explainer3d } from './themes/explainer-3d';
import { flatVector } from './themes/flat-vector';
import { glowSketch } from './themes/glow-sketch';
import { minimalLine } from './themes/minimal-line';
import { pixelArt } from './themes/pixel-art';
import { retro3d } from './themes/retro-3d';

/** Every animation style the composition can draw, by id. */
export const STYLE_THEMES: Record<StyleId, StyleTheme> = {
  'glow-sketch': glowSketch,
  'comic-art': comicArt,
  'brick-build': brickBuild,
  'pixel-art': pixelArt,
  chalkboard,
  'retro-3d': retro3d,
  'flat-vector': flatVector,
  'minimal-line': minimalLine,
  'cgi-motion': cgiMotion,
  'explainer-3d': explainer3d,
};

export const themeFor = (id: string | null | undefined): StyleTheme | null => (isStyleId(id) ? STYLE_THEMES[id] : null);
