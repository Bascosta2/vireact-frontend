import type { StyleId } from './ids';
import { isStyleId } from './ids';
import type { StyleTheme } from './theme';
import { artNouveau } from './themes/art-nouveau';
import { botanicalPlate } from './themes/botanical-plate';
import { brickBuild } from './themes/brick-build';
import { cgiMotion } from './themes/cgi-motion';
import { chalkboard } from './themes/chalkboard';
import { comicArt } from './themes/comic-art';
import { explainer3d } from './themes/explainer-3d';
import { flatVector } from './themes/flat-vector';
import { glowSketch } from './themes/glow-sketch';
import { goldenHour } from './themes/golden-hour';
import { impastoOil } from './themes/impasto-oil';
import { minimalLine } from './themes/minimal-line';
import { nocturneGouache } from './themes/nocturne-gouache';
import { paintedAnime } from './themes/painted-anime';
import { paperCut } from './themes/paper-cut';
import { pixelArt } from './themes/pixel-art';
import { retro3d } from './themes/retro-3d';
import { romanMosaic } from './themes/roman-mosaic';
import { sumiE } from './themes/sumi-e';
import { watercolour } from './themes/watercolour';

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
  watercolour,
  'roman-mosaic': romanMosaic,
  'sumi-e': sumiE,
  'impasto-oil': impastoOil,
  'nocturne-gouache': nocturneGouache,
  'botanical-plate': botanicalPlate,
  'paper-cut': paperCut,
  'art-nouveau': artNouveau,
  'golden-hour': goldenHour,
  'painted-anime': paintedAnime,
};

export const themeFor = (id: string | null | undefined): StyleTheme | null => (isStyleId(id) ? STYLE_THEMES[id] : null);
