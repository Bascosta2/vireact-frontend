/**
 * The animation styles of the Skills Editor (from the "10 Claude Animation Styles" guide). Each one is an
 * editing skill: the backend registry (vireact-backend/src/service/editor/skills.js) gives the planner its
 * rules, and the composition draws the whole edit in its look. Keep the ids in step with the backend.
 *
 * Two names differ from the guide on purpose: "Lego Style" is Brick Build and "PS2 Style" is Retro 3D,
 * because those are other companies' trademarks.
 */
export const STYLE_IDS = [
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

export type StyleId = (typeof STYLE_IDS)[number];

export const isStyleId = (id: unknown): id is StyleId => typeof id === 'string' && (STYLE_IDS as readonly string[]).includes(id);
