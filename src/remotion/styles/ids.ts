/**
 * The animation styles of the Skills Editor (from the "10 Claude Animation Styles" guide). Each one is an
 * editing skill: the backend registry (vireact-backend/src/service/editor/skills.js) gives the planner its
 * rules, and the composition draws the whole edit in its look. Keep the ids in step with the backend.
 *
 * Two names differ from the guide on purpose: "Lego Style" is Brick Build and "PS2 Style" is Retro 3D,
 * because those are other companies' trademarks.
 */
/** The first set: graphic animation looks. */
export const ANIMATED_STYLE_IDS = [
  'glow-sketch',
  'comic-art',
  'brick-build',
  'pixel-art',
  'chalkboard',
  'retro-3d',
  'flat-vector',
  'minimal-line',
  'cgi-motion',
  'explainer-3d',
] as const;

/**
 * The second set, from the "10 Animation Styles" painting prompts (Skale Out): real media painted in
 * code. "Ghibli Style" is Painted Anime here: that name belongs to a film studio.
 */
export const PAINTED_STYLE_IDS = [
  'watercolour',
  'roman-mosaic',
  'sumi-e',
  'impasto-oil',
  'nocturne-gouache',
  'botanical-plate',
  'paper-cut',
  'art-nouveau',
  'golden-hour',
  'painted-anime',
] as const;

export const STYLE_IDS = [...ANIMATED_STYLE_IDS, ...PAINTED_STYLE_IDS] as const;

export type StyleId = (typeof STYLE_IDS)[number];

export const isStyleId = (id: unknown): id is StyleId => typeof id === 'string' && (STYLE_IDS as readonly string[]).includes(id);
