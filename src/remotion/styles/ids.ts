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

/**
 * The library set (2026-11-24): every editing skill found in the Claude animation repos and prompt
 * collections (lemo-opuscar, HyperFrames, pixelfx, ShotCraft, the its-applied-ai style list and others; see
 * library.json for each one's source). Some names differ from the source on purpose: "HD-2D" is Pixel
 * Diorama, "Backrooms" is Liminal Tape and "Matrix" is Digital Rain (other companies' marks), and styles
 * named after a creator were folded into generic ones.
 */
export const LIBRARY_STYLE_IDS = [
  'blueprint', 'whiteboard', 'sketchnote', 'marker-pad', 'tablet-sketch', 'iso-infographic', 'assembly-manual',
  'technical-drawing', 'stick-figures', 'flat-space', 'oscilloscope', 'circuit-board', 'factory-cutaway',
  'transit-map', 'relief-map', 'paper-map', 'pen-plotter', 'microscope', 'physics-lab', 'crowd-sim',
  'mascot-explainer', 'coin-stacks', 'pencil-dataviz', 'spreadsheet', 'projection-model', 'big-numbers',
  'product-studio', 'glass-product', 'teardown', 'keynote-launch', 'desk-flythrough', 'mascot-screencast',
  'liquid-glass', 'code-editor', 'news-package', 'caption-news', 'briefing-board', 'analyst-briefing',
  'investigation-desk', 'light-scan', 'light-table', 'case-file', 'countdown', 'telestrator', 'newsreel',
  'silent-film', 'scratch-film', 'retro-terminal', 'liminal-tape', 'one-bit', 'kino-montage', 'spy-titles',
  'text-flash', 'digital-rain', 'xray-scanner', 'thermal', 'synthwave', 'neon-signs', 'cosmos', 'glitch-cut',
  'hologram-hud', 'lidar-scan', 'swiss-grid', 'bauhaus', 'pictogram-grid', 'liquid-chrome', 'low-poly',
  'firefly-dots', 'flow-field', 'claymation', 'pastel-3d', 'doodle', 'rubber-hose', 'midcentury-toon',
  'scifi-toon', 'cel-anime', 'manga-panels', 'game-show', 'pixel-fx', 'microgame', 'pixel-diorama', 'pop-art',
  'risograph', 'woodcut', 'copper-engraving', 'urban-sketch', 'coloured-pencil', 'crayon-book', 'one-line',
  'ukiyo-e', 'stained-glass', 'illuminated', 'shadow-puppets', 'paper-lantern', 'pop-up-book', 'red-paper-cut',
  'scratchboard', 'screen-print', 'memphis', 'art-deco', 'vintage-collage', 'double-exposure', 'felt-wool',
  'isometric-town', 'beat-cards', 'audiogram', 'kinetic-type', 'city-symphony', 'sunset-silhouette',
  'tilt-shift', 'light-leak',
] as const;

export const STYLE_IDS = [...ANIMATED_STYLE_IDS, ...PAINTED_STYLE_IDS, ...LIBRARY_STYLE_IDS] as const;

export type StyleId = (typeof STYLE_IDS)[number];

export const isStyleId = (id: unknown): id is StyleId => typeof id === 'string' && (STYLE_IDS as readonly string[]).includes(id);
