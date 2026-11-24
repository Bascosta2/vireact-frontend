import type { ScreenId } from '../showcase/screens';
import type { StyleId } from './ids';

/**
 * What each style is for, and the cover the Skills library shows for it.
 *
 *   talking-head  made for someone on camera: hook above the head, captions under the chin, graphics
 *                 around the face. Covers use the real talking-head demo take.
 *   any-footage   animation styles that restyle any video (gameplay, product shots, b-roll, screen
 *                 recordings). Covers use a sample screen of the footage the style suits best.
 *   storytelling  animated storytelling: the style paints a whole animated world and the creator's voice
 *                 narrates it (the edit shows the painted scene, not the camera). Covers show the scene.
 */
export type StyleCategory = 'talking-head' | 'any-footage' | 'storytelling';

export interface StyleCover {
  category: StyleCategory;
  /** What fills the frame: the talking-head take, the take in a panel under a slide, a sample screen, or the painted scene. */
  base: 'talking' | 'talking-panel' | 'scene' | ScreenId;
  /** Short name of the footage in the cover, for the card ("Gameplay", "Product ad"). */
  shown: string;
  hook: [string, string];
  /** Caption lines; a word ending in * is an emphasis word. */
  lines: string[];
  /** Show the style's sample graphic (stories leave the scene clear). */
  graphic: boolean;
}

const STORY_LINES = ['once upon a', 'time far*', 'away there', 'was a story*'];

export const STYLE_COVERS: Record<StyleId, StyleCover> = {
  // Talking-head skills
  chalkboard: { category: 'talking-head', base: 'talking', shown: 'Talking head: tutorial', hook: ['Editing 101', 'the hook'], lines: ['today we', 'learn the', 'one rule*', 'that matters*'], graphic: true },
  'minimal-line': { category: 'talking-head', base: 'talking', shown: 'Talking head: founder', hook: ['Less,', 'but better'], lines: ['I cut', 'everything', 'that does not', 'matter*'], graphic: true },
  'flat-vector': { category: 'talking-head', base: 'talking-panel', shown: 'Talking head with slides', hook: ['3 tools', 'I use daily'], lines: ['this one', 'saves me', 'hours*', 'every week*'], graphic: true },

  // Animation styles for any footage
  'glow-sketch': { category: 'any-footage', base: 'city-night', shown: 'Night b-roll', hook: ['This city', 'never sleeps'], lines: ['3 a.m.', 'downtown', 'every light*', 'still on*'], graphic: true },
  'comic-art': { category: 'any-footage', base: 'city-day', shown: 'Street story', hook: ['Meanwhile,', 'downtown...'], lines: ['the bus', 'was late', 'again*', 'so I ran*'], graphic: true },
  'brick-build': { category: 'any-footage', base: 'toy-box', shown: 'Unboxing', hook: ['Unboxing', 'the new set'], lines: ['look at', 'this box', '350 pieces*', 'let us build*'], graphic: true },
  'pixel-art': { category: 'any-footage', base: 'game', shown: 'Gameplay', hook: ['Level 1:', 'the first jump'], lines: ['jump', 'grab the', 'coins*', 'one more*'], graphic: true },
  'retro-3d': { category: 'any-footage', base: 'race', shown: 'Racing game', hook: ['Final lap,', 'no brakes'], lines: ['full speed*', 'hold the', 'line', 'new record*'], graphic: true },
  'cgi-motion': { category: 'any-footage', base: 'product-dark', shown: 'Product ad', hook: ['Ice cold,', 'zero sugar'], lines: ['the can', 'that started', 'it all*', 'taste it*'], graphic: true },
  'explainer-3d': { category: 'any-footage', base: 'app', shown: 'App screen recording', hook: ['Set it up', 'in 30 seconds'], lines: ['tap start', 'pick a plan', 'invite your', 'team*'], graphic: true },

  // Animated storytelling
  watercolour: { category: 'storytelling', base: 'scene', shown: 'Story: the koi pond', hook: ['The koi pond,', 'a slow story'], lines: STORY_LINES, graphic: false },
  'roman-mosaic': { category: 'storytelling', base: 'scene', shown: 'Story: the old sea', hook: ['The turtle', 'who crossed the sea'], lines: STORY_LINES, graphic: false },
  'sumi-e': { category: 'storytelling', base: 'scene', shown: 'Story: two cranes', hook: ['Two cranes,', 'one red sun'], lines: STORY_LINES, graphic: false },
  'impasto-oil': { category: 'storytelling', base: 'scene', shown: 'Story: the storm', hook: ['The night', 'the whale rose'], lines: STORY_LINES, graphic: false },
  'nocturne-gouache': { category: 'storytelling', base: 'scene', shown: 'Story: the meadow at night', hook: ['The deer', 'and the fireflies'], lines: STORY_LINES, graphic: false },
  'botanical-plate': { category: 'storytelling', base: 'scene', shown: 'Story: the meadow plate', hook: ['A butterfly', 'finds its flower'], lines: STORY_LINES, graphic: false },
  'paper-cut': { category: 'storytelling', base: 'scene', shown: 'Story: into the deep', hook: ['Into', 'the deep'], lines: STORY_LINES, graphic: false },
  'art-nouveau': { category: 'storytelling', base: 'scene', shown: 'Story: the red flower', hook: ['The hummingbird', 'and the red flower'], lines: STORY_LINES, graphic: false },
  'golden-hour': { category: 'storytelling', base: 'scene', shown: 'Story: last light', hook: ['Last light', 'over the wheat'], lines: STORY_LINES, graphic: false },
  'painted-anime': { category: 'storytelling', base: 'scene', shown: 'Story: that summer', hook: ['That summer,', 'we ran forever'], lines: STORY_LINES, graphic: false },
};

/** The cover frame for a still: the hook over the scene for stories, captions and the graphic otherwise. */
export const coverFrame = (style: StyleId) => (STYLE_COVERS[style].category === 'storytelling' ? 28 : 104);
