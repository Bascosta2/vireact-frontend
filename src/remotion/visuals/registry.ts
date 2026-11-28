import { BODY_VISUALS } from './body';
import { ENERGY_VISUALS } from './energy';
import { IDEA_VISUALS } from './ideas';
import type { Visual } from './kit';
import { MONEY_VISUALS } from './money';
import { STORY_VISUALS } from './story';
import { TECH_VISUALS } from './tech';

/**
 * Every animated illustration the editor can show, by name. The names must match VISUALS in the
 * backend (vireact-backend/src/service/editor/edl.js), which is the list Claude picks from.
 */
export const VISUALS: Record<string, Visual> = {
  ...BODY_VISUALS,
  ...MONEY_VISUALS,
  ...IDEA_VISUALS,
  ...TECH_VISUALS,
  ...ENERGY_VISUALS,
  ...STORY_VISUALS,
};

export const VISUAL_NAMES = Object.keys(VISUALS);
