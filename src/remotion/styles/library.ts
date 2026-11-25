import type { StyleCategory, StyleCover } from './covers';
import raw from './library.json';
import type { StyleId } from './ids';

/**
 * The library styles' shared description (library.json, copied as-is to the backend as
 * vireact-backend/src/service/editor/styles-library.json): name, what it is for, how the planner should
 * use it, the copy for the Skills page, its sound palette and its cover. The look itself is code
 * (themes/<id>.tsx).
 *
 * Layouts:
 *   footage    the footage fills the frame, restyled;
 *   window     the footage sits in a window of the style's world (theme.screen);
 *   story      the style's animated scene replaces the camera; the voice narrates (theme.Scene);
 *   explainer  the scene fills the frame and the creator stays in a bubble (theme.Scene + theme.pip).
 */
export type LibraryLayout = 'footage' | 'window' | 'story' | 'explainer';

export interface LibraryEntry {
  id: StyleId;
  name: string;
  layout: LibraryLayout;
  category: StyleCategory;
  /** Other sections it also appears in. */
  tags: StyleCategory[];
  /** Where it came from (repo and style, prompt numbers). */
  source: string;
  accent: string;
  /** [display, body]: a @remotion/google-fonts module name and its weights ("400,700"). */
  fonts: [[string, string], [string, string]];
  tagline: string;
  bestFor: string;
  /** The look in a sentence (shown to creators and given to the planner). */
  look: string;
  /** How it moves (planner). */
  motion: string;
  /** How the planner writes the hook ("like a ..."). */
  hookRule: string;
  /** Which graphics suit it (planner). */
  graphicsRule: string;
  ambient: string;
  captions: string;
  hook: string;
  graphics: string;
  transition: string;
  sound: string;
  /** [maxWords, maxChars] per caption line. */
  captionLimits?: [number, number];
  /** Graphic types the style leaves out. */
  drop?: string[];
  /** The style's sound palette (backend SFX_PALETTES). */
  sfx: string;
  cover: Omit<StyleCover, 'category'>;
}

export const LIBRARY: Partial<Record<StyleId, LibraryEntry>> = Object.fromEntries((raw as unknown as LibraryEntry[]).map((e) => [e.id, e]));
